"use client";

import { useMemo } from "react";
import { Row } from "./types";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export function NodeChartsSection({
  rows,
  loading,
}: {
  rows: Row[];
  loading?: boolean;
}) {
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: "#e2e8f0" } },
        tooltip: {
          enabled: true,
          titleColor: "#e2e8f0",
          bodyColor: "#e2e8f0",
          backgroundColor: "rgba(2, 6, 23, 0.9)",
          borderColor: "rgba(51, 65, 85, 0.8)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(148,163,184,0.12)" },
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(148,163,184,0.12)" },
        },
      },
    }),
    []
  );

  const lineLabels = rows.map((r) => r.date);

  const amountLineData = useMemo(
    () => ({
      labels: lineLabels,
      datasets: [
        {
          label: "Amount",
          data: rows.map((r) => r.amount),
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 2,
          borderColor: "rgba(14, 165, 233, 0.95)",
          pointBackgroundColor: "rgba(14, 165, 233, 0.95)",
        },
        {
          label: "Balance",
          data: rows.map((r) => r.balance),
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 2,
          borderColor: "rgba(148, 163, 184, 0.95)",
          pointBackgroundColor: "rgba(148, 163, 184, 0.95)",
        },
      ],
    }),
    [lineLabels.join("|"), rows]
  );

  const categoryBarData = useMemo(() => {
    const byCategory = rows.reduce<Record<string, number>>((acc, r) => {
      const key = r.category || "Unknown";
      acc[key] = (acc[key] ?? 0) + Number(r.amount ?? 0);
      return acc;
    }, {});
    return {
      labels: Object.keys(byCategory),
      datasets: [
        {
          label: "Sum(amount)",
          data: Object.values(byCategory),
          backgroundColor: "rgba(14, 165, 233, 0.35)",
          borderColor: "rgba(14, 165, 233, 0.85)",
          borderWidth: 1,
        },
      ],
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-50">Amount & Balance</p>
              <p className="text-[11px] text-slate-400">By date</p>
            </div>
            {loading && <span className="text-[11px] text-slate-400">Loading...</span>}
          </div>
          <div className="h-[280px]">
            <Line data={amountLineData as any} options={chartOptions as any} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4">
          <div className="mb-2">
            <p className="text-sm font-semibold text-slate-50">Category breakdown</p>
            <p className="text-[11px] text-slate-400">Sum(amount) by category</p>
          </div>
          <div className="h-[280px]">
            <Bar data={categoryBarData as any} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
