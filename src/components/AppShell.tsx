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

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isXlUp = useIsXlUp();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const [bottomOpen, setBottomOpen] = useState(true);
  const toggleBottom = useCallback(() => setBottomOpen((v) => !v), []);

  useEffect(() => {
    // ✅ จอเล็ก: เริ่มต้นให้ sidebar ปิด + bottom ปิด
    setSidebarOpen(isXlUp);
    setBottomOpen(isXlUp);
  }, [isXlUp]);

  // ✅ กฎสำคัญ: บนจอเล็ก ถ้า sidebar เปิดอยู่ → ซ่อน BottomBar ไม่ให้ทับ
  const showBottomBar = useMemo(() => {
    if (isXlUp) return true;
    return !sidebarOpen;
  }, [isXlUp, sidebarOpen]);

  return (
    <div className="h-dvh w-full bg-[#0D1117] text-[#F0EEE9] overflow-hidden">
      <SidebarVer2
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        header={
          <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        }
        footer={
          showBottomBar ? (
            <BottomBar open={bottomOpen} onToggle={toggleBottom} />
          ) : null
        }
      >
        {/* ✅ กันพื้นที่ให้ bottom bar เฉพาะตอนมันโชว์ */}
        <div
          className={[
            "px-4 py-4 md:px-6 md:py-5 xl:px-10 xl:py-6",
            showBottomBar ? "pb-14 xl:pb-0" : "pb-4",
          ].join(" ")}
        >
          {children}
        </div>
      </SidebarVer2>
    </div>
  );
}
