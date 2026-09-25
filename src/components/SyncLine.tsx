import { RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function SyncLine() {
  const lang = useStore((s) => s.lang);
  const sync = useStore((s) => s.sync);
  const syncedAt = useStore((s) => s.syncedAt);
  const cloudError = useStore((s) => s.cloudError);
  const refresh = useStore((s) => s.refresh);
  const L = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const time = syncedAt
    ? new Date(syncedAt).toLocaleTimeString(lang === 'zh' ? 'zh-Hant' : 'en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
  const text =
    sync === 'loading' ? L('Loading everyone’s votes…', '正在載入所有人的投票…')
    : sync === 'offline' ? L('Shared backend not connected. Showing this device only.', '未連接共享資料庫，只顯示此裝置的資料。')
    : sync === 'error' ? L(`Couldn’t load: ${cloudError ?? 'try again'}`, `無法載入：${cloudError ?? '請再試'}`)
    : sync === 'ready' ? L(`Everyone’s votes, updated ${time}`, `所有人的投票，更新於 ${time}`)
    : '';

  return (
    <div className="no-print flex items-center gap-3 text-sm text-muted-foreground" role="status">
      <span className={sync === 'error' ? 'text-[var(--coral-ink)]' : ''}>{text}</span>
      {sync !== 'offline' && (
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={sync === 'loading'}
          className="chip min-h-9 bg-muted text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${sync === 'loading' ? 'animate-spin' : ''}`} aria-hidden />
          {L('Refresh', '更新')}
        </button>
      )}
    </div>
  );
}