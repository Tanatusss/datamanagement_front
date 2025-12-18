"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/cn";

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
  const [q, setQ] = useState("");

  // add tab on route change
  useEffect(() => {
    if (!pathname) return;
    if (IGNORE_TABS_PREFIX.some((p) => pathname.startsWith(p))) return;

    setTabs((prev) => {
      if (prev.some((t) => t.path === pathname)) return prev;
      return [...prev, { path: pathname, label: pathToLabel(pathname) }];
    });
  }, [pathname]);

  const handleCloseTab = useCallback(
    (pathToClose: string) => {
      let next: string | null = null;

      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.path === pathToClose);
        const nextTabs = prev.filter((t) => t.path !== pathToClose);

        if (pathname === pathToClose) {
          next = nextTabs[idx - 1]?.path ?? nextTabs[0]?.path ?? "/";
        }
        return nextTabs;
      });

      if (next) router.push(next);
    },
    [router, pathname]
  );

  return (
    <header className="w-full border-b border-slate-800 bg-[#06070A]">
      {/* ───────────────── Top row */}
      <div className="flex items-center gap-3 px-3 py-2 lg:px-4">
        {/* ☰ Hamburger (mobile / tablet) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md
                     border border-slate-700 bg-[#020617] text-slate-200
                     hover:bg-[#111827]"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* ◀ ▶ Back / Forward (desktop only, อยู่ข้าง search) */}
        <div className="hidden lg:flex  items-center gap-1">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-md
                       border border-slate-700 bg-[#020617] text-slate-200
                       hover:bg-[#111827]"
            title="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.forward()}
            className="h-9 w-9 flex items-center justify-center rounded-md
                       border border-slate-700 bg-[#020617] text-slate-200
                       hover:bg-[#111827]"
            title="Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 🔍 Search (layout เดิม) */}
        <div className="relative flex flex-1 max-w-xl">
          <div
            className="flex w-full items-center gap-2 rounded-md
                       border border-slate-700 bg-[#020617]
                       px-3 py-2 text-xs text-slate-400"
          >
            <Search className="h-4 w-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pages… (Ctrl/Cmd+K)"
              className="w-full bg-transparent outline-none
                         text-slate-200 placeholder:text-slate-500"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="h-6 w-6 flex items-center justify-center
                           rounded hover:bg-slate-700/40"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────── Tabs row (เหมือนเดิม) */}
      <div className="flex items-end border-t border-slate-900 px-1 pt-1">
        <div className="flex max-w-full flex-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.path === pathname;
            return (
              <div
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={cn(
                  "group flex items-center px-3 py-1.5 text-xs rounded-t-md border border-b-0 mr-[2px]",
                  active
                    ? "bg-[#0b1120] text-[#F0EEE9] border-slate-700"
                    : "bg-[#020617] text-slate-400 border-transparent hover:bg-[#050816]"
                )}
              >
                <span className="truncate max-w-[160px]">{tab.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.path);
                  }}
                  className="ml-2 h-4 w-4 flex items-center justify-center
                             rounded hover:bg-slate-600/40"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          <div className="flex-1 border-b border-slate-800" />
        </div>
      </div>
    </header>
  );
}
