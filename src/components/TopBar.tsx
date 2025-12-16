// src/components/Topbar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

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

/** ✅ หน้าในเว็บที่ค้นหาได้ (ปรับเพิ่ม/ลดได้ตามต้องการ) */
type RouteItem = {
  label: string;
  href: string;
  keywords?: string[];
  section?: string;
};

const ROUTES: RouteItem[] = [
  { label: "Home", href: "/", keywords: ["dashboard", "main"] },

  { label: "OCR · Document Upload", href: "/ocr/upload", keywords: ["upload", "scan"] },
  { label: "OCR · Results", href: "/ocr/results", keywords: ["result", "history"] },
  { label: "OCR · Settings", href: "/ocr/settings", keywords: ["config"] },

  { label: "Ingestion · Dashboard", href: "/ingestion/dashboard", keywords: ["runs"] },
  { label: "Ingestion · Spaces", href: "/ingestion/space", keywords: ["space", "workspace"] },
  { label: "Ingestion · Connections", href: "/ingestion/connection", keywords: ["db", "source"] },

  { label: "Catalog · Data Dictionary", href: "/catalog/dictionary", keywords: ["metadata"] },
  { label: "Catalog · Data Lineage", href: "/catalog/lineage", keywords: ["flow", "graph"] },

  { label: "APIs · Explorer", href: "/apis/explorer", keywords: ["swagger", "openapi"] },
  { label: "APIs · Keys", href: "/apis/keys", keywords: ["token", "auth"] },

  { label: "Visualization · Dashboard", href: "/visualization/dashboard", keywords: ["chart"] },
  { label: "Visualization · Reports", href: "/visualization/reports", keywords: ["report"] },

  { label: "Governance · Policies", href: "/governance/policies", keywords: ["policy"] },
  { label: "Governance · Access Control", href: "/governance/access", keywords: ["permission", "role"] },

  { label: "MDM · Entity Management", href: "/mdm/entities", keywords: ["entity"] },
  { label: "MDM · Matching Rules", href: "/mdm/rules", keywords: ["rule"] },
  { label: "MDM · Merge Preview", href: "/mdm/merge-preview", keywords: ["merge"] },

  { label: "MRM & AI · Models", href: "/mrm-ai/models", keywords: ["model"] },
  { label: "MRM & AI · Training Logs", href: "/mrm-ai/logs", keywords: ["log"] },

  { label: "Marketplace · Browse", href: "/marketplace/browse", keywords: ["dataset"] },
  { label: "Marketplace · My Purchases", href: "/marketplace/purchases", keywords: ["orders"] },

  { label: "AI Sandbox · Playground", href: "/sandbox/playground", keywords: ["test"] },
  { label: "AI Sandbox · Experiments", href: "/sandbox/experiments", keywords: ["experiment"] },

  { label: "AI Console · Compute Resources", href: "/console/resources", keywords: ["gpu", "compute"] },
  { label: "AI Console · Job History", href: "/console/jobs", keywords: ["jobs"] },

  { label: "Admin · Authentication", href: "/admin/authentication", keywords: ["auth"] },
  { label: "Admin · API Gateway", href: "/admin/apigateway", keywords: ["gateway"] },
  { label: "Admin · Logging", href: "/admin/logging", keywords: ["logs"] },
  { label: "Admin · Configuration", href: "/admin/configuration", keywords: ["config"] },
];

function norm(s: string) {
  return s.toLowerCase().trim();
}

export default function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [tabs, setTabs] = useState<OpenedTab[]>([]);

  // ✅ command/search state
  const [q, setQ] = useState("");
  const [openSuggest, setOpenSuggest] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // เปิดแท็บใหม่ทุกครั้งที่เปลี่ยน path (ยกเว้น /login /register)
  useEffect(() => {
    if (!pathname) return;

    if (IGNORE_TABS_PREFIX.some((p) => pathname.startsWith(p))) return;

    setTabs((prev) => {
      if (prev.some((t) => t.path === pathname)) return prev;
      const label = pathToLabel(pathname);
      return [...prev, { path: pathname, label }];
    });
  }, [pathname]);

  const handleClickTab = (path: string) => {
    if (path === pathname) return;
    router.push(path);
  };

  const handleCloseTab = (pathToClose: string) => {
    let nextPathToGo: string | null = null;

    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.path === pathToClose);
      const nextTabs = prev.filter((t) => t.path !== pathToClose);

      if (pathname === pathToClose) {
        const fallback =
          nextTabs[idx - 1] ?? nextTabs[idx] ?? { path: "/", label: "Home" };
        nextPathToGo = fallback.path;
      }

      return nextTabs;
    });

    if (nextPathToGo) router.push(nextPathToGo);
  };

  const showTabs = useMemo(() => tabs, [tabs]);

  const results = useMemo(() => {
    const s = norm(q);
    if (!s) return ROUTES.slice(0, 10);

    const scored = ROUTES.map((r) => {
      const hay = norm([r.label, r.href, ...(r.keywords ?? [])].join(" "));
      // simple score: contains / startsWith
      let score = 0;
      if (hay.includes(s)) score += 5;
      if (norm(r.label).startsWith(s)) score += 3;
      if (norm(r.href).includes(s)) score += 2;
      return { r, score };
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r);

    return scored.slice(0, 10);
  }, [q]);

  const goTo = (href: string) => {
    setOpenSuggest(false);
    setQ("");
    setActiveIdx(0);
    router.push(href);
  };

  // keyboard shortcuts: Ctrl/Cmd+K or "/" to focus
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !(e.ctrlKey || e.metaKey || e.altKey);

      if (isCmdK || isSlash) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpenSuggest(true);
        return;
      }

      if (!openSuggest) return;

      if (e.key === "Escape") {
        setOpenSuggest(false);
        setQ("");
        setActiveIdx(0);
        inputRef.current?.blur();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((v) => Math.min(v + 1, Math.max(results.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((v) => Math.max(v - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const pick = results[activeIdx];
        if (pick) goTo(pick.href);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSuggest, results, activeIdx]);

  // click outside to close
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !inputRef.current?.contains(t)) {
        setOpenSuggest(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header className="w-full border-b border-slate-800 bg-[#06070A] backdrop-blur">
      {/* แถวบน */}
      <div className="flex items-center justify-center gap-3 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-[#020617] text-slate-200 hover:bg-[#111827] hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => router.forward()}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-[#020617] text-slate-200 hover:bg-[#111827] hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ✅ Search / Command input */}
        <div className="relative ml-4 flex flex-1 max-w-xl">
          <div className="flex w-full items-center gap-2 rounded-md border border-slate-700 bg-[#020617] px-3 py-1.5 text-xs text-slate-400 hover:border-sky-500/70 hover:bg-[#02091f]">
            <Search className="h-3.5 w-3.5" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpenSuggest(true);
                setActiveIdx(0);
              }}
              onFocus={() => setOpenSuggest(true)}
              placeholder="Search pages… (Ctrl/Cmd+K)"
              className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setActiveIdx(0);
                  inputRef.current?.focus();
                  setOpenSuggest(true);
                }}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-700/40"
                title="Clear"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* ✅ Suggest dropdown */}
          {openSuggest && (
            <div
              ref={popRef}
              className="absolute left-0 top-[42px] z-50 w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120] shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
            >
              <div className="px-3 py-2 text-[11px] text-slate-500 border-b border-slate-800">
                {q ? `Results for “${q}”` : "Quick navigation"}
              </div>

              <div className="max-h-[320px] overflow-auto py-1">
                {results.length > 0 ? (
                  results.map((r, idx) => {
                    const active = idx === activeIdx;
                    return (
                      <button
                        key={r.href}
                        type="button"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => goTo(r.href)}
                        className={[
                          "w-full px-3 py-2 text-left flex items-center justify-between gap-3",
                          active
                            ? "bg-sky-500/10 text-[#F0EEE9]"
                            : "text-[#F0EEE9B3] hover:bg-[#141824] hover:text-[#F0EEE9]",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-medium">
                            {r.label}
                          </div>
                          <div className="truncate text-[11px] text-slate-500">
                            {r.href}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600">
                          Enter
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-3 text-xs text-slate-500">
                    No matches
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-3 py-2 text-[11px] text-slate-600 border-t border-slate-800">
                <span>↑↓ to navigate · Enter to open</span>
                <span>Esc to close</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-12" />
      </div>

      {/* แถวล่าง: tabs */}
      <div className="flex items-end border-t border-slate-900 px-1 pt-1">
        <div className="flex max-w-full flex-1 items-end overflow-x-auto">
          {showTabs.map((tab) => {
            const active = tab.path === pathname;
            return (
              <div
                key={tab.path}
                onClick={() => handleClickTab(tab.path)}
                className={[
                  "group flex items-center px-3 py-1.5 text-xs rounded-t-md border border-b-0 mr-[1px]",
                  "cursor-pointer select-none",
                  active
                    ? "bg-[#0b1120] text-[#F0EEE9] border-slate-700"
                    : "bg-[#020617] text-slate-400 border-transparent hover:bg-[#050816] hover:text-slate-100",
                ].join(" ")}
              >
                <span className="truncate max-w-[160px]">{tab.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.path);
                  }}
                  className={[
                    "ml-2 flex h-4 w-4 items-center justify-center rounded hover:bg-slate-600/40",
                    active
                      ? "text-slate-300"
                      : "text-slate-500 group-hover:text-slate-300",
                  ].join(" ")}
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
