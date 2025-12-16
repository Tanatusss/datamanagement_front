// src/components/ingestion/space/space-detail/LeftWorkspacePanel.tsx
"use client";

import React from "react";
import { X, Wand2, Code2 } from "lucide-react";
import type { LeftPanel } from "./flowTypes";
import { WorkspacePanel, type NodeSpec } from "@/components/ingestion/space/WorkspacePanel";

type Props = {
  leftPanel: Exclude<LeftPanel, "none">; // transform | sql
  onClose: () => void;

  /** ✅ เพิ่ม: ส่ง nodes ที่ generate ไปให้ FlowCanvas */
  onGenerateNodes?: (nodes: NodeSpec[], meta: { mode: "transform" | "sql"; raw: string }) => void;
};

export function LeftWorkspacePanel({ leftPanel, onClose, onGenerateNodes }: Props) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-inner shadow-black/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {leftPanel === "transform" ? (
            <>
              <Wand2 className="h-4 w-4 text-violet-300" />
              <h2 className="text-sm font-semibold text-slate-100">
                Transform Workspace
              </h2>
            </>
          ) : (
            <>
              <Code2 className="h-4 w-4 text-sky-300" />
              <h2 className="text-sm font-semibold text-slate-100">
                SQL Workspace
              </h2>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/60 text-slate-200 hover:bg-slate-600"
          title="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <WorkspacePanel
          mode={leftPanel}
          compact
          onGenerateNodes={onGenerateNodes}
        />
      </div>
    </div>
  );
}
