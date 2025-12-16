"use client";

import React from "react";
import type { LeftPanel } from "./flowTypes";

type Props = {
  leftPanel: LeftPanel;
  left: React.ReactNode;
  right: React.ReactNode;
};

export function SpaceDetailLayout({ leftPanel, left, right }: Props) {
  const showLeft = leftPanel !== "none";

  return (
    <div
      className={[
        "grid gap-5",
        // ✅ โครงเดียวเสมอ: ถ้ามี left → 2 คอลัมน์, ถ้าไม่มี → 1 คอลัมน์
        showLeft ? "lg:grid-cols-[420px_1fr]" : "lg:grid-cols-[1fr]",
      ].join(" ")}
    >
      {/* ✅ left อยู่ตลอด แต่ซ่อนด้วย CSS เพื่อไม่ unmount/mount */}
      <div className={showLeft ? "block" : "hidden lg:block lg:invisible"}>
        {left}
      </div>

      {/* ✅ right อยู่ตลอด ไม่โดนถอดออก */}
      <div className="min-w-0">{right}</div>
    </div>
  );
}
