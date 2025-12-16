"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ScanLine,
  Folder,
  Code2,
  BarChart3,
  ShieldCheck,
  Layers,
  UploadCloud,
  Brain,
  ShoppingBag,
  FlaskConical,
  BotMessageSquare,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Database,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// 👇 ingestion contexts + modal
import { useSpaces } from "@/components/ingestion/SpaceContext";
import { useConnections } from "@/components/ingestion/ConnectionsContext";
import { CreateSpaceModal } from "@/components/ingestion/space/CreateSpaceModal";

type Section = { key: string; label: string; icon: React.ComponentType<any> };
type Item = { label: string; href: string };

const allSubMenus: Record<string, Item[]> = {
  ocr: [
    { label: "Document Upload", href: "/ocr/upload" },
    { label: "OCR Results", href: "/ocr/results" },
    { label: "Settings", href: "/ocr/settings" },
  ],
  ingestion: [
    { label: "Space", href: "/ingestion/space" },
    { label: "Connection", href: "/ingestion/connection" },
  ],
  catalog: [
    { label: "Data Dictionary", href: "/catalog/dictionary" },
    { label: "Data Lineage", href: "/catalog/lineage" },
  ],
  apis: [
    { label: "API Explorer", href: "/apis/explorer" },
    { label: "API Keys", href: "/apis/keys" },
  ],
  visualization: [
    { label: "Dashboard", href: "/visualization/dashboard" },
    { label: "Reports", href: "/visualization/reports" },
  ],
  governance: [
    { label: "Policies", href: "/governance/policies" },
    { label: "Access Control", href: "/governance/access" },
  ],
  mdm: [
    { label: "Entity Management", href: "/mdm/entities" },
    { label: "Matching Rules", href: "/mdm/rules" },
    { label: "Merge Preview", href: "/mdm/merge-preview" },
  ],
  "mrm-ai": [
    { label: "Models", href: "/mrm-ai/models" },
    { label: "Training Logs", href: "/mrm-ai/logs" },
  ],
  marketplace: [
    { label: "Browse Datasets", href: "/marketplace/browse" },
    { label: "My Purchases", href: "/marketplace/purchases" },
  ],
  sandbox: [
    { label: "Playground", href: "/sandbox/playground" },
    { label: "Experiments", href: "/sandbox/experiments" },
  ],
  console: [
    { label: "Compute Resources", href: "/console/resources" },
    { label: "Job History", href: "/console/jobs" },
  ],
  admin: [
    { label: "Authentication", href: "/admin/authentication" },
    { label: "API Gateway", href: "/admin/apigateway" },
    { label: "Logging", href: "/admin/logging" },
    { label: "Configuration", href: "/admin/configuration" },
  ],
};

const sections: Section[] = [
  { key: "ocr", label: "OCR", icon: ScanLine },
  { key: "ingestion", label: "Ingestion", icon: UploadCloud },
  { key: "catalog", label: "Data Catalog", icon: Folder },
  { key: "apis", label: "APIs", icon: Code2 },
  { key: "visualization", label: "Visualization", icon: BarChart3 },
  { key: "governance", label: "Data Governance", icon: ShieldCheck },
  { key: "mdm", label: "MDM", icon: Layers },
  { key: "mrm-ai", label: "MRM & AI", icon: Brain },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { key: "sandbox", label: "AI Sandbox", icon: FlaskConical },
  { key: "console", label: "AI Console", icon: BotMessageSquare },
];

function subMenus(prefix: string): Item[] {
  return allSubMenus[prefix] ?? [];
}

export default function SidebarVer2({
  children,
  header,
  footer,
  sidebarOpen,
  onToggleSidebar,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // ---- Ingestion contexts ----
  const { spaces, createSpace, openSpaceDetail } = useSpaces();
  const {
    connections,
    openCreateModal: openConnectionCreateModal,
    openConnectionDetail,
  } = useConnections();

  const [spaceModalOpen, setSpaceModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ให้ sidebar เลือก section อัตโนมัติตาม URL ปัจจุบัน
  useEffect(() => {
    const p = pathname || "";
    if (p.startsWith("/ocr")) setActiveSection("ocr");
    else if (p.startsWith("/ingestion")) setActiveSection("ingestion");
    else if (p.startsWith("/catalog")) setActiveSection("catalog");
    else if (p.startsWith("/apis")) setActiveSection("apis");
    else if (p.startsWith("/visualization")) setActiveSection("visualization");
    else if (p.startsWith("/governance")) setActiveSection("governance");
    else if (p.startsWith("/mdm")) setActiveSection("mdm");
    else if (p.startsWith("/mrm-ai")) setActiveSection("mrm-ai");
    else if (p.startsWith("/marketplace")) setActiveSection("marketplace");
    else if (p.startsWith("/sandbox")) setActiveSection("sandbox");
    else if (p.startsWith("/console")) setActiveSection("console");
    else if (p.startsWith("/admin")) setActiveSection("admin");
    else setActiveSection(null);
  }, [pathname]);

  // sidebarOpen จาก AppShell = state ของ “sidebar ย่อย”
  const collapsed = !sidebarOpen;

  const isActiveRoute = (href: string) =>
    pathname === href || (pathname ? pathname.startsWith(`${href}/`) : false);

  const currentSection: Section | null =
    sections.find((s) => s.key === activeSection) ?? null;

  const currentItems = useMemo(() => {
    return activeSection && allSubMenus[activeSection]
      ? subMenus(activeSection)
      : [];
  }, [activeSection]);

  // สร้าง space แล้วปิด modal
  const handleCreateSpace = (name: string) => {
    createSpace(name);
    setSpaceModalOpen(false);
  };

  const handleLogin = () => {
    setUserMenuOpen(false);
    router.push("/login");
  };

  const handleRegister = () => {
    setUserMenuOpen(false);
    router.push("/register");
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    router.push("/login");
  };

  const tooltipClass =
    "pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-[9999] " +
    "rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-100 " +
    "bg-slate-900/95 backdrop-blur-md ring-1 ring-white/10 " +
    "shadow-[0_8px_24px_rgba(0,0,0,0.45)] " +
    "opacity-0 scale-95 transition-all duration-150 ease-out " +
    "group-hover:opacity-100 group-hover:scale-100";

  return (
    <div className="relative flex h-screen w-full bg-[#020617] text-[#F0EEE9]">
      {/* Activity bar (ซ้ายสุด) */}
      <aside className="flex h-full w-16 flex-col items-center justify-between bg-[#06070A] text-[#F0EEE9B3]">
        <div className="mt-3 flex flex-col items-center gap-4">
          {/* logo / home */}
          <button
            type="button"
            onClick={() => {
              router.push("/");
              // ถ้า sidebar ย่อยยังเปิดอยู่ ให้ปิดด้วย
              if (!collapsed) onToggleSidebar();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#020617] text-xs font-bold text-[#F0EEE9] shadow-sm hover:bg-[#111827]"
          >
            DMP
          </button>

          {/* section icons */}
          <div className="flex flex-col items-center gap-2">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const selected = activeSection === sec.key;

              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => {
                    setActiveSection((prev) =>
                      prev === sec.key && !collapsed ? null : sec.key
                    );
                    if (collapsed) onToggleSidebar();
                  }}
                  className={[
                    "group relative flex h-10 w-10 items-center justify-center rounded-xl",
                    "transition-all duration-150",
                    selected ? "bg-[#1f2937]" : "hover:bg-[#1f2937]/80",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute left-0 h-6 w-[3px] rounded-r-full bg-sky-500",
                      "transition-opacity duration-150",
                      selected ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                    ].join(" ")}
                  />
                  <Icon
                    className={[
                      "h-5 w-5",
                      selected
                        ? "text-[#F0EEE9]"
                        : "text-slate-400 group-hover:text-slate-100",
                    ].join(" ")}
                  />
                  <span className={tooltipClass}>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* bottom: user + admin */}
        <div className="mb-4 flex flex-col items-center gap-2">
          {/* user dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-[#020617] ring-1 ring-slate-800 hover:bg-[#111827] hover:ring-slate-600 transition"
            >
              <User className="h-5 w-5 text-slate-300 group-hover:text-[#F0EEE9]" />
            </button>

            {userMenuOpen && (
              <div className="absolute left-12 top-1/2 z-50 w-48 -translate-y-1/2 rounded-lg border border-slate-700 bg-[#0b1120] py-1 text-sm shadow-xl">
                {user ? (
                  <>
                    <div className="border-b border-slate-700 px-3 py-2 text-xs text-[#F0EEE9B3]">
                      Signed in as
                      <div className="truncate font-medium text-[#F0EEE9]">
                        {user.username}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-[#F0EEE9B3] transition hover:bg-[#111827] hover:text-[#F0EEE9]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-b border-slate-700 px-3 py-2 text-xs text-[#F0EEE9B3]">
                      Not signed in
                    </div>
                    <button
                      type="button"
                      onClick={handleLogin}
                      className="w-full px-3 py-2 text-left text-[#F0EEE9B3] transition hover:bg-[#111827] hover:text-[#F0EEE9]"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="w-full px-3 py-2 text-left text-[#F0EEE9B3] transition hover:bg-[#111827] hover:text-[#F0EEE9]"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* admin section */}
          <button
            type="button"
            onClick={() => {
              setActiveSection((prev) =>
                prev === "admin" && !collapsed ? null : "admin"
              );
              if (collapsed) onToggleSidebar();
            }}
            className={[
              "group relative flex h-10 w-10 items-center justify-center rounded-xl",
              "transition-all duration-150",
              activeSection === "admin" ? "bg-[#1f2937]" : "hover:bg-[#1f2937]/80",
            ].join(" ")}
          >
            <span
              className={[
                "absolute left-0 h-6 w-[3px] rounded-r-full bg-sky-500",
                "transition-opacity duration-150",
                activeSection === "admin" ? "opacity-100" : "opacity-0 group-hover:opacity-70",
              ].join(" ")}
            />
            <Settings
              className={[
                "h-5 w-5",
                activeSection === "admin"
                  ? "text-[#F0EEE9]"
                  : "text-slate-400 group-hover:text-slate-100",
              ].join(" ")}
            />
            <span className={tooltipClass}>ADMIN</span>
          </button>
        </div>
      </aside>

      {/* Submenu pane (ขวาของ activity bar) */}
      <aside
        className={[
          "relative h-full bg-[#050812] transition-all duration-200",
          collapsed ? "w-0 border-l border-[#12151e]" : "w-64 border-r border-[#12151e]",
        ].join(" ")}
      >
        {!collapsed && (
          <div className="relative h-full w-64">
            {/* Submenu header */}
            <div className="flex items-center justify-between border-b border-[#12151e] px-4 py-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F0EEE9B3]">
                  {activeSection ? "Section" : "Workspace"}
                </span>
                <span className="text-sm font-medium text-[#F0EEE9]">
                  {currentSection?.label ?? "Home"}
                </span>
              </div>

              {/* ปุ่มปิด sidebar ย่อย */}
              <button
                type="button"
                onClick={onToggleSidebar}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#03050b] text-[#F0EEE9B3] hover:bg-[#020617] hover:text-[#F0EEE9]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Submenu content */}
            <nav className="flex-1 space-y-0.5 p-2 text-sm">
              {activeSection === "ingestion" ? (
                <>
                  {/* Dashboard */}
                  <button
                    type="button"
                    onClick={() => router.push("/ingestion/dashboard")}
                    className={[
                      "flex w-full items-center justify-between rounded-md px-3 py-1.5",
                      "transition-colors duration-150",
                      isActiveRoute("/ingestion/dashboard")
                        ? "bg-[#141824] text-[#F0EEE9]"
                        : "text-[#F0EEE9B3] hover:bg-[#141824] hover:text-[#F0EEE9]",
                    ].join(" ")}
                  >
                    <span>Dashboard</span>
                  </button>

                  {/* Spaces header */}
                  <div className="mt-2 flex items-center justify-between px-1 text-xs text-[#F0EEE9B3]">
                    <button
                      type="button"
                      onClick={() => router.push("/ingestion/space")}
                      className={[
                        "rounded-md px-1 py-0.5 uppercase tracking-wide",
                        isActiveRoute("/ingestion/space")
                          ? "bg-[#141824] text-[#F0EEE9]"
                          : "hover:bg-[#141824] hover:text-[#F0EEE9]",
                      ].join(" ")}
                    >
                      Spaces
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpaceModalOpen(true)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-[#F0EEE9] hover:bg-[#1f2937]"
                      title="Create Space"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Space list */}
                  {spaces.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {spaces.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => openSpaceDetail(s.id)}
                          className={[
                            "w-full rounded-md px-3 py-1.5 text-left text-sm",
                            "transition-colors duration-150",
                            pathname?.startsWith("/ingestion/space") &&
                              pathname.includes(encodeURIComponent(s.name))
                              ? "bg-[#141824] text-[#F0EEE9]"
                              : "text-[#F0EEE9B3] hover:bg-[#141824] hover:text-[#F0EEE9]",
                          ].join(" ")}
                        >
                          • {s.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 px-3 text-xs text-[#6b7280]">
                      No spaces yet
                    </p>
                  )}

                  {/* Connections header */}
                  <div className="mt-4 flex items-center justify-between px-1 text-xs text-[#F0EEE9B3]">
                    <button
                      type="button"
                      onClick={() => router.push("/ingestion/connection")}
                      className={[
                        "rounded-md px-1 py-0.5 uppercase tracking-wide",
                        isActiveRoute("/ingestion/connection")
                          ? "bg-[#141824] text-[#F0EEE9]"
                          : "hover:bg-[#141824] hover:text-[#F0EEE9]",
                      ].join(" ")}
                    >
                      Connections
                    </button>

                    <button
                      type="button"
                      onClick={openConnectionCreateModal}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-[#F0EEE9] hover:bg-[#1f2937]"
                      title="Create Connection"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Connection list */}
                  {connections.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {connections.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => openConnectionDetail(c.id)}
                          className={[
                            "w-full rounded-md px-3 py-1.5 text-left text-sm",
                            "transition-colors duration-150",
                            pathname?.startsWith("/ingestion/connection") &&
                              pathname.includes(encodeURIComponent(c.id))
                              ? "bg-[#141824] text-[#F0EEE9]"
                              : "text-[#F0EEE9B3] hover:bg-[#141824] hover:text-[#F0EEE9]",
                          ].join(" ")}
                        >
                          • {c.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 px-3 text-xs text-[#6b7280]">
                      No connections yet
                    </p>
                  )}
                </>
              ) : activeSection ? (
                <>
                  {currentItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "flex items-center rounded-md px-3 py-1.5",
                        "transition-colors duration-150",
                        isActiveRoute(item.href)
                          ? "bg-[#141824] text-[#F0EEE9]"
                          : "text-[#F0EEE9B3] hover:bg-[#141824] hover:text-[#F0EEE9]",
                      ].join(" ")}
                    >
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}

                  {currentItems.length === 0 && (
                    <div className="mt-4 px-3 text-xs text-[#F0EEE9B3]">
                      No submenu
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 px-3 text-xs text-[#6b7280]">
                  เลือกเมนูด้านซ้าย (OCR, Ingestion, ฯลฯ) เพื่อดูรายละเอียด
                </div>
              )}
            </nav>
          </div>
        )}
      </aside>

      {/* ปุ่มเปิด sidebar ย่อย */}
      {collapsed && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="absolute left-12 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[#F0EEE9] shadow-lg hover:bg-[#1A1F2E] transition"
          title="Open sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* ✅ MAIN: header (Topbar) + content scroll + footer (BottomPanel) */}
      <main className="flex min-h-0 flex-1 flex-col bg-[#0D1117] text-[#F0EEE9]">
        {/* ===== TOPBAR (ไม่ scroll) ===== */}
        {header && (
          <div className="shrink-0 border-b border-slate-800">
            {header}
          </div>
        )}

        {/* ===== CONTENT (scroll เฉพาะตรงนี้) ===== */}
        <div className="min-h-0 flex-1 overflow-auto">
          {children}
        </div>

        {/* ===== BOTTOM BAR (ติดล่าง + ชิด sidebar ย่อย) ===== */}
        {footer && (
  <div className="shrink-0 border-t border-slate-800 bg-[#050812]">
    {footer}
  </div>
)}
      </main>


      {/* Create Space modal */}
      <CreateSpaceModal
        open={spaceModalOpen}
        onClose={() => setSpaceModalOpen(false)}
        onCreate={handleCreateSpace}
      />
    </div>
  );
}
