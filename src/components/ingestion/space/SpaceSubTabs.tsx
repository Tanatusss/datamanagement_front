"use client";

import { Code2, Workflow, Wand2 } from "lucide-react";

type TabKey = "transform" | "sql";

export function SpaceSubTabs({
  tab,
  onTab,
}: {
  tab: TabKey;
  onTab: (t: TabKey) => void;
}) {
  const Item = ({
    k,
    label,
    icon,
  }: {
    k: TabKey;
    label: string;
    icon: React.ReactNode;
  }) => {
    const active = tab === k;
    return (
      <button
        type="button"
        onClick={() => onTab(k)}
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
          "border transition-colors",
          active
            ? "border-sky-400/60 bg-sky-500/15 text-sky-200"
            : "border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70",
        ].join(" ")}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Item k="transform" label="Transform" icon={<Wand2 className="h-4 w-4" />} />
      <Item k="sql" label="SQL" icon={<Code2 className="h-4 w-4" />} />
    </div>
  );
}
