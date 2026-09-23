import type { Lang } from '@/lib/store';

const STRINGS = {
  place: { en: 'Outer Sunset · FSK', zh: '日落區 · FSK' },
  topic: { en: 'Tech & AI in our classrooms', zh: '課堂上的科技與 AI' },
  question: {
    en: "What should technology and AI look like in our kids' classrooms at Francis Scott Key?",
    zh: '我們孩子在 Francis Scott Key 的課堂上，科技與 AI 應該是什麼樣子？',
  },
  pickRole: { en: 'Start by telling us one thing:', zh: '先告訴我們一件事：' },
  roleParent: { en: "I'm a parent", zh: '我是家長' },
  roleStaff: { en: 'I teach or work here', zh: '我在這裡任教或工作' },
  roleBoth: { en: 'Both', zh: '兩者都是' },
  anonNote: {
    en: 'No name, no email. Just your votes, grouped by role.',
    zh: '不需姓名或電郵，只記錄你的投票和身分類別。',
  },
  left: { en: 'left', zh: '則剩餘' },
  agree: { en: 'Agree', zh: '同意' },
  disagree: { en: 'Disagree', zh: '不同意' },
  unsure: { en: 'Unsure', zh: '不確定' },
  somethingWrong: { en: 'Something wrong?', zh: '有問題？' },
  reportStatement: { en: 'Report this statement.', zh: '檢舉這則陳述。' },
  reported: { en: 'Thanks. A steward will take a look.', zh: '謝謝，管理員會查看。' },
  sharePlaceholder: { en: 'Share your perspective…', zh: '分享你的看法…' },
  fromParent: { en: 'From a parent', zh: '來自家長' },
  fromStaff: { en: 'From a teacher', zh: '來自老師' },
  fromBoth: { en: 'From a parent & teacher', zh: '來自家長兼老師' },
  fromNeighbor: { en: 'From a participant', zh: '來自參與者' },
  pendingTranslation: { en: 'Translation coming', zh: '翻譯即將提供' },
  doneTitle: { en: "You've seen every statement. Thank you.", zh: '你已看完所有陳述，謝謝你。' },
  doneBody: {
    en: 'New ones arrive as people add them, so check back before the SSC meeting. Is something missing? Add it.',
    zh: '大家新增的陳述會陸續出現，校務委員會會議前歡迎再來看看。覺得少了什麼？請新增。',
  },
  addOne: { en: 'Add a statement', zh: '新增陳述' },
  seeReport: { en: 'See the results', zh: '查看結果' },
  about: { en: 'About', zh: '關於' },
  end: { en: 'End', zh: '結束' },
  results: { en: 'Results', zh: '結果' },
  guideTitle: { en: 'Add your own perspective', zh: '加入你自己的看法' },
  guideIntro: {
    en: "Something the cards haven't captured yet? This is your chance.",
    zh: '有什麼卡片還沒說到的？這是你的機會。',
  },
  guide1b: { en: 'Share a belief, concern, or value', zh: '分享一個信念、擔憂或價值' },
  guide1: { en: ' in your own words. Other parents and teachers will vote on it.', zh: '，用你自己的話。其他家長和老師會對它投票。' },
  guide2b: { en: 'One idea per statement.', zh: '每則只寫一個想法。' },
  guide2: { en: ' It stands on its own, not as a reply to another card.', zh: '它會獨立呈現，而不是回應某張卡片。' },
  guide3b: { en: 'Keep it about tools and policies, not people.', zh: '針對工具和政策，不針對個人。' },
  guide3: { en: " No names of teachers, staff, or kids.", zh: '請勿提及老師、職員或孩子的名字。' },
  guide4b: { en: 'English or Chinese both welcome.', zh: '中文或英文都可以。' },
  guide4: { en: ' A steward reads each one and adds a translation before it goes out.', zh: '管理員會逐則閱讀並加上翻譯後才發佈。' },
  guideOutro: { en: "Don't overthink it. There's no wrong answer here.", zh: '不用想太多，這裡沒有錯的答案。' },
  gotIt: { en: "Got it, let's go", zh: '明白，開始吧' },
  typeHere: { en: 'Type here: what do you think?', zh: '請在這裡輸入：你怎麼想？' },
  showInstructions: { en: 'Show instructions', zh: '顯示說明' },
  goBack: { en: 'Go back', zh: '返回' },
  submit: { en: 'Submit', zh: '提交' },
  noLinks: { en: 'No links, please.', zh: '請勿附上連結。' },
  thanksTitle: { en: 'Thanks. It’s in the queue.', zh: '謝謝，已送出待審。' },
  thanksBody: {
    en: 'A steward reads every statement before it joins the deck, usually within a day.',
    zh: '每則陳述都會經管理員閱讀後才加入，通常一天內完成。',
  },
  keepVoting: { en: 'Keep voting', zh: '繼續投票' },
  addAnother: { en: 'Add another', zh: '再新增一則' },
  chars: { en: 'char', zh: '字' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(lang: Lang, key: StringKey): string {
  return STRINGS[key][lang];
}