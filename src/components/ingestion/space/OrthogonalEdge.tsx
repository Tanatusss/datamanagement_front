"use client";

import React, { useMemo, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import { Plus, Trash2 } from "lucide-react";

import type { EtlActionType } from "@/components/ingestion/space/EtlActionIcon";
import { EtlActionIcon } from "@/components/ingestion/space/EtlActionIcon";

type EtlEdgeData = {
  action?: EtlActionType;
  onPlus?: (edgeId: string) => void;
  onClearAction?: (edgeId: string) => void;
};

function orthogonalPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number
): { d: string; labelX: number; labelY: number; mx: number } {
  const mx = sx + (tx - sx) * 0.55;
  const d = `M ${sx},${sy} L ${mx},${sy} L ${mx},${ty} L ${tx},${ty}`;
  const labelX = mx;
  const labelY = (sy + ty) / 2;
  return { d, labelX, labelY, mx };
}

export function OrthogonalEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd, data } =
    props as EdgeProps & { data?: EtlEdgeData };

  const [hovered, setHovered] = useState(false);

  const { d, labelY, mx } = useMemo(
    () => orthogonalPath(sourceX, sourceY, targetX, targetY),
    [sourceX, sourceY, targetX, targetY]
  );

  const onPlus = () => data?.onPlus?.(id);
  const onClear = () => data?.onClearAction?.(id);

  // ====== positioning ======
  // ให้ icon/toolbar ไปอยู่ด้านข้าง segment กลาง และเลือกซ้าย/ขวาตามทิศทาง edge
  const side: 1 | -1 = useMemo(() => {
    return targetX >= sourceX ? 1 : -1;
  }, [sourceX, targetX]);

  const ICON_OFFSET_X = 0; // icon ออกจากเส้น (แกน X)
  const TOOLBAR_GAP_Y = 35; // toolbar อยู่ใต้ icon (แกน Y)
  const HOVER_EXTRA_X = 0; // hover แล้วดันออกจากเส้นเพิ่ม (แกน X)

  const iconX = mx + side * ICON_OFFSET_X;
  const iconY = labelY;

  // toolbar อยู่ "ข้างล่าง" icon
  const toolbarX =
    mx + side * (ICON_OFFSET_X + (hovered ? HOVER_EXTRA_X : 0));
  const toolbarY = iconY + TOOLBAR_GAP_Y;

  return (
    <>
      {/* เส้นจริง */}
      <BaseEdge path={d} style={style} markerEnd={markerEnd} />

      {/* hit-area โปร่งใส: ทำให้ hover ง่ายขึ้น */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={26}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      <EdgeLabelRenderer>
        {/* ETL icon */}
        {data?.action ? (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${iconX}px, ${iconY}px)`,
              zIndex: 40,
              pointerEvents: "none",
            }}
          >
            <EtlActionIcon action={data.action} />
          </div>
        ) : null}

        {/* toolbar: ใต้ icon */}
        <div
          className="react-flow__edge-label nodrag nopan"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${toolbarX}px, ${toolbarY}px)`,
            zIndex: 50,
            transition: "transform 120ms ease-out, opacity 120ms ease-out",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={[
              "flex items-center gap-1.5 rounded-full border border-slate-600/70",
              "bg-slate-900/90 px-2 py-1 shadow-lg backdrop-blur",
              hovered ? "opacity-100" : "opacity-0",
              "transition-opacity",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlus();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-100 hover:bg-slate-700"
              title="ETL Actions"
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-100 hover:bg-slate-700"
              title="Clear ETL Action"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
