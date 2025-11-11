"use client";
import { Search, ChevronDown } from "lucide-react";

type TopbarProps = {
  userEmail?: string;
};

export default function Topbar({ userEmail = "poom.w@datascale.tech" }: TopbarProps) {
  return (
    <header
      // ติดบนสุด + ชิดขวา โดยเว้นที่ให้ sidebar 240px
      className="fixed top-0 right-0 left-[240px] z-50
                 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60
                 border-b border-[var(--border)]"
    >
      <div className="h-14 flex items-center">
        {/* คอนเทนเนอร์ให้ดูเป็นแถบสะอาด ๆ ไม่ชิดขอบจอเกินไป */}
        <div className="w-full max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* ซ้าย: ชื่อแอป */}
            <div className="text-sm font-semibold text-slate-700 whitespace-nowrap">
              SQLStore
            </div>

            {/* กลาง: ช่องค้นหา — กว้างพอดีและมีเงาบางๆ */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Filter by name or tags"
                    className="w-full h-9 rounded-md border border-[var(--border)]
                               pl-9 pr-3 text-sm bg-white/90 outline-none
                               focus:ring-2 focus:ring-slate-200 focus:border-slate-300
                               shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* ขวา: ปุ่ม + Add SQL */}
            <button
              className="h-9 px-3 rounded-md text-sm font-medium
                         bg-white hover:bg-slate-100 active:bg-slate-200
                         border border-[var(--border)] shadow-sm
                         whitespace-nowrap"
            >
              + Add SQL
            </button>

            {/* ขวาสุด: อีเมลผู้ใช้ + caret (เมนู) */}
            <button
              className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md
                         text-xs text-slate-600 bg-white/80 hover:bg-white
                         border border-[var(--border)] shadow-sm"
            >
              <span className="truncate max-w-[180px]">{userEmail}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
