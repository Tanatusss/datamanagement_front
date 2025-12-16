"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Database, ChevronDown } from "lucide-react";

import { useSpaces } from "@/components/ingestion/SpaceContext";
import { AnalyzeModal } from "@/components/ingestion/space/AnalyzeModal";
import { useConnections } from "@/components/ingestion/ConnectionsContext";
import { getDbIconForType, type DbType } from "@/components/ingestion/dbCatalog";

type TabKey = "summary" | "explore" | "chart";

type Row = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
};

const INITIAL_ROWS: Row[] = [
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

const COLUMNS = [
  { id: "id", label: "id", type: "integer" },
  { id: "date", label: "date", type: "date" },
  { id: "description", label: "description", type: "string" },
  { id: "category", label: "category", type: "string" },
  { id: "amount", label: "amount", type: "number" },
  { id: "balance", label: "balance", type: "number" },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

type SortConfig =
  | {
      columnId: ColumnId;
      direction: "asc" | "desc";
    }
  | null;

type FilterConfig =
  | {
      columnId: ColumnId;
      value: string;
    }
  | null;

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// ✅ basePath helper (/dmp)
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
function withBasePath(p?: string) {
  if (!p) return "";
  if (!p.startsWith("/")) return `${BASE_PATH}/${p}`;
  return `${BASE_PATH}${p}`;
}

export default function NodeDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string; schema: string }>();
  const searchParams = useSearchParams();

  const slug = safeDecode(params.slug);
  const schemaFromPath = safeDecode(params.schema);

  const { spaces } = useSpaces();
  const space = spaces.find((s) => s.name === slug);

  const { connections } = useConnections();

  const nodeId = searchParams.get("nodeId") || "";
  const schema = schemaFromPath;

  // query from url
  const connectionNameFromQuery = searchParams.get("connection") || "";
  const tableFromQuery = searchParams.get("table") || "transactions";

  // state that can be overridden by sessionStorage payload
  const [connectionName, setConnectionName] = useState(
    connectionNameFromQuery || "Unknown connection"
  );
  const [table, setTable] = useState(tableFromQuery);

  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [loadingRows, setLoadingRows] = useState(true);
  const connectionIdFromQuery = searchParams.get("connectionId") || "";

  type PayloadMeta = {
    connectionId?: string;
    connectionName?: string;
    table?: string;
  };

  const [payloadMeta, setPayloadMeta] = useState<PayloadMeta | null>(null);

  // ✅ 1) read payload from sessionStorage first (no API)
  useEffect(() => {
    let alive = true;
    setLoadingRows(true);
    setPayloadMeta(null);

    const key = `nodePreview:${slug}:${nodeId}`;

    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const payload = JSON.parse(raw);
        if (!alive) return;

        // keep meta (ไว้ใช้ resolve connection)
        const meta: PayloadMeta = {
          connectionId: payload?.connectionId
            ? String(payload.connectionId)
            : undefined,
          connectionName: payload?.connectionName
            ? String(payload.connectionName)
            : undefined,
          table: payload?.table ? String(payload.table) : undefined,
        };
        setPayloadMeta(meta);

        // override meta เฉพาะถ้ามีค่า (ไม่งั้นใช้จาก query)
        if (meta.connectionName) setConnectionName(meta.connectionName);
        if (meta.table) setTable(meta.table);

        // rows
        const r = Array.isArray(payload?.rows) ? payload.rows : [];
        if (r.length) {
          const mapped = r.map((x: any, idx: number) => ({
            id: Number(x.id ?? idx + 1),
            date: String(x.date ?? ""),
            description: String(x.description ?? ""),
            category: String(x.category ?? ""),
            amount: Number(x.amount ?? 0),
            balance: Number(x.balance ?? 0),
          }));

          // ✅ ถ้า payload มีน้อย (เช่น 2 แถว) เติม mock ต่อท้ายให้เห็นหลายแถวตามต้องการ
          const merged =
            mapped.length < INITIAL_ROWS.length
              ? [...mapped, ...INITIAL_ROWS.slice(mapped.length)]
              : mapped;

          setRows(merged);
        } else {
          setRows(INITIAL_ROWS);
        }

        setLoadingRows(false);
        return;
      }
    } catch {
      // ignore
    }

    // fallback if no payload
    if (alive) {
      setRows(INITIAL_ROWS);
      setLoadingRows(false);
    }

    return () => {
      alive = false;
    };
  }, [slug, nodeId]);

  // ✅ 2) resolve dbType/dbIcon from ConnectionsContext by connectionName
  const rawConnection = useMemo(() => {
    if (connectionIdFromQuery) {
      const byId = connections.find(
        (c: any) => String(c.id) === String(connectionIdFromQuery)
      );
      if (byId) return byId;
    }
    return connections.find((c: any) => c.name === connectionName);
  }, [connections, connectionIdFromQuery, connectionName]);

  const dbType: DbType | undefined = rawConnection?.type as DbType | undefined;

  // IMPORTANT: use <img> and ensure basePath
  const dbIcon: string | undefined = dbType
    ? getDbIconForType(dbType) // ✅ เหมือนหน้า create node
    : undefined;

  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [openMenuCol, setOpenMenuCol] = useState<ColumnId | null>(null);
  const [analyzeCol, setAnalyzeCol] = useState<ColumnId | null>(null);

  const [editingCol, setEditingCol] = useState<ColumnId | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(null);
  const [pendingFilterCol, setPendingFilterCol] = useState<ColumnId | null>(
    null
  );
  const [filterValueInput, setFilterValueInput] = useState("");

  const handleHeaderClick = (colId: ColumnId) => {
    setOpenMenuCol((prev) => (prev === colId ? null : colId));
  };

  const handleMenuSelect = (action: string, colId: ColumnId) => {
    setOpenMenuCol(null);

    if (action === "analyze") {
      setAnalyzeCol(colId);
      return;
    }

    if (action === "edit-column") {
      setEditingCol((prev) => (prev === colId ? null : colId));
      return;
    }

    if (action === "filter") {
      setPendingFilterCol(colId);
      setFilterValueInput(
        filterConfig?.columnId === colId ? filterConfig.value : ""
      );
      return;
    }

    if (action === "sort") {
      setSortConfig((prev) => {
        if (!prev || prev.columnId !== colId)
          return { columnId: colId, direction: "asc" };
        if (prev.direction === "asc")
          return { columnId: colId, direction: "desc" };
        return null;
      });
      return;
    }
  };

  const applyFilter = () => {
    if (!pendingFilterCol) return;
    const v = filterValueInput.trim();
    if (!v) setFilterConfig(null);
    else setFilterConfig({ columnId: pendingFilterCol, value: v });
    setPendingFilterCol(null);
  };

  const clearFilter = () => {
    setFilterConfig(null);
    setPendingFilterCol(null);
    setFilterValueInput("");
  };

  const processedRows = useMemo(() => {
    let data = [...rows];

    if (filterConfig?.value) {
      const { columnId, value } = filterConfig;
      const lower = value.toLowerCase();
      data = data.filter((row) =>
        String((row as any)[columnId] ?? "")
          .toLowerCase()
          .includes(lower)
      );
    }

    if (sortConfig) {
      const { columnId, direction } = sortConfig;
      data.sort((a, b) => {
        const av = (a as any)[columnId];
        const bv = (b as any)[columnId];

        const aNum = Number(av);
        const bNum = Number(bv);
        const bothNumeric = !Number.isNaN(aNum) && !Number.isNaN(bNum);

        let cmp = 0;
        if (bothNumeric) cmp = aNum - bNum;
        else cmp = String(av).localeCompare(String(bv));

        return direction === "asc" ? cmp : -cmp;
      });
    }

    return data;
  }, [rows, filterConfig, sortConfig]);

  const goBack = () => {
    router.push(`/ingestion/space/${encodeURIComponent(slug)}`);
  };

  const sortIconFor = (colId: ColumnId) => {
    if (!sortConfig || sortConfig.columnId !== colId) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const editingChipLabel =
    editingCol && COLUMNS.find((c) => c.id === editingCol)?.label;

  const activeFilterLabel =
    filterConfig && COLUMNS.find((c) => c.id === filterConfig.columnId)?.label;

  const activeSortLabel =
    sortConfig && COLUMNS.find((c) => c.id === sortConfig.columnId)?.label;

  return (
    <div className="space-y-5 text-slate-100">
      {/* TOPBAR */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900 px-5 py-4 shadow-sm border border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="
                flex h-12 w-12 items-center justify-center
                rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800
                text-white ring-4 ring-slate-700/80
              "
            >
              {dbIcon ? (
                <img
                  src={dbIcon}
                  alt={dbType || connectionName}
                  className="h-8 w-8 object-contain"
                  draggable={false}
                />
              ) : (
                <Database className="h-4 w-4" />
              )}
            </div>

            <div>
              <h1 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
                <span className="text-sky-400">{connectionName}</span>
              </h1>
              <p className="text-xs text-slate-400">Schema: {schema}</p>
              <p className="text-xs text-slate-400">Table: {table}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-lg shadow-black/40">
        <div className="border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 px-4">
            <span className="text-[18px] font-semibold text-slate-50 tracking-wide">
              {schema}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(["summary", "explore", "chart"] as TabKey[]).map((key) => {
              const label =
                key === "summary"
                  ? "Summary"
                  : key === "explore"
                  ? "Explore"
                  : "Chart";
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={
                    isActive
                      ? "px-4 py-1.5 rounded-full bg-sky-500 text-slate-900 text-[11px] font-medium shadow-sm"
                      : "px-4 py-1.5 rounded-full text-[11px] text-slate-300 hover:bg-slate-800 font-medium"
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-5 pt-4">
          <div className="overflow-hidden rounded-xl border border-slate-700">
            <div className="bg-slate-900 px-4 py-2 text-[11px] font-medium text-slate-300 border-b border-slate-700 flex items-center justify-between">
              <span>{table}</span>
              <div className="flex items-center gap-2">
                {loadingRows && (
                  <span className="text-[11px] text-slate-400">Loading...</span>
                )}
              </div>
            </div>

            {pendingFilterCol && (
              <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900 px-3 py-2 text-[11px] text-slate-200">
                <span className="font-medium">
                  Filter on{" "}
                  {COLUMNS.find((c) => c.id === pendingFilterCol)?.label}:
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

            <div className="max-h-[420px] overflow-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-900 text-[11px] text-slate-400 border-b border-slate-700">
                  <tr>
                    {COLUMNS.map((col) => (
                      <th key={col.id} className="relative px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleHeaderClick(col.id)}
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
                              onClick={() => handleMenuSelect("analyze", col.id)}
                              className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                            >
                              Analyze
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMenuSelect("edit-column", col.id)}
                              className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                            >
                              {editingCol === col.id
                                ? "Stop editing"
                                : "Edit column"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMenuSelect("filter", col.id)}
                              className="block w-full px-3 py-1 text-left hover:bg-slate-800"
                            >
                              Filter
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMenuSelect("sort", col.id)}
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
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, [col.id]: value }
                                        : r
                                    )
                                  );
                                }}
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
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            {editingChipLabel && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-100">
                Editing column:{" "}
                <span className="font-mono">{editingChipLabel}</span>
              </span>
            )}

            {activeFilterLabel && filterConfig?.value && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-300">
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
              </span>
            )}

            {activeSortLabel && sortConfig && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-900/40 px-2 py-0.5 text-[10px] text-sky-300">
                Sort:{" "}
                <span className="font-mono">
                  {activeSortLabel} ({sortConfig.direction})
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <AnalyzeModal
        open={!!analyzeCol}
        onClose={() => setAnalyzeCol(null)}
        column={analyzeCol}
        rows={rows}
      />
    </div>
  );
}
