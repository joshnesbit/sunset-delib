import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import { useStore } from '@/lib/store';
import { MIN_PARTICIPANTS, MIN_VOTES } from '@/lib/clustering';

export default function About() {
  const lang = useStore((s) => s.lang);
  const L = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const sections: [string, string][] = [
    [
      L('What this is', '這是什麼'),
      L(
        'A conversation among Francis Scott Key parents and teachers about technology and AI in our classrooms. You vote on short statements, add your own, and together we find where we actually agree.',
        '這是 Francis Scott Key 家長與老師之間，關於課堂科技與 AI 的對話。你對簡短的陳述投票、加入自己的看法，我們一起找出真正的共識。'
      ),
    ],
    [
      L('Why now', '為什麼是現在'),
      L(
        "SFUSD's board plans to vote on a technology and AI policy in March 2027. What FSK families and staff agree on goes to the board and the Superintendent's office before that vote.",
        '三藩市聯合校區教育委員會計劃於 2027 年 3 月表決科技與 AI 政策。FSK 家庭與職員的共識會在表決前送交教育委員會及學監辦公室。'
      ),
    ],
    [
      L('How results work', '結果如何產生'),
      L(
        `People who vote alike are grouped together, the same way Pol.is does it. Results open once ${MIN_PARTICIPANTS} people have each answered ${MIN_VOTES}+ statements. We highlight statements that every group agrees on. The groups are named by people, not software.`,
        `投票相近的人會被歸為一組，做法與 Pol.is 相同。當 ${MIN_PARTICIPANTS} 人各回應 ${MIN_VOTES} 則以上陳述後，結果便會公開。我們會突出每個群組都認同的陳述。群組名稱由人撰寫，而非軟體。`
      ),
    ],
    [
      L('Your data', '你的資料'),
      L(
        'No names, no emails. We keep your role (parent, teacher/staff, or both), your language, and your votes. Nothing is sold, and nothing is used to train AI.',
        '不需姓名或電郵。我們只保留你的身分類別（家長、老師／職員或兩者）、語言和投票。資料不會出售，也不會用來訓練 AI。'
      ),
    ],
    [
      L('Where the statements came from', '陳述從何而來'),
      L(
        'The first cards are a draft written from public reporting and reviewed by an FSK parent, an FSK teacher, and a neighbor. None of them are quotes from FSK families. Every card you add is read by a steward before it goes out.',
        '最初的卡片是根據公開報導撰寫的草稿，經一位 FSK 家長、一位 FSK 老師和一位鄰居審閱。它們都不是 FSK 家庭的原話。你新增的每則陳述都會先經管理員閱讀才發佈。'
      ),
    ],
  ];

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      <TopBar />
      <main className="flex flex-col gap-8 px-5 py-8 md:px-8">
        <h1 className="text-3xl font-semibold leading-tight">{L('About Key Common Ground', '關於「共同點」')}</h1>

        <section className="flex flex-col gap-2 rounded-[var(--radius)] bg-card p-5 shadow-sm">
          <p className="label text-[var(--coral-ink)]">{L('Who tends this', '誰負責')}</p>
          <p>
            <strong>Josh</strong>, {L('Outer Sunset neighbor, keeps the tool running.', '日落區鄰居，負責維護這個工具。')}
          </p>
          <p>
            <strong>{L('FSK steward: being named', 'FSK 負責人：確認中')}</strong>{' '}
            {L('— the person at school who answers for this and reads the results aloud.', '，校內負責回應並公開宣讀結果的人。')}
          </p>
          <p className="text-sm text-muted-foreground">
            {L('Rather talk in person? Stop by the FSK front office, 1530 43rd Ave. Paper ballots are available there.', '想當面談？歡迎到 FSK 校務處（43 街 1530 號），那裡有紙本選票。')}
          </p>
        </section>

        {sections.map(([h, b]) => (
          <section key={h} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{h}</h2>
            <p>{b}</p>
          </section>
        ))}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="pill pill-agree flex-1">{L('Start voting', '開始投票')}</Link>
          <Link to="/report" className="pill pill-quiet flex-1">{L('See the results', '查看結果')}</Link>
        </div>
      </main>
    </div>
  );
}