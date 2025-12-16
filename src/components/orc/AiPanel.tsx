// src/components/orc/AiPanel.tsx

import React from "react";
import { X } from "lucide-react";
import type { AiRow } from "./types";
import { uid } from "./types";

export type AiPanelProps = {
  aiRows: AiRow[];
  setAiRows: React.Dispatch<React.SetStateAction<AiRow[]>>;
};

export function AiPanel({ aiRows, setAiRows }: AiPanelProps) {
  if (!aiRows) {
    return (
      <div className="p-6 text-sm text-[#F0EEE9B3] bg-[#252526]">
        ต้องมีผลลัพธ์ OCR ก่อนจึงจะใช้ AI Generate ได้
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#252526] text-[#F0EEE9]">
      <table className="w-full text-sm">
        {/* HEADER */}
        <thead className="sticky top-0 bg-[#2D2D2D] text-[#F0EEE9B3] border-b border-[#3C3C3C]">
          <tr>
            <th className="px-3 py-2 w-8 text-left">#</th>
            <th className="px-3 py-2 w-40 text-left">หัวข้อ</th>
            <th className="px-3 py-2 text-left">ข้อความ</th>
            <th className="px-3 py-2 w-20 text-left">แก้ไข</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {aiRows.map((row, idx) => (
            <tr
              key={row.id}
              className="border-b border-[#3C3C3C] hover:bg-[#333333]"
            >
              <td className="px-3 py-2 align-top text-[#F0EEE9B3]">
                {idx + 1}
              </td>

              {/* LABEL */}
              <td className="px-3 py-2 align-top">
                <textarea
                  value={row.label}
                  onChange={(e) =>
                    setAiRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, label: e.target.value } : r
                      )
                    )
                  }
                  rows={1}
                  className="
                    w-full resize-y rounded-lg border border-[#3C3C3C]
                    bg-[#1E1E1E] px-2 py-1.5 text-sm font-medium
                    text-[#F0EEE9] outline-none
                    focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]
                  "
                />
              </td>

              {/* TEXT */}
              <td className="px-3 py-2 align-top">
                <textarea
                  value={row.text}
                  onChange={(e) =>
                    setAiRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, text: e.target.value } : r
                      )
                    )
                  }
                  rows={2}
                  className="
                    w-full rounded-lg border border-[#3C3C3C]
                    bg-[#1E1E1E] px-2 py-1.5 leading-6
                    text-[#F0EEE9] outline-none
                    focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]
                  "
                />
              </td>

              {/* DELETE BUTTON */}
              <td className="px-3 py-2 align-top">
                <button
                  className="
                    inline-flex items-center justify-center rounded-md
                    border border-[#3C3C3C] bg-[#1E1E1E]
                    px-2 py-1 text-xs text-[#F0EEE9B3]
                    hover:bg-[#333333]
                  "
                  onClick={() =>
                    setAiRows((prev) => prev.filter((r) => r.id !== row.id))
                  }
                  title="ลบแถวนี้"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD NEW BUTTON */}
      <div className="px-4 py-3">
        <button
          onClick={() =>
            setAiRows((prev) => [...prev, { id: uid(), label: "", text: "" }])
          }
          className="
            inline-flex items-center gap-2 rounded-full border border-dashed border-[#007ACC]
            bg-[#007ACC] px-3 py-2 text-sm text-[#F0EEE9]
            hover:bg-[#007ACC]/90 hover:text-white
          "
        >
          <span className="text-lg leading-none">＋</span>
          เพิ่ม
        </button>
      </div>
    </div>
  );
}
