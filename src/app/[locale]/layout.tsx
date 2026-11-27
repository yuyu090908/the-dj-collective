import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Noto_Sans_JP, Noto_Sans_Thai } from "next/font/google";
import "../globals.css";
import { htmlLang, locales } from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/server";
import { getDict } from "@/lib/i18n";
import { env } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const jp = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-jp", display: "swap", preload: false });
const thai = Noto_Sans_Thai({ subsets: ["thai"], weight: ["400", "500", "700"], variable: "--font-thai", display: "swap", preload: false });

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDict(locale);
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: `THE DJ COLLECTIVE — ${t.meta.tagline}`, template: "%s — THE DJ COLLECTIVE" },
    description: t.meta.defaultDescription,
    applicationName: "THE DJ COLLECTIVE",
    appleWebApp: { capable: true, title: "DJ COLLECTIVE", statusBarStyle: "black-translucent" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#101010",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  return (
    <html lang={htmlLang[locale]} className={`${inter.variable} ${space.variable} ${jp.variable} ${thai.variable}`}>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
          }}
        />
      </body>
    </html>
  );
}
