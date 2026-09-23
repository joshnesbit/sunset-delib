import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import { useStore } from '@/lib/store';
import { t, type StringKey } from '@/lib/i18n';

const MAX = 160;
const LINK_RE = /(https?:\/\/|www\.|\.(com|org|net|io|us)\b)/i;
const GUIDE: [StringKey, StringKey][] = [
  ['guide1b', 'guide1'],
  ['guide2b', 'guide2'],
  ['guide3b', 'guide3'],
  ['guide4b', 'guide4'],
];

export default function Add() {
  const lang = useStore((s) => s.lang);
  const currentId = useStore((s) => s.currentId);
  const seen = useStore((s) => s.seenAddGuide);
  const markSeen = useStore((s) => s.markGuideSeen);
  const submit = useStore((s) => s.submit);
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [sent, setSent] = useState(false);

  if (!currentId) return <Navigate to="/" replace />;

  const hasLink = LINK_RE.test(text);
  const canSend = text.trim().length >= 8 && !hasLink;

  if (!seen || showGuide) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        <TopBar showEnd />
        <main className="flex flex-1 flex-col px-4 py-6 md:px-6">
          <section className="card-in flex flex-1 flex-col gap-4 rounded-[var(--radius)] bg-card p-6 shadow-sm md:p-8">
            <h1 className="text-3xl font-semibold">{t(lang, 'guideTitle')}</h1>
            <p>{t(lang, 'guideIntro')}</p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {GUIDE.map(([b, rest]) => (
                <li key={b}>
                  <strong>{t(lang, b)}</strong>
                  {t(lang, rest)}
                </li>
              ))}
            </ul>
            <p>{t(lang, 'guideOutro')}</p>
            <button
              type="button"
              className="pill pill-agree mt-auto w-full"
              onClick={() => {
                markSeen();
                setShowGuide(false);
              }}
            >
              {t(lang, 'gotIt')}
            </button>
          </section>
        </main>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        <TopBar showEnd />
        <main className="card-in flex flex-1 flex-col justify-center gap-5 px-5 py-10">
          <h1 className="text-3xl font-semibold">{t(lang, 'thanksTitle')}</h1>
          <p className="text-muted-foreground">{t(lang, 'thanksBody')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="pill pill-agree flex-1">
              {t(lang, 'keepVoting')}
            </Link>
            <button
              type="button"
              className="pill pill-quiet flex-1"
              onClick={() => {
                setText('');
                setSent(false);
              }}
            >
              {t(lang, 'addAnother')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <TopBar showEnd />
      <main className="flex flex-1 flex-col gap-4 px-4 py-6 md:px-6">
        <h1 className="text-2xl font-semibold leading-snug md:text-3xl">{t(lang, 'question')}</h1>
        <button
          type="button"
          className="label self-start text-muted-foreground hover:text-foreground"
          onClick={() => setShowGuide(true)}
        >
          {t(lang, 'showInstructions')} →
        </button>
        <div className="flex flex-1 flex-col rounded-[var(--radius)] bg-card p-5 shadow-md">
          <label htmlFor="stmt" className="sr-only">
            {t(lang, 'typeHere')}
          </label>
          <textarea
            id="stmt"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder={t(lang, 'typeHere')}
            className="min-h-48 flex-1 resize-none bg-transparent text-xl leading-snug outline-none placeholder:text-muted-foreground/80"
            autoFocus
          />
          <div className="label flex justify-between pt-2">
            <span className="text-[var(--coral-ink)]">{hasLink ? t(lang, 'noLinks') : ''}</span>
            <span className="text-muted-foreground">
              {text.length} / {MAX} {t(lang, 'chars')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="pill pill-disagree" onClick={() => navigate('/')}>
            {t(lang, 'goBack')}
          </button>
          <button
            type="button"
            className="pill pill-agree"
            disabled={!canSend}
            onClick={() => {
              submit(text);
              setSent(true);
            }}
          >
            {t(lang, 'submit')}
          </button>
        </div>
      </main>
    </div>
  );
}