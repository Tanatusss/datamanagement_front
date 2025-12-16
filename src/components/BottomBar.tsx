"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronDown } from "lucide-react";

type BottomTab = "terminal" | "output" | "prompt";

type Props = {
  open: boolean;
  onToggle: () => void;
};

const TABS: { key: BottomTab; label: string }[] = [
  { key: "terminal", label: "TERMINAL" },
  { key: "output", label: "OUTPUT" },
  { key: "prompt", label: "PROMPT" },
];

export default function BottomPanel({ open, onToggle }: Props) {
  const [tab, setTab] = useState<BottomTab>("terminal");

  // VSCode-like height
  const [height, setHeight] = useState<number>(260);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHRef = useRef(260);

  // demo buffers (ต่อจริงทีหลังได้)
  const terminalLines = useMemo(
    () => [
      "✓ Compiled in 100ms",
      "✓ Compiled in 152ms",
      "GET /ingestion/space/test?left=sql 200 in 92ms (compile: 74ms, render: 18ms)",
      "GET /ingestion/space/test?left=transform 200 in 23ms (compile: 6ms, render: 18ms)",
    ],
    []
  );

  const outputLines = useMemo(
    () => ["[build] Done", "[dev] Fast Refresh ready", "[api] OK"],
    []
  );

  // drag handle
  const onMouseDownHandle = (e: React.MouseEvent) => {
    draggingRef.current = true;
    startYRef.current = e.clientY;
    startHRef.current = height;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const dy = startYRef.current - e.clientY; // ดึงขึ้น = สูงขึ้น
      const next = Math.min(520, Math.max(140, startHRef.current + dy));
      setHeight(next);
    };

    const onUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [height]);

  // ⌘J / Ctrl+J toggle (เหมือน VSCode)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "j") {
        e.preventDefault();
        onToggle();
      }
      if (e.key === "Escape" && open) onToggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onToggle]);

  return (
    <div
      className={[
        "relative w-full",
        "bg-[#06070A]",
        "border-t border-slate-800",
      ].join(" ")}
      style={{ height: open ? height : 40 }}
    >
      {/* Drag handle */}
      {open && (
        <div
          onMouseDown={onMouseDownHandle}
          className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize"
          title="Drag to resize"
        >
          <div className="mx-auto mt-0.5 h-1 w-20 rounded-full bg-slate-500/60" />
        </div>
      )}

      {/* VSCode-like tab bar */}
      <div className="flex h-10 items-center justify-between px-2">
        <div className="flex items-center gap-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  if (!open) onToggle();
                  setTab(t.key);
                }}
                className={[
                  "relative px-3 py-2 text-[12px] font-semibold",
                  active
                    ? "text-slate-100"
                    : "text-slate-400 hover:text-slate-200",
                ].join(" ")}
              >
                {t.label}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-sky-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
            title={open ? "Collapse" : "Open"}
          >
            <ChevronDown
              className={[
                "h-4 w-4 transition-transform",
                open ? "" : "rotate-180",
              ].join(" ")}
            />
          </button>

          <button
            type="button"
            onClick={() => open && onToggle()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="h-[calc(100%-40px)] overflow-hidden px-2 pb-2">
          <div className="h-full rounded-lg border border-slate-800 bg-[#0b1120]">
            {tab === "terminal" && (
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-6 text-slate-200">
                  {terminalLines.map((l, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {l}
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 p-2">
                  <input
                    className="w-full rounded-md bg-[#020617] px-3 py-2 font-mono text-[12px] text-slate-100 outline-none ring-1 ring-slate-800 focus:ring-sky-500/40"
                    placeholder="Type a command…"
                  />
                </div>
              </div>
            )}

            {tab === "output" && (
              <div className="h-full overflow-auto p-3 font-mono text-[12px] leading-6 text-slate-200">
                {outputLines.map((l, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {l}
                  </div>
                ))}
              </div>
            )}

            {tab === "prompt" && (
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-auto p-3 text-sm text-slate-200">
                  <div className="rounded-md border border-slate-800 bg-[#020617]/70 p-3">
                    <div className="text-xs font-semibold text-slate-100">
                      Prompt
                    </div>
                    <div className="mt-2 text-xs text-slate-300">
                      ช่องนี้ไว้ต่อ AI/Workflow ภายหลัง (ตอนนี้เป็น UI)
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-800 p-2">
                  <textarea
                    className="h-20 w-full resize-none rounded-md bg-[#020617] px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-800 focus:ring-sky-500/40"
                    placeholder="Ask or run a prompt…"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
