import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_STATEMENTS, type Role, type Statement, type ThemeId } from '@/data/statements';
import { cloudReady, cloudRequest, isSteward, listAll, stampOf, type Doc } from '@/lib/cloud';

export type Lang = 'en' | 'zh';
export type VoteValue = -1 | 0 | 1;
export type Vote = { pid: string; sid: string; v: VoteValue; at: number };
export type Participant = { id: string; role: Role; lang: Lang; createdAt: number };
export type Flag = { id: string; sid: string; at: number; resolved: boolean };
export type SubmitResult = 'ok' | 'rate' | 'duplicate' | 'spam';
export type SubmitMeta = { trap: string; openedAt: number };
export type SyncState = 'idle' | 'loading' | 'ready' | 'error' | 'offline';
export type Member = { email?: string; name?: string } | null;

type PDoc = { pid: string; role: Role; lang: Lang; createdAt: number; votes: Record<string, VoteValue>; times: Record<string, number> };
type Me = PDoc & { docId?: string };
type SDoc = { sid: string; en: string; zh: string; authorRole?: Role; authorId?: string; signals?: string[]; createdAt: number };
type FRow = { id: string; sid: string; at: number };
type DDoc = {
  kind: 'statement' | 'seed' | 'group' | 'flag';
  target: string;
  en?: string; zh?: string; theme?: ThemeId; status?: Statement['status']; hidden?: boolean; name?: string;
  createdAt: number;
};

const RATE_WINDOW = 10 * 60 * 1000;
const RATE_MAX = 3;
const DAY_MAX = 8;
const FAST_WRITE_MS = 4000;
const norm = (x: string) => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

function looksGarbled(text: string): boolean {
  if (!/\p{L}/u.test(text)) return true;
  if (/(.)\1{5,}/u.test(text)) return true;
  const letters = text.match(/[A-Za-z]/g)?.length ?? 0;
  const upper = text.match(/[A-Z]/g)?.length ?? 0;
  return letters > 20 && upper / letters > 0.7;
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Apply steward decisions (oldest first) to participant statements, seeds, groups and flags. */
function derive(S: SDoc[], F: FRow[], D: DDoc[]) {
  const edits = new Map<string, Partial<Statement>>();
  const hidden = new Map<string, boolean>();
  const groupNames: Record<string, string> = {};
  const resolved = new Set<string>();
  for (const d of [...D].sort((a, b) => a.createdAt - b.createdAt)) {
    if (d.kind === 'statement') {
      const patch = Object.fromEntries(
        (['en', 'zh', 'theme', 'status'] as const).filter((k) => d[k] !== undefined).map((k) => [k, d[k]])
      );
      edits.set(d.target, { ...edits.get(d.target), ...patch });
    } else if (d.kind === 'seed') hidden.set(d.target, !!d.hidden);
    else if (d.kind === 'group') groupNames[d.target] = d.name ?? '';
    else if (d.kind === 'flag') resolved.add(d.target);
  }
  const submitted: Statement[] = S.map((s) => ({
    id: s.sid, en: s.en ?? '', zh: s.zh ?? '', theme: 'open', source: 'participant', status: 'pending',
    authorRole: s.authorRole, authorId: s.authorId, signals: s.signals ?? [], createdAt: s.createdAt,
    ...edits.get(s.sid),
  }));
  return {
    submitted,
    hiddenSeeds: [...hidden].filter(([, h]) => h).map(([k]) => k),
    flags: F.map((f) => ({ id: f.id, sid: f.sid, at: f.at, resolved: resolved.has(f.id) })),
    groupNames,
  };
}

/** Everyone's participant docs, with this device's session swapped in (it's always the freshest). */
function people(P: PDoc[], me: Me | null) {
  const rows: PDoc[] = P.filter((p) => p.pid !== me?.pid);
  if (me) rows.push(me);
  return {
    participants: rows.map((p) => ({ id: p.pid, role: p.role, lang: p.lang, createdAt: p.createdAt })),
    votes: rows.flatMap((p) =>
      Object.entries(p.votes ?? {}).map(([sid, v]) => ({ pid: p.pid, sid, v, at: p.times?.[sid] ?? 0 }))
    ),
  };
}

type ModerationPatch = Partial<Pick<Statement, 'en' | 'zh' | 'theme' | 'status'>>;

type State = {
  lang: Lang;
  seenAddGuide: boolean;
  me: Me | null;
  currentId: string | null;
  memberToken: string | null;
  member: Member;

  participants: Participant[];
  votes: Vote[];
  submitted: Statement[];
  hiddenSeeds: string[];
  flags: Flag[];
  groupNames: Record<string, string>;
  sync: SyncState;
  syncedAt: number | null;
  cloudError: string | null;
  _p: PDoc[];
  _s: SDoc[];
  _f: FRow[];
  _d: DDoc[];

  setLang: (lang: Lang) => void;
  start: (role: Role) => void;
  end: () => void;
  vote: (sid: string, v: VoteValue) => void;
  submit: (text: string, meta: SubmitMeta) => SubmitResult;
  flag: (sid: string) => void;
  markGuideSeen: () => void;
  refresh: () => Promise<void>;

  moderate: (id: string, patch: ModerationPatch) => void;
  setSeedHidden: (sid: string, hidden: boolean) => void;
  resolveFlag: (id: string) => void;
  setGroupName: (key: string, name: string) => void;
  resetLocal: () => void;

  requestCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  checkMember: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useStore = create<State>()(
  persist(
    (set, get) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let inflight = false;
      const schedule = () => { clearTimeout(timer); timer = setTimeout(() => void push(), 700); };

      /** Write this device's participant doc (role + votes) to the shared backend. */
      const push = async (): Promise<void> => {
        const me = get().me;
        if (!me || !cloudReady) return;
        if (inflight) { schedule(); return; }
        inflight = true;
        const { docId, ...data } = me;
        try {
          if (docId) await cloudRequest('update', 'participants', { id: docId, data });
          else {
            let id: string | undefined;
            try {
              id = (await cloudRequest<{ document?: Doc<PDoc> }>('create', 'participants', { data })).document?.id;
            } catch (e) {
              const found = await cloudRequest<{ documents?: Doc<PDoc>[] }>('query', 'participants', {
                where: [{ field: 'pid', op: 'eq', value: me.pid }], limit: 1,
              });
              id = found.documents?.[0]?.id;
              if (!id) throw e;
              await cloudRequest('update', 'participants', { id, data });
            }
            const cur = get().me;
            if (cur && cur.pid === me.pid) set({ me: { ...cur, docId: id } });
          }
          set({ cloudError: null });
        } catch (e) {
          set({ cloudError: msg(e) });
        } finally {
          inflight = false;
        }
        const cur = get().me;
        if (cur && cur.pid === me.pid && JSON.stringify(cur.votes) !== JSON.stringify(me.votes)) schedule();
      };

      /** A steward decision: applied here at once, saved with the steward's sign-in stamp. */
      const decide = (d: Omit<DDoc, 'createdAt'>) => {
        const doc: DDoc = { ...d, createdAt: Date.now() };
        const st = get();
        const _d = [...st._d, doc];
        set({ _d, ...derive(st._s, st._f, _d) });
        if (cloudReady && st.memberToken)
          cloudRequest('create', 'decisions', { data: doc, member_token: st.memberToken }).catch((e) => set({ cloudError: msg(e) }));
      };

      return {
        lang: 'en',
        seenAddGuide: false,
        me: null,
        currentId: null,
        memberToken: null,
        member: null,
        participants: [],
        votes: [],
        submitted: [],
        hiddenSeeds: [],
        flags: [],
        groupNames: {},
        sync: 'idle',
        syncedAt: null,
        cloudError: null,
        _p: [], _s: [], _f: [], _d: [],

        setLang: (lang) => set({ lang }),

        start: (role) => {
          const me: Me = { pid: newId(), role, lang: get().lang, createdAt: Date.now(), votes: {}, times: {} };
          set({ me, currentId: me.pid, ...people(get()._p, me) });
          void push();
        },

        end: () => set({ me: null, currentId: null, seenAddGuide: false, ...people(get()._p, null) }),

        vote: (sid, v) => {
          const me = get().me;
          if (!me) return;
          const next: Me = { ...me, votes: { ...me.votes, [sid]: v }, times: { ...me.times, [sid]: Date.now() } };
          set({ me: next, ...people(get()._p, next) });
          schedule();
        },

        submit: (text, { trap, openedAt }) => {
          const { currentId, me, lang, submitted } = get();
          const clean = text.trim().replace(/\s+/g, ' ');
          if (!clean || looksGarbled(clean)) return 'spam';
          // Honeypot: a field people never see. If it's filled, say thanks and keep nothing.
          if (trap) return 'ok';
          const now = Date.now();
          const mine = submitted.filter((x) => x.authorId === currentId && x.createdAt);
          if (
            mine.filter((x) => now - x.createdAt! < RATE_WINDOW).length >= RATE_MAX ||
            mine.filter((x) => now - x.createdAt! < 86_400_000).length >= DAY_MAX
          ) return 'rate';
          const n = norm(clean);
          if ([...SEED_STATEMENTS, ...submitted].some((x) => norm(x.en) === n || norm(x.zh) === n)) return 'duplicate';
          const doc: SDoc = {
            sid: 'p-' + newId().slice(0, 8),
            en: lang === 'en' ? clean : '',
            zh: lang === 'zh' ? clean : '',
            authorRole: me?.role,
            authorId: currentId ?? undefined,
            signals: now - openedAt < FAST_WRITE_MS ? ['fast'] : [],
            createdAt: now,
          };
          const st = get();
          const _s = [...st._s, doc];
          set({ _s, ...derive(_s, st._f, st._d) });
          if (cloudReady) cloudRequest('create', 'statements', { data: doc }).catch((e) => set({ cloudError: msg(e) }));
          return 'ok';
        },

        flag: (sid) => {
          const at = Date.now();
          const st = get();
          const _f = [...st._f, { id: 'local-' + newId(), sid, at }];
          set({ _f, ...derive(st._s, _f, st._d) });
          if (cloudReady) cloudRequest('create', 'flags', { data: { sid, createdAt: at } }).catch((e) => set({ cloudError: msg(e) }));
        },

        markGuideSeen: () => set({ seenAddGuide: true }),

        refresh: async () => {
          if (!cloudReady) { set({ sync: 'offline' }); return; }
          set({ sync: 'loading' });
          try {
            const [P, S, F, D] = await Promise.all([
              listAll<PDoc>('participants'),
              listAll<SDoc>('statements'),
              listAll<{ sid: string; createdAt: number }>('flags'),
              listAll<DDoc>('decisions'),
            ]);
            const _p = P.map((d) => d.data);
            const _s = S.map((d) => d.data);
            const _f = F.map((d) => ({ id: d.id, sid: d.data.sid, at: d.data.createdAt }));
            const _d = D.filter((d) => isSteward(stampOf(d))).map((d) => d.data);
            let me = get().me;
            if (me && !me.docId) {
              const found = P.find((d) => d.data.pid === me!.pid);
              if (found) me = { ...me, docId: found.id };
            }
            set({ me, _p, _s, _f, _d, ...derive(_s, _f, _d), ...people(_p, me), sync: 'ready', syncedAt: Date.now(), cloudError: null });
          } catch (e) {
            set({ sync: 'error', cloudError: msg(e) });
          }
        },

        moderate: (id, patch) => decide({ kind: 'statement', target: id, ...patch }),
        setSeedHidden: (sid, hidden) => decide({ kind: 'seed', target: sid, hidden }),
        resolveFlag: (id) => decide({ kind: 'flag', target: id }),
        setGroupName: (key, name) => decide({ kind: 'group', target: key, name: name.slice(0, 60) }),

        resetLocal: () => set({ me: null, currentId: null, seenAddGuide: false, ...people(get()._p, null) }),

        requestCode: async (email) => {
          await cloudRequest('auth_request', 'any', { email: email.trim() });
        },
        verifyCode: async (email, code) => {
          const r = await cloudRequest<{ member_token: string; member: Member }>('auth_verify', 'any', { email: email.trim(), code: code.trim() });
          set({ memberToken: r.member_token, member: { ...r.member, email: r.member?.email ?? email.trim().toLowerCase() } });
        },
        checkMember: async () => {
          const token = get().memberToken;
          if (!token || !cloudReady) return;
          try {
            const r = await cloudRequest<{ member: Member }>('auth_me', 'any', { member_token: token });
            if (!r.member) set({ memberToken: null, member: null });
            else set({ member: { ...get().member, ...r.member } });
          } catch {
            /* offline: keep the session until it's known to be expired */
          }
        },
        signOut: async () => {
          const token = get().memberToken;
          set({ memberToken: null, member: null });
          if (token) await cloudRequest('auth_signout', 'any', { member_token: token }).catch(() => undefined);
        },
      };
    },
    {
      name: 'key-common-ground-v3',
      partialize: (s) => ({
        lang: s.lang, seenAddGuide: s.seenAddGuide, me: s.me, currentId: s.currentId, memberToken: s.memberToken, member: s.member,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return { ...current, ...p, ...people([], p.me ?? null) };
      },
    }
  )
);

/** The signed-in person is on the steward list. */
export const canSteward = (m: Member) => isSteward(m?.email ?? m?.name);

/** Everything currently in rotation: seed statements not hidden + approved participant statements. */
export function liveStatements(submitted: Statement[], hiddenSeeds: string[]): Statement[] {
  const seeds = SEED_STATEMENTS.filter((s) => !hiddenSeeds.includes(s.id));
  return [...seeds, ...submitted.filter((s) => s.status === 'approved')];
}

/** Text in the chosen language, falling back to the other while a translation is pending. */
export function textOf(s: Statement, lang: Lang): { text: string; fallback: boolean } {
  const want = lang === 'zh' ? s.zh : s.en;
  if (want) return { text: want, fallback: false };
  return { text: lang === 'zh' ? s.en : s.zh, fallback: true };
}

/** Deterministic per-participant shuffle so each person sees a different order, stable across reloads. */
export function seededOrder<T extends { id: string }>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}