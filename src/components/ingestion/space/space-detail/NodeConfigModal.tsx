// src/components/ingestion/space/space-detail/NodeConfigModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Check } from "lucide-react";

import type { DbType } from "@/components/ingestion/dbCatalog";

export type MappingChoice = "original" | "edit" | "ignore";

export type OutColumn = {
    key: string;
    name: string;
};

export type SourceMappingRow = {
  out: OutColumn;
  mode: MappingChoice; // original | edit | ignore
  editedName?: string;

  // ✅ UI only
  editing?: boolean; // when true show input + check button
};


export type DestinationMappingRow = {
    inName: string; // from source out columns (filtered ignore)
    targetName: string; // destination field
    mode: "original" | "ignore";
};

export type NodeConfigValue = {
    connectionId: string;
    connectionName: string;
    schema: string;
    table: string;

    sourceMapping?: SourceMappingRow[];
    destinationMapping?: DestinationMappingRow[];

    previewRows?: Record<string, any>[];
};

type ConnectionOption = { id: string; name: string; type?: DbType };

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (val: NodeConfigValue) => void;

    role: "source" | "destination";
    dbType?: DbType;
    dbIcon?: string;

    initial?: Partial<NodeConfigValue>;
    connectionOptions: ConnectionOption[];

    sourceOutColumns?: string[];
};

type TabKey = "detail" | "mapping" | "preview";

const MOCK_SOURCE_FIELDS = [
    "customer_id",
    "first_name",
    "last_name",
    "email",
    "created_at",
];
const MOCK_TARGET_FIELDS = ["cust_id", "full_name", "email", "created_at"];

export function NodeConfigModal({
    open,
    onClose,
    onSave,
    role,
    dbType,
    initial,
    connectionOptions,
    sourceOutColumns,
}: Props) {
    const [tab, setTab] = useState<TabKey>("detail");

    // detail fields
    const [connectionId, setConnectionId] = useState("");
    const [schema, setSchema] = useState("");
    const [table, setTable] = useState("");

    // mapping
    const [sourceMapping, setSourceMapping] = useState<SourceMappingRow[]>([]);
    const [destinationMapping, setDestinationMapping] = useState<
        DestinationMappingRow[]
    >([]);

    const connectionName = useMemo(() => {
        return connectionOptions.find((c) => c.id === connectionId)?.name ?? "";
    }, [connectionId, connectionOptions]);

    const canSave = !!connectionId && !!schema.trim() && !!table.trim();

    // ✅ destination fields list (replace with real schema later)
    const destinationFields = useMemo(() => {
        return MOCK_TARGET_FIELDS;
    }, []);

    // source: compute visible out columns (ignore hidden)
    const computedSourceOut = useMemo(() => {
        return sourceMapping
            .filter((r) => r.mode !== "ignore")
            .map((r) =>
                r.mode === "edit"
                    ? r.editedName?.trim() || r.out.name
                    : r.out.name
            );
    }, [sourceMapping]);

    // destination: apply hiding from ignore
    const computedDestRows = useMemo(() => {
        return destinationMapping.filter((r) => r.mode !== "ignore");
    }, [destinationMapping]);

    // preview mock
    const previewCols = useMemo(() => {
        if (role === "source")
            return computedSourceOut.length ? computedSourceOut : ["(no columns)"];
        return computedDestRows.length
            ? computedDestRows.map((r) => r.targetName || r.inName)
            : ["(no columns)"];
    }, [role, computedSourceOut, computedDestRows]);

    const previewRows = useMemo(() => {
        const cols = previewCols.filter((c) => c !== "(no columns)");
        const rows: Record<string, any>[] = [];
        for (let i = 0; i < 5; i++) {
            const r: Record<string, any> = {};
            cols.forEach((c) => {
                r[c] = mockValueFor(c, i);
            });
            rows.push(r);
        }
        return rows;
    }, [previewCols]);

    // init
    useEffect(() => {
        if (!open) return;

        setTab("detail");

        setConnectionId(initial?.connectionId ?? "");
        setSchema(initial?.schema ?? "");
        setTable(initial?.table ?? "");

        if (role === "source") {
            const baseCols: OutColumn[] =
                (initial?.sourceMapping?.map((r) => r.out) as OutColumn[] | undefined) ??
                MOCK_SOURCE_FIELDS.map((n, i) => ({ key: `c${i}`, name: n }));

            const existing = initial?.sourceMapping;
            if (existing && existing.length) {
                setSourceMapping(existing);
            } else {
                setSourceMapping(
                    baseCols.map((c) => ({
                        out: c,
                        mode: "original",
                        editedName: c.name,
                        editing: false,
                    }))
                );
            }
            setDestinationMapping([]);
        } else {
            // Destination mapping rows:
            // left = source fields (from out), right = destination field dropdown (default = destination field)
            const inCols = (sourceOutColumns?.length
                ? sourceOutColumns
                : MOCK_SOURCE_FIELDS
            ).slice(0, 50);

            const existing = initial?.destinationMapping;
            if (existing && existing.length) {
                setDestinationMapping(existing);
            } else {
                setDestinationMapping(
                    inCols.map((src, idx) => ({
                        inName: src,
                        targetName: destinationFields[idx] ?? destinationFields[0] ?? "",
                        mode: "original",
                    }))
                );
            }
            setSourceMapping([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, role, initial, sourceOutColumns, destinationFields]);

    const handleSave = () => {
        if (!canSave) return;

        onSave({
            connectionId,
            connectionName,
            schema: schema.trim(),
            table: table.trim(),
            sourceMapping: role === "source" ? sourceMapping : undefined,
            destinationMapping: role === "destination" ? destinationMapping : undefined,
            previewRows,
        });
    };

    if (!open) return null;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-4xl max-h-[70vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md">
                {/* header */}
                <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200">
                            Configure {role === "source" ? "Source" : "Destination"}
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-50">
                            {dbType ? `${dbType}` : "Database"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/70 text-slate-200 hover:bg-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* LEFT vertical tabs + RIGHT content */}
                <div className="flex min-h-[400px]">
                    {/* LEFT */}
                    <div className="w-[190px] shrink-0 border-r border-slate-700 bg-slate-950/30 p-3">
                        <div className="space-y-2">
                            <VerticalTabButton
                                active={tab === "detail"}
                                onClick={() => setTab("detail")}
                            >
                                Detail
                            </VerticalTabButton>
                            <VerticalTabButton
                                active={tab === "mapping"}
                                onClick={() => setTab("mapping")}
                            >
                                Mapping
                            </VerticalTabButton>
                            <VerticalTabButton
                                active={tab === "preview"}
                                onClick={() => setTab("preview")}
                            >
                                Preview
                            </VerticalTabButton>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex-1">
                        <div className="relative max-h-[50vh] overflow-y-auto p-4">
                            {/* DETAIL */}
                            {tab === "detail" && (
                                <div className="flex min-h-[40vh] items-center justify-center">
                                    <div className="w-full max-w-xl">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-3 md:col-span-2">
                                                <Field label="Connection">
                                                    <select
                                                        value={connectionId}
                                                        onChange={(e) => setConnectionId(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                                                    >
                                                        <option value="">— Select connection —</option>
                                                        {connectionOptions.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </Field>

                                                <Field label="Schema">
                                                    <input
                                                        value={schema}
                                                        onChange={(e) => setSchema(e.target.value)}
                                                        placeholder="e.g. public"
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                                                    />
                                                </Field>

                                                <Field label="Table">
                                                    <input
                                                        value={table}
                                                        onChange={(e) => setTable(e.target.value)}
                                                        placeholder="e.g. customers"
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MAPPING */}
                            {tab === "mapping" && (
                                <div className="space-y-4">
                                    {role === "source" ? (
                                        <>
                                            {/* Title */}
                                            <div className="grid grid-cols-12 items-center gap-3 px-3">
                                                <div className="col-span-5 text-sm font-semibold text-slate-200">
                                                    Source
                                                </div>

                                                <div className="col-span-7">
                                                    {/* สำคัญ: ใช้ max-w-md + mx-auto เหมือน dropdown */}
                                                    <div className="mx-auto w-full max-w-md text-center">
                                                        <p className="text-sm font-semibold text-slate-200">OUT</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="overflow-hidden rounded-2xl border border-slate-700">
                                                <div className="grid grid-cols-12 items-center bg-slate-950/50 px-3 py-2 text-[11px] font-semibold text-slate-300">
                                                    <div className="col-span-5">{table || "(table)"}</div>
                                                </div>

                                                <div className="divide-y divide-slate-800 bg-slate-900/40">
                                                    {sourceMapping.map((row, idx) => {
                                                        const isIgnored = row.mode === "ignore";
                                                        return (
                                                            <div
                                                                key={row.out.key}
                                                                className={[
                                                                    "grid grid-cols-12 items-start gap-3 px-3 py-2 text-sm",
                                                                    isIgnored ? "opacity-60" : "",
                                                                ].join(" ")}
                                                            >
                                                                {/* left */}
                                                                <div className="col-span-5 truncate pt-2 text-slate-100">
                                                                    {row.out.name}
                                                                </div>

                                                                {/* right: ✅ dropdown เดียว + input เฉพาะตอน edit */}
                                                                <div className="col-span-7">
                                                                    <div className="mx-auto w-full max-w-md">
                                                                        <SingleSourceDropdown
                                                                            row={row}
                                                                            onChange={(next) => {
                                                                                setSourceMapping((prev) =>
                                                                                    prev.map((r, i) =>
                                                                                        i === idx ? { ...r, ...next } : r
                                                                                    )
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Title */}
                                             <div className="grid grid-cols-12 items-center gap-3 px-3">
                                                <div className="col-span-5 text-sm font-semibold text-slate-200">
                                                    IN
                                                </div>

                                                <div className="col-span-7">
                                                    {/* สำคัญ: ใช้ max-w-md + mx-auto เหมือน dropdown */}
                                                    <div className="mx-auto w-full max-w-md text-center">
                                                        <p className="text-sm font-semibold text-slate-200">DESTINATION</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="overflow-hidden rounded-2xl border border-slate-700">
                                                <div className="grid grid-cols-12 items-center bg-slate-950/50 px-3 py-2 text-[11px] font-semibold text-slate-300">
                                                    <div className="col-span-5">{table || "(table)"}</div>
                                                </div>

                                                <div className="divide-y divide-slate-800 bg-slate-900/40">
                                                    {destinationMapping.map((row, idx) => {
                                                        const isIgnored = row.mode === "ignore";
                                                        const keepValue = row.inName || ""; // ✅ default แสดงเป็นชื่อ source field

                                                        return (
                                                            <div
                                                                key={`${row.inName}-${idx}`}
                                                                className={[
                                                                    "grid grid-cols-12 items-center gap-3 px-3 py-2 text-sm",
                                                                    isIgnored ? "opacity-60" : "",
                                                                ].join(" ")}
                                                            >
                                                                {/* left: source field */}
                                                                <div className="col-span-5 truncate text-slate-100">{row.inName}</div>

                                                                {/* right: dropdown = (keep source field) OR ignore */}
                                                                <div className="col-span-7">
                                                                    <div className="mx-auto w-full max-w-md">
                                                                        <select
                                                                            value={isIgnored ? "__ignore__" : keepValue}
                                                                            onChange={(e) => {
                                                                                const v = e.target.value;

                                                                                if (v === "__ignore__") {
                                                                                    setDestinationMapping((prev) =>
                                                                                        prev.map((r, i) =>
                                                                                            i === idx ? { ...r, mode: "ignore" } : r
                                                                                        )
                                                                                    );
                                                                                    return;
                                                                                }

                                                                                // ✅ keep (กลับมา original)
                                                                                setDestinationMapping((prev) =>
                                                                                    prev.map((r, i) =>
                                                                                        i === idx ? { ...r, mode: "original", targetName: r.targetName } : r
                                                                                    )
                                                                                );
                                                                            }}
                                                                            className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                                                                        >
                                                                            {/* ✅ default/keep = source field ของแถวนี้ */}
                                                                            <option value={keepValue}>{keepValue || "—"}</option>

                                                                            {/* ✅ มี ignore แค่อันเดียว */}
                                                                            <option value="__ignore__">ignore</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}


                                                    {computedDestRows.length === 0 && (
                                                        <div className="px-3 py-4 text-sm text-slate-300">
                                                            No columns to map (all ignored or empty).
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-[11px] text-slate-400">
                                                * Destination dropdown ใช้{" "}
                                                <span className="text-slate-200 font-semibold">
                                                    destination fields
                                                </span>{" "}
                                                และ default เป็นค่าที่ดึงมา (targetName)
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* PREVIEW */}
                            {tab === "preview" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold text-slate-200">
                                            Preview ·{" "}
                                            <span className="text-slate-400">{schema || "(schema)"}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            Showing mock rows for{" "}
                                            <span className="text-slate-200 font-semibold">
                                                {table || "(table)"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-slate-700">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left text-xs">
                                                <thead className="bg-slate-950/50 text-slate-300">
                                                    <tr>
                                                        {previewCols.map((c) => (
                                                            <th
                                                                key={c}
                                                                className="whitespace-nowrap px-3 py-2 font-semibold"
                                                            >
                                                                {c}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-100">
                                                    {previewRows.map((r, idx) => (
                                                        <tr key={idx}>
                                                            {previewCols.map((c) => (
                                                                <td
                                                                    key={c}
                                                                    className="whitespace-nowrap px-3 py-2 text-slate-200"
                                                                >
                                                                    {String(r[c] ?? "")}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-slate-400">
                                        * Preview is mock data (for UI only).
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
                    <div className="text-[11px] text-slate-400">
                        {role === "source" ? (
                            <>
                                Out columns:{" "}
                                <span className="text-slate-200 font-semibold">
                                    {computedSourceOut.length}
                                </span>
                            </>
                        ) : (
                            <>
                                Target columns:{" "}
                                <span className="text-slate-200 font-semibold">
                                    {computedDestRows.length}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave}
                            className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-40"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerticalTabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "w-full text-left",
                "rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                "border",
                active
                    ? "bg-slate-800 text-slate-50 border-sky-500/60"
                    : "bg-transparent text-slate-300 border-transparent hover:bg-slate-800/60 hover:border-slate-700",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[11px] font-semibold text-slate-300">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    );
}

/**
 * ✅ Source mapping:
 * - dropdown เดียวต่อแถว
 * - default ที่โชว์ = ชื่อคอลัมน์ (customer_id, first_name, ...)
 * - ถ้าเลือก edit -> แสดง input ให้แก้ชื่อได้จริง
 */
function SingleSourceDropdown({
  row,
  onChange,
}: {
  row: SourceMappingRow;
  onChange: (next: Partial<SourceMappingRow>) => void;
}) {
  const originalName = row.out.name;
  const editedName = row.editedName ?? originalName;

  // label ที่ควรโชว์เป็น "ชื่อคอลัมน์จริง" เสมอ
  const displayLabel =
    row.mode === "edit" ? (editedName.trim() || originalName) : originalName;

  // ===== EDITING MODE: input + ✓ button =====
  if (row.editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={editedName}
          onChange={(e) => onChange({ editedName: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange({
                mode: "edit",
                editedName: (editedName || "").trim() || originalName,
                editing: false,
              });
            }
            if (e.key === "Escape") {
              onChange({
                mode: "original",
                editedName: originalName,
                editing: false,
              });
            }
          }}
          placeholder="ใส่ชื่อใหม่ของ column"
          className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
        />

        <button
          type="button"
          onClick={() =>
            onChange({
              mode: "edit",
              editedName: (editedName || "").trim() || originalName,
              editing: false,
            })
          }
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-slate-100 hover:border-sky-500 hover:bg-slate-900"
          title="Confirm"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ===== DROPDOWN MODE =====
  // ✅ select value = ชื่อคอลัมน์จริงที่โชว์ (ไม่ใช่ __edit__)
  const selectValue = row.mode === "ignore" ? "__ignore__" : displayLabel;

  return (
    <select
      value={selectValue}
      onChange={(e) => {
        const v = e.target.value;

        if (v === "__ignore__") {
          onChange({ mode: "ignore", editing: false });
          return;
        }

        if (v === "__edit__") {
          // ✅ เลือก edit -> เปลี่ยนเป็น input
          onChange({
            mode: "edit",
            editedName: editedName || originalName,
            editing: true,
          });
          return;
        }

        // ถ้าเลือกค่า displayLabel (ปัจจุบัน) ก็ไม่ต้องทำอะไร
        onChange({ editing: false });
      }}
      className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
    >
      {/* ✅ ค่าแรก = ชื่อคอลัมน์จริงที่ใช้อยู่ */}
      <option value={displayLabel}>{displayLabel}</option>

      {/* action options */}
      <option value="__edit__">edit column</option>
      <option value="__ignore__">ignore</option>
    </select>
  );
}



function mockValueFor(col: string, i: number) {
    const key = col.toLowerCase();
    if (key.includes("id")) return 1000 + i;
    if (key.includes("email")) return `user${i}@example.com`;
    if (key.includes("name")) return i % 2 ? "Alice" : "Bob";
    if (key.includes("date") || key.includes("created"))
        return `2025-01-0${(i % 9) + 1}`;
    return `val_${i}`;
}
