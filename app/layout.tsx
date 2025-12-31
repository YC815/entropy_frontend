import type { Metadata } from "next";
// 1. 引入字體：Archivo Black (英文標題) + Noto Sans TC (中文) + JetBrains Mono (代碼)
import { Archivo_Black, Noto_Sans_TC, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 引入你原本的 Provider (保持不變)
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

// 2. 設定 Archivo Black (用於英文標題，保留 Neo-Brutalism 的扁平粗獷感)
const archivo = Archivo_Black({
  weight: "400", // 這種字體只有 400，因為它本身就很粗
  subsets: ["latin"],
  variable: "--font-archivo",
});

// 3. 設定 Noto Sans TC (思源黑體) - 用於中文標題與內文
const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700", "900"], // 引入多個字重，900 = Black 超粗體
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

// 4. 設定 JetBrains Mono (用於代碼/數據顯示)
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// 4. 更新網站標題資訊
export const metadata: Metadata = {
  title: "EntroPy | Anti-Entropy Console",
  description: "Strategic Life Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 5. 在 body 的 className 中：
           - 注入字體變數: ${archivo.variable} ${notoSansTC.variable} ${mono.variable}
           - 設定基礎樣式: antialiased (平滑字體), bg-stone-100 (背景灰白), text-stone-900 (文字深黑)
      */}
      <body
        className={`${archivo.variable} ${notoSansTC.variable} ${mono.variable} antialiased bg-stone-100 text-stone-900`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
