import { Link, useNavigate } from 'react-router-dom';
import { House } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function TopBar({ showEnd = false }: { showEnd?: boolean }) {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const end = useStore((s) => s.end);
  const navigate = useNavigate();

  return (
    <header className="no-print flex items-center justify-between gap-2 border-b border-border px-4 py-3 md:px-6">
      <button
        type="button"
        onClick={() => {
          end();
          navigate('/');
        }}
        className="label flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <House className="size-5" aria-hidden />
        <span className="sr-only">{lang === 'en' ? 'Start over: ' : '重新開始：'}</span>
        {t(lang, 'place')}
      </button>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="chip min-h-9 bg-muted text-muted-foreground hover:text-foreground"
          aria-label={lang === 'en' ? 'Switch to Traditional Chinese' : 'Switch to English'}
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
        <Link to="/about" className="chip min-h-9 bg-muted text-muted-foreground hover:text-foreground">
          {t(lang, 'about')} →
        </Link>
        {showEnd && (
          <button
            type="button"
            onClick={() => {
              end();
              navigate('/');
            }}
            className="chip min-h-9 bg-destructive font-bold text-destructive-foreground"
          >
            {t(lang, 'end')}
          </button>
        )}
      </div>
    </header>
  );
}