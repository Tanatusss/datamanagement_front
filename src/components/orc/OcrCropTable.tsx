// src/components/orc/OcrCropTable.tsx
"use client";

import { Edit3, X } from "lucide-react";
import React from "react";
import type { OcrLine } from "./types";

type OcrCropTableProps = {
  visibleLines: OcrLine[];
  editingLineId: string | null;
  highlightedLineId: string | null;
  onChangeEditingLineId: (id: string | null) => void;
  onHighlightLine: (id: string) => void;
  onUpdateLine: (id: string, patch: Partial<OcrLine>) => void;
  onRemoveLine: (id: string, source?: OcrLine["source"]) => void;
};

export function OcrCropTable({
  visibleLines,
  editingLineId,
  highlightedLineId,
  onChangeEditingLineId,
  onHighlightLine,
  onUpdateLine,
  onRemoveLine,
}: OcrCropTableProps) {
  if (!visibleLines.length) {
    return (
      <div className="p-6 text-sm text-slate-500">
        ยังไม่มีส่วนที่ครอป — ลองลากกรอบบนรูปด้านซ้ายเพื่อเพิ่มบรรทัดใหม่
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 bg-slate-50 text-slate-500 border-b border-slate-200">
        <tr>
          <th className="px-3 py-2 w-8 text-left">#</th>
          <th className="px-3 py-2 w-40 text-left">หัวข้อ</th>
          <th className="px-3 py-2 text-left">ข้อความ</th>
          <th className="px-3 py-2 w-24 text-left">แก้ไข</th>
        </tr>
      </thead>
      <tbody>
        {visibleLines.map((line, idx) => {
          const isEditing = editingLineId === line.id;
          const isActive = highlightedLineId === line.id;

          return (
            <tr
              key={line.id}
              onClick={() => onHighlightLine(line.id)}
              className={`border-b border-slate-100 ${
                isActive ? "bg-[#E5F6FF]" : "hover:bg-slate-50/60"
              } cursor-pointer`}
            >
              <td className="px-3 py-2 align-top text-slate-500">
                {idx + 1}
              </td>
              <td className="px-3 py-2 align-top">
                {isEditing ? (
                  <textarea
                    value={line.label}
                    onChange={(e) =>
                      onUpdateLine(line.id, { label: e.target.value })
                    }
                    rows={1}
                    className="w-full resize-y rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 outline-none focus:border-[#00A6DF] focus:ring-2 focus:ring-[#D4F0FF]"
                  />
                ) : (
                  <div className="font-medium text-slate-800">
                    {line.label || (
                      <span className="text-slate-400">ยังไม่มีหัวข้อ</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 align-top">
                {isEditing ? (
                  <textarea
                    value={line.text}
                    onChange={(e) =>
                      onUpdateLine(line.id, { text: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 leading-6 outline-none focus:border-[#00A6DF] focus:ring-2 focus:ring-[#D4F0FF]"
                  />
                ) : (
                  <div className="min-h-9 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-slate-800">
                    {line.text || (
                      <span className="text-slate-400">ยังไม่มีข้อความ</span>
                    )}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 align-top">
                <div className="flex items-center gap-1">
                  <button
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeEditingLineId(
                        isEditing ? null : line.id
                      );
                    }}
                    title="แก้ไขหัวข้อและข้อความ"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveLine(line.id, line.source);
                    }}
                    title={
                      line.source === "crop"
                        ? "ลบบรรทัดที่ครอปนี้"
                        : "ล้างหัวข้อและข้อความบรรทัดนี้"
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
