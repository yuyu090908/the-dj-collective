import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, PageHero } from "@/components/ui";
import { DeviceCheck } from "@/components/site/device-check";

const L = {
  en: { start: "Start test", stop: "Stop", camera: "Camera", mic: "Microphone", screen: "Test screen share", ok: "Camera and microphone are working.", denied: "Permission denied or no device found. Allow camera & microphone in your browser settings.", level: "Input level", tip: "For gear checks, share your DJ software window or point a second camera at your controller. Echo cancellation and noise suppression are switched off here so music isn't mangled — use headphones to avoid feedback." },
  ja: { start: "テスト開始", stop: "停止", camera: "カメラ", mic: "マイク", screen: "画面共有をテスト", ok: "カメラとマイクは正常に動作しています。", denied: "許可されていないか、デバイスが見つかりません。ブラウザ設定でカメラとマイクを許可してください。", level: "入力レベル", tip: "機材確認では、DJソフトのウィンドウを共有するか、2台目のカメラでコントローラーを映してください。音楽が劣化しないよう、ここではエコーキャンセルとノイズ除去をオフにしています。ハウリング防止のためヘッドホンを使用してください。" },
  th: { start: "เริ่มทดสอบ", stop: "หยุด", camera: "กล้อง", mic: "ไมโครโฟน", screen: "ทดสอบแชร์หน้าจอ", ok: "กล้องและไมโครโฟนทำงานปกติ", denied: "ไม่ได้รับอนุญาตหรือไม่พบอุปกรณ์ กรุณาอนุญาตกล้องและไมค์ในเบราว์เซอร์", level: "ระดับเสียงเข้า", tip: "สำหรับตรวจอุปกรณ์ ให้แชร์หน้าต่างโปรแกรมดีเจหรือใช้กล้องตัวที่สองถ่ายคอนโทรลเลอร์ ที่นี่ปิดการตัดเสียงสะท้อนและลดเสียงรบกวนเพื่อไม่ให้เพลงเพี้ยน ใช้หูฟังเพื่อป้องกันเสียงหอน" },
};

export async function generateMetadata({ params }: PageProps<"/[locale]/device-check">) {
  const { locale, t } = await pageCtx(params);
  return { ...seo(locale, "/device-check", t.pages.lessons.deviceCheck), robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/device-check">) {
  const { locale, t } = await pageCtx(params);
  return (
    <>
      <PageHero kicker="Online lessons" title={t.pages.lessons.deviceCheck} />
      <Container className="pt-10">
        <DeviceCheck labels={L[locale]} />
      </Container>
    </>
  );
}
