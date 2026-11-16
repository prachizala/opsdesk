import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { TopNav } from "@/components/TopNav";
import { CommandPalette } from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "OpsDesk - B2B Travel Operations Dispatcher",
  description: "Calm mission control for travel operations with LCD-aware SLA routing and AI triage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-content-primary antialiased font-sans">
        <UserProvider>
          <ToastProvider>
            <TopNav />
            <CommandPalette />
            <main className="max-w-[1440px] mx-auto px-6 py-6">
              {children}
            </main>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
