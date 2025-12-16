"use client";

import React, { useMemo, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  title?: string; // e.g. "JSON / SCHEMA"
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  className?: string;
  heightPx?: number; // default 560
};

export default function JsonSchemaPanel({
  title = "JSON / SCHEMA",
  value,
  onChange,
  readOnly = false,
  className = "",
  heightPx = 560,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ ใช้ scrollTop state เพื่อเลื่อนเลขบรรทัดตาม textarea แบบเป๊ะ
  const [scrollTop, setScrollTop] = useState(0);

  // ✅ copy status
  const [copied, setCopied] = useState(false);

  const lineNumbers = useMemo(() => {
    const count = Math.max(1, value.split("\n").length);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-slate-800/80",
        // ✅ ไม่มี dot background
        "bg-slate-950/70 backdrop-blur",
        "shadow-[0_20px_70px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {title}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={[
            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1",
            "text-xs text-slate-300",
            "hover:bg-slate-900/60 hover:text-slate-100",
            "ring-1 ring-inset ring-slate-800/70",
            "transition",
          ].join(" ")}
          title="Copy"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div
        className="relative flex w-full font-mono text-[13px] leading-6"
        style={{ height: heightPx }}
      >
        {/* Gutter (line numbers) */}
        <div className="w-12 shrink-0 border-r border-slate-800/80 bg-slate-950/70 text-slate-500 overflow-hidden">
          {/* ✅ translate ตาม scrollTop ของ textarea */}
          <div
            className="py-3 pb-12" // ✅ กันบรรทัดท้ายโดนตัด
            style={{ transform: `translateY(-${scrollTop}px)` }}
          >
            {lineNumbers.map((n) => (
              <div
                key={n}
                className="h-6 px-3 text-right select-none tabular-nums"
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)} // ✅ กัน undefined
          readOnly={readOnly}
          spellCheck={false}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          wrap="off" // ✅ สำคัญ: ปิด word-wrap → เลขบรรทัดตรงกับ \n
          className={[
            "flex-1 resize-none overflow-auto bg-transparent",
            "px-4 py-3 outline-none",
            "text-slate-100 placeholder:text-slate-600",
            "caret-sky-400 selection:bg-sky-500/20",
            // ✅ ปิด wrap ให้ชัวร์ + ให้เลื่อนแนวนอนแทน
            "whitespace-pre",
          ].join(" ")}
          style={{
            whiteSpace: "pre", // ✅ กันบาง browser
          }}
        />
      </div>
    </div>
  );
}
