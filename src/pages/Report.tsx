import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import { liveStatements, textOf, useStore, type Lang } from '@/lib/store';
import { analyze, countEligible, MIN_PARTICIPANTS, MIN_VOTES } from '@/lib/clustering';
import { demoData } from '@/lib/demoVotes';
import { SEED_STATEMENTS, type Statement } from '@/data/statements';

const COLORS = ['var(--primary)', 'var(--destructive)', 'var(--accent)', 'var(--foreground)'];
const pct = (x: number) => Math.round(x * 100) + '%';

export default function Report() {
  const lang = useStore((s) => s.lang);
  const participants = useStore((s) => s.participants);
  const votes = useStore((s) => s.votes);
  const submitted = useStore((s) => s.submitted);
  const hiddenSeeds = useStore((s) => s.hiddenSeeds);
  const groupNames = useStore((s) => s.groupNames);
  const [params] = useSearchParams();
  const demo = params.get('demo') === '1';
  const L = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const { statements, eligible, result } = useMemo(() => {
    if (demo) {
      const d = demoData();
      return { statements: SEED_STATEMENTS, eligible: d.participants.length, result: analyze(d.participants, SEED_STATEMENTS, d.votes) };
    }
    const live = liveStatements(submitted, hiddenSeeds);
    return { statements: live, eligible: countEligible(participants, live, votes), result: analyze(participants, live, votes) };
  }, [demo, participants, votes, submitted, hiddenSeeds]);

  const byId = useMemo(() => new Map<string, Statement>([...SEED_STATEMENTS, ...submitted].map((s) => [s.id, s])), [submitted]);
  const txt = (sid: string) => { const s = byId.get(sid); return s ? textOf(s, lang).text : sid; };
  const ready = demo || eligible >= MIN_PARTICIPANTS;
  const name = (i: number) =>
    (result && groupNames[`${demo ? 'demo:' : ''}${result.k}-${i}`]) || L(`Group ${'ABCD'[i]}`, `第 ${'ABCD'[i]} 組`);
  void statements;

  return (
    <div className="mx-auto min-h-dvh max-w-3xl">
      <TopBar />
      {demo && (
        <p className="label sticky top-0 z-10 bg-destructive px-4 py-2 text-center text-destructive-foreground">
          {L('Demo votes — not FSK responses', '示範投票——並非 FSK 的回應')}
        </p>
      )}
      <main className="flex flex-col gap-10 px-5 py-8 md:px-8">
        <header className="flex flex-col gap-3">
          <p className="label text-muted-foreground">{L('Results · Tech & AI at FSK', '結果 · FSK 的科技與 AI')}</p>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            {L('Where FSK parents and teachers stand', 'FSK 家長與老師的看法')}
          </h1>
        </header>

        {!ready || !result ? (
          <section className="flex flex-col gap-4 rounded-[var(--radius)] bg-card p-6 shadow-sm">
            <p className="text-2xl font-semibold">
              {eligible} {L(`of ${MIN_PARTICIPANTS} so far`, `/ ${MIN_PARTICIPANTS} 人`)}
            </p>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: pct(Math.min(1, eligible / MIN_PARTICIPANTS)) }} />
            </div>
            <p className="text-muted-foreground">
              {L(
                `Results open once ${MIN_PARTICIPANTS} people have each answered ${MIN_VOTES} or more statements. Until then there are no groups to show, and we won't invent any.`,
                `當 ${MIN_PARTICIPANTS} 人各回應至少 ${MIN_VOTES} 則陳述後，結果便會公開。在此之前沒有分組可顯示，我們也不會捏造。`
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="pill pill-agree flex-1">{L('Vote now', '立即投票')}</Link>
              <Link to="/report?demo=1" className="pill pill-quiet flex-1">{L('See it with demo votes', '以示範投票預覽')}</Link>
            </div>
          </section>
        ) : (
          <>
            <Section title={L('Who took part', '參與者')}>
              <div className="grid grid-cols-3 gap-3">
                {([['parent', 'Parents', '家長'], ['staff', 'Teachers & staff', '老師與職員'], ['both', 'Both', '兩者皆是']] as const).map(([r, en, zh]) => (
                  <div key={r} className="rounded-[var(--radius)] bg-card p-4 text-center shadow-sm">
                    <p className="text-3xl font-semibold">{result.roles[r]}</p>
                    <p className="label text-muted-foreground">{L(en, zh)}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={L(`${result.k} opinion groups`, `${result.k} 個意見群組`)}>
              <Scatter points={result.points} />
              <div className="grid gap-4 md:grid-cols-2">
                {result.groups.map((g) => (
                  <article key={g.index} className="flex flex-col gap-3 rounded-[var(--radius)] bg-card p-5 shadow-sm" style={{ borderTop: `6px solid ${COLORS[g.index]}` }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-semibold">{name(g.index)}</h3>
                      <span className="chip bg-muted">{g.members.length} {L('people', '人')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {L(`${g.roles.parent} parents · ${g.roles.staff} staff · ${g.roles.both} both`, `家長 ${g.roles.parent} · 職員 ${g.roles.staff} · 兩者 ${g.roles.both}`)}
                    </p>
                    <ul className="flex flex-col gap-2 text-sm">
                      {g.distinctive.map((d) => {
                        const agreeSide = Math.abs(d.pa - d.restPa) >= Math.abs(d.pd - d.restPd);
                        return (
                          <li key={d.sid}>
                            “{txt(d.sid)}”
                            <span className="label block text-muted-foreground">
                              {agreeSide ? L(`${pct(d.pa)} agree vs ${pct(d.restPa)} of others`, `${pct(d.pa)} 同意，其他人 ${pct(d.restPa)}`) : L(`${pct(d.pd)} disagree vs ${pct(d.restPd)} of others`, `${pct(d.pd)} 不同意，其他人 ${pct(d.restPd)}`)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                ))}
              </div>
            </Section>

            <Section title={L('Where everyone agrees', '大家都認同的')} note={L('At least 60% in every group.', '每個群組至少 60%。')}>
              <Rows lang={lang} empty={L('No statement cleared the bar in every group yet.', '暫時沒有陳述在每個群組都達標。')}
                rows={result.consensus.map((c) => ({ sid: c.sid, text: txt(c.sid), meta: L(`${pct(c.min)}+ ${c.dir === 'agree' ? 'agree' : 'disagree'} in every group`, `每組至少 ${pct(c.min)} ${c.dir === 'agree' ? '同意' : '不同意'}`) }))} />
            </Section>

            <Section title={L('Parents and teachers agree', '家長與老師都同意')}>
              <Rows lang={lang} empty={result.staffEnough ? L('None yet.', '暫時沒有。') : L('Not enough teachers and staff have voted to compare yet.', '參與的老師與職員還不夠，暫時無法比較。')}
                rows={result.roleAgree.map((r) => ({ sid: r.sid, text: txt(r.sid), meta: L(`Parents ${pct(r.parent)} · Teachers ${pct(r.staff)} agree`, `家長 ${pct(r.parent)} · 老師 ${pct(r.staff)} 同意`) }))} />
            </Section>

            <Section title={L('Parents and teachers differ', '家長與老師看法不同')}>
              <Rows lang={lang} empty={L('No big gaps yet.', '暫時沒有明顯差距。')}
                rows={result.roleDiffer.map((r) => ({ sid: r.sid, text: txt(r.sid), meta: L(`Parents ${pct(r.parent)} · Teachers ${pct(r.staff)} agree`, `家長 ${pct(r.parent)} · 老師 ${pct(r.staff)} 同意`) }))} />
            </Section>

            <Section title={L('What divides us', '分歧所在')}>
              <Rows lang={lang} empty={L('No sharp divides.', '沒有明顯分歧。')}
                rows={result.divisive.map((d) => ({ sid: d.sid, text: txt(d.sid), meta: d.byGroup.map((p, i) => `${name(i)} ${pct(p)}`).join(' · ') }))} />
            </Section>
          </>
        )}

        <Section title={L('What happens next', '接下來')}>
          <ol className="grid gap-3 md:grid-cols-4">
            {[
              [L('Heard', '聽到了'), L('This report, read aloud at an FSK School Site Council meeting.', '本報告，將在 FSK 校務委員會會議上宣讀。')],
              [L('Doing', '進行中'), L('FSK sends where-we-agree to the board and Superintendent Su’s office.', 'FSK 把共識送交教育委員會及蘇學監辦公室。')],
              [L('Changed', '改變'), L('Filled in by the steward after the board votes.', '教育委員會表決後由管理員更新。')],
              [L('Expect next', '預計'), L('Board vote on SFUSD’s tech & AI policy, March 2027.', '教育委員會於 2027 年 3 月表決科技與 AI 政策。')],
            ].map(([h, b]) => (
              <li key={h} className="rounded-[var(--radius)] bg-card p-4 shadow-sm">
                <p className="label text-[var(--coral-ink)]">{h}</p>
                <p className="text-sm">{b}</p>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            {L(
              `Method: each person's votes place them on a map (PCA); similar voters form groups (k-means, 2–4 groups). Only people with ${MIN_VOTES}+ votes count. Group names are written by people, not software.`,
              `方法：每人的投票把他們放在一張圖上（主成分分析）；投票相近的人組成群組（k-means，2–4 組）。只計算投了 ${MIN_VOTES} 票以上的人。群組名稱由人撰寫，而非軟體。`
            )}{' '}
            {result && result.setAside > 0 &&
              L(
                `${result.setAside} voting session${result.setAside === 1 ? ' was' : 's were'} set aside for voting faster than a person can read.`,
                `有 ${result.setAside} 個投票紀錄因速度快過常人閱讀而被排除。`
              )}{' '}
            <Link to="/about" className="underline underline-offset-2">{L('More', '更多')}</Link>
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="border-b border-border pb-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Rows({ rows, empty }: { lang: Lang; empty: string; rows: { sid: string; text: string; meta: string }[] }) {
  if (!rows.length) return <p className="text-muted-foreground">{empty}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.sid} className="rounded-[var(--radius)] bg-card px-5 py-4 shadow-sm">
          <p className="text-lg leading-snug">“{r.text}”</p>
          <p className="label mt-1 text-muted-foreground">{r.meta}</p>
        </li>
      ))}
    </ul>
  );
}

function Scatter({ points }: { points: { x: number; y: number; g: number }[] }) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sx = (x: number) => 6 + ((x - x0) / (x1 - x0 || 1)) * 88;
  const sy = (y: number) => 6 + ((y - y0) / (y1 - y0 || 1)) * 48;
  return (
    <svg viewBox="0 0 100 60" className="w-full rounded-[var(--radius)] bg-card shadow-sm" role="img" aria-label="Map of voters by opinion group">
      {points.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={1.3} fill={COLORS[p.g]} opacity={0.85} />)}
    </svg>
  );
}