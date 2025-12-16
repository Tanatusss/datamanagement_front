// src/components/ingestion/space/TemplateModal.tsx
"use client";

import { X } from "lucide-react";

export type ConnectionItem = {
  id: string;
  name: string;
  type: string;
};

type TemplateModalProps = {
  open: boolean;
  connections: ConnectionItem[];
  selectedConnectionId: string;
  schema: string;
  table: string;
  onChangeConnection: (id: string) => void;
  onChangeSchema: (v: string) => void;
  onChangeTable: (v: string) => void;
  onOk: () => void;
  onCancel: () => void;
  onPreview: () => void;
};

export function TemplateModal({
  open,
  connections,
  selectedConnectionId,
  schema,
  table,
  onChangeConnection,
  onChangeSchema,
  onChangeTable,
  onOk,
  onCancel,
  onPreview,
}: TemplateModalProps) {
  if (!open) return null;

  const canSubmit = !!selectedConnectionId && !!schema && !!table;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-5 text-sm text-slate-50 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-50">
            เพิ่ม node template
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3">
          {/* Connection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Connection
            </label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={selectedConnectionId}
              onChange={(e) => onChangeConnection(e.target.value)}
            >
              <option value="" className="bg-slate-950 text-slate-400">
                เลือก connection...
              </option>
              {connections.map((c: ConnectionItem) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-slate-950 text-slate-100"
                >
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Schema */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Schema
            </label>
            <input
              type="text"
              value={schema}
              onChange={(e) => onChangeSchema(e.target.value)}
              placeholder="เช่น public, dbo ฯลฯ"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Table */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Table
            </label>
            <input
              type="text"
              value={table}
              onChange={(e) => onChangeTable(e.target.value)}
              placeholder="เช่น customer, transaction_2024 ฯลฯ"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-600 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onPreview}
            disabled={!canSubmit}
            className="rounded-full border border-sky-500 px-4 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={onOk}
            disabled={!canSubmit}
            className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-medium text-slate-900 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
