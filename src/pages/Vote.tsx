import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TopBar from '@/components/TopBar';
import { liveStatements, seededOrder, textOf, useStore, type VoteValue } from '@/lib/store';
import { t, type StringKey } from '@/lib/i18n';
import { THEMES, type Role } from '@/data/statements';

const ROLES: { role: Role; key: StringKey }[] = [
  { role: 'parent', key: 'roleParent' },
  { role: 'staff', key: 'roleStaff' },
  { role: 'both', key: 'roleBoth' },
];

const FROM: Record<Role, StringKey> = { parent: 'fromParent', staff: 'fromStaff', both: 'fromBoth' };

export default function Vote() {
  const lang = useStore((s) => s.lang);
  const currentId = useStore((s) => s.currentId);
  const start = useStore((s) => s.start);
  const votes = useStore((s) => s.votes);
  const submitted = useStore((s) => s.submitted);
  const hiddenSeeds = useStore((s) => s.hiddenSeeds);
  const castVote = useStore((s) => s.vote);
  const flag = useStore((s) => s.flag);
  const [flagged, setFlagged] = useState<string | null>(null);

  const deck = useMemo(() => {
    if (!currentId) return [];
    const mine = new Set(votes.filter((v) => v.pid === currentId).map((v) => v.sid));
    return seededOrder(liveStatements(submitted, hiddenSeeds), currentId).filter((s) => !mine.has(s.id));
  }, [currentId, votes, submitted, hiddenSeeds]);

  if (!currentId) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        <TopBar />
        <main className="flex flex-1 flex-col justify-center gap-8 px-5 py-10 md:px-10">
          <p className="label text-muted-foreground">{t(lang, 'topic')}</p>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{t(lang, 'question')}</h1>
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground">{t(lang, 'pickRole')}</p>
            {ROLES.map(({ role, key }) => (
              <button key={role} type="button" onClick={() => start(role)} className="pill pill-agree w-full">
                {t(lang, key)}
              </button>
            ))}
            <p className="mt-1 text-sm text-muted-foreground">{t(lang, 'anonNote')}</p>
          </div>
        </main>
        <Footer lang={lang} />
      </div>
    );
  }

  const card = deck[0];
  const answer = (v: VoteValue) => {
    if (!card) return;
    setFlagged(null);
    castVote(card.id, v);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col border-x border-border/60 bg-card/40">
      <TopBar showEnd />
      <div className="label flex justify-between px-4 py-3 text-muted-foreground md:px-6">
        <span>{card ? THEMES[card.theme][lang] : t(lang, 'topic')}</span>
        <span>
          {deck.length} {t(lang, 'left')}
        </span>
      </div>

      <main className="flex flex-1 flex-col px-5 md:px-8">
        {card ? (
          <>
            <div key={card.id} className="card-in flex flex-1 flex-col justify-center gap-4 py-8">
              {card.source === 'participant' && (
                <span className="chip self-start bg-accent text-accent-foreground">
                  {t(lang, card.authorRole ? FROM[card.authorRole] : 'fromNeighbor')}
                </span>
              )}
              <p className="text-2xl font-medium leading-snug md:text-3xl">“{textOf(card, lang).text}”</p>
              {textOf(card, lang).fallback && (
                <span className="label text-muted-foreground">{t(lang, 'pendingTranslation')}</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <button type="button" className="pill pill-agree px-2" onClick={() => answer(1)}>
                {t(lang, 'agree')}
              </button>
              <button type="button" className="pill pill-disagree px-2" onClick={() => answer(-1)}>
                {t(lang, 'disagree')}
              </button>
              <button type="button" className="pill pill-unsure px-2" onClick={() => answer(0)}>
                {t(lang, 'unsure')}
              </button>
            </div>
            <p className="py-4 text-center text-sm">
              {flagged === card.id ? (
                <span className="text-muted-foreground">{t(lang, 'reported')}</span>
              ) : (
                <>
                  {t(lang, 'somethingWrong')}{' '}
                  <button
                    type="button"
                    className="text-[var(--coral-ink)] underline underline-offset-2"
                    onClick={() => {
                      flag(card.id);
                      setFlagged(card.id);
                    }}
                  >
                    {t(lang, 'reportStatement')}
                  </button>
                </>
              )}
            </p>
          </>
        ) : (
          <div className="card-in flex flex-1 flex-col justify-center gap-5 py-10">
            <h2 className="text-2xl font-semibold leading-snug">{t(lang, 'doneTitle')}</h2>
            <p className="text-muted-foreground">{t(lang, 'doneBody')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/add" className="pill pill-agree flex-1">
                {t(lang, 'addOne')}
              </Link>
              <Link to="/report" className="pill pill-quiet flex-1">
                {t(lang, 'seeReport')}
              </Link>
            </div>
          </div>
        )}
      </main>

      <div className="no-print sticky bottom-0 rounded-t-[2rem] bg-[var(--bark)] px-4 py-4 md:px-6">
        <Link
          to="/add"
          className="flex min-h-12 items-center justify-between rounded-full bg-card px-5 font-medium text-muted-foreground shadow-inner"
        >
          {t(lang, 'sharePlaceholder')}
          <ArrowRight className="size-5 text-foreground" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function Footer({ lang }: { lang: 'en' | 'zh' }) {
  return (
    <footer className="no-print flex justify-center gap-6 px-4 py-5 text-sm text-muted-foreground">
      <Link to="/report" className="underline underline-offset-2 hover:text-foreground">
        {t(lang, 'results')}
      </Link>
      <Link to="/about" className="underline underline-offset-2 hover:text-foreground">
        {t(lang, 'about')}
      </Link>
    </footer>
  );
}