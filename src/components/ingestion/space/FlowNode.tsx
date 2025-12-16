"use client";

import React from "react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Database, X as XIcon } from "lucide-react";
import { DbType } from "../dbCatalog";

export type FlowNodeData = {
  kind?: "dataset" | "field" | "source" | "sql_draft";
  payload?: any;
  connectionId?: string;
  connectionName: string;
  schema: string;
  table: string;
  dbIcon?: string;
  dbType?: DbType;
  onOpen?: () => void;
  onDelete?: () => void;
};

// ✅ ReactFlow node type
export type FlowNodeType = Node<FlowNodeData, "dbNode">;

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { selected, data, isConnectable } = props;
  const d = data;

  const hasDbIcon = !!d.dbIcon;
  const dbLabel = d.dbType
    ? `${d.dbType} connection`
    : d.connectionName || "Connection";

  return (
    <div
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        d.onOpen?.(); // ✅ เรียกจาก FlowCanvas
      }}
      className={[
        "group relative",
        "min-w-[230px] max-w-[280px]",
        "rounded-3xl border bg-slate-900",
        "px-5 py-4 text-xs text-slate-100",
        "border-slate-600 shadow-[0_10px_25px_rgba(0,0,0,0.35)]",
        "backdrop-blur-md",
        "transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.45)]",
        selected ? "ring-2 ring-sky-400/80" : "",
      ].join(" ")}
    >
      {/* ❌ ปุ่มลบ — กันไม่ให้ไป drag / connect */}
      {d.onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            d.onDelete?.();
          }}
          className="
            nodrag nopan
            absolute top-2 right-2
            flex h-5 w-5 items-center justify-center
            rounded-full bg-rose-600 text-white
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150 shadow-lg
          "
          title="Delete node"
        >
          <XIcon className="h-3 w-3" strokeWidth={3} />
        </button>
      )}

      {/* 🎯 target handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="
          !h-3 !w-3 rounded-full
          !bg-slate-300
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          cursor-crosshair
        "
      />

      {/* 🎯 source handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="
          !h-3 !w-3 rounded-full
          !bg-sky-500
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          cursor-crosshair
        "
      />

      {/* content */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">
          <div
            className="
              flex h-14 w-14 items-center justify-center
              rounded-full
              bg-gradient-to-br from-slate-700 to-slate-800
              text-white
              ring-4 ring-slate-600/40
              shadow-inner
            "
            title={dbLabel}
          >
            {hasDbIcon ? (
              <img
                src={d.dbIcon}
                alt={dbLabel}
                className="h-12 w-12 object-contain"
                draggable={false}
              />
            ) : (
              <Database className="h-6 w-6" />
            )}
          </div>
        </div>

        <p className="mt-1 max-w-full truncate font-mono text-[11px] text-slate-400">
          Schema: {d.schema || "public"}
        </p>
        <p className="mt-0.5 max-w-full truncate font-mono text-xs font-semibold text-white">
          Table: {d.table || "(table)"}
        </p>
      </div>
    </div>
  );
}
