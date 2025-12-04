import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://docuflow-azure.vercel.app"),
  title: "DocuFlow | AI 要約ドキュメントワークスペース",
  description:
    "DocuFlow は、AI 要約で、PDF や Word 資料を一瞬で整理するドキュメントワークスペースです。GPT-4を活用した自動要約、タグ付け、全文検索で効率的なドキュメント管理を実現します。",
  keywords: ["ドキュメント管理", "AI要約", "PDF", "Word", "タグ付け", "全文検索"],
  authors: [{ name: "DocuFlow" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "DocuFlow | AI 要約ドキュメントワークスペース",
    description: "AI 要約で、PDF / Word 資料を一瞬で整理。GPT-4を活用したスマートなドキュメント管理。",
    type: "website",
    siteName: "DocuFlow",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "DocuFlow - AI-Powered Document Workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuFlow | AI 要約ドキュメントワークスペース",
    description: "AI 要約で、PDF / Word 資料を一瞬で整理",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200`}
      >
        <ToastProvider>
          {children}
          <CommandPalette />
          <KeyboardShortcutsHelp />
        </ToastProvider>
      </body>
    </html>
  );
}
