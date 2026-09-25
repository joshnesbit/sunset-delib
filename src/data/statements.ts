/*
 * SEED STATEMENTS: a DRAFT for the editorial trio (Josh, one FSK teacher, one FSK parent).
 * Drawn from the proposals in "FSK: Tech With Intention" (draft policy v0.3, Sep 2026) and the
 * debate around it: each policy line appears as something a person could agree OR disagree with,
 * alongside the strongest counter-positions. None are quotes from FSK families or survey results.
 * Balance rule: roughly a third lean toward more tech use, a third toward limits, a third
 * conditional or about process. One idea per statement.
 * The Traditional Chinese is a first-pass draft. A native reader must check every line before launch.
 */

export type Role = 'parent' | 'staff' | 'both';
export type ThemeId =
  | 'screens' | 'breaks' | 'learning' | 'ai' | 'dojo'
  | 'families' | 'teachers' | 'decide' | 'open';
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
  authorId?: string;
  signals?: string[];
  createdAt?: number;
};

export const THEMES: Record<ThemeId, { en: string; zh: string }> = {
  screens: { en: 'Screen time by grade', zh: '各年級的螢幕時間' },
  breaks: { en: 'Breaks, rewards & video', zh: '小休、獎勵與影片' },
  learning: { en: 'Reading, writing & homework', zh: '閱讀、寫字與功課' },
  ai: { en: 'AI in the classroom', zh: '課堂上的 AI' },
  dojo: { en: 'ClassDojo & behavior apps', zh: 'ClassDojo 與行為管理程式' },
  families: { en: 'Transparency & family choice', zh: '透明度與家長選擇' },
  teachers: { en: 'Supporting teachers', zh: '支援老師' },
  decide: { en: 'Who decides, and when', zh: '由誰決定、何時決定' },
  open: { en: 'From participants', zh: '參與者新增' },
};

const s = (id: string, theme: ThemeId, lean: Lean, en: string, zh: string): Statement => ({
  id, theme, lean, en, zh, source: 'seed', status: 'approved',
});

export const SEED_STATEMENTS: Statement[] = [
  s('s1', 'screens', 'limits', "Kids in TK through 2nd grade shouldn't use individual devices at school, except for required tests.", '過渡幼稚園至二年級的孩子在學校不應使用個人裝置，必要的測驗除外。'),
  s('s2', 'screens', 'conditional', 'About 20 minutes a day of device time is the right limit for 3rd graders.', '三年級學生每天大約 20 分鐘的裝置時間是合適的上限。'),
  s('s3', 'screens', 'more', 'Fixed minute limits by grade are too rigid; teachers should decide how much screen time a lesson needs.', '按年級設定固定分鐘上限太死板；應由老師決定一堂課需要多少螢幕時間。'),
  s('s4', 'screens', 'more', '4th and 5th graders should be able to bring a school Chromebook home for homework.', '四、五年級學生應可把學校的 Chromebook 帶回家做功課。'),
  s('s5', 'screens', 'limits', 'Phones and smartwatches should be off and put away for the whole school day.', '手機和智能手錶應在整個上課日關機並收好。'),
  s('s6', 'screens', 'more', 'My child should be able to keep a smartwatch on so I can reach them directly.', '我的孩子應可戴著智能手錶，讓我能直接聯絡他們。'),

  s('b1', 'breaks', 'limits', 'Brain breaks should be screen-free: movement, stretching, drawing, or play.', '課堂小休應遠離螢幕：活動、伸展、畫畫或遊戲。'),
  s('b2', 'breaks', 'more', 'A short dance or yoga video is a fine brain break on a rainy day.', '下雨天時，一段短短的跳舞或瑜伽影片是不錯的小休。'),
  s('b3', 'breaks', 'limits', "Screens shouldn't be a reward, like movie time or game time for good behavior.", '螢幕不應被當作獎勵，例如表現好就能看電影或玩遊戲。'),
  s('b4', 'breaks', 'conditional', 'YouTube should be blocked on student devices but still available to teachers for lessons.', '學生裝置應封鎖 YouTube，但老師上課時仍可使用。'),
  s('b5', 'breaks', 'conditional', 'Afterschool programs at FSK should follow the same screen rules as the school day.', 'FSK 的課後活動應遵守與上課時間相同的螢幕規則。'),

  s('l1', 'learning', 'limits', 'Print books should be the default for teaching reading.', '教閱讀應以紙本書為主。'),
  s('l2', 'learning', 'limits', 'Handwriting should come first in TK–2, before kids learn to type.', '過渡幼稚園至二年級應先教寫字，之後才學打字。'),
  s('l3', 'learning', 'more', 'Math practice apps help my child get extra practice at their own level.', '數學練習程式讓我的孩子能按自己的程度多加練習。'),
  s('l4', 'learning', 'conditional', 'Any practice app should have a stated purpose and a set number of minutes a week.', '任何練習程式都應說明用途，並定好每週使用多少分鐘。'),
  s('l5', 'learning', 'limits', 'Homework should never require home internet or a school device.', '功課絕不應需要家中網絡或學校裝置才能完成。'),
  s('l6', 'learning', 'more', 'Typing is a basic skill FSK kids should build before middle school.', '打字是基本技能，FSK 的孩子應在升上初中前練好。'),

  s('a1', 'ai', 'limits', 'There should be no student-facing generative AI in TK–5: no chatbots, AI writing tools, or AI search.', '過渡幼稚園至五年級不應讓學生使用生成式 AI：不用聊天機器人、AI 寫作工具或 AI 搜尋。'),
  s('a2', 'ai', 'more', "Older elementary kids should try AI tools with a teacher, so they learn what AI gets wrong.", '高年級小學生應在老師指導下試用 AI 工具，學會分辨 AI 會出錯的地方。'),
  s('a3', 'ai', 'limits', 'Gemini and other built-in AI features should be turned off on student Google accounts.', '學生的 Google 帳戶應關閉 Gemini 及其他內置 AI 功能。'),
  s('a4', 'ai', 'conditional', "Amira, the AI reading screener, is fine for the district's required 1st and 2nd grade screening, with notice to families first.", 'Amira（AI 閱讀篩檢工具）用於學區規定的一、二年級篩檢是可以的，只要先通知家長。'),
  s('a5', 'ai', 'more', 'If Amira helps teachers spot reading struggles earlier, FSK should use it beyond the required screening.', '如果 Amira 能幫老師更早發現閱讀困難，FSK 應在規定篩檢之外也使用它。'),
  s('a6', 'ai', 'limits', 'No student work, photos, or voice recordings should be uploaded to AI tools.', '任何學生作業、照片或錄音都不應上傳到 AI 工具。'),
  s('a7', 'ai', 'conditional', 'Teachers should tell families when they use AI in their own work, like drafting messages home.', '老師在工作中使用 AI（例如起草給家長的訊息）時，應告知家長。'),
  s('a8', 'ai', 'more', 'Teachers should be free to use AI for lesson planning and paperwork.', '老師應可自由使用 AI 來備課和處理文書工作。'),

  s('c1', 'dojo', 'limits', "ClassDojo points shouldn't be shown on the classroom screen where everyone can see them.", 'ClassDojo 的分數不應顯示在全班都看得到的課室螢幕上。'),
  s('c2', 'dojo', 'conditional', 'If points are used, they should go toward whole-class goals, not individual rankings.', '如果使用積分，應用於全班目標，而不是個人排名。'),
  s('c3', 'dojo', 'more', "ClassDojo updates are how I know what's happening in my child's class, and I'd miss them.", 'ClassDojo 的更新讓我知道孩子班上的情況，沒有了我會覺得可惜。'),
  s('c4', 'dojo', 'limits', 'In-class alerts and sounds from behavior apps distract kids more than they help.', '行為管理程式在課堂上的提示和聲音，對孩子的干擾多於幫助。'),

  s('f1', 'families', 'conditional', 'FSK should post a list each trimester of every app by grade, its purpose, and minutes per week.', 'FSK 應每學期公佈清單，按年級列出每個應用程式、用途和每週分鐘數。'),
  s('f2', 'families', 'conditional', 'Families should be able to ask for a paper version of any device activity, with their child staying in the room with classmates.', '家長應可為任何裝置活動要求紙本版本，而孩子仍留在課室與同學一起。'),
  s('f3', 'families', 'more', 'Asking for family consent on every app would slow teachers down more than it protects kids.', '每個應用程式都要徵求家長同意，對老師的拖累多於對孩子的保護。'),
  s('f4', 'families', 'conditional', 'Information about classroom technology should reach families in Chinese and Spanish, not just English.', '有關課堂科技的資訊應以中文和西班牙文送達家庭，而不只是英文。'),
  s('f5', 'families', 'more', "Kids whose families don't have much tech at home need school to teach digital skills.", '家裡科技資源不多的孩子，要靠學校教他們數位技能。'),

  s('t1', 'teachers', 'conditional', "Teachers need paid planning time before they're asked to change how they use tech.", '在要求老師改變使用科技的方式之前，應給他們有薪的備課時間。'),
  s('t2', 'teachers', 'limits', 'PTA money should go to books, manipulatives, and rainy-day kits before software.', '家長教師會的經費應優先用於書本、教具和雨天活動包，然後才是軟件。'),
  s('t3', 'teachers', 'more', "I trust FSK teachers' judgment about technology more than a school-wide rulebook.", '在科技方面，我信任 FSK 老師的判斷多於一套全校規則。'),
  s('t4', 'teachers', 'conditional', "I'd volunteer for reading buddies or indoor recess if it helped classrooms use fewer screens.", '如果有助課室減少使用螢幕，我願意做閱讀夥伴或室內小息的義工。'),
  s('t5', 'teachers', 'conditional', 'A teacher should be able to propose a tool outside the policy and get an answer within two weeks.', '老師應可提出使用政策以外的工具，並在兩週內得到答覆。'),

  s('w1', 'decide', 'more', "FSK should wait for SFUSD's March 2027 policy instead of writing its own rules now.", 'FSK 應等待三藩市聯合校區 2027 年 3 月的政策，而不是現在自訂規則。'),
  s('w2', 'decide', 'conditional', 'A parent survey alone isn’t enough; teachers and staff need an equal voice in this policy.', '單靠家長問卷並不足夠；老師和職員在這項政策上應有同等的發言權。'),
  s('w3', 'decide', 'conditional', 'The policy should be reviewed every spring with teachers, families, and 3rd–5th graders.', '政策應每年春季與老師、家長及三至五年級學生一起檢討。'),
  s('w4', 'decide', 'conditional', 'Whatever FSK decides, families should hear back what changed and why.', '無論 FSK 作出什麼決定，家長都應得知有什麼改變、為什麼。'),
];