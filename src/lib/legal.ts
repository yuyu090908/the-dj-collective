// DRAFT legal templates. They describe how the software actually behaves today,
// but MUST be reviewed by a qualified lawyer (Thai PDPA, consumer law, and each
// target market) before launch. Operator name / address / contact are left blank on purpose.
import type { Locale } from "./i18n/config";

type Doc = { title: string; sections: [string, string][] };
type Docs = Record<"terms" | "privacy" | "refund" | "copyright", Record<Locale, Doc>>;

export const legal: Docs = {
  terms: {
    en: { title: "Terms of Service", sections: [
      ["Operator", "THE DJ COLLECTIVE — legal entity name, registered address and contact to be inserted."],
      ["Accounts", "You must give accurate information and keep your password safe. One person per account."],
      ["Lessons", "Bookings are confirmed only after payment is verified by our server. Lesson content is for your personal learning."],
      ["Acceptable use", "No harassment, spam, impersonation, or uploading content you do not have the rights to."],
      ["AI features", "AI outputs are educational guidance. Measured audio values and AI estimates are shown separately; AI may be wrong."],
      ["Changes & law", "We may update these terms with notice. Governing law and jurisdiction to be defined (Thailand assumed)."],
    ] },
    ja: { title: "利用規約", sections: [
      ["運営者", "THE DJ COLLECTIVE — 法人名・所在地・連絡先を記載予定。"],
      ["アカウント", "正確な情報を登録し、パスワードを適切に管理してください。1人1アカウントです。"],
      ["レッスン", "予約はサーバーが決済を確認した時点で確定します。レッスン内容は個人の学習目的でご利用ください。"],
      ["禁止事項", "嫌がらせ、スパム、なりすまし、権利を持たないコンテンツのアップロードを禁止します。"],
      ["AI機能", "AIの出力は学習のための参考情報です。計測値とAIの推定は分けて表示され、AIは誤る可能性があります。"],
      ["変更・準拠法", "本規約は通知の上で変更することがあります。準拠法・管轄は確定予定（タイを想定）。"],
    ] },
    th: { title: "ข้อกำหนดการใช้งาน", sections: [
      ["ผู้ให้บริการ", "THE DJ COLLECTIVE — ชื่อนิติบุคคล ที่อยู่ และช่องทางติดต่อ จะระบุภายหลัง"],
      ["บัญชีผู้ใช้", "กรุณาให้ข้อมูลที่ถูกต้องและรักษารหัสผ่าน หนึ่งคนต่อหนึ่งบัญชี"],
      ["บทเรียน", "การจองจะยืนยันหลังเซิร์ฟเวอร์ตรวจสอบการชำระเงินแล้ว เนื้อหาบทเรียนใช้เพื่อการเรียนส่วนตัว"],
      ["การใช้งานที่ไม่อนุญาต", "ห้ามคุกคาม สแปม แอบอ้าง หรืออัปโหลดเนื้อหาที่ไม่มีสิทธิ์"],
      ["ฟีเจอร์ AI", "ผลลัพธ์ AI เป็นคำแนะนำเพื่อการเรียน ค่าที่วัดได้และค่าประมาณแสดงแยกกัน และ AI อาจผิดพลาดได้"],
      ["การเปลี่ยนแปลงและกฎหมาย", "อาจปรับปรุงข้อกำหนดโดยแจ้งล่วงหน้า กฎหมายที่ใช้บังคับจะกำหนดภายหลัง (คาดว่าเป็นประเทศไทย)"],
    ] },
  },
  privacy: {
    en: { title: "Privacy Policy", sections: [
      ["Data we collect", "Account (email, name), profile (experience, genres, gear), bookings, payments (handled by Stripe; we do not store card numbers), messages, uploads."],
      ["Purpose", "Providing lessons and the platform, payments, reminders, safety and moderation."],
      ["AI & your data", "The AI Coach uses your learning history only if you allow it in Settings. Uploaded audio is private by default and never used to train AI without explicit consent."],
      ["Your rights (PDPA)", "Access, correction, deletion, portability and withdrawal of consent. Download your data or delete your account in Settings."],
      ["Processors", "Hosting (e.g. Vercel), database (Supabase), payments (Stripe), video calls (Daily), email (Resend) — once connected."],
      ["Contact", "Data protection contact to be inserted."],
    ] },
    ja: { title: "プライバシーポリシー", sections: [
      ["取得する情報", "アカウント（メール・名前）、プロフィール（経験・ジャンル・機材）、予約、決済（Stripeが処理し、カード番号は保存しません）、メッセージ、アップロード。"],
      ["利用目的", "レッスンとプラットフォームの提供、決済、リマインダー、安全確保とモデレーション。"],
      ["AIとデータ", "AIコーチは設定で許可した場合のみ学習履歴を利用します。アップロード音源は初期設定で非公開で、明示的な同意なくAI学習に使用しません。"],
      ["あなたの権利（PDPA）", "開示・訂正・削除・データポータビリティ・同意撤回。設定画面からデータのダウンロードとアカウント削除ができます。"],
      ["委託先", "ホスティング（Vercel等）、データベース（Supabase）、決済（Stripe）、ビデオ通話（Daily）、メール（Resend）— 接続後。"],
      ["お問い合わせ", "個人情報保護の窓口を記載予定。"],
    ] },
    th: { title: "นโยบายความเป็นส่วนตัว", sections: [
      ["ข้อมูลที่เก็บ", "บัญชี (อีเมล ชื่อ) โปรไฟล์ (ประสบการณ์ แนวเพลง อุปกรณ์) การจอง การชำระเงิน (ดำเนินการโดย Stripe เราไม่เก็บเลขบัตร) ข้อความ และไฟล์อัปโหลด"],
      ["วัตถุประสงค์", "ให้บริการบทเรียนและแพลตฟอร์ม การชำระเงิน การแจ้งเตือน ความปลอดภัยและการดูแลเนื้อหา"],
      ["AI และข้อมูลของคุณ", "AI Coach ใช้ประวัติการเรียนเฉพาะเมื่อคุณอนุญาต ไฟล์เสียงเป็นส่วนตัวโดยค่าเริ่มต้น และไม่ใช้ฝึก AI โดยไม่ได้รับความยินยอม"],
      ["สิทธิ์ของคุณ (PDPA)", "เข้าถึง แก้ไข ลบ โอนย้ายข้อมูล และถอนความยินยอม ดาวน์โหลดข้อมูลหรือลบบัญชีได้ในหน้าตั้งค่า"],
      ["ผู้ประมวลผลข้อมูล", "โฮสติ้ง (เช่น Vercel) ฐานข้อมูล (Supabase) การชำระเงิน (Stripe) วิดีโอคอล (Daily) อีเมล (Resend) — เมื่อเชื่อมต่อแล้ว"],
      ["ติดต่อ", "ช่องทางติดต่อเรื่องข้อมูลส่วนบุคคลจะระบุภายหลัง"],
    ] },
  },
  refund: {
    en: { title: "Refund Policy", sections: [
      ["Free cancellation", "Cancel or reschedule up to 24 hours before a lesson for a full refund to the original payment method."],
      ["Late cancellation", "Within 24 hours of the lesson, cancellations are not refunded (provisional policy — to be confirmed by the school)."],
      ["Cancelled by the school", "If we cancel, you receive a full refund."],
      ["Payment after a hold expired", "If your payment arrives after your held time was taken by someone else, the booking is cancelled and refunded automatically."],
      ["Subscriptions", "Monthly plans renew automatically each month by card until cancelled. You can cancel at any time from Subscription; access continues until the end of the paid period. Refunds for subscriptions and price-change notice periods are to be confirmed by the school (provisional)."],
    ] },
    ja: { title: "返金規定", sections: [
      ["無料キャンセル", "レッスン開始24時間前までのキャンセル・日程変更は、元の決済方法に全額返金します。"],
      ["直前キャンセル", "開始24時間以内のキャンセルは返金対象外です（仮の規定 — スクールが確定予定）。"],
      ["スクール都合のキャンセル", "スクール都合でキャンセルした場合は全額返金します。"],
      ["仮押さえ期限切れ後の決済", "仮押さえの期限切れ後に他の方が予約した枠への決済は、自動的にキャンセル・返金されます。"],
      ["サブスクリプション", "月額プランは解約するまで毎月カードで自動更新されます。サブスクリプション画面からいつでも解約でき、支払い済み期間の終了まで利用できます。サブスクリプションの返金と価格改定の通知期間はスクールが確定します（暫定）。"],
    ] },
    th: { title: "นโยบายการคืนเงิน", sections: [
      ["ยกเลิกฟรี", "ยกเลิกหรือเลื่อนนัดก่อนเริ่มเรียน 24 ชั่วโมง คืนเงินเต็มจำนวนผ่านช่องทางเดิม"],
      ["ยกเลิกกระชั้นชิด", "ยกเลิกภายใน 24 ชั่วโมงก่อนเรียนจะไม่คืนเงิน (นโยบายชั่วคราว — รอสคูลยืนยัน)"],
      ["สคูลเป็นฝ่ายยกเลิก", "หากเรายกเลิก คุณจะได้รับเงินคืนเต็มจำนวน"],
      ["ชำระเงินหลังหมดเวลาล็อก", "หากชำระเงินหลังจากเวลาที่ล็อกไว้ถูกผู้อื่นจองไปแล้ว การจองจะถูกยกเลิกและคืนเงินอัตโนมัติ"],
      ["สมาชิกรายเดือน", "แพ็กเกจรายเดือนต่ออายุอัตโนมัติด้วยบัตรทุกเดือนจนกว่าจะยกเลิก ยกเลิกได้ทุกเมื่อที่หน้า Subscription และใช้งานได้จนสิ้นสุดรอบที่ชำระแล้ว การคืนเงินค่าสมาชิกและระยะเวลาแจ้งเปลี่ยนราคาจะยืนยันโดยโรงเรียน (ชั่วคราว)"],
    ] },
  },
  copyright: {
    en: { title: "Copyright Policy", sections: [
      ["Your uploads", "Only upload mixes and media you have the right to use. Publishing to the community requires confirming you hold the necessary rights."],
      ["Private by default", "Audio uploaded for analysis is private by default and served through signed, expiring URLs."],
      ["Reporting infringement", "Rights holders can report content via the Contact page (topic: Other). We review and remove infringing content."],
      ["Practice audio", "Practice tools only use licensed, original or user-owned audio."],
    ] },
    ja: { title: "著作権ポリシー", sections: [
      ["アップロード", "利用権を持つMIXやメディアのみアップロードしてください。コミュニティへの公開には権利の確認が必要です。"],
      ["初期設定は非公開", "分析用の音源は初期設定で非公開となり、期限付きの署名付きURLで配信されます。"],
      ["侵害の通報", "権利者はお問い合わせページ（その他）から通報できます。確認の上、侵害コンテンツを削除します。"],
      ["練習用音源", "練習ツールでは権利処理済み・オリジナル・ユーザー所有の音源のみ使用します。"],
    ] },
    th: { title: "นโยบายลิขสิทธิ์", sections: [
      ["การอัปโหลด", "อัปโหลดเฉพาะมิกซ์และสื่อที่คุณมีสิทธิ์ การเผยแพร่สู่คอมมูนิตี้ต้องยืนยันสิทธิ์"],
      ["ส่วนตัวโดยค่าเริ่มต้น", "ไฟล์เสียงเพื่อการวิเคราะห์เป็นส่วนตัวโดยค่าเริ่มต้น และเข้าถึงผ่าน URL แบบมีลายเซ็นและหมดอายุ"],
      ["แจ้งการละเมิด", "เจ้าของสิทธิ์แจ้งได้ที่หน้าติดต่อ (หัวข้อ: อื่น ๆ) เราจะตรวจสอบและลบเนื้อหาที่ละเมิด"],
      ["เพลงสำหรับฝึก", "เครื่องมือฝึกใช้เฉพาะเพลงที่มีลิขสิทธิ์ เพลงต้นฉบับ หรือเพลงที่ผู้ใช้เป็นเจ้าของ"],
    ] },
  },
};
