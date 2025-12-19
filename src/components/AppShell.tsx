"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import SidebarVer2 from "./SidebarVer.2";
import Topbar from "./TopBar";
import BottomBar from "./BottomBar";

function useIsXlUp() {
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsXl(mq.matches);
    apply();

    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  return isXl;
}

/**
 * ✅ ปรับ 2 ค่านี้ให้ตรงกับ SidebarVer2 จริง
 * - ถ้า sidebar ตอน "เปิด" กว้าง ~280px ให้ใส่ 280
 * - ถ้าตอน "พับ" เหลือ ~80-96px ให้ใส่ตามนั้น
 */
const SIDEBAR_OPEN_PX = 280;
const SIDEBAR_COLLAPSED_PX = 88;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isXlUp = useIsXlUp();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const [bottomOpen, setBottomOpen] = useState(true);
  const toggleBottom = useCallback(() => setBottomOpen((v) => !v), []);

  useEffect(() => {
    // ✅ จอเล็ก: sidebar ปิด, bottom ปิด (ตามที่คุณตั้งไว้เดิม)
    setSidebarOpen(isXlUp);
    setBottomOpen(isXlUp);
  }, [isXlUp]);

  // ✅ จอเล็ก ถ้า sidebar เปิดอยู่ → ซ่อน BottomBar กันบัง
  const showBottomBar = useMemo(() => {
    if (isXlUp) return true;
    return !sidebarOpen;
  }, [isXlUp, sidebarOpen]);

  // ✅ กันระยะให้ content เฉพาะ XL+ (desktop)
  // จอเล็กปล่อยเป็น overlay ไม่ต้องดัน content
  const contentPaddingLeft = useMemo(() => {
    if (!isXlUp) return 0;
    return sidebarOpen ? SIDEBAR_OPEN_PX : SIDEBAR_COLLAPSED_PX;
  }, [isXlUp, sidebarOpen]);

  return (
    <div className="min-h-[100svh] w-full bg-[#0D1117] text-[#F0EEE9]">
      <SidebarVer2
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        header={
          <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        }
        // ✅ ส่ง BottomBar ตรง ๆ (ห้าม fixed ซ้อน)
        footer={
          showBottomBar ? (
            <BottomBar open={bottomOpen} onToggle={toggleBottom} />
          ) : null
        }
      >
        {/* ✅ Content wrapper: ใส่ gutter + กัน sidebar เฉพาะ desktop */}
        <div
          className="min-h-[calc(100svh-3.5rem)] w-full transition-[padding-left] duration-200 ease-out"
          style={{ paddingLeft: contentPaddingLeft }}
        >
          {/* ✅ padding ด้านในสำหรับทุกหน้า (ไม่ให้แน่นติดขอบ) */}
          <div className="w-full px-4 sm:px-6 lg:px-8">{children}</div>
        </div>
      </SidebarVer2>
    </div>
  );
}
