import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/TopNav";
import { Inter, Prompt } from "next/font/google";

export const metadata: Metadata = {
  title: "BOL Data Management Platform ​",
  description: "Interactive data workspace",
};
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.className} ${prompt.className}`}>
      <body className="bg-slate-50 text-slate-900">
        <Sidebar />
        <Topbar userEmail="Introvert007w@product.com" />

        {/* เว้นระยะเพื่อไม่ให้เนื้อหาทับ navbar/sidebar */}
        <main className="ml-[240px] mt-[56px] p-6 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
