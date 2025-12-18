"use client";

import { TabKey } from "./types";

export function NodeTabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {(["summary", "explore", "chart"] as TabKey[]).map((key) => {
        const label =
          key === "summary" ? "Summary" : key === "explore" ? "Explore" : "Chart";
        const isActive = activeTab === key;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
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
  );
}
