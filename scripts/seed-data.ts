// Seed data. Everything here is either (a) given in the project brief, or
// (b) explicitly marked as PROVISIONAL / PLACEHOLDER so it can be replaced from
// /admin. Nothing here claims real credentials, reviews or partnerships.

type L = { en: string; ja: string; th: string };

export const plans = [
  {
    code: "free", name: "FREE", price: 0, sort: 0,
    quotas: { ai_coach_messages: 20, mix_analyses: 1, max_upload_mb: 50, max_minutes: 20 },
    features: {
      en: ["Browse & join the community", "DJ profile", "Limited AI Coach", "Quick mix check", "Lesson booking"],
      ja: ["コミュニティ閲覧・参加", "DJプロフィール", "AIコーチの限定利用", "MIX簡易分析", "レッスン予約"],
      th: ["ดูและเข้าร่วมคอมมูนิตี้", "โปรไฟล์ดีเจ", "ใช้ AI Coach แบบจำกัด", "วิเคราะห์มิกซ์เบื้องต้น", "จองบทเรียน"],
    },
  },
  {
    code: "member", name: "COLLECTIVE MEMBER", price: 49000, sort: 1,
    quotas: { ai_coach_messages: 300, mix_analyses: 4, max_upload_mb: 200, max_minutes: 90 },
    features: {
      en: ["AI DJ Coach", "Monthly mix analysis credits", "Foundation learning content", "Practice menus", "DJ challenges"],
      ja: ["AI DJ Coach", "月間MIX分析枠", "基礎学習コンテンツ", "練習メニュー", "DJチャレンジ"],
      th: ["AI DJ Coach", "สิทธิ์วิเคราะห์มิกซ์รายเดือน", "บทเรียนพื้นฐาน", "เมนูฝึกซ้อม", "DJ Challenge"],
    },
  },
  {
    code: "artist_pro", name: "ARTIST PRO", price: 99000, sort: 2,
    quotas: { ai_coach_messages: 800, mix_analyses: 12, max_upload_mb: 400, max_minutes: 180 },
    features: {
      en: ["Extended AI analysis credits", "AI Set Builder", "Advanced practice menus", "Artist Studio", "Digital Press Kit", "DJ matching"],
      ja: ["AI分析枠の拡張", "AI Set Builder", "高度な練習メニュー", "Artist Studio", "Digital Press Kit", "DJマッチング"],
      th: ["เพิ่มสิทธิ์วิเคราะห์ด้วย AI", "AI Set Builder", "เมนูฝึกขั้นสูง", "Artist Studio", "Digital Press Kit", "จับคู่ดีเจ"],
    },
  },
  {
    code: "stage_elite", name: "STAGE ELITE", price: 199000, sort: 3,
    quotas: { ai_coach_messages: 2000, mix_analyses: 30, max_upload_mb: 800, max_minutes: 300 },
    features: {
      en: ["Highest AI usage limits", "Advanced career support tools", "Priority booking", "Advanced learning content", "Advanced growth analytics"],
      ja: ["AI機能の利用枠拡張", "高度なキャリア支援機能", "優先予約", "上級学習コンテンツ", "高度な成長分析"],
      th: ["สิทธิ์ใช้ AI สูงสุด", "เครื่องมือสนับสนุนอาชีพขั้นสูง", "จองก่อนใคร", "บทเรียนขั้นสูง", "วิเคราะห์พัฒนาการขั้นสูง"],
    },
  },
];

export const courses: { level: number; slug: string; title: L; description: L; modules: L[] }[] = [
  {
    level: 1, slug: "foundation",
    title: { en: "FOUNDATION", ja: "FOUNDATION", th: "FOUNDATION" },
    description: { en: "Your first beat: gear, tempo and the basics of beatmatching.", ja: "最初の一歩。機材、テンポ、ビートマッチングの基礎。", th: "ก้าวแรก: อุปกรณ์ จังหวะ และพื้นฐานการแมตช์บีต" },
    modules: [
      { en: "What is a DJ?", ja: "DJとは何か", th: "ดีเจคืออะไร" },
      { en: "Equipment basics", ja: "機材の基本操作", th: "พื้นฐานการใช้อุปกรณ์" },
      { en: "Understanding BPM", ja: "BPMの理解", th: "ทำความเข้าใจ BPM" },
      { en: "Cue and Play", ja: "CueとPlay", th: "Cue และ Play" },
      { en: "Headphone monitoring", ja: "ヘッドホンモニタリング", th: "การมอนิเตอร์ด้วยหูฟัง" },
      { en: "Basic beatmatching", ja: "基本的なビートマッチング", th: "การแมตช์บีตเบื้องต้น" },
    ],
  },
  {
    level: 2, slug: "mixing",
    title: { en: "MIXING", ja: "MIXING", th: "MIXING" },
    description: { en: "Phrasing, EQ, faders, gain, loops, effects and transitions.", ja: "フレーズ、EQ、フェーダー、ゲイン、ループ、エフェクト、トランジション。", th: "เฟรส อีคิว เฟดเดอร์ เกน ลูป เอฟเฟกต์ และทรานซิชัน" },
    modules: [
      { en: "Phrase mixing", ja: "フレーズミックス", th: "การมิกซ์ตามเฟรส" },
      { en: "EQ control", ja: "EQコントロール", th: "การควบคุม EQ" },
      { en: "Fader technique", ja: "フェーダー操作", th: "เทคนิคเฟดเดอร์" },
      { en: "Gain staging", ja: "ゲイン調整", th: "การปรับเกน" },
      { en: "Loops", ja: "ループ", th: "ลูป" },
      { en: "Effects", ja: "エフェクト", th: "เอฟเฟกต์" },
      { en: "Transitions", ja: "トランジション", th: "ทรานซิชัน" },
    ],
  },
  {
    level: 3, slug: "music-selection",
    title: { en: "MUSIC SELECTION", ja: "MUSIC SELECTION", th: "MUSIC SELECTION" },
    description: { en: "Harmonic mixing, structure, energy and building a set.", ja: "ハーモニックミックス、楽曲構成、エネルギー管理、セット構成。", th: "ฮาร์โมนิกมิกซ์ โครงสร้างเพลง การจัดการพลังงาน และการวางเซ็ต" },
    modules: [
      { en: "Harmonic mixing", ja: "ハーモニックミックス", th: "ฮาร์โมนิกมิกซ์" },
      { en: "Track structure", ja: "楽曲構成", th: "โครงสร้างเพลง" },
      { en: "Energy management", ja: "エネルギー管理", th: "การจัดการพลังงาน" },
      { en: "Selecting by genre", ja: "ジャンル別選曲", th: "การเลือกเพลงตามแนว" },
      { en: "Building playlists", ja: "プレイリスト作成", th: "การสร้างเพลย์ลิสต์" },
      { en: "Set construction", ja: "セット構成", th: "การวางโครงสร้างเซ็ต" },
    ],
  },
  {
    level: 4, slug: "performance",
    title: { en: "PERFORMANCE", ja: "PERFORMANCE", th: "PERFORMANCE" },
    description: { en: "Club gear, 3–4 decks, long sets, reading the floor.", ja: "クラブ機材、3〜4デッキ、ロングセット、フロアの読み方。", th: "อุปกรณ์คลับ 3–4 เด็ค เซ็ตยาว และการอ่านฟลอร์" },
    modules: [
      { en: "Club equipment", ja: "クラブ機材", th: "อุปกรณ์ในคลับ" },
      { en: "3–4 deck operation", ja: "3〜4デッキの操作", th: "การเล่น 3–4 เด็ค" },
      { en: "Long sets", ja: "ロングセット", th: "เซ็ตยาว" },
      { en: "Reading the crowd", ja: "観客の反応の読み方", th: "การอ่านปฏิกิริยาผู้ชม" },
      { en: "DJ changeovers", ja: "DJ交代時の対応", th: "การเปลี่ยนตัวดีเจ" },
      { en: "Troubleshooting", ja: "トラブル対応", th: "การแก้ปัญหาเฉพาะหน้า" },
    ],
  },
  {
    level: 5, slug: "artist-development",
    title: { en: "ARTIST DEVELOPMENT", ja: "ARTIST DEVELOPMENT", th: "ARTIST DEVELOPMENT" },
    description: { en: "Name, profile, branding, socials and getting booked.", ja: "DJ名、プロフィール、ブランディング、SNS、出演準備。", th: "ชื่อดีเจ โปรไฟล์ แบรนดิ้ง โซเชียล และการเตรียมขึ้นโชว์" },
    modules: [
      { en: "Your DJ name", ja: "DJ名", th: "ชื่อดีเจ" },
      { en: "Artist profile", ja: "アーティストプロフィール", th: "โปรไฟล์ศิลปิน" },
      { en: "DJ branding", ja: "DJブランディング", th: "แบรนดิ้งดีเจ" },
      { en: "Social media strategy", ja: "SNS戦略", th: "กลยุทธ์โซเชียลมีเดีย" },
      { en: "Promo mixes", ja: "プロモーションMIX", th: "มิกซ์โปรโมต" },
      { en: "Preparing for gigs", ja: "イベント出演準備", th: "เตรียมตัวขึ้นโชว์" },
      { en: "Working with promoters", ja: "主催者とのコミュニケーション", th: "การสื่อสารกับผู้จัด" },
    ],
  },
  {
    level: 6, slug: "professional",
    title: { en: "PROFESSIONAL", ja: "PROFESSIONAL", th: "PROFESSIONAL" },
    description: { en: "Final assessment, showcase, portfolio and career.", ja: "最終評価、Showcase、ポートフォリオ、キャリア育成。", th: "การประเมินขั้นสุดท้าย โชว์เคส พอร์ตโฟลิโอ และเส้นทางอาชีพ" },
    modules: [
      { en: "Practical assignments", ja: "実践課題", th: "งานภาคปฏิบัติ" },
      { en: "Instructor final assessment", ja: "講師による最終評価", th: "การประเมินขั้นสุดท้ายโดยผู้สอน" },
      { en: "Showcase participation", ja: "Showcase参加", th: "เข้าร่วมโชว์เคส" },
      { en: "DJ portfolio", ja: "DJポートフォリオ", th: "พอร์ตโฟลิโอดีเจ" },
      { en: "Applying for gigs", ja: "出演募集への応募", th: "สมัครงานโชว์" },
      { en: "Ongoing career development", ja: "継続的なキャリア育成", th: "การพัฒนาอาชีพต่อเนื่อง" },
    ],
  },
];

// Lesson formats. Prices are EXAMPLE VALUES ONLY (is_provisional = true) — shown with a
// PROVISIONAL tag on the site and must be confirmed by the school in /admin. PRICES ARE PROVISIONAL (is_provisional = true) until the
// school confirms them in /admin/settings.
export const lessons = [
  { slug: "bkk-private-60", mode: "in_person", duration: 60, price: 150000, sort: 0,
    title: { en: "Bangkok Studio · Private 60 min", ja: "バンコク対面 · 個人 60分", th: "สตูดิโอกรุงเทพฯ · ส่วนตัว 60 นาที" },
    description: { en: "One-to-one at the studio on club-standard gear.", ja: "スタジオでのマンツーマンレッスン。", th: "เรียนตัวต่อตัวที่สตูดิโอ" } },
  { slug: "bkk-private-90", mode: "in_person", duration: 90, price: 210000, sort: 1,
    title: { en: "Bangkok Studio · Private 90 min", ja: "バンコク対面 · 個人 90分", th: "สตูดิโอกรุงเทพฯ · ส่วนตัว 90 นาที" },
    description: { en: "Extended session for set building and performance.", ja: "セット構成や実践向けのロングセッション。", th: "เซสชันยาวสำหรับวางเซ็ตและฝึกการแสดง" } },
  { slug: "online-private-60", mode: "online", duration: 60, price: 120000, sort: 2,
    title: { en: "Online · Private 60 min", ja: "オンライン · 個人 60分", th: "ออนไลน์ · ส่วนตัว 60 นาที" },
    description: { en: "Live video lesson on your own setup, anywhere.", ja: "ご自宅の機材でライブビデオレッスン。", th: "เรียนผ่านวิดีโอสดด้วยอุปกรณ์ของคุณเอง" } },
  { slug: "online-mix-review-30", mode: "online", duration: 30, price: 60000, sort: 3,
    title: { en: "Online · Mix review 30 min", ja: "オンライン · MIXレビュー 30分", th: "ออนไลน์ · รีวิวมิกซ์ 30 นาที" },
    description: { en: "Instructor walks through a mix you recorded.", ja: "録音したMIXを講師が一緒に振り返ります。", th: "ผู้สอนรีวิวมิกซ์ที่คุณอัดไว้" } },
] as const;
