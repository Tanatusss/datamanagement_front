// src/components/ingestion/space/AnalyzeModal.tsx
"use client";

import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

type AnalyzeModalProps = {
  open: boolean;
  onClose: () => void;
  column: string | null;
  rows: any[];
};

export function AnalyzeModal({
  open,
  onClose,
  column,
  rows,
}: AnalyzeModalProps) {
  if (!open || !column) return null;

  // ดึงค่าในคอลัมน์นั้น ๆ ทั้งหมด (ไม่เอา null/ว่าง)
  const rawValues = rows
    .map((r) => r?.[column])
    .filter((v) => v !== null && v !== undefined && v !== "") as
    | string[]
    | number[];

  if (rawValues.length === 0) {
    return (
      <BaseModal onClose={onClose} column={column}>
        <p className="text-sm text-slate-200">
          Column นี้ยังไม่มีข้อมูลสำหรับวิเคราะห์
        </p>
      </BaseModal>
    );
  }

  // ---------- ตรวจประเภทข้อมูล ----------
  const numericValues = rawValues
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));

  const dateValues = rawValues
    .map((v) => new Date(String(v)))
    .filter((d) => !Number.isNaN(d.getTime()));

  const numericScore = numericValues.length;
  const dateScore = dateValues.length;

  const isNumeric =
    numericScore > 0 && numericScore >= rawValues.length * 0.5;
  const isDate = !isNumeric && dateScore > 0 && dateScore >= rawValues.length * 0.5;
  const isCategory = !isNumeric && !isDate;

  // ===================== NUMERIC =====================
  if (isNumeric) {
    const values = numericValues;
    const stats = computeStatistics(values);
    const total = values.length;

    // histogram
    const binCount = 10;
    const min = stats.min;
    const max = stats.max;
    const binSize = (max - min || 1) / binCount;
    const bins = new Array(binCount).fill(0);

    values.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      bins[idx]++;
    });

    const histData = {
      labels: bins.map(
        (_b, i) =>
          `${(min + i * binSize).toFixed(0)} - ${(
            min +
            (i + 1) * binSize
          ).toFixed(0)}`
      ),
      datasets: [
        {
          label: "Frequency",
          data: bins,
          // sky-500 แบบโปร่งๆ
          backgroundColor: "#0EA5E980",
        },
      ],
    };

    // top values (เหมือน Dataiku: TOP VALUES)
    const countsByValue: Record<string, number> = {};
    values.forEach((v) => {
      const key = String(v);
      countsByValue[key] = (countsByValue[key] ?? 0) + 1;
    });
    const sortedValues = Object.entries(countsByValue).sort(
      (a, b) => b[1] - a[1]
    );
    const topValues = sortedValues.slice(0, 5);

    // outliers summary
    const outCount = stats.outliers.length;
    const hasOutliers = outCount > 0;
    const outMin = hasOutliers ? Math.min(...stats.outliers) : null;
    const outMax = hasOutliers ? Math.max(...stats.outliers) : null;

    return (
      <BaseModal onClose={onClose} column={column}>
        {/* SUMMARY + HISTOGRAM */}
        <div className="mb-6 grid grid-cols-12 gap-6">
          {/* SUMMARY ฝั่งซ้าย */}
          <div className="col-span-4">
            <SectionTitle>SUMMARY</SectionTitle>
            <div className="mt-3 space-y-1 text-xs text-slate-200">
              <SummaryRow label="Total rows" value={values.length} />
              <SummaryRow label="Min" value={stats.min.toFixed(2)} />
              <SummaryRow label="Q1" value={stats.q1.toFixed(2)} />
              <SummaryRow label="Median" value={stats.median.toFixed(2)} />
              <SummaryRow label="Q3" value={stats.q3.toFixed(2)} />
              <SummaryRow label="Max" value={stats.max.toFixed(2)} />
              <SummaryRow label="Mean" value={stats.mean.toFixed(2)} />
              <SummaryRow label="Std dev" value={stats.std.toFixed(2)} />
            </div>
          </div>

          {/* กราฟฝั่งขวา */}
          <div className="col-span-8">
            <SectionTitle>NUMERICAL</SectionTitle>
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
              <h3 className="mb-2 text-sm font-medium text-slate-100">
                Distribution
              </h3>
              <Bar
                data={histData}
                options={{
                  plugins: {
                    legend: {
                      labels: { color: "#e5e7eb" }, // text-slate-200
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: "#cbd5e1" }, // text-slate-300
                      grid: { color: "rgba(255,255,255,0.05)" },
                    },
                    y: {
                      ticks: { color: "#cbd5e1" },
                      grid: { color: "rgba(255,255,255,0.05)" },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* DETAIL ZONE ด้านล่างสไตล์ Dataiku */}
        <div className="mt-4">
          <SectionTitle>DETAIL</SectionTitle>

          <div className="mt-3 grid grid-cols-12 gap-6 text-xs text-slate-200">
            {/* STATISTICS */}
            <div className="col-span-4 space-y-1">
              <SubSectionTitle>Statistics</SubSectionTitle>
              <SummaryRow label="Min" value={stats.min.toFixed(2)} />
              <SummaryRow label="Q1" value={stats.q1.toFixed(2)} />
              <SummaryRow label="Median" value={stats.median.toFixed(2)} />
              <SummaryRow label="Mean" value={stats.mean.toFixed(2)} />
              <SummaryRow label="Q3" value={stats.q3.toFixed(2)} />
              <SummaryRow label="Max" value={stats.max.toFixed(2)} />
              <SummaryRow label="Std dev" value={stats.std.toFixed(2)} />
              <SummaryRow label="IQR" value={stats.iqr.toFixed(2)} />
            </div>

            {/* TOP VALUES */}
            <div className="col-span-4 space-y-1">
              <SubSectionTitle>Top values</SubSectionTitle>
              {topValues.length === 0 ? (
                <span className="text-[11px] text-slate-400">No data</span>
              ) : (
                topValues.map(([val, count]) => {
                  const pct = ((count / total) * 100).toFixed(1);
                  return (
                    <div
                      key={val}
                      className="flex items-center justify-between"
                    >
                      <span className="font-mono text-slate-100">
                        {val}
                      </span>
                      <span className="ml-3 text-[11px] text-slate-400">
                        {count} rows ({pct}%)
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* OUTLIERS */}
            <div className="col-span-4 space-y-1">
              <SubSectionTitle>Outliers</SubSectionTitle>
              <SummaryRow label="Count" value={outCount} />
              <SummaryRow
                label="Lower fence"
                value={stats.lowerFence.toFixed(2)}
              />
              <SummaryRow
                label="Upper fence"
                value={stats.upperFence.toFixed(2)}
              />
              {hasOutliers && (
                <>
                  <SummaryRow
                    label="Min outlier"
                    value={outMin!.toFixed(2)}
                  />
                  <SummaryRow
                    label="Max outlier"
                    value={outMax!.toFixed(2)}
                  />
                </>
              )}
              {!hasOutliers && (
                <div className="text-[11px] text-slate-400">
                  ไม่มีค่าที่เกินช่วง outlier fence
                </div>
              )}
            </div>
          </div>
        </div>
      </BaseModal>
    );
  }

  // ===================== DATE =====================
  if (isDate) {
    const countsByDay: Record<string, number> = {};

    dateValues.forEach((d) => {
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      countsByDay[key] = (countsByDay[key] ?? 0) + 1;
    });

    const sortedDays = Object.keys(countsByDay).sort();
    const labels = sortedDays;
    const counts = sortedDays.map((d) => countsByDay[d]);

    const data = {
      labels,
      datasets: [
        {
          label: "Rows per day",
          data: counts,
          // sky-400 เส้น + fill โปร่ง
          borderColor: "#38BDF8",
          backgroundColor: "#38BDF830",
          tension: 0.25,
        },
      ],
    };

    const total = counts.reduce((a, b) => a + b, 0);
    const minDay = labels[0];
    const maxDay = labels[labels.length - 1];

    return (
      <BaseModal onClose={onClose} column={column}>
        <div className="mb-6 grid grid-cols-12 gap-6">
          {/* SUMMARY ฝั่งซ้าย */}
          <div className="col-span-4">
            <SectionTitle>SUMMARY</SectionTitle>
            <div className="mt-3 space-y-1 text-xs text-slate-200">
              <SummaryRow label="Total rows" value={total} />
              <SummaryRow label="Unique days" value={labels.length} />
              <SummaryRow
                label="Average per day"
                value={(total / labels.length).toFixed(2)}
              />
              <SummaryRow label="First date" value={minDay} />
              <SummaryRow label="Last date" value={maxDay} />
            </div>
          </div>

          {/* TIME SERIES ฝั่งขวา */}
          <div className="col-span-8">
            <SectionTitle>TIME SERIES</SectionTitle>
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
              <h3 className="mb-2 text-sm font-medium text-slate-100">
                Count per day
              </h3>
              <Line data={data} />
            </div>
          </div>
        </div>

        {/* STATISTICS (simple text grid) */}
        <div className="mt-4">
          <SectionTitle>STATISTICS</SectionTitle>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <StatText label="Total rows" value={String(total)} />
            <StatText label="Unique days" value={String(labels.length)} />
            <StatText
              label="Average per day"
              value={(total / labels.length).toFixed(2)}
            />
          </div>
        </div>
      </BaseModal>
    );
  }

  // ===================== CATEGORY =====================
  const countsByCategory: Record<string, number> = {};
  (rawValues as (string | number)[]).forEach((v) => {
    const key = String(v);
    countsByCategory[key] = (countsByCategory[key] ?? 0) + 1;
  });

  const sortedCategories = Object.entries(countsByCategory).sort(
    (a, b) => b[1] - a[1]
  );

  const topN = 10;
  const top = sortedCategories.slice(0, topN);

  const labels = top.map(([name]) => name);
  const counts = top.map(([, c]) => c);

  const catData = {
    labels,
    datasets: [
      {
        label: "Count",
        data: counts,
        backgroundColor: "#0EA5E980", // sky-500 โปร่ง
      },
    ],
  };

  const totalRows = rawValues.length;
  const distinct = sortedCategories.length;
  const [topName, topCount] = top[0] || ["-", 0];

  return (
    <BaseModal onClose={onClose} column={column}>
      <div className="mb-6 grid grid-cols-12 gap-6">
        {/* SUMMARY ฝั่งซ้าย */}
        <div className="col-span-4">
          <SectionTitle>SUMMARY</SectionTitle>
          <div className="mt-3 space-y-1 text-xs text-slate-200">
            <SummaryRow label="Total rows" value={totalRows} />
            <SummaryRow label="Distinct categories" value={distinct} />
            <SummaryRow
              label="Top category"
              value={`${topName} (${topCount})`}
            />
          </div>
        </div>

        {/* DISTRIBUTION ฝั่งขวา */}
        <div className="col-span-8">
          <SectionTitle>CATEGORICAL</SectionTitle>
          <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h3 className="mb-2 text-sm font-medium text-slate-100">
              Category distribution (Top {top.length})
            </h3>
            <Bar data={catData} />
          </div>
        </div>
      </div>

      {/* STATISTICS (simple text grid) */}
      <div className="mt-4">
        <SectionTitle>STATISTICS</SectionTitle>
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <StatText label="Total rows" value={String(totalRows)} />
          <StatText label="Distinct categories" value={String(distinct)} />
          <StatText
            label="Most frequent"
            value={`${topName} (${topCount})`}
          />
        </div>
      </div>
    </BaseModal>
  );
}

// =====================================================
// Utilities / Sub components
// =====================================================

function computeStatistics(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const outliers = values.filter((v) => v < lowerFence || v > upperFence);

  return {
    min,
    max,
    mean,
    median,
    q1,
    q3,
    iqr,
    std,
    lowerFence,
    upperFence,
    outliers,
  };
}

type BaseModalProps = {
  onClose: () => void;
  column: string;
  children: React.ReactNode;
};

function BaseModal({ onClose, column, children }: BaseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">
            Analyze:{" "}
            <span className="font-mono text-sky-300">{column}</span>
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {children}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-600 px-4 py-1.5 text-xs text-slate-100 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// text-only stat block สำหรับด้านล่าง
type StatTextProps = {
  label: string;
  value: string;
};

function StatText({ label, value }: StatTextProps) {
  return (
    <div className="flex flex-col text-xs">
      <span className="text-[11px] text-slate-300">{label}</span>
      <span className="mt-0.5 text-sm font-mono font-semibold text-slate-50">
        {value}
      </span>
    </div>
  );
}

type SectionTitleProps = {
  children: React.ReactNode;
};

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
      {children}
    </div>
  );
}

type SubSectionTitleProps = {
  children: React.ReactNode;
};

function SubSectionTitle({ children }: SubSectionTitleProps) {
  return (
    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
      {children}
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string | number;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <span className="ml-3 font-mono font-semibold text-slate-50">
        {typeof value === "number" ? value : String(value)}
      </span>
    </div>
  );
}
