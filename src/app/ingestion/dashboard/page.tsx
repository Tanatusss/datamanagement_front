// src/app/ingestion/dashboard/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  FolderPlus,
  Cable,
  Workflow,
  Clock,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { useSpaces } from "@/components/ingestion/SpaceContext";
import { useConnections } from "@/components/ingestion/ConnectionsContext";
import { CreateSpaceModal } from "@/components/ingestion/space/CreateSpaceModal";

type RunStatus = "Success" | "Failed" | "Running";

type LatestRun = {
  name: string;
  space: string;
  status: RunStatus;
  time: string;
  rows: string;
};

const latestRunsMock: LatestRun[] = [
  {
    name: "Daily CRM Import",
    space: "Customer 360",
    status: "Success",
    time: "Today · 08:05",
    rows: "1.2M rows",
  },
  {
    name: "POS Incremental Load",
    space: "Retail Analytics",
    status: "Failed",
    time: "Today · 07:40",
    rows: "—",
  },
  {
    name: "Master Data Sync",
    space: "Client Master",
    status: "Success",
    time: "Yesterday · 23:10",
    rows: "480k rows",
  },
  {
    name: "Bank Statement Import",
    space: "Finance Staging",
    status: "Success",
    time: "Yesterday · 22:30",
    rows: "8k rows",
  },
];

const recentChangesMock = [
  {
    text: "Created new connection: PostgreSQL_DWH",
    user: "admin007",
    time: "10 min ago",
  },
  {
    text: "Updated schedule: Daily CRM Import (06:00 → 05:30)",
    user: "data.ops",
    time: "1 hour ago",
  },
  {
    text: "Disabled connection: Legacy_MySQL",
    user: "admin007",
    time: "Yesterday",
  },
];

const DETAIL = {
  domain: "Client Master Data",
  module: "Ingestion",
  modifiedAt: "2025-12-01 09:30",
  owner: "admin007",
};

type SpacePreview = {
  id?: string;
  name: string;
  desc?: string;
  connections: number;
  pipelines: number;
};

type ConnectionPreview = {
  id?: string;
  name: string;
  type: string;
  status: string;
  lastUsed: string;
};

export default function IngestionDashboardPage() {
  const { spaces, createSpace } = useSpaces();
  const { connections, openCreateModal: openCreateConnectionModal } =
    useConnections();

  const [spaceModalOpen, setSpaceModalOpen] = useState(false);

  const {
    totalSpaces,
    activeSpaces,
    disabledSpaces,
    totalConnections,
    healthyConnections,
    warningConnections,
  } = useMemo(() => {
    const totalSpaces = spaces.length;
    const activeSpaces = spaces.filter(
      (s: any) => s.status === "enabled" || s.status === "active"
    ).length;
    const disabledSpaces = totalSpaces - activeSpaces;

    const totalConnections = connections.length;
    const healthyConnections = connections.filter(
      (c: any) =>
        c.health === "healthy" ||
        c.status === "healthy" ||
        c.status === "connected"
    ).length;
    const warningConnections = totalConnections - healthyConnections;

    return {
      totalSpaces,
      activeSpaces,
      disabledSpaces,
      totalConnections,
      healthyConnections,
      warningConnections,
    };
  }, [spaces, connections]);

  const kpis = useMemo(
    () => [
      {
        label: "Spaces",
        value: String(totalSpaces),
        sub: `${activeSpaces} active / ${disabledSpaces} disabled`,
        icon: FolderPlus,
      },
      {
        label: "Connections",
        value: String(totalConnections),
        sub: `${healthyConnections} healthy / ${warningConnections} warning`,
        icon: Cable,
      },
      {
        label: "Pipelines",
        value: "12",
        sub: "8 scheduled / 4 manual",
        icon: Workflow,
      },
      {
        label: "Last 24h Runs",
        value: "36",
        sub: "32 success / 4 failed",
        icon: Clock,
      },
    ],
    [
      totalSpaces,
      activeSpaces,
      disabledSpaces,
      totalConnections,
      healthyConnections,
      warningConnections,
    ]
  );

  const spacesPreview: SpacePreview[] =
    spaces.length > 0
      ? spaces.slice(0, 3).map((s: any) => ({
          id: s.id ?? s.slug ?? s.name,
          name: s.name,
          desc: s.description,
          connections: s.connectionCount ?? 0,
          pipelines: s.pipelineCount ?? 0,
        }))
      : [
          {
            id: "mock-customer-360",
            name: "Customer 360",
            desc: "Unified customer view from CRM & POS.",
            connections: 3,
            pipelines: 5,
          },
          {
            id: "mock-client-master",
            name: "Client Master",
            desc: "Golden record master data for clients.",
            connections: 2,
            pipelines: 3,
          },
          {
            id: "mock-finance-staging",
            name: "Finance Staging",
            desc: "Bank statements & GL staging area.",
            connections: 2,
            pipelines: 4,
          },
        ];

  const connectionsPreview: ConnectionPreview[] =
    connections.length > 0
      ? connections.slice(0, 3).map((c: any) => ({
          // ✅ ใส่ id เพื่อใช้เป็น key ถาวร
          id: c.id ?? c.connectionId ?? `${c.type ?? c.kind}-${c.name}`,
          name: c.name,
          type: c.type || c.kind || "Unknown",
          status: c.health || c.status || "Unknown",
          lastUsed: c.lastUsedAt || "—",
        }))
      : [
          {
            id: "mock-postgresql-dwh",
            name: "PostgreSQL_DWH",
            type: "PostgreSQL",
            status: "Healthy",
            lastUsed: "Today · 08:05",
          },
          {
            id: "mock-crm-prod-api",
            name: "CRM_Prod_API",
            type: "REST API",
            status: "Warning",
            lastUsed: "Today · 07:40",
          },
          {
            id: "mock-s3-statement-bucket",
            name: "S3_Statement_Bucket",
            type: "S3 / Object Storage",
            status: "Healthy",
            lastUsed: "Yesterday · 22:30",
          },
        ];

  const handleCreateSpace = (name: string) => {
    createSpace(name);
    setSpaceModalOpen(false);
  };

  return (
    <>
      <div className="-mx-2 -mt-4 min-h-[calc(100vh-3.5rem)] bg-[#0D1117] pb-6 pt-4 text-[#F0EEE9]">
        <div className="space-y-6">
          {/* ---------- 1. Header + Detail bar ---------- */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-[#F0EEE9]">
                  Ingestion dashboard
                </h1>
                <p className="mt-1 text-sm text-[#9BA1A6]">
                  ภาพรวมการเชื่อมต่อข้อมูล (Spaces / Connections / Pipelines)
                  และ run ล่าสุดของ ingestion jobs
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpaceModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#30363D] bg-[#161B22] px-3 py-1.5 text-sm font-medium text-[#F0EEE9] shadow-sm hover:bg-[#1F2933]"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>New space</span>
                </button>
                <button
                  type="button"
                  onClick={() => openCreateConnectionModal()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 via-sky-400 to-sky-300 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:brightness-110"
                >
                  <Cable className="h-4 w-4" />
                  <span>New connection</span>
                </button>
              </div>
            </div>

            {/* Detail bar */}
            <div className="grid gap-3 rounded-2xl border border-[#30363D] bg-[#161B22] px-4 py-3 text-sm text-[#F0EEE9] shadow-sm">
              <div className="grid gap-3 md:grid-cols-4">
                <DetailItem label="Domain" value={DETAIL.domain} />
                <DetailItem label="Module" value={DETAIL.module} />
                <DetailItem label="Last modified" value={DETAIL.modifiedAt} />
                <DetailItem label="Owner" value={DETAIL.owner} />
              </div>
            </div>
          </section>

          {/* ---------- 2. KPI Cards ---------- */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="flex flex-col justify-between rounded-2xl border border-[#30363D] bg-[#161B22] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#6E7681]">
                        {kpi.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#F0EEE9]">
                        {kpi.value}
                      </p>
                      <p className="mt-1 text-xs text-[#9BA1A6]">{kpi.sub}</p>
                    </div>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500/10">
                      <Icon className="h-4 w-4 text-sky-400" />
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ---------- 3. Middle: Runs + Changes ---------- */}
          <section className="grid gap-4 lg:grid-cols-3">
            {/* Latest Runs */}
            <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-400" />
                  <h2 className="text-sm font-semibold text-[#F0EEE9]">
                    Latest runs
                  </h2>
                </div>
                <button className="text-xs font-medium text-sky-400 hover:underline">
                  View all runs
                </button>
              </div>

              <div className="overflow-x-auto dark-scroll">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-[#30363D] bg-[#0B1120] text-[#8B949E]">
                    <tr>
                      <th className="py-2 pr-4">Pipeline</th>
                      <th className="py-2 pr-4">Space</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Last run</th>
                      <th className="py-2 pr-4 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262D]">
                    {latestRunsMock.map((run) => (
                      <tr key={run.name}>
                        <td className="py-2 pr-4 text-[#F0EEE9]">{run.name}</td>
                        <td className="py-2 pr-4 text-[#9BA1A6]">{run.space}</td>
                        <td className="py-2 pr-4">
                          <StatusBadge status={run.status} />
                        </td>
                        <td className="py-2 pr-4 text-[#9BA1A6]">{run.time}</td>
                        <td className="py-2 pr-4 text-right text-[#9BA1A6]">
                          {run.rows}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Changes + Alerts */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-[#F0EEE9]">
                    Recent changes
                  </h2>
                </div>
                <ul className="space-y-2 text-xs">
                  {recentChangesMock.map((item, idx) => (
                    <li
                      key={idx}
                      className="rounded-lg bg-[#0D1117] px-3 py-2 text-[#F0EEE9]"
                    >
                      <p className="line-clamp-2">{item.text}</p>
                      <p className="mt-1 text-[10px] text-[#8B949E]">
                        {item.user} · {item.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-100 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">Health alerts</span>
                </div>
                <ul className="space-y-1">
                  <li>• 2 failed runs in last 24h</li>
                  <li>• 1 connection in warning state (CRM_Prod_API)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ---------- 4. Spaces & Connections Preview ---------- */}
          <section className="grid gap-4 lg:grid-cols-2">
            {/* Spaces */}
            <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#F0EEE9]">Spaces</h2>
                <button className="text-xs font-medium text-sky-400 hover:underline">
                  View all spaces
                </button>
              </div>

              {spacesPreview.length === 0 ? (
                <p className="text-xs text-[#9BA1A6]">
                  ยังไม่มี Space — กดปุ่ม &quot;New space&quot; เพื่อสร้างตัวแรก
                </p>
              ) : (
                <div className="space-y-2">
                  {spacesPreview.map((s, idx) => (
                    <div
                      key={s.id ?? `${s.name}-${idx}`}
                      className="flex items-start justify-between rounded-xl border border-[#30363D] bg-[#0D1117] px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#F0EEE9]">
                          {s.name}
                        </p>
                        <p className="mt-1 text-xs text-[#9BA1A6] line-clamp-2">
                          {s.desc}
                        </p>
                        <p className="mt-1 text-[11px] text-[#6E7681]">
                          {s.connections} connections · {s.pipelines} pipelines
                        </p>
                      </div>
                      <button className="text-xs font-medium text-sky-400 hover:underline">
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connections */}
            <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#F0EEE9]">
                  Connections
                </h2>
                <button className="text-xs font-medium text-sky-400 hover:underline">
                  View all connections
                </button>
              </div>

              {connectionsPreview.length === 0 ? (
                <p className="text-xs text-[#9BA1A6]">
                  ยังไม่มี Connection — กดปุ่ม &quot;New connection&quot;
                  ด้านบนขวา เพื่อเริ่มเชื่อมต่อแหล่งข้อมูล
                </p>
              ) : (
                <div className="space-y-2">
                  {connectionsPreview.map((c, idx) => (
                    <div
                      // ✅ FIX: ใช้ id ถ้ามี ไม่งั้น fallback ที่ไม่ซ้ำแน่
                      key={c.id ?? `${c.name}-${c.type}-${idx}`}
                      className="flex items-start justify-between rounded-xl border border-[#30363D] bg-[#0D1117] px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#F0EEE9]">
                          {c.name}
                        </p>
                        <p className="mt-1 text-xs text-[#9BA1A6]">{c.type}</p>
                        <p className="mt-1 text-[11px] text-[#6E7681]">
                          Last used: {c.lastUsed}
                        </p>
                      </div>
                      <StatusPill status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal สร้าง Space */}
      <CreateSpaceModal
        open={spaceModalOpen}
        onClose={() => setSpaceModalOpen(false)}
        onCreate={handleCreateSpace}
      />
    </>
  );
}

/* ---------- Small presentational components ---------- */

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[#6E7681]">
        {label}
      </span>
      <span className="truncate text-sm font-semibold text-[#F0EEE9]">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: RunStatus | string }) {
  const normalized = String(status).toLowerCase();

  if (normalized === "success") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
        Success
      </span>
    );
  }
  if (normalized === "failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-300">
        Failed
      </span>
    );
  }
  if (normalized === "running") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
        Running
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-[#21262D] px-2 py-0.5 text-[11px] font-medium text-[#F0EEE9]">
      {String(status)}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = String(status).toLowerCase();

  if (normalized === "healthy") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
        Healthy
      </span>
    );
  }
  if (normalized === "warning") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
        Warning
      </span>
    );
  }
  if (normalized === "error" || normalized === "failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-200">
        Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-[#21262D] px-2 py-0.5 text-[11px] font-medium text-[#F0EEE9]">
      {String(status)}
    </span>
  );
}
