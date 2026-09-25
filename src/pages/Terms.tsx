import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import { useStore } from '@/lib/store';

export default function Terms() {
  const lang = useStore((s) => s.lang);
  const L = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const sections: [string, string][] = [
    [
      L("What's welcome", '歡迎的內容'),
      L(
        'Beliefs, worries, hopes, and experiences about technology and AI at Francis Scott Key, in English or Chinese. Disagreement is welcome. That is the point.',
        '關於 Francis Scott Key 科技與 AI 的信念、擔憂、期望和經驗，中文或英文皆可。歡迎不同意見，這正是目的所在。'
      ),
    ],
    [
      L('What gets removed', '會被移除的內容'),
      L(
        'Names or details that identify a child, teacher, or staff member. Threats, harassment, or slurs. Ads, links, and spam. Statements that are not about the question.',
        '可辨識孩子、老師或職員的姓名或細節；威脅、騷擾或侮辱性字眼；廣告、連結和垃圾訊息；與問題無關的陳述。'
      ),
    ],
    [
      L('Who moderates', '由誰審核'),
      L(
        'Josh, the FSK steward for this conversation, reads every new statement before anyone sees it. He may fix spelling and add a translation. He never changes what a statement means. If a statement would need its meaning changed, it is not published.',
        'Josh 是這次對話的 FSK 負責人，會在任何人看到之前閱讀每則新陳述。他可以修正錯字並加上翻譯，但絕不改變陳述的意思。如果需要改變意思才能發佈，該陳述就不會發佈。'
      ),
    ],
    [
      L('Reports', '檢舉'),
      L(
        'Anyone can report a card with "Something wrong?" A steward reads each report and decides whether to hide the card or keep it.',
        '任何人都可以按「有問題？」檢舉卡片。管理員會閱讀每則檢舉，決定隱藏或保留該卡片。'
      ),
    ],
    [
      L('Keeping it fair', '保持公平'),
      L(
        'A few automatic checks help keep out bots: a limit on how many statements one person can add in a short time, and results that set aside voting sessions too fast for a person to read the cards. The report says how many were set aside. We never record names, emails, or IP addresses.',
        '一些自動檢查有助阻擋機械人：限制同一人在短時間內可新增的陳述數量，以及在結果中排除快到不可能讀完卡片的投票。報告會列出排除了多少。我們從不記錄姓名、電郵或 IP 位址。'
      ),
    ],
    [
      L('Disagree with a decision?', '不同意某個決定？'),
      L(
        'Email Josh, the steward, at josh@relationaltechproject.org. He will get back to you, and you can meet in person at drop-off or pick-up.',
        '請電郵負責人 Josh（josh@relationaltechproject.org），他會回覆你，也可以在接送孩子時當面談。'
      ),
    ],
  ];

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      <TopBar />
      <main className="flex flex-col gap-8 px-5 py-8 md:px-8">
        <h1 className="text-3xl font-semibold leading-tight">{L('Terms of Use & Moderation Policy', '使用條款與審核政策')}</h1>
        {sections.map(([h, b]) => (
          <section key={h} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{h}</h2>
            <p>{b}</p>
          </section>
        ))}
        <Link to="/add" className="pill pill-agree">{L('Back to adding', '返回新增')}</Link>
      </main>
    </div>
  );
}