// src/components/TopBar.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Command,
} from "lucide-react";

import { cn } from "@/lib/cn";

type Props = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Topbar({ sidebarOpen, onToggleSidebar }: Props) {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [kHint, setKHint] = useState<"Cmd" | "Ctrl">("Ctrl");

  useEffect(() => {
    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
    setKHint(isMac ? "Cmd" : "Ctrl");
  }, []);

  const shell =
    "w-full border-b border-slate-800/70 bg-[#0D1117]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0D1117]/70";

  const iconBtn = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md",
    "border border-slate-700/70 bg-[#0B1220]/60",
    "text-slate-200 hover:bg-slate-800/60 hover:text-slate-100",
    "transition-colors"
  );

  // ✅ ต้องเป็น xl:hidden (ไม่ใช่ lg:hidden) เพราะ drawer ใช้ xl เป็น breakpoint
  const hamburgerBtn = cn(
    "xl:hidden inline-flex h-9 w-9 items-center justify-center rounded-md",
    "border border-slate-700/70 bg-[#0B1220]/60",
    "text-slate-200 hover:bg-slate-800/60 hover:text-slate-100",
    "transition-colors"
  );

  const searchWrap = cn(
    "flex w-full items-center gap-2 rounded-md",
    "border border-slate-700/70 bg-[#020617]/55",
    "px-3 py-2",
    "transition-colors",
    "focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/15"
  );

  const searchInput = cn(
    "w-full bg-transparent outline-none",
    "text-slate-200 placeholder:text-slate-500",
    "text-sm"
  );

  const canGoBack = useMemo(() => true, []);
  const canGoForward = useMemo(() => true, []);

  return (
    <header className={shell}>
      <div className="flex h-14 items-center gap-2 px-3 lg:px-4">
        {/* ☰ Hamburger (< xl เท่านั้น) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={hamburgerBtn}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          title={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* ⬅ ➡ Back / Forward
            - บนจอเล็กมากให้ซ่อน forward เพื่อไม่ทับ search
        */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(iconBtn, !canGoBack && "opacity-50 pointer-events-none")}
            onClick={() => router.back()}
            title="Back"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            className={cn(
              iconBtn,
              "hidden sm:inline-flex",
              !canGoForward && "opacity-50 pointer-events-none"
            )}
            onClick={() => router.forward()}
            title="Forward"
            aria-label="Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <div className={searchWrap}>
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pages…"
              className={searchInput}
            />

            {/* Hint (ซ่อนในจอเล็ก) */}
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
              <Command className="h-3.5 w-3.5" />
              <span>{kHint}+K</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
