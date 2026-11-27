import type { Locale } from "./i18n/config";

type T3 = [string, string, string];
const pick = (t: T3, l: Locale) => t[l === "en" ? 0 : l === "ja" ? 1 : 2];

type Feature = { phase: 2 | 3 | 4; title: T3; lead: T3; planned: T3[]; needs?: string[] };

const F: Record<string, Feature> = {
  "ai-coach": {
    phase: 2,
    title: ["AI DJ Coach", "AI DJ Coach", "AI DJ Coach"],
    lead: [
      "A personal coach that uses your level, gear, practice and instructor feedback — only with your permission.",
      "あなたのレベル、機材、練習、講師のフィードバックを（許可した範囲で）踏まえて指導する専属コーチ。",
      "โค้ชส่วนตัวที่ใช้ระดับ อุปกรณ์ การฝึก และฟีดแบ็กจากผู้สอนของคุณ — เฉพาะเมื่อคุณอนุญาต",
    ],
    planned: [
      ["24/7 DJ questions in English, Japanese and Thai", "日本語・英語・タイ語で24時間DJの質問に対応", "ถามเรื่องดีเจได้ 24 ชม. ทั้งไทย อังกฤษ ญี่ปุ่น"],
      ["Gear-specific answers grounded in official manuals; says so when unsure", "メーカー公式マニュアルに基づく機材別の回答。不確かな点は断定しない", "คำตอบตามคู่มือทางการของอุปกรณ์ และบอกตรง ๆ เมื่อไม่แน่ใจ"],
      ["Weekly practice plans and a roadmap to your goal", "週間練習計画と目標までのロードマップ", "แผนฝึกรายสัปดาห์และโรดแมปสู่เป้าหมาย"],
      ["Explains your Mix Lab results and finds weak spots", "Mix Labの結果を解説し、苦手分野を発見", "อธิบายผล Mix Lab และหาจุดที่ควรพัฒนา"],
      ["Hands questions over to your instructor", "講師への質問を引き継ぎ", "ส่งต่อคำถามให้ผู้สอน"],
      ["Voice conversation", "音声会話", "สนทนาด้วยเสียง"],
    ],
    needs: ["ANTHROPIC_API_KEY (LLM)", "Speech-to-text / text-to-speech API"],
  },
  "mix-lab": {
    phase: 2,
    title: ["AI Mix Lab", "AI Mix Lab", "AI Mix Lab"],
    lead: [
      "Upload MP3, WAV, AIFF or M4A. A dedicated audio worker measures your mix; AI only explains what was measured.",
      "MP3・WAV・AIFF・M4Aをアップロード。専用の音声解析ワーカーが計測し、AIは計測値を解説するだけです。",
      "อัปโหลด MP3, WAV, AIFF หรือ M4A ระบบวิเคราะห์เสียงจะวัดค่า และ AI อธิบายเฉพาะค่าที่วัดได้จริง",
    ],
    planned: [
      ["BPM drift, key estimate, beat-grid stability, phrase structure", "BPM推移、キー推定、ビートグリッドの安定性、フレーズ構成", "BPM คีย์ ความนิ่งของบีตกริด โครงสร้างเฟรส"],
      ["Low/mid/high energy, loudness balance, clipping", "低域・中域・高域の変化、音量バランス、クリッピング", "พลังงานย่านต่ำ/กลาง/สูง สมดุลความดัง การคลิป"],
      ["Transition list — tap to jump to that moment in the player", "トランジション一覧。タップで該当時間から再生", "รายการทรานซิชัน แตะเพื่อเล่นจากจุดนั้น"],
      ["Measured values and estimates shown separately, with confidence", "計測値と推定値を分けて、信頼度付きで表示", "แยกค่าที่วัดได้กับค่าประมาณ พร้อมระดับความเชื่อมั่น"],
      ["Async jobs: uploading → queued → analysing → done / failed → retry", "非同期ジョブ：アップロード中→待機→分析中→完了／失敗→再試行", "งานแบบอะซิงก์: อัปโหลด → รอ → วิเคราะห์ → เสร็จ / ล้มเหลว → ลองใหม่"],
      ["Uploads are private by default and never used for AI training without consent", "音源は初期設定で非公開。同意なくAI学習に使用しません", "ไฟล์เป็นส่วนตัวโดยค่าเริ่มต้น และไม่ใช้ฝึก AI โดยไม่ได้รับความยินยอม"],
    ],
    needs: ["Audio worker (Python · FastAPI · librosa/Essentia · FFmpeg)", "Object storage (Supabase Storage)", "ANTHROPIC_API_KEY"],
  },
  "set-builder": {
    phase: 2,
    title: ["AI Set Builder", "AI Set Builder", "AI Set Builder"],
    lead: [
      "Energy plans for the venue, the hour and your slot — never just a straight line up. You edit every step.",
      "会場・時間帯・出演順に合わせたエネルギー設計。単純な右肩上がりにはしません。すべて自分で編集できます。",
      "วางแผนพลังงานตามสถานที่ เวลา และลำดับการเล่น ไม่ใช่แค่ไต่ขึ้นเรื่อย ๆ และแก้ไขได้ทุกขั้น",
    ],
    planned: [
      ["Inputs: genre, length, BPM range, venue type, time, crowd, slot position", "入力：ジャンル、時間、BPM範囲、会場タイプ、時間帯、観客、出演順", "ข้อมูล: แนว ความยาว ช่วง BPM ประเภทสถานที่ เวลา ผู้ชม ลำดับ"],
      ["Opening → Groove Low → Groove → Build → Peak → Recovery → Closing", "Opening → Groove Low → Groove → Build → Peak → Recovery → Closing", "Opening → Groove Low → Groove → Build → Peak → Recovery → Closing"],
      ["Drag to reorder and reshape the energy curve", "ドラッグで並べ替え、エネルギーカーブを調整", "ลากเพื่อจัดลำดับและปรับเส้นพลังงาน"],
      ["Recommendations only from your own library import (rekordbox XML / CSV)", "推薦はインポートした自分の楽曲ライブラリ（rekordbox XML / CSV）からのみ", "แนะนำจากคลังเพลงที่นำเข้าเท่านั้น (rekordbox XML / CSV)"],
    ],
    needs: ["ANTHROPIC_API_KEY"],
  },
  learning: {
    phase: 2,
    title: ["Courses", "コース", "คอร์ส"],
    lead: [
      "Six levels with video, text, practice tasks, quizzes, practical submissions, instructor and AI review.",
      "動画、テキスト、練習課題、理解度テスト、実技提出、講師評価、AI評価を備えた6レベル。",
      "6 ระดับ พร้อมวิดีโอ เนื้อหา แบบฝึก แบบทดสอบ งานปฏิบัติ และการประเมินโดยผู้สอนและ AI",
    ],
    planned: [
      ["Progress tracking per module and level-up moments", "モジュールごとの進捗とレベルアップ演出", "ติดตามความคืบหน้าและเลเวลอัป"],
      ["Video lessons hosted on a streaming CDN", "動画教材のストリーミング配信", "วิดีโอบทเรียนผ่าน CDN"],
      ["Practical submissions reviewed by your instructor", "実技提出を講師が評価", "ผู้สอนรีวิวงานปฏิบัติ"],
    ],
    needs: ["Course video files (to be recorded)", "Video hosting (e.g. Mux / Cloudflare Stream)"],
  },
  practice: {
    phase: 4,
    title: ["Practice Room", "Practice Room", "Practice Room"],
    lead: [
      "A two-deck trainer in the browser for the basics — a learning tool, not a replacement for real gear.",
      "ブラウザで使える2デッキの基礎練習環境。実機の代わりではなく、学習用ツールです。",
      "เทรนเนอร์ 2 เด็คในเบราว์เซอร์สำหรับพื้นฐาน — เครื่องมือเรียน ไม่ใช่สิ่งทดแทนอุปกรณ์จริง",
    ],
    planned: [
      ["Beatmatching, phrasing, EQ, harmonic, transition and energy drills", "ビートマッチング、フレーズ、EQ、ハーモニック、トランジション、エネルギーの練習", "ฝึกแมตช์บีต เฟรส EQ ฮาร์โมนิก ทรานซิชัน และพลังงาน"],
      ["Deck A/B, cue, tempo, crossfader, 3-band EQ, loop, master", "Deck A/B、Cue、テンポ、クロスフェーダー、3バンドEQ、ループ、マスター", "Deck A/B, Cue, Tempo, Crossfader, EQ 3 แบนด์, Loop, Master"],
      ["Only licensed or original practice tracks", "権利処理済み・オリジナルの練習用音源のみ使用", "ใช้เฉพาะเพลงฝึกที่มีลิขสิทธิ์หรือเพลงต้นฉบับ"],
      ["AI Club Simulator (2D, educational simulation)", "AI Club Simulator（2D・教育用シミュレーション）", "AI Club Simulator (2D เพื่อการศึกษา)"],
    ],
    needs: ["Licensed practice tracks"],
  },
  community: {
    phase: 3,
    title: ["Community", "コミュニティ", "คอมมูนิตี้"],
    lead: [
      "A music network for DJs: mixes, video, photos, gear questions, track advice, event posts.",
      "DJのための音楽SNS。MIX、動画、写真、機材の質問、選曲相談、イベント告知。",
      "เครือข่ายดนตรีสำหรับดีเจ: มิกซ์ วิดีโอ รูป คำถามอุปกรณ์ คำแนะนำเพลง และอีเวนต์",
    ],
    planned: [
      ["Likes, comments, follows, bookmarks, hashtags, genre & city feeds", "いいね、コメント、フォロー、ブックマーク、ハッシュタグ、ジャンル・地域別フィード", "ไลก์ คอมเมนต์ ฟอลโลว์ บุ๊กมาร์ก แฮชแท็ก ฟีดตามแนวและเมือง"],
      ["Block & report, with admins making final moderation decisions", "ブロック・通報。最終的なモデレーション判断は管理者", "บล็อกและรายงาน โดยแอดมินตัดสินขั้นสุดท้าย"],
      ["B2B matching — contact only when both sides agree", "B2Bマッチング。双方の同意がある場合のみ連絡可能", "จับคู่ B2B ติดต่อได้เมื่อทั้งสองฝ่ายยินยอม"],
      ["Publishing a mix requires confirming you hold the rights", "MIXの公開には権利の確認が必要", "การเผยแพร่มิกซ์ต้องยืนยันสิทธิ์"],
    ],
  },
  messages: {
    phase: 3,
    title: ["Messages", "メッセージ", "ข้อความ"],
    lead: ["Direct messages between DJs who both agreed to connect.", "双方が承認したDJ同士のダイレクトメッセージ。", "ข้อความส่วนตัวระหว่างดีเจที่ยินยอมเชื่อมต่อกัน"],
    planned: [
      ["Instructor ↔ student messaging", "講師と生徒のメッセージ", "ข้อความระหว่างผู้สอนกับนักเรียน"],
      ["Block & report from any conversation", "会話からのブロック・通報", "บล็อกและรายงานได้จากทุกบทสนทนา"],
    ],
  },
  battles: {
    phase: 3,
    title: ["DJ Battles", "DJ Battles", "DJ Battles"],
    lead: [
      "Monthly challenges. Default weighting: AI technique 40%, instructors 40%, community vote 20% — set per battle.",
      "月例チャレンジ。初期配分はAI技術評価40%、講師評価40%、コミュニティ投票20%（大会ごとに変更可）。",
      "ชาเลนจ์รายเดือน ค่าเริ่มต้น: AI 40% ผู้สอน 40% โหวต 20% ปรับได้ทุกรายการ",
    ],
    planned: [
      ["House, Tech House, Techno, Open Format, Beginner, Creative Transition, 30-Minute Mix", "House、Tech House、Techno、Open Format、Beginner、Creative Transition、30分MIX", "House, Tech House, Techno, Open Format, Beginner, Creative Transition, 30-Minute Mix"],
      ["One vote per account, duplicate-audio checks, anomaly detection, admin review", "1アカウント1票、音源重複チェック、異常投票検知、管理者審査", "1 บัญชี 1 โหวต ตรวจไฟล์ซ้ำ ตรวจจับความผิดปกติ แอดมินตรวจสอบ"],
      ["Public judging criteria", "評価基準の公開", "เปิดเผยเกณฑ์การตัดสิน"],
    ],
  },
  ranking: {
    phase: 3,
    title: ["Ranking", "ランキング", "อันดับ"],
    lead: ["Weekly, monthly, all-time, genre and beginner rankings — plus Most Improved DJ.", "週間・月間・総合・ジャンル別・初心者ランキング、そしてMost Improved DJ。", "อันดับรายสัปดาห์ รายเดือน ตลอดกาล ตามแนว มือใหม่ และ Most Improved DJ"],
    planned: [["Growth counts: beginners are ranked on improvement too", "成長も評価：初心者も上達度でランクイン", "นับพัฒนาการ: มือใหม่ก็ติดอันดับได้จากการพัฒนา"]],
  },
  "artist-studio": {
    phase: 4,
    title: ["Artist Studio", "Artist Studio", "Artist Studio"],
    lead: ["Build your artist brand: name ideas, logo, bios in three languages, content plans.", "DJ名の候補、ロゴ、3言語のプロフィール、コンテンツ計画でアーティストブランドを構築。", "สร้างแบรนด์ศิลปิน: ชื่อ โลโก้ ไบโอ 3 ภาษา และแผนคอนเทนต์"],
    planned: [
      ["DJ name generator with links to check existing artists / trademarks", "既存アーティスト・商標を確認する検索導線付きDJ名ジェネレーター", "ตัวช่วยตั้งชื่อดีเจ พร้อมลิงก์ตรวจชื่อศิลปิน/เครื่องหมายการค้า"],
      ["Logo studio (image-generation provider)", "ロゴスタジオ（画像生成サービス連携）", "สตูดิโอโลโก้ (เชื่อมบริการสร้างภาพ)"],
      ["Digital Press Kit at /artists/your-name — you choose what is public", "/artists/your-name の Digital Press Kit。公開項目は自分で選択", "Digital Press Kit ที่ /artists/your-name เลือกเองว่าจะแสดงอะไร"],
    ],
    needs: ["ANTHROPIC_API_KEY", "Image generation API"],
  },
  gigs: {
    phase: 4,
    title: ["Gigs", "Gigs", "Gigs"],
    lead: ["Open calls from venues and promoters, matched to your public profile. Promoters always make the final call.", "会場・主催者の出演募集を公開プロフィールと照合。最終判断は必ず主催者が行います。", "งานรับสมัครจากสถานที่และผู้จัด จับคู่กับโปรไฟล์ของคุณ ผู้จัดตัดสินใจขั้นสุดท้ายเสมอ"],
    planned: [
      ["Genre, venue, date, set length, level, fee and requirements", "ジャンル、会場、日時、プレイ時間、レベル、報酬、応募条件", "แนว สถานที่ วันเวลา ความยาวเซ็ต ระดับ ค่าตอบแทน เงื่อนไข"],
      ["Student Showcase management", "Student Showcaseの管理", "จัดการ Student Showcase"],
      ["No guaranteed slots or partnerships are shown before they are confirmed", "確定前に出演保証や提携実績は表示しません", "ไม่แสดงการการันตีหรือพาร์ตเนอร์ก่อนได้รับการยืนยัน"],
    ],
  },
  events: {
    phase: 4,
    title: ["Events", "イベント", "อีเวนต์"],
    lead: ["DJ events, venue info, line-ups, tickets and showcase sign-ups.", "DJイベント、会場情報、出演者、チケット、ショーケースへの参加申し込み。", "อีเวนต์ดีเจ ข้อมูลสถานที่ ไลน์อัป ตั๋ว และการสมัครโชว์เคส"],
    planned: [["Event detail pages with venue, line-up, genres and ticket links", "会場・出演DJ・ジャンル・チケットリンク付きのイベント詳細", "หน้ารายละเอียดอีเวนต์พร้อมสถานที่ ไลน์อัป แนวเพลง และลิงก์ตั๋ว"]],
  },
  subscription: {
    phase: 2,
    title: ["Subscription", "サブスクリプション", "สมาชิกรายเดือน"],
    lead: ["Monthly plans with usage quotas sized to real API and server costs.", "API・サーバー費用に基づく利用枠付きの月額プラン。", "แพ็กเกจรายเดือนพร้อมโควตาตามต้นทุน API และเซิร์ฟเวอร์จริง"],
    planned: [
      ["Card, debit and PromptPay via Stripe; server-verified webhooks", "Stripe経由のカード・デビット・PromptPay。Webhookによるサーバー側検証", "บัตรและพร้อมเพย์ผ่าน Stripe ตรวจสอบผ่าน webhook ฝั่งเซิร์ฟเวอร์"],
      ["Lesson packs and coupons", "レッスン回数券とクーポン", "แพ็กบทเรียนและคูปอง"],
    ],
    needs: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "Stripe Price IDs per plan"],
  },
  "admin-community": { phase: 3, title: ["Community moderation", "コミュニティ管理", "จัดการคอมมูนิตี้"], lead: ["Reports queue with AI triage; admins decide.", "AIによる整理付きの通報キュー。判断は管理者。", "คิวรายงานพร้อม AI คัดแยก แอดมินเป็นผู้ตัดสิน"], planned: [["Hide / remove posts, warn or suspend users, all audit-logged", "投稿の非表示・削除、警告・停止。すべて監査ログに記録", "ซ่อน/ลบโพสต์ เตือน/ระงับผู้ใช้ บันทึกทุกการกระทำ"]] },
  "admin-events": { phase: 4, title: ["Events & open calls", "イベント・出演募集", "อีเวนต์และงานรับสมัคร"], lead: ["Create events, showcases and open calls.", "イベント、ショーケース、出演募集を作成。", "สร้างอีเวนต์ โชว์เคส และงานรับสมัคร"], planned: [["Publish / cancel events, manage line-ups and applications", "イベントの公開・中止、出演者と応募の管理", "เผยแพร่/ยกเลิก จัดการไลน์อัปและผู้สมัคร"]] },
  "admin-battles": { phase: 3, title: ["DJ Battles", "DJバトル", "DJ แบทเทิล"], lead: ["Run battles with per-battle weighting and fraud checks.", "大会ごとの配分設定と不正対策でバトルを運営。", "จัดแบทเทิลพร้อมตั้งน้ำหนักและตรวจการโกง"], planned: [["Weights (AI / instructor / community), entry review, vote audit", "配分（AI／講師／コミュニティ）、エントリー審査、投票監査", "น้ำหนัก (AI/ผู้สอน/คอมมูนิตี้) ตรวจผลงาน ตรวจโหวต"]] },
  "admin-ai-usage": { phase: 2, title: ["AI usage & API cost", "AI利用量・APIコスト", "การใช้ AI และต้นทุน API"], lead: ["Per-user, per-feature usage against plan quotas, and monthly API cost.", "ユーザー・機能ごとの利用量とプラン上限、月次APIコスト。", "การใช้งานต่อผู้ใช้/ฟีเจอร์เทียบโควตา และต้นทุน API รายเดือน"], planned: [["Quota enforcement is already modelled in the database (ai_usage, plans.quotas)", "クォータ管理はDBに設計済み（ai_usage, plans.quotas）", "โครงสร้างโควตามีในฐานข้อมูลแล้ว (ai_usage, plans.quotas)"]] },
  "instructor-assignments": { phase: 3, title: ["Assignments", "課題", "แบบฝึกหัด"], lead: ["Create assignments, review submissions; your evaluation is stored separately from AI evaluation.", "課題の作成と提出物の評価。講師評価はAI評価と分けて保存されます。", "สร้างแบบฝึกหัดและรีวิวงาน การประเมินของคุณถูกเก็บแยกจาก AI"], planned: [["Audio submissions with Mix Lab analysis attached", "Mix Lab分析付きの音源提出", "ส่งไฟล์เสียงพร้อมผลวิเคราะห์ Mix Lab"]] },
  "instructor-reviews": { phase: 2, title: ["Reviews", "評価", "การประเมิน"], lead: ["Review AI analyses of your students and add your own guidance.", "生徒のAI分析を確認し、指導内容を追加。", "ดูผลวิเคราะห์ AI ของนักเรียนและเพิ่มคำแนะนำของคุณ"], planned: [["AI score and instructor score shown side by side, never merged silently", "AIスコアと講師スコアを並べて表示。黙って統合しません", "แสดงคะแนน AI และผู้สอนคู่กัน ไม่รวมกันโดยไม่แจ้ง"]] },
};

export function phaseFeature(key: string, locale: Locale) {
  const f = F[key];
  if (!f) return null;
  return {
    phase: f.phase,
    title: pick(f.title, locale),
    lead: pick(f.lead, locale),
    planned: f.planned.map((p) => pick(p, locale)),
    needs: f.needs ?? [],
  };
}
