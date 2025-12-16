"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileJson,
  FileText,
  AlertTriangle,
} from "lucide-react";

// ✅ ใช้ panel ที่ทำ line-number sync เรียบร้อยแล้ว
import JsonSchemaPanel from "./transform/JsonSchemaPanel";

type WorkspaceMode = "transform" | "sql";

type Props = {
  mode: WorkspaceMode;
  compact?: boolean;
};

const TRANSFORM_TEMPLATE = JSON.stringify(
  {
    notes: "Reference JSON/Schema for transform planning",
    schema: {
      dataset: "customer_360",
      fields: [
        { name: "customer_id", type: "string" },
        { name: "full_name", type: "string" },
        { name: "created_at", type: "timestamp" },
      ],
    },
    example_nodes: [
      { connection: "CRM", table: "customers" },
      { connection: "POS", table: "transactions" },
    ],
  },
  null,
  2
);

const SQL_TEMPLATE = `-- SQL Workspace (Reference / Draft)
-- วาง query หรือ schema เพื่อใช้เป็น reference หรือเตรียมสร้าง dataset

SELECT
  customer_id,
  full_name,
  created_at
FROM public.customers
WHERE created_at >= NOW() - INTERVAL '30 days';`;

function safeJsonParse(text: string):
  | { ok: true; value: any }
  | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Invalid JSON" };
  }
}

export function WorkspacePanel({ mode, compact = false }: Props) {
  const [drafts, setDrafts] = useState({
    transform: TRANSFORM_TEMPLATE,
    sql: SQL_TEMPLATE,
  });

  const text = drafts[mode];

  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "ok"; msg: string }
    | { type: "error"; msg: string }
  >({ type: "idle" });

  const title = mode === "transform" ? "Transform Workspace" : "SQL Workspace";
  const subtitle =
    mode === "transform"
      ? "วาง JSON / Schema เพื่อใช้เป็น reference หรือวาง draft สำหรับเตรียมสร้าง node"
      : "วาง query / schema เพื่อใช้เป็น reference หรือเตรียมสร้าง node";

  const languageHint = mode === "transform" ? "JSON / SCHEMA" : "SQL / SCHEMA";

  const icon = mode === "transform" ? (
    <FileJson className="h-4 w-4 text-violet-300" />
  ) : (
    <FileText className="h-4 w-4 text-sky-300" />
  );

  const heightPx = compact ? 300 : 560;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ type: "ok", msg: "Copied to clipboard" });
      setTimeout(() => setStatus({ type: "idle" }), 1200);
    } catch {
      setStatus({ type: "error", msg: "Copy failed" });
    }
  };

  const handleValidate = () => {
    setStatus({ type: "idle" });

    if (mode === "transform") {
      const parsed = safeJsonParse(text);
      if (!parsed.ok) {
        setStatus({ type: "error", msg: parsed.error });
        return;
      }
      setStatus({ type: "ok", msg: "Valid JSON" });
      return;
    }

    if (!text.trim()) {
      setStatus({ type: "error", msg: "Empty SQL" });
      return;
    }
    setStatus({ type: "ok", msg: "Saved as draft" });
  };

  const panelTitle = useMemo(() => languageHint, [languageHint]);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-300">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleValidate}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            {mode === "transform" ? "Validate" : "Save"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>
      </div>

      {/* Status line (เหมือนของเดิม) */}
      {status.type !== "idle" && (
        <div className="flex items-center justify-end">
          {status.type === "ok" ? (
            <span className="text-[11px] text-emerald-300">{status.msg}</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              {status.msg}
            </span>
          )}
        </div>
      )}

      {/* ✅ Editor panel (ใช้ JsonSchemaPanel ที่ line-number sync แล้ว) */}
      <JsonSchemaPanel
        title={panelTitle}
        value={text}
        onChange={(v) => setDrafts((prev) => ({ ...prev, [mode]: v }))}
        heightPx={heightPx}
        // className ใส่เพิ่มให้ใกล้เคียงธีมเดิม
        className="border border-slate-700 bg-[#020617]/70"
      />

      {/* Tips */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-[11px] text-slate-300">
        <p className="font-semibold text-slate-200">Tips</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Workspace นี้เป็น{" "}
            <span className="text-slate-200">reference / draft</span>
          </li>
          <li>Transform: วาง JSON schema, mapping plan</li>
          <li>SQL: วาง query draft หรือ notes</li>
        </ul>
      </div>
    </div>
  );
}
