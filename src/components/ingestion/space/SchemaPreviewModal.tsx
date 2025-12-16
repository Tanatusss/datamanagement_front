// src/components/ingestion/space/SchemaPreviewModal.tsx
"use client";

import { X } from "lucide-react";

type SchemaPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  connectionName?: string;
  schema: string;
  table: string;
};

// mock data ให้เหมือนหน้า NodeDetailPage
type Row = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
};

const PREVIEW_ROWS: Row[] = [
  {
    id: 1,
    date: "2025-01-02",
    description: "ร้านสะดวกซื้อ 7-Eleven สาขาลาดพร้าว",
    category: "Expense",
    amount: -85.5,
    balance: 5000.0,
  },
  {
    id: 2,
    date: "2025-01-02",
    description: "โอนเงินจากนาย สมชาย ใจดี",
    category: "Income",
    amount: 2000.0,
    balance: 7000.0,
  },
  {
    id: 3,
    date: "2025-01-03",
    description: "KFC เดลิเวอรี",
    category: "Expense",
    amount: -189.0,
    balance: 6811.0,
  },
  {
    id: 4,
    date: "2025-01-04",
    description: "รับเงินเดือน บริษัท XYZ",
    category: "Income",
    amount: 25000.0,
    balance: 31811.0,
  },
  {
    id: 5,
    date: "2025-01-05",
    description: "เติมน้ำมัน ปตท.",
    category: "Expense",
    amount: -850.0,
    balance: 30961.0,
  },
  {
    id: 6,
    date: "2025-01-06",
    description: "ค่าอินเทอร์เน็ต True",
    category: "Expense",
    amount: -599.0,
    balance: 30362.0,
  },
  {
    id: 7,
    date: "2025-01-07",
    description: "AIS เติมเงิน",
    category: "Expense",
    amount: -100.0,
    balance: 30262.0,
  },
  {
    id: 8,
    date: "2025-01-08",
    description: "โอนเงินให้ นาย ธนโชค มั่งมี",
    category: "Transfer",
    amount: -3000.0,
    balance: 27262.0,
  },
  {
    id: 9,
    date: "2025-01-09",
    description: "SCB พร้อมเพย์ รับจาก บจก. ABC",
    category: "Income",
    amount: 1500.0,
    balance: 28762.0,
  },
  {
    id: 10,
    date: "2025-01-10",
    description: "GrabFood - ชานมไข่มุก",
    category: "Expense",
    amount: -95.0,
    balance: 28667.0,
  },
];

const PREVIEW_COLUMNS = [
  { id: "id", label: "id" },
  { id: "date", label: "date" },
  { id: "description", label: "description" },
  { id: "category", label: "category" },
  { id: "amount", label: "amount" },
  { id: "balance", label: "balance" },
] as const;

type ColumnId = (typeof PREVIEW_COLUMNS)[number]["id"];

export function SchemaPreviewModal({
  open,
  onClose,
  connectionName,
  schema,
  table,
}: SchemaPreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              Preview rows (sample data)
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              {connectionName && (
                <>
                  Connection:{" "}
                  <span className="font-medium text-slate-100">
                    {connectionName}
                  </span>
                  {" · "}
                </>
              )}
              <span className="font-mono text-[11px] text-slate-300">
                {schema}.{table}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* การ์ดหลัก */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-inner shadow-black/60">
          {/* Header บนการ์ด */}
          <div className="border-b border-slate-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-50">
              {schema}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Sample rows from&nbsp;
              <span className="font-mono text-sky-300">{table}</span>
            </p>
          </div>

          {/* Table wrapper */}
          <div className="px-4 pb-4 pt-3">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
              {/* Bar ด้านบน */}
              <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 text-[11px] font-medium text-slate-200">
                {table}
              </div>

              {/* Table */}
              <div className="max-h-72 overflow-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-900 text-[11px] text-slate-300">
                    <tr>
                      {PREVIEW_COLUMNS.map((col) => (
                        <th
                          key={col.id}
                          className="px-4 py-2 font-medium"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                    {PREVIEW_ROWS.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-4 py-2 text-[11px] text-slate-100">
                          {row.id}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-100 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-100">
                          {row.description}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-100 whitespace-nowrap">
                          {row.category}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-100 whitespace-nowrap">
                          {row.amount}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-100 whitespace-nowrap">
                          {row.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer ปุ่มปิด */}
          <div className="flex justify-end border-t border-slate-800 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-600 px-4 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
