"use client";

import { X } from "lucide-react";
import type { ConnectionItem } from "../ConnectionsContext"; // หรือ path ให้ตรงกับโปรเจกต์จริง

type Props = {
  open: boolean;
  onClose: () => void;
  connection: ConnectionItem | null;
};

export function ConnectionDetailModal({ open, onClose, connection }: Props) {
  if (!open || !connection) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm">
      <div
        className="
          relative w-full max-w-lg rounded-3xl
          bg-[#111827] border border-[#1F2937]
          px-8 py-7 shadow-[0_10px_40px_rgba(0,0,0,0.65)]
        "
      >
        {/* ปุ่ม X มุมขวาบน */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-6 text-xl font-semibold text-[#F0EEE9]">
          Connection Detail
        </h2>

        <dl className="space-y-3 text-sm">
          <Row label="Connection name:">
            <span className="font-medium text-[#E5E7EB]">
              {connection.name}
            </span>
          </Row>

          <Row label="Type:">
            <span className="font-medium text-[#E5E7EB]">
              {connection.type}
            </span>
          </Row>

          <Row label="Category:">
            <span className="font-medium text-[#E5E7EB]">
              {connection.category}
            </span>
          </Row>

          <Row label="Slug:">
            <span className="font-mono text-xs text-[#cbd5f5] bg-[#020617] px-2 py-0.5 rounded-md border border-slate-700/60">
              {connection.slug}
            </span>
          </Row>

          <Row label="Last viewed:">
            <span className="font-medium text-[#E5E7EB]">
              {connection.lastViewedAt
                ? new Date(connection.lastViewedAt).toLocaleString()
                : "N/A"}
            </span>
          </Row>
        </dl>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full px-6 py-2 text-sm font-medium
              bg-sky-500 text-[#0b1120]
              hover:bg-sky-400
              transition
              shadow-[0_4px_14px_rgba(56,189,248,0.35)]
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** แยกเป็นคอมโพเนนต์เล็ก ๆ ให้โค้ดอ่านง่ายขึ้น */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-xs text-[#9CA3AF]">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
