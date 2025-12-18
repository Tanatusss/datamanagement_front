"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

import { COLUMNS, type ColumnId, type FilterConfig, type Row, type SortConfig } from "./types";

type Props = {
  tableName: string;

  rows: Row[];
  processedRows: Row[];
  loadingRows: boolean;

  // column menu
  openMenuCol: ColumnId | null;
  onHeaderClick: (colId: ColumnId) => void;
  onMenuSelect: (action: "analyze" | "edit-column" | "filter" | "sort", colId: ColumnId) => void;

  // editing
  editingCol: ColumnId | null;
  setEditingCol: (col: ColumnId | null) => void;
  onCellChange: (rowId: number, colId: ColumnId, value: string) => void;

  // filter
  pendingFilterCol: ColumnId | null;
  filterValueInput: string;
  setFilterValueInput: (v: string) => void;
  setPendingFilterCol: (c: ColumnId | null) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  filterConfig: FilterConfig;

  // sort
  sortConfig: SortConfig;
  sortIconFor: (colId: ColumnId) => string;
};

function Chip({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "emerald" | "sky";
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-900/40 text-emerald-300"
      : tone === "sky"
      ? "bg-sky-900/40 text-sky-300"
      : "bg-slate-800 text-slate-100";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${cls}`}>
      {children}
    </span>
  );
}

export function NodeTableSection(props: Props) {
  const {
    tableName,
    rows,
    processedRows,
    loadingRows,

    openMenuCol,
    onHeaderClick,
    onMenuSelect,

    editingCol,
    setEditingCol,
    onCellChange,

    pendingFilterCol,
    filterValueInput,
    setFilterValueInput,
    setPendingFilterCol,
    applyFilter,
    clearFilter,
    filterConfig,

    sortConfig,
    sortIconFor,
  } = props;

  const editingChipLabel =
    editingCol && COLUMNS.find((c) => c.id === editingCol)?.label;

  const activeFilterLabel =
    filterConfig && COLUMNS.find((c) => c.id === filterConfig.columnId)?.label;

  const activeSortLabel =
    sortConfig && COLUMNS.find((c) => c.id === sortConfig.columnId)?.label;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      {/* table header */}
      <div className="bg-slate-900 px-4 py-2 text-[11px] font-medium text-slate-300 border-b border-slate-700 flex items-center justify-between">
        <span>{tableName}</span>
        <div className="flex items-center gap-2">
          {loadingRows && (
            <span className="text-[11px] text-slate-400">Loading...</span>
          )}
        </div>
      </div>

      {/* filter bar */}
      {pendingFilterCol && (
        <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900 px-3 py-2 text-[11px] text-slate-200">
          <span className="font-medium">
            Filter on {COLUMNS.find((c) => c.id === pendingFilterCol)?.label}:
          </span>

          {pendingFilterCol === "category" ? (
            <select
              className="flex-1 rounded border border-slate-600 px-2 py-1 text-[11px] bg-slate-900 text-slate-100"
              value={filterValueInput}
              onChange={(e) => setFilterValueInput(e.target.value)}
            >
              <option value="">-- เลือก category --</option>
              {[...new Set(rows.map((r) => r.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="flex-1 rounded border border-slate-600 px-2 py-1 text-[11px] bg-slate-900 text-slate-100"
              placeholder="พิมพ์คำที่ต้องการค้นหาในคอลัมน์นี้..."
              value={filterValueInput}
              onChange={(e) => setFilterValueInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilter();
                if (e.key === "Escape") setPendingFilterCol(null);
              }}
            />
          )}

          <button
            type="button"
            onClick={applyFilter}
            className="rounded-full border border-slate-500 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilter}
            className="rounded-full px-3 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      )}

      {/* table */}
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-900 text-[11px] text-slate-300 border-b border-slate-700">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.id} className="relative px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onHeaderClick(col.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-800 ${
                      openMenuCol === col.id ? "bg-slate-800" : ""
                    }`}
                  >
                    <span className="font-mono text-[11px]">
                      {col.label}
                      {sortIconFor(col.id) && (
                        <span className="ml-1">{sortIconFor(col.id)}</span>
                      )}
                    </span>
                    <ChevronDown className="h-3 w-3 text-slate-500" />
                  </button>

                  {openMenuCol === col.id && (
                    <div className="absolute left-1 top-full z-20 mt-1 w-40 rounded-lg border border-slate-700 bg-slate-900 py-1 text-[11px] text-slate-100 shadow-xl">
                      <button
                        type="button"
                        onClick={() => onMenuSelect("analyze", col.id)}
                        className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                      >
                        Analyze
                      </button>
                      <button
                        type="button"
                        onClick={() => onMenuSelect("edit-column", col.id)}
                        className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                      >
                        {editingCol === col.id ? "Stop editing" : "Edit column"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onMenuSelect("filter", col.id)}
                        className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                      >
                        Filter
                      </button>
                      <button
                        type="button"
                        onClick={() => onMenuSelect("sort", col.id)}
                        className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                      >
                        Sort
                      </button>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 bg-slate-950/60">
            {processedRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/80">
                {COLUMNS.map((col) => {
                  const isEditing = editingCol === col.id;
                  const rawValue = (row as any)[col.id];

                  return (
                    <td
                      key={col.id}
                      className="px-3 py-2 text-[11px] text-slate-100 whitespace-nowrap"
                    >
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[11px] text-slate-100"
                          value={String(rawValue ?? "")}
                          onChange={(e) => onCellChange(row.id, col.id, e.target.value)}
                        />
                      ) : (
                        String(rawValue ?? "")
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {!processedRows.length && !loadingRows && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  No rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* chips */}
      <div className="mt-3 px-3 pb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
        {editingChipLabel && (
          <Chip tone="slate">
            Editing column: <span className="font-mono">{editingChipLabel}</span>
            <button
              type="button"
              onClick={() => setEditingCol(null)}
              className="ml-1 text-[10px] underline"
            >
              stop
            </button>
          </Chip>
        )}

        {activeFilterLabel && filterConfig?.value && (
          <Chip tone="emerald">
            Filter:{" "}
            <span className="font-mono">
              {activeFilterLabel} ~ "{filterConfig.value}"
            </span>
            <button
              type="button"
              onClick={clearFilter}
              className="ml-1 text-[10px] underline"
            >
              clear
            </button>
          </Chip>
        )}

        {activeSortLabel && sortConfig && (
          <Chip tone="sky">
            Sort:{" "}
            <span className="font-mono">
              {activeSortLabel} ({sortConfig.direction})
            </span>
          </Chip>
        )}
      </div>
    </div>
  );
}
