import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import SyncLine from '@/components/SyncLine';
import { canSteward, liveStatements, textOf, useStore } from '@/lib/store';
import { cloudReady } from '@/lib/cloud';
import { analyze } from '@/lib/clustering';
import { demoData } from '@/lib/demoVotes';
import { SEED_STATEMENTS, THEMES, type Statement, type ThemeId } from '@/data/statements';

const inputCls =
  'w-full rounded-2xl border border-input bg-background px-4 py-3 text-base leading-snug outline-none focus:ring-2 focus:ring-ring';

export default function Steward() {
  const participants = useStore((s) => s.participants);
  const votes = useStore((s) => s.votes);
  const submitted = useStore((s) => s.submitted);
  const hiddenSeeds = useStore((s) => s.hiddenSeeds);
  const flags = useStore((s) => s.flags);
  const groupNames = useStore((s) => s.groupNames);
  const moderate = useStore((s) => s.moderate);
  const setSeedHidden = useStore((s) => s.setSeedHidden);
  const resolveFlag = useStore((s) => s.resolveFlag);
  const setGroupName = useStore((s) => s.setGroupName);
  const resetLocal = useStore((s) => s.resetLocal);
  const [useDemo, setUseDemo] = useState(false);
  const member = useStore((s) => s.member);
  const refresh = useStore((s) => s.refresh);
  const checkMember = useStore((s) => s.checkMember);
  const signOut = useStore((s) => s.signOut);

  useEffect(() => {
    void checkMember();
    void refresh();
  }, [checkMember, refresh]);

  const byId = useMemo(() => new Map<string, Statement>([...SEED_STATEMENTS, ...submitted].map((s) => [s.id, s])), [submitted]);
  const pending = submitted.filter((s) => s.status === 'pending');
  const openFlags = flags.filter((f) => !f.resolved);
  const flagGroups = [...new Set(openFlags.map((f) => f.sid))].map((sid) => ({ sid, count: openFlags.filter((f) => f.sid === sid).length }));

  const result = useMemo(() => {
    if (useDemo) {
      const d = demoData();
      return analyze(d.participants, SEED_STATEMENTS, d.votes);
    }
    return analyze(participants, liveStatements(submitted, hiddenSeeds), votes);
  }, [useDemo, participants, votes, submitted, hiddenSeeds]);

  if (cloudReady && !canSteward(member)) return <Gate />;

  const hideStatement = (sid: string) => {
    if (sid.startsWith('p-')) moderate(sid, { status: 'hidden' });
    else setSeedHidden(sid, true);
    openFlags.filter((f) => f.sid === sid).forEach((f) => resolveFlag(f.id));
  };

  const exportCsv = () => {
    const role = new Map(participants.map((p) => [p.id, p.role]));
    const q = (x: string) => `"${x.replace(/"/g, '""')}"`;
    const lines = [
      'participant,role,statement_id,statement_en,vote',
      ...votes.map((v) => [v.pid.slice(0, 8), role.get(v.pid) ?? '', v.sid, q(byId.get(v.sid)?.en ?? ''), v.v].join(',')),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'key-common-ground-votes.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto min-h-dvh max-w-3xl">
      <TopBar />
      <main className="flex flex-col gap-10 px-5 py-8 md:px-8">
        <header className="flex flex-col gap-2">
          <p className="label text-muted-foreground">Steward</p>
          <h1 className="text-3xl font-semibold">Tend the conversation</h1>
          <div className="flex flex-wrap gap-2">
            <span className="chip bg-muted">{participants.length} participants</span>
            <span className="chip bg-muted">{votes.length} votes</span>
            <span className="chip bg-accent text-accent-foreground">{pending.length} waiting</span>
            <span className="chip bg-destructive text-destructive-foreground">{flagGroups.length} flagged</span>
          </div>
          <SyncLine />
          {member && (
            <p className="text-sm text-muted-foreground">
              Signed in as {member.email ?? member.name}.{' '}
              <button type="button" className="underline underline-offset-2" onClick={() => void signOut()}>Sign out</button>
            </p>
          )}
        </header>

        <Block title="Waiting for review">
          {pending.length ? pending.map((s) => <PendingCard key={s.id} s={s} />) : <p className="text-muted-foreground">Nothing in the queue. New statements land here before anyone sees them.</p>}
        </Block>

        <Block title="Flagged by participants">
          {flagGroups.length ? (
            flagGroups.map(({ sid, count }) => {
              const s = byId.get(sid);
              return (
                <div key={sid} className="flex flex-col gap-3 rounded-[var(--radius)] bg-card p-5 shadow-sm">
                  <p className="text-lg leading-snug">“{s ? textOf(s, 'en').text : sid}”</p>
                  <p className="label text-[var(--coral-ink)]">Reported {count}×</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="pill pill-disagree" onClick={() => hideStatement(sid)}>Hide it</button>
                    <button className="pill pill-quiet" onClick={() => openFlags.filter((f) => f.sid === sid).forEach((f) => resolveFlag(f.id))}>Keep it</button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No reports. Good sign.</p>
          )}
        </Block>

        {hiddenSeeds.length > 0 && (
          <Block title="Hidden seed statements">
            {hiddenSeeds.map((sid) => (
              <div key={sid} className="flex items-center justify-between gap-3 rounded-[var(--radius)] bg-card px-5 py-3 shadow-sm">
                <p className="text-sm">“{byId.get(sid)?.en}”</p>
                <button className="chip min-h-9 bg-primary text-primary-foreground" onClick={() => setSeedHidden(sid, false)}>Restore</button>
              </div>
            ))}
          </Block>
        )}

        <Block title="Name the groups">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-[var(--primary)]" checked={useDemo} onChange={(e) => setUseDemo(e.target.checked)} />
            Practice on the demo votes
          </label>
          {result ? (
            <>
              <p className="text-sm text-muted-foreground">Read what sets each group apart, then name it with the editorial trio. Names show on the report exactly as written.</p>
              {result.groups.map((g) => {
                const key = `${useDemo ? 'demo:' : ''}${result.k}-${g.index}`;
                const top = g.distinctive[0];
                return (
                  <div key={key} className="flex flex-col gap-2 rounded-[var(--radius)] bg-card p-5 shadow-sm">
                    <p className="label text-muted-foreground">Group {'ABCD'[g.index]} · {g.members.length} people</p>
                    {top && <p className="text-sm">Stands out on: “{textOf(byId.get(top.sid)!, 'en').text}”</p>}
                    <input className={inputCls} placeholder={`Group ${'ABCD'[g.index]}`} value={groupNames[key] ?? ''} onChange={(e) => setGroupName(key, e.target.value)} />
                  </div>
                );
              })}
              <Link to={useDemo ? '/report?demo=1' : '/report'} className="pill pill-quiet">See the report →</Link>
            </>
          ) : (
            <p className="text-muted-foreground">Groups appear once at least 6 people have each answered 10 statements.</p>
          )}
        </Block>

        <Block title="Data">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="pill pill-agree flex-1" onClick={exportCsv} disabled={!votes.length}>Export votes (CSV)</button>
            <button
              className="pill pill-quiet flex-1"
              onClick={() => { if (confirm('End the voting session on this device? Shared votes stay in the backend.')) resetLocal(); }}
            >
              End this device's session
            </button>
          </div>
          <p className="text-sm text-muted-foreground">The export holds role and votes only, with no names and no contact details.</p>
        </Block>
      </main>
    </div>
  );
}

function Gate() {
  const member = useStore((s) => s.member);
  const requestCode = useStore((s) => s.requestCode);
  const verifyCode = useStore((s) => s.verifyCode);
  const signOut = useStore((s) => s.signOut);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar />
      <main className="flex flex-col gap-5 px-5 py-10">
        <p className="label text-muted-foreground">Steward</p>
        <h1 className="text-3xl font-semibold">Sign in to tend the conversation</h1>
        {member ? (
          <>
            <p>{member.email ?? member.name} isn't on the steward list for this conversation.</p>
            <button className="pill pill-quiet" onClick={() => void signOut()}>Use a different email</button>
          </>
        ) : step === 'email' ? (
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void run(async () => { await requestCode(email); setStep('code'); }); }}>
            <label htmlFor="st-email" className="label text-muted-foreground">Email</label>
            <input id="st-email" type="email" required autoComplete="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="pill pill-agree" disabled={busy || !email.includes('@')}>{busy ? 'Sending…' : 'Send me a code'}</button>
          </form>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void run(() => verifyCode(email, code)); }}>
            <p>Check {email} for a 6-digit code.</p>
            <label htmlFor="st-code" className="label text-muted-foreground">Code</label>
            <input id="st-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className={inputCls} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            <button className="pill pill-agree" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Sign in'}</button>
            <button type="button" className="label self-start text-muted-foreground" onClick={() => { setStep('email'); setCode(''); }}>← Different email</button>
          </form>
        )}
        {error && <p className="text-sm text-[var(--coral-ink)]" role="alert">{error}</p>}
      </main>
    </div>
  );
}

function PendingCard({ s }: { s: Statement }) {
  const moderate = useStore((st) => st.moderate);
  const [en, setEn] = useState(s.en);
  const [zh, setZh] = useState(s.zh);
  const [theme, setTheme] = useState<ThemeId>(s.theme);
  const both = en.trim() && zh.trim();

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] bg-card p-5 shadow-sm">
      <p className="label text-muted-foreground">
        From a {s.authorRole === 'staff' ? 'teacher' : s.authorRole === 'both' ? 'parent & teacher' : 'parent'}
      </p>
      {s.signals?.includes('fast') && (
        <span className="chip self-start bg-secondary text-secondary-foreground">Written in under 4 seconds: check it reads like a person</span>
      )}
      <label className="label text-muted-foreground" htmlFor={`en-${s.id}`}>English</label>
      <textarea id={`en-${s.id}`} className={inputCls} rows={2} value={en} onChange={(e) => setEn(e.target.value)} />
      <label className="label text-muted-foreground" htmlFor={`zh-${s.id}`}>繁體中文</label>
      <textarea id={`zh-${s.id}`} className={inputCls} rows={2} value={zh} onChange={(e) => setZh(e.target.value)} />
      <label className="label text-muted-foreground" htmlFor={`th-${s.id}`}>Theme</label>
      <select id={`th-${s.id}`} className={inputCls} value={theme} onChange={(e) => setTheme(e.target.value as ThemeId)}>
        {(Object.keys(THEMES) as ThemeId[]).map((id) => <option key={id} value={id}>{THEMES[id].en}</option>)}
      </select>
      {!both && <p className="text-sm text-[var(--coral-ink)]">Add the missing translation, or approve and it shows with a “translation coming” note.</p>}
      <div className="grid grid-cols-2 gap-2">
        <button className="pill pill-agree" disabled={!en.trim() && !zh.trim()} onClick={() => moderate(s.id, { en: en.trim(), zh: zh.trim(), theme, status: 'approved' })}>Approve</button>
        <button className="pill pill-disagree" onClick={() => moderate(s.id, { status: 'hidden' })}>Don't publish</button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-2 text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}