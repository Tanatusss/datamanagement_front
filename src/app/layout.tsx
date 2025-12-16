// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import AppShell from "@/components/AppShell";
import ToastProvider from "@/components/ToastProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SpaceProvider } from "@/components/ingestion/SpaceContext";
import { ConnectionProvider } from "@/components/ingestion/ConnectionsContext";

export const metadata: Metadata = {
  title: "BOL Data Management Platform ​",
  description: "Interactive data workspace",
};

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={sarabun.className}>
      <body className="min-h-screen bg-[#0D1117]">
        <ToastProvider />
        <AuthProvider>
          <SpaceProvider>
            <ConnectionProvider>
              <AppShell>{children}</AppShell>
            </ConnectionProvider>
          </SpaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
