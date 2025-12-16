// src/components/StatusBar.tsx
"use client";

import { usePathname } from "next/navigation";

export default function StatusBar() {
  const pathname = usePathname();

  return (
    <div className="h-7 border-t border-slate-800 bg-[#050815] text-[11px] text-slate-400 flex items-center justify-between px-3">
      {/* ด้านซ้าย */}
      <div className="flex items-center gap-3">
        <span className="text-sky-400 font-medium">
           Data Workspace
        </span>

        <span className="hidden sm:inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Ready
        </span>
      </div>

      {/* ด้านขวา – ทำ style คล้าย VSCode: UTF-8, LF, TypeScript JSX ฯลฯ */}
      <div className="flex items-center gap-4">
        <span className="hidden md:inline text-slate-500">
          {pathname || "/"}
        </span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>TypeScript JSX</span>
      </div>
    </div>
  );
}
