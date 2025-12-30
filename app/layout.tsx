import type { Metadata } from "next";
// 1. 引入我們需要的字體：Archivo Black (標題) 與 JetBrains Mono (代碼/數據)
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 引入你原本的 Provider (保持不變)
import QueryProvider from "@/components/providers/query-provider";

// 2. 設定 Archivo Black (用於大標題)
const archivo = Archivo_Black({
  weight: "400", // 這種字體通常只有 400，因為它本身就很粗
  subsets: ["latin"],
  variable: "--font-archivo", // 這會對應到 globals.css 的設定
});

// 3. 設定 JetBrains Mono (用於內文和數據)
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono", // 這也會對應到 globals.css
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
           - 注入字體變數: ${archivo.variable} ${mono.variable}
           - 設定基礎樣式: antialiased (平滑字體), bg-stone-100 (背景灰白), text-stone-900 (文字深黑)
      */}
      <body
        className={`${archivo.variable} ${mono.variable} antialiased bg-stone-100 text-stone-900`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
