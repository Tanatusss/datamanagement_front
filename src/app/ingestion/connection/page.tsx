// src/app/ingestion/connection/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useConnections } from "@/components/ingestion/ConnectionsContext";
import {
  getDbIconForType,
  type DbType,
} from "@/components/ingestion/dbCatalog";

const CATEGORY_LABEL: Record<string, string> = {
  SQL: "SQL Databases",
  NoSQL: "NoSQL Databases",
  Analytical: "Analytical / Data Warehouse",
  Files: "Files",
  "Big Data": "Big Data",
  "Full-text Search": "Full-text Search",
  "Graph Database": "Graph Databases",
};

type CardProps = {
  id: string;
  name: string;
  type: DbType;
  icon?: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

function ConnectionCard({
  id,
  name,
  type,
  icon,
  onOpen,
  onDelete,
}: CardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(id);
      }}
      className="
        group relative flex w-full min-h-[190px] cursor-pointer flex-col items-center gap-3
        rounded-3xl border border-[#1F2937] bg-[#111827] px-6 py-6
        shadow-[0_6px_18px_rgba(0,0,0,0.45)]
        transition
        hover:-translate-y-0.5 hover:border-sky-500/70
        hover:shadow-[0_10px_28px_rgba(0,0,0,0.7)]
      "
    >
      {/* delete button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        className="
          absolute right-3 top-3 flex h-5 w-5 items-center justify-center
          rounded-full bg-rose-500 text-[18px] font-bold text-white shadow
          hover:bg-rose-600
        "
        title="Delete connection"
      >
        −
      </button>

      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#020617] ring-1 ring-[#1F2937] overflow-hidden">
        {icon ? (
          <img
            src={icon}
            alt={type}
            className="h-10 w-10 object-contain"
            loading="lazy"
            draggable={false}
            onError={(e) => {
              // กันกรณี path หรือไฟล์ไม่อยู่จริง
              // ซ่อนรูปแล้ว fallback เป็น text
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="max-w-[58px] truncate text-center text-[11px] text-[#cbd5e1]">
            {type}
          </span>
        )}
      </div>

      <div className="mt-1 text-center leading-tight">
        <p className="max-w-[180px] truncate text-sm font-medium text-[#E2E8F0]">
          {name}
        </p>
        <p className="text-[11px] text-[#9CA3AF]">{type}</p>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const {
    connections,
    openCreateModal,
    markViewed,
    deleteConnection,
    openConnectionDetail,
  } = useConnections();

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return connections;
    return connections.filter((c) => c.name.toLowerCase().includes(term));
  }, [connections, search]);

  const recent = useMemo(() => {
    return [...connections]
      .filter((c) => c.lastViewedAt)
      .sort(
        (a, b) =>
          new Date(b.lastViewedAt || 0).getTime() -
          new Date(a.lastViewedAt || 0).getTime()
      )
      .slice(0, 6);
  }, [connections]);

  const grouped = useMemo(() => {
    const byCat: Record<string, typeof filtered> = {};
    filtered.forEach((c) => {
      (byCat[c.category] ||= []).push(c);
    });
    return Object.entries(byCat).sort(([aKey], [bKey]) => aKey.localeCompare(bKey));
  }, [filtered]);

  const handleOpenConnection = (id: string) => {
    markViewed(id);
    openConnectionDetail(id);
  };

  const handleDeleteConnection = (id: string) => {
    deleteConnection(id);
  };

  return (
    <>
      {/* ---------- Header ---------- */}
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-[#F0EEE9]">Connections</h1>
        <p className="text-sm text-[#9aa4b2]">
          จัดการการเชื่อมต่อแหล่งข้อมูล (Databases / Warehouses / APIs ฯลฯ)
        </p>
      </header>

      {/* ---------- Action row ---------- */}
      <section className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={openCreateModal}
          className="
            inline-flex min-w-[240px] items-center justify-center gap-3
            rounded-2xl border-2 border-dashed border-sky-500 bg-[#020617]
            px-5 py-4 text-sm font-medium text-[#E5E7EB]
            shadow-[0_4px_12px_rgba(0,0,0,0.4)]
            hover:border-sky-400 hover:text-white hover:bg-[#020617]/80
            transition
          "
        >
          <Plus className="h-5 w-5" />
          New connection
        </button>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search connections..."
            className="
              w-full rounded-full border border-[#1f2937] bg-[#020617]
              py-2 pl-9 pr-3 text-sm text-[#E5E7EB] shadow-sm
              placeholder-[#64748B]
              focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500
              transition
            "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* ---------- Recent ---------- */}
      {recent.length > 0 && (
        <section className="mb-8 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
            Recent connections
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((c) => {
              const icon = getDbIconForType(c.type as DbType); // ✅ basePath-safe
              return (
                <ConnectionCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  type={c.type as DbType}
                  icon={icon}
                  onOpen={handleOpenConnection}
                  onDelete={handleDeleteConnection}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Grouped by category ---------- */}
      {grouped.length === 0 ? (
        <p className="text-sm text-[#9aa4b2]">
          ยังไม่มี connection ให้สร้างใหม่โดยกดปุ่ม{" "}
          <span className="font-medium text-[#E5E7EB]">“New connection”</span>
        </p>
      ) : (
        <section className="space-y-8">
          {grouped.map(([catKey, items]) => (
            <div key={catKey} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
                {CATEGORY_LABEL[catKey] ?? catKey}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => {
                  const icon = getDbIconForType(c.type as DbType); // ✅ basePath-safe
                  return (
                    <ConnectionCard
                      key={c.id}
                      id={c.id}
                      name={c.name}
                      type={c.type as DbType}
                      icon={icon}
                      onOpen={handleOpenConnection}
                      onDelete={handleDeleteConnection}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
