"use client";

import { useCallback, useState } from "react";
import SidebarVer2 from "./SidebarVer.2";
import Topbar from "./TopBar";
import BottomBar from "./BottomBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const [bottomOpen, setBottomOpen] = useState(true);
  const toggleBottom = useCallback(() => setBottomOpen((v) => !v), []);

  return (
    <div className="h-screen w-full bg-[#0D1117] text-[#F0EEE9] overflow-hidden">
      <SidebarVer2
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        header={
          <Topbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
        }
        footer={
          <BottomBar
            open={bottomOpen}
            onToggle={toggleBottom}
          />
        }
      >
        {/* ✅ content เท่านั้นที่มี padding */}
        <div className="px-10 py-6">
          {children}
        </div>
      </SidebarVer2>
    </div>
  );
}
