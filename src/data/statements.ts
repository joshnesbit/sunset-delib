/*
 * SEED STATEMENTS: a DRAFT for the editorial trio (Josh, one FSK teacher, one FSK parent).
 * Edit freely: rewrite, cut, add. Balance rule: roughly a third lean toward more tech use,
 * a third toward limits, a third conditional or about process. One idea per statement.
 * The Traditional Chinese is a first-pass draft. Have a native reader check every line before launch.
 * Drawn from public reporting (Tech in Check's petition, UESF, SF Parents Coalition, SFUSD statements);
 * none of these are quotes from FSK families.
 */

export type Role = 'parent' | 'staff' | 'both';
export type ThemeId =
  | 'devices' | 'tutors' | 'genai' | 'teachers'
  | 'privacy' | 'evidence' | 'equity' | 'decide' | 'open';
export type Lean = 'more' | 'limits' | 'conditional';
export type Status = 'approved' | 'pending' | 'hidden';

export type Statement = {
  id: string;
  en: string;
  zh: string;
  theme: ThemeId;
  lean?: Lean;
  source: 'seed' | 'participant';
  status: Status;
  authorRole?: Role;
  createdAt?: number;
};

export const THEMES: Record<ThemeId, { en: string; zh: string }> = {
  devices: { en: 'Devices & screen time', zh: '裝置與螢幕時間' },
  tutors: { en: 'AI reading tutors', zh: 'AI 閱讀輔導' },
  genai: { en: 'Generative AI for students', zh: '學生使用生成式 AI' },
  teachers: { en: "Teachers' use of AI", zh: '老師使用 AI' },
  privacy: { en: 'Privacy & vendors', zh: '隱私與廠商' },
  evidence: { en: 'Evidence', zh: '成效證據' },
  equity: { en: 'Equity & access', zh: '公平與使用機會' },
  decide: { en: 'Who decides', zh: '由誰決定' },
  open: { en: 'From participants', zh: '參與者新增' },
};

const s = (id: string, theme: ThemeId, lean: Lean, en: string, zh: string): Statement => ({
  id, theme, lean, en, zh, source: 'seed', status: 'approved',
});

export const SEED_STATEMENTS: Statement[] = [
  s('d1', 'devices', 'limits', 'Homework in K–5 should be on paper by default, with screens the exception.', '幼稚園至五年級的功課應以紙本為主，螢幕只作例外。'),
  s('d2', 'devices', 'limits', 'Students in grades 3–5 should share classroom device carts instead of each taking a device home.', '三至五年級學生應共用教室的平板車，而不是每人帶一部裝置回家。'),
  s('d3', 'devices', 'more', "Having their own school device helps kids whose families can't afford one at home.", '擁有學校配發的裝置，能幫助家裡負擔不起的孩子。'),
  s('d4', 'devices', 'conditional', "I'd be comfortable with screen time at school if I knew roughly how many minutes a day it was.", '如果我知道孩子每天在學校大約用多少分鐘螢幕，我會比較放心。'),
  s('d5', 'devices', 'more', 'Learning to type and use a computer is a basic skill kids should start in elementary school.', '學習打字和操作電腦是基本技能，孩子應從小學開始學。'),

  s('t1', 'tutors', 'conditional', 'An AI reading tutor is fine as a supplement, as long as a teacher — not the software — decides who uses it and when.', 'AI 閱讀輔導可以作為輔助，只要由老師（而不是軟體）決定誰使用、何時使用。'),
  s('t2', 'tutors', 'limits', 'Reading practice in K–2 should happen with a person — a teacher, aide, or volunteer — not an app.', '幼稚園至二年級的閱讀練習應由真人陪伴——老師、助教或義工——而不是應用程式。'),
  s('t3', 'tutors', 'more', "If an AI tutor gives every child one-on-one reading practice, that's something our classrooms can't offer otherwise.", '如果 AI 輔導能讓每個孩子都有一對一的閱讀練習，這是我們的課堂原本做不到的。'),
  s('t4', 'tutors', 'limits', "I'd rather the money for AI reading software went to more reading specialists and aides.", '我寧願把 AI 閱讀軟體的經費用來聘請更多閱讀專家和助教。'),
  s('t5', 'tutors', 'more', "An AI tutor that can explain things in a family's home language could help kids who are learning English.", '能用家庭母語解說的 AI 輔導，可以幫助正在學英文的孩子。'),

  s('g1', 'genai', 'more', 'Kids will meet AI everywhere; school is the safest place to learn what it gets wrong.', '孩子遲早會到處接觸 AI；學校是學習 AI 會在哪裡出錯最安全的地方。'),
  s('g2', 'genai', 'limits', 'Generative AI chatbots should be turned off on all K–5 student devices.', '所有幼稚園至五年級學生的裝置都應關閉生成式 AI 聊天機器人。'),
  s('g3', 'genai', 'conditional', 'Elementary students can learn how AI works and where it fails without using chatbots themselves.', '小學生可以學習 AI 的原理和缺陷，而不必自己使用聊天機器人。'),
  s('g4', 'genai', 'limits', 'Young kids need to struggle through writing on their own before any tool does it for them.', '年幼的孩子需要先靠自己努力學會寫作，之後才讓任何工具代勞。'),
  s('g5', 'genai', 'more', 'Used with a teacher, AI can make learning more creative — drawing, storytelling, asking big questions.', '在老師指導下，AI 能讓學習更有創意——畫畫、說故事、提出大問題。'),

  s('te1', 'teachers', 'more', "If AI saves my child's teacher an hour of paperwork a week, that's an hour I want them to have.", '如果 AI 每週能替老師省下一小時的文書工作，我希望老師能擁有這一小時。'),
  s('te2', 'teachers', 'conditional', 'Teachers should tell families when they use AI to write report card comments or messages home.', '老師用 AI 撰寫成績表評語或給家長的訊息時，應告知家長。'),
  s('te3', 'teachers', 'conditional', "Teachers need paid training time before they're asked to use any new AI tool.", '在要求老師使用任何新的 AI 工具之前，應給予有薪的培訓時間。'),
  s('te4', 'teachers', 'limits', "AI should never be used to grade young students' work.", 'AI 絕不應被用來批改低年級學生的作業。'),
  s('te5', 'teachers', 'more', 'Teachers should be free to try AI tools for lesson planning without asking permission for each one.', '老師應可自由試用 AI 工具來備課，不需要每個工具都申請批准。'),

  s('p1', 'privacy', 'limits', "No tool that records my child's voice or face belongs in a classroom without written parent consent.", '任何會錄下孩子聲音或臉孔的工具，未經家長書面同意都不應進入課堂。'),
  s('p2', 'privacy', 'conditional', "Families should be able to see a plain-language list of every app that collects their child's data.", '家長應能看到一份淺白易懂的清單，列出所有收集孩子資料的應用程式。'),
  s('p3', 'privacy', 'limits', "Student data should never be used to train a company's AI models.", '學生資料絕不應被用來訓練企業的 AI 模型。'),
  s('p4', 'privacy', 'conditional', 'Families should be able to opt their child out of an AI tool without the child being left out of the lesson.', '家長應能讓孩子不使用某個 AI 工具，而孩子不會因此被排除在課堂之外。'),
  s('p5', 'privacy', 'more', "I trust the district to vet education apps for privacy; I don't need to review each one myself.", '我信任學區會審查教育應用程式的隱私保障；我不需要逐一自己檢查。'),

  s('e1', 'evidence', 'conditional', 'SFUSD should show evidence a tool improves learning before expanding it to more classrooms.', '三藩市聯合校區應先證明某工具能改善學習，才擴展到更多課室。'),
  s('e2', 'evidence', 'more', 'Waiting years for perfect research means our kids fall behind schools that are already experimenting.', '等待多年的完美研究，意味著我們的孩子會落後於已經在嘗試的學校。'),
  s('e3', 'evidence', 'conditional', 'Each school should report back once a year on how its tech tools are actually working.', '每間學校應每年報告一次其科技工具的實際成效。'),
  s('e4', 'evidence', 'limits', 'The burden of proof should be on tech companies, not on parents who are worried.', '舉證責任應在科技公司身上，而不是在憂心的家長身上。'),
  s('e5', 'evidence', 'conditional', "Teachers' observations of what works in their classroom count as real evidence.", '老師在自己課室中觀察到的成效，也算是真正的證據。'),

  s('q1', 'equity', 'conditional', 'Some kids have every device at home and some have none; school tech should close that gap, not widen it.', '有些孩子家裡什麼裝置都有，有些一部也沒有；學校的科技應縮小差距，而不是擴大。'),
  s('q2', 'equity', 'more', 'Kids whose parents are less comfortable with tech depend on school to teach digital skills.', '父母不太熟悉科技的孩子，要靠學校教他們數位技能。'),
  s('q3', 'equity', 'limits', 'Screen-heavy learning hurts most the kids who already have the most screen time at home.', '大量依賴螢幕的學習，對在家已有最多螢幕時間的孩子傷害最大。'),
  s('q4', 'equity', 'conditional', "Information about school tech should reach families in their home language, not just English.", '學校有關科技的資訊應以家庭的母語送達，而不只是英文。'),
  s('q5', 'equity', 'more', "AI tools could give students with learning differences support that's hard to get otherwise.", 'AI 工具可以為有學習差異的學生提供平常難以取得的支援。'),

  s('w1', 'decide', 'conditional', 'Parents and teachers at each school should have a say in which tools are used there, not just the district.', '每間學校的家長和老師應對學校使用哪些工具有發言權，而不只是由學區決定。'),
  s('w2', 'decide', 'limits', 'Big tech contracts, like ChatGPT for district staff, should go to a public school board vote first.', '像為學區職員購買 ChatGPT 這類大型科技合約，應先交由教育委員會公開投票。'),
  s('w3', 'decide', 'limits', "Tech companies shouldn't help write the policies for the schools they sell to.", '科技公司不應參與制定它們銷售對象學校的政策。'),
  s('w4', 'decide', 'more', 'The district should be able to move quickly on tech, keeping families informed rather than asking each time.', '學區應能在科技方面迅速行動，只需告知家長，而不必每次都徵詢意見。'),
  s('w5', 'decide', 'conditional', 'Whatever the board decides in March, FSK families should hear back what changed and why.', '無論教育委員會三月作出什麼決定，FSK 家庭都應得知有什麼改變、為什麼。'),
];