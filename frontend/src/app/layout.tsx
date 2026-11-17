import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { TopNav, Sidebar } from "@/components/shell";
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
      <body className="min-h-screen bg-canvas text-content-primary antialiased font-sans flex flex-col">
        <UserProvider>
          <ToastProvider>
            <TopNav />
            <CommandPalette />
            <div className="flex-1 flex w-full max-w-[1440px] mx-auto">
              <Sidebar className="min-h-[calc(100vh-56px)] sticky top-14 self-start" />
              <main className="flex-1 px-6 py-6 overflow-x-hidden min-w-0">
                {children}
              </main>
            </div>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
