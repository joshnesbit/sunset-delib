import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_STATEMENTS, type Role, type Statement, type ThemeId } from '@/data/statements';

export type Lang = 'en' | 'zh';
export type VoteValue = -1 | 0 | 1;
export type Vote = { pid: string; sid: string; v: VoteValue; at: number };
export type Participant = { id: string; role: Role; lang: Lang; createdAt: number };
export type Flag = { id: string; sid: string; at: number; resolved: boolean };

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

type ModerationPatch = Partial<Pick<Statement, 'en' | 'zh' | 'theme' | 'status'>> & { theme?: ThemeId };

type State = {
  lang: Lang;
  participants: Participant[];
  currentId: string | null;
  votes: Vote[];
  submitted: Statement[];
  hiddenSeeds: string[];
  flags: Flag[];
  seenAddGuide: boolean;
  groupNames: Record<string, string>;

  setLang: (lang: Lang) => void;
  start: (role: Role) => void;
  end: () => void;
  vote: (sid: string, v: VoteValue) => void;
  submit: (text: string) => void;
  moderate: (id: string, patch: ModerationPatch) => void;
  setSeedHidden: (sid: string, hidden: boolean) => void;
  flag: (sid: string) => void;
  resolveFlag: (id: string) => void;
  markGuideSeen: () => void;
  setGroupName: (key: string, name: string) => void;
  resetLocal: () => void;
};

const empty = {
  participants: [] as Participant[],
  currentId: null as string | null,
  votes: [] as Vote[],
  submitted: [] as Statement[],
  hiddenSeeds: [] as string[],
  flags: [] as Flag[],
  groupNames: {} as Record<string, string>,
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: 'en',
      seenAddGuide: false,
      ...empty,

      setLang: (lang) => set({ lang }),

      start: (role) => {
        const p: Participant = { id: newId(), role, lang: get().lang, createdAt: Date.now() };
        set((st) => ({ participants: [...st.participants, p], currentId: p.id }));
      },

      end: () => set({ currentId: null, seenAddGuide: false }),

      vote: (sid, v) => {
        const pid = get().currentId;
        if (!pid) return;
        set((st) => ({
          votes: [...st.votes.filter((x) => !(x.pid === pid && x.sid === sid)), { pid, sid, v, at: Date.now() }],
        }));
      },

      submit: (text) => {
        const { currentId, participants, lang } = get();
        const author = participants.find((p) => p.id === currentId);
        const clean = text.trim();
        if (!clean) return;
        const st: Statement = {
          id: 'p-' + newId().slice(0, 8),
          en: lang === 'en' ? clean : '',
          zh: lang === 'zh' ? clean : '',
          theme: 'open',
          source: 'participant',
          status: 'pending',
          authorRole: author?.role,
          createdAt: Date.now(),
        };
        set((s) => ({ submitted: [...s.submitted, st] }));
      },

      moderate: (id, patch) =>
        set((st) => ({ submitted: st.submitted.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),

      setSeedHidden: (sid, hidden) =>
        set((st) => ({
          hiddenSeeds: hidden ? [...new Set([...st.hiddenSeeds, sid])] : st.hiddenSeeds.filter((x) => x !== sid),
        })),

      flag: (sid) => set((st) => ({ flags: [...st.flags, { id: newId(), sid, at: Date.now(), resolved: false }] })),

      resolveFlag: (id) => set((st) => ({ flags: st.flags.map((f) => (f.id === id ? { ...f, resolved: true } : f)) })),

      markGuideSeen: () => set({ seenAddGuide: true }),

      setGroupName: (key, name) => set((st) => ({ groupNames: { ...st.groupNames, [key]: name } })),

      resetLocal: () => set({ ...empty, seenAddGuide: false }),
    }),
    { name: 'key-common-ground-v1' }
  )
);

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