"use client";

import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Database, X as XIcon, AlertTriangle } from "lucide-react";
import { DbType } from "../dbCatalog";

export type FlowNodeData = {
  kind?: "dataset" | "field" | "source" | "destination" | "sql_draft";
  payload?: any;
  connectionId?: string;
  connectionName?: string;
  schema?: string;
  table?: string;
  dbIcon?: string;
  dbType?: DbType;
  onOpen?: () => void;
  onDelete?: () => void;
};


export type FlowNodeType = Node<FlowNodeData, "dbNode">;

export function FlowNode(props: NodeProps<FlowNodeType>) {
  const { selected, data, isConnectable } = props;
  const d = data;

  const hasDbIcon = !!d.dbIcon;

  // ✅ configured = มีทั้ง connectionId + schema + table (คุณจะปรับเงื่อนไขได้)
  const isConfigured = !!(d.connectionId && d.schema && d.table);

  const dbLabel = d.dbType ? `${d.dbType}` : d.connectionName || "Connection";

  return (
    <div
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        d.onOpen?.(); // ✅ เปิด modal จาก FlowCanvas
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
      {/* ❌ delete */}
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
        {/* icon */}
        <div className="relative mb-2">
          <div
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full",
              "bg-gradient-to-br from-slate-700 to-slate-800 text-white",
              "ring-4 ring-slate-600/40 shadow-inner",
              !isConfigured ? "ring-rose-500/35" : "",
            ].join(" ")}
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

          {/* ✅ red warning badge when not configured */}
          {!isConfigured && (
            <div
              className="
                absolute -right-1 -top-1
                flex h-6 w-6 items-center justify-center
                rounded-full bg-rose-600 text-white
                ring-2 ring-slate-900
              "
              title="Not configured"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* ✅ state: not configured */}
        {!isConfigured ? (
          <>
            <p className="text-[12px] font-semibold text-slate-100">
              Not configured
            </p>
            <p className="mt-0.5 text-[11px] text-rose-300">
              Double-click to configure
            </p>
          </>
        ) : (
          /* ✅ state: configured => show only table name (as requested) */
          <>
            <p className="mt-0.5 max-w-full truncate font-mono text-xs font-semibold text-white">
              {d.table}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
