// src/components/ingestion/space/space-detail/SpaceDetailHeader.tsx
"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { SpaceSubTabs } from "@/components/ingestion/space/SpaceSubTabs";
import type { LeftPanel } from "./flowTypes";

type Props = {
  spaceName: string;
  onBack: () => void;
  active: LeftPanel; // none | transform | sql
  onOpenTransform: () => void;
  onOpenSql: () => void;
};

export function SpaceDetailHeader({
  spaceName,
  onBack,
  active,
  onOpenTransform,
  onOpenSql,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full
                     border border-[#1F2937] bg-[#020617] text-slate-200
                     hover:bg-[#111827] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-[#F0EEE9]">{spaceName}</h1>
          <p className="mt-1 text-sm text-[#9AA4B2]">
            Flow สำหรับกำหนด node ต่างๆ ของ Space นี้
          </p>

          {/* ✅ ไม่มี Flow แล้ว: ให้ SpaceSubTabs แสดง Transform/SQL อย่างเดียว
              - ถ้า SpaceSubTabs ยังมี Flow ให้ลบในไฟล์นั้น
          */}
          <SpaceSubTabs
            tab={active === "transform" ? ("transform" as any) : active === "sql" ? ("sql" as any) : ("none" as any)}
            onTab={(t: any) => {
              if (t === "transform") onOpenTransform();
              if (t === "sql") onOpenSql();
            }}
          />
        </div>
      </div>
    </div>
  );
}
