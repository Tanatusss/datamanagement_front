// src/components/Topbar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type TopbarProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

type OpenedTab = {
  path: string;
  label: string;
};

const SEGMENT_LABEL_MAP: Record<string, string> = {
  ocr: "OCR",
  ingestion: "Ingestion",
  space: "Space",
  connection: "Connection",
  catalog: "Data Catalog",
  apis: "APIs",
  visualization: "Visualization",
  governance: "Governance",
  mdm: "MDM",
  "mrm-ai": "MRM & AI",
  marketplace: "Marketplace",
  sandbox: "AI Sandbox",
  console: "AI Console",
  admin: "Admin",
};

const IGNORE_TABS_PREFIX = ["/login", "/register"];

function pathToLabel(pathname: string): string {
  if (!pathname || pathname === "/") return "Home";

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];

  if (SEGMENT_LABEL_MAP[last]) return SEGMENT_LABEL_MAP[last];
  if (SEGMENT_LABEL_MAP[segments[0]]) return SEGMENT_LABEL_MAP[segments[0]];

  const decoded = decodeURIComponent(last);
  return decoded
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [tabs, setTabs] = useState<OpenedTab[]>([]);

  // เปิดแท็บใหม่ทุกครั้งที่เปลี่ยน path (ยกเว้น /login /register)
  useEffect(() => {
    if (!pathname) return;

    if (IGNORE_TABS_PREFIX.some((p) => pathname.startsWith(p))) {
      return;
    }

    setTabs((prev) => {
      if (prev.some((t) => t.path === pathname)) return prev;
      const label = pathToLabel(pathname);
      return [...prev, { path: pathname, label }];
    });
  }, [pathname]);

  const handleClickTab = (path: string) => {
    if (path === pathname) return;
    router.push(path);
  };

  const handleCloseTab = (pathToClose: string) => {
  let nextPathToGo: string | null = null;

  setTabs((prev) => {
    const idx = prev.findIndex((t) => t.path === pathToClose);
    const nextTabs = prev.filter((t) => t.path !== pathToClose);

    // ถ้าปิด tab ที่กำลัง active ให้เลือก fallback
    if (pathname === pathToClose) {
      const fallback =
        nextTabs[idx - 1] ?? nextTabs[idx] ?? { path: "/", label: "Home" };
      nextPathToGo = fallback.path; // ✅ แค่ “จำไว้” ก่อน
    }

    return nextTabs;
  });

  // ✅ ค่อยนำทาง “หลัง” setTabs ถูกเรียก (นอก setState updater)
  if (nextPathToGo) router.push(nextPathToGo);
};


  const showTabs = useMemo(() => tabs, [tabs]);

  return (
    <header className="w-full border-b border-slate-800 bg-[#06070A] backdrop-blur">
      {/* แถวบน: back/forward + search bar แบบ VSCode */}
      <div className="flex items-center justify-center gap-3 px-3 py-2">
        {/* ปุ่ม back / forward เหมือน browser / VSCode */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-[#020617] text-slate-200 hover:bg-[#111827] hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => router.forward()}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-[#020617] text-slate-200 hover:bg-[#111827] hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* search / command bar กลางจอ */}
        <button
          type="button"
          className="ml-4 flex flex-1 max-w-xl justify-center items-center gap-2 rounded-md border border-slate-700 bg-[#020617] px-3 py-1.5 text-xs text-slate-400 hover:border-sky-500/70 hover:bg-[#02091f]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="truncate">
            PRODUCT DATAMANAGEMENT
          </span>
        </button>

        {/* ช่องว่างสำหรับปุ่มอื่นในอนาคต */}
        <div className="w-12" />
      </div>

      {/* แถวล่าง: VSCode editor tabs (closable) */}
      <div className="flex items-end border-t border-slate-900 px-1 pt-1">
        <div className="flex max-w-full flex-1 items-end overflow-x-auto">
          {showTabs.map((tab) => {
            const active = tab.path === pathname;
            return (
              <div
                key={tab.path}
                onClick={() => handleClickTab(tab.path)}
                className={[
                  "group flex items-center px-3 py-1.5 text-xs rounded-t-md border border-b-0 mr-[1px]",
                  "cursor-pointer select-none",
                  active
                    ? "bg-[#0b1120] text-[#F0EEE9] border-slate-700"
                    : "bg-[#020617] text-slate-400 border-transparent hover:bg-[#050816] hover:text-slate-100",
                ].join(" ")}
              >
                <span className="truncate max-w-[160px]">{tab.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.path);
                  }}
                  className={[
                    "ml-2 flex h-4 w-4 items-center justify-center rounded hover:bg-slate-600/40",
                    active
                      ? "text-slate-300"
                      : "text-slate-500 group-hover:text-slate-300",
                  ].join(" ")}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}

          {/* พื้นที่ว่างด้านขวาแบบ VSCode */}
          <div className="flex-1 border-b border-slate-800" />
        </div>
      </div>
    </header>
  );
}
