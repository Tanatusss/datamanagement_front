// src/components/ingestion/space/WorkspaceNode.tsx
"use client";

import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

export type WorkspaceNodeData = {
  label: string;
  kind: "dataset" | "field" | "source" | "sql_draft";
  payload?: any;
};

// ✅ สำคัญ: Node type ของ ReactFlow
export type WorkspaceRFNode = Node<WorkspaceNodeData, "workspaceNode">;

export function WorkspaceNode(props: NodeProps<WorkspaceRFNode>) {
  const { data, targetPosition, sourcePosition, selected } = props;

  const tp: Position = targetPosition ?? Position.Left;
  const sp: Position = sourcePosition ?? Position.Right;

  return (
    <div
      className={[
        "relative rounded-2xl border bg-slate-900/90 px-4 py-3 shadow-lg backdrop-blur",
        selected ? "border-sky-400" : "border-slate-700",
      ].join(" ")}
    >
      {/* ✅ Handles ซ้าย/ขวา */}
      <Handle
        type="target"
        position={tp}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-sky-300 !bg-slate-900"
      />
      <Handle
        type="source"
        position={sp}
        className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-sky-300 !bg-slate-900"
      />

      <div className="space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-slate-400">
          {data.kind}
        </div>
        <div className="truncate text-[12px] font-semibold text-slate-50">
          {data.label}
        </div>
      </div>
    </div>
  );
}
