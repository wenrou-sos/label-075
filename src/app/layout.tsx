import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "高值耗材全流程管理平台",
  description: "医院高值耗材全流程闭环管理——申购、验收、领用、使用、结算",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
