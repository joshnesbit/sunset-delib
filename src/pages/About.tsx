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
        'A conversation among Francis Scott Key parents and teachers about technology and AI in our classrooms. You vote on short statements, add your own, and together we find where we actually agree. That common ground helps inform FSK’s school policy, and it may help SFUSD as it sets district policy too.',
        '這是 Francis Scott Key 家長與老師之間，關於課堂科技與 AI 的對話。你對簡短的陳述投票、加入自己的看法，我們一起找出真正的共識。這些共識將協助制定 FSK 的學校政策，也可能對學區制定政策有所幫助。'
      ),
    ],
    [
      L('Why now', '為什麼是現在'),
      L(
        "FSK is drafting its own technology policy now, and SFUSD's board plans to vote on a district technology and AI policy in March 2027. What FSK families and staff agree on can inform both.",
        'FSK 正在草擬自己的科技政策，而三藩市聯合校區教育委員會計劃於 2027 年 3 月表決全學區的科技與 AI 政策。FSK 家庭與職員的共識可以為兩者提供參考。'
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
        'No names, no emails. We keep your role (parent, teacher/staff, or both), your language, and your votes. They are stored anonymously in a shared community backend, where anyone with the app’s ID could read them. Nothing is sold, and nothing is used to train AI.',
        '不需姓名或電郵。我們只保留你的身分類別（家長、老師／職員或兩者）、語言和投票。這些資料以匿名方式存放在共享的社區資料庫，任何擁有此應用程式 ID 的人都可讀取。資料不會出售，也不會用來訓練 AI。'
      ),
    ],
    [
      L('Where the statements came from', '陳述從何而來'),
      L(
        "The first cards turn the proposals in FSK's draft Tech With Intention policy (v0.3), and the arguments for and against them, into statements you can agree or disagree with. They are reviewed by an FSK parent, an FSK teacher, and a neighbor. None of them are quotes from FSK families. Every card you add is read by a steward before it goes out.",
        '最初的卡片把 FSK「有意識地使用科技」政策草案（第 0.3 版）的建議，以及支持和反對的論點，寫成可以同意或不同意的陳述，並經一位 FSK 家長、一位 FSK 老師和一位鄰居審閱。它們都不是 FSK 家庭的原話。你新增的每則陳述都會先經管理員閱讀才發佈。'
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
            <strong>Josh</strong>,{' '}
            {L(
              'Outer Sunset neighbor and FSK steward for this conversation. He keeps the tool running, reads every new statement, and shares the results.',
              '日落區鄰居，也是這次對話的 FSK 負責人。他負責維護工具、閱讀每則新陳述，並分享結果。'
            )}
          </p>
          <p>
            <a href="mailto:josh@relationaltechproject.org" className="text-[var(--coral-ink)] underline underline-offset-2">
              josh@relationaltechproject.org
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            {L(
              'Rather talk in person? Email Josh and we can find a time at drop-off or pick-up.',
              '想當面談？請電郵 Josh，我們可以在接送孩子時約個時間。'
            )}
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