"use client";

import dynamic from "next/dynamic";
import { ToastProvider } from "@/components/Toast";

// 遅延読み込みでパフォーマンス改善（クライアント専用）
const CommandPalette = dynamic(
  () =>
    import("@/components/CommandPalette").then(
      (mod) => mod.CommandPalette,
    ),
  { ssr: false },
);

const KeyboardShortcutsHelp = dynamic(
  () =>
    import("@/components/KeyboardShortcutsHelp").then(
      (mod) => mod.KeyboardShortcutsHelp,
    ),
  { ssr: false },
);

const ServiceWorkerRegistration = dynamic(
  () =>
    import("@/components/ServiceWorkerRegistration").then(
      (mod) => mod.ServiceWorkerRegistration,
    ),
  { ssr: false },
);

const PWAInstallPrompt = dynamic(
  () =>
    import("@/components/PWAInstallPrompt").then(
      (mod) => mod.PWAInstallPrompt,
    ),
  { ssr: false },
);

export function AppClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <CommandPalette />
      <KeyboardShortcutsHelp />
      <ServiceWorkerRegistration />
      <PWAInstallPrompt />
    </ToastProvider>
  );
}


