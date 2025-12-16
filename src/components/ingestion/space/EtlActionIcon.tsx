// src/components/ingestion/space/EtlActionIcon.tsx
"use client";

import React from "react";
import {
  Sigma,
  Repeat2,
  GitMerge,
  GitBranch,
  Scale,
  Search,
  Share2,
  Hash,
  Code2,
  History,
  ArrowUpDown,
  Layers,
  Combine,
  FunctionSquare,
  Database,
  HardDriveUpload,
} from "lucide-react";

export type EtlActionType =
  | "aggregate"
  | "balanced"
  | "conditional"
  | "convert"
  | "derived"
  | "lookup"
  | "merge"
  | "mergeJoin"
  | "multicast"
  | "rowCount"
  | "script"
  | "scd"
  | "sort"
  | "union"
  | "source"
  | "destination";



  
type Props = {
  action: EtlActionType;
  compact?: boolean;
};

const CONFIG: Record<
  EtlActionType,
  {
    label: string;
    icon: React.ReactNode;
    wrapper: string;
    dot: string;
  }
> = {
  aggregate: {
    label: "Aggregate",
    icon: <Sigma className="h-3.5 w-3.5" />,
    wrapper: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-400",
  },
  balanced: {
    label: "Balanced",
    icon: <Scale className="h-3.5 w-3.5" />,
    wrapper: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    dot: "bg-cyan-400",
  },
  conditional: {
    label: "Conditional",
    icon: <GitBranch className="h-3.5 w-3.5" />,
    wrapper: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot: "bg-indigo-400",
  },
  convert: {
    label: "Convert",
    icon: <Repeat2 className="h-3.5 w-3.5" />,
    wrapper: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  derived: {
    label: "Derived",
    icon: <FunctionSquare className="h-3.5 w-3.5" />,
    wrapper: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-400",
  },
  lookup: {
    label: "Lookup",
    icon: <Search className="h-3.5 w-3.5" />,
    wrapper: "bg-teal-50 text-teal-700 border border-teal-200",
    dot: "bg-teal-400",
  },
  merge: {
    label: "Merge",
    icon: <GitMerge className="h-3.5 w-3.5" />,
    wrapper: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-400",
  },
  mergeJoin: {
    label: "Merge Join",
    icon: <Combine className="h-3.5 w-3.5" />,
    wrapper: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-400",
  },
  multicast: {
    label: "Multicast",
    icon: <Share2 className="h-3.5 w-3.5" />,
    wrapper: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
  },
  rowCount: {
    label: "Row Count",
    icon: <Hash className="h-3.5 w-3.5" />,
    wrapper: "bg-slate-50 text-slate-700 border border-slate-200",
    dot: "bg-slate-400",
  },
  script: {
    label: "Script",
    icon: <Code2 className="h-3.5 w-3.5" />,
    wrapper: "bg-neutral-50 text-neutral-700 border border-neutral-200",
    dot: "bg-neutral-400",
  },
  scd: {
    label: "SCD",
    icon: <History className="h-3.5 w-3.5" />,
    wrapper: "bg-rose-50 text-rose-700 border border-rose-200",
    dot: "bg-rose-400",
  },
  sort: {
    label: "Sort",
    icon: <ArrowUpDown className="h-3.5 w-3.5" />,
    wrapper: "bg-lime-50 text-lime-700 border border-lime-200",
    dot: "bg-lime-400",
  },
  union: {
    label: "Union",
    icon: <Layers className="h-3.5 w-3.5" />,
    wrapper: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
    dot: "bg-fuchsia-400",
  },
  source: {
    label: "Source",
    icon: <Database className="h-3.5 w-3.5" />,
    wrapper: "bg-zinc-50 text-zinc-700 border border-zinc-200",
    dot: "bg-zinc-400",
  },
  destination: {
    label: "Destination",
    icon: <HardDriveUpload className="h-3.5 w-3.5" />,
    wrapper: "bg-orange-50 text-orange-700 border border-orange-200",
    dot: "bg-orange-400",
  },
};


export function normalizeEtlAction(
  raw?: string
): EtlActionType | undefined {
  if (!raw) return undefined;

  switch (raw) {
    case "convert":
      return "convert";
    case "merge_join":
      return "mergeJoin";
    case "row_count":
      return "rowCount";
    default:
      return raw as EtlActionType;
  }
}


export function EtlActionIcon({ action, compact = false }: Props) {
  const cfg = CONFIG[action];

  // ⭐ กันพัง + debug ง่าย
  if (!cfg) {
    console.warn("Unknown ETL action:", action);

    return (
      <div className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700">
        Unknown
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={[
          "inline-flex items-center justify-center rounded-full border px-1.5 py-0.5",
          "shadow-sm text-[9px] font-semibold",
          cfg.wrapper,
        ].join(" ")}
      >
        {cfg.icon}
      </div>
    );
  }

  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "shadow-sm text-[10px] font-semibold backdrop-blur-sm",
        cfg.wrapper,
      ].join(" ")}
    >
      <span className={["h-1.5 w-1.5 rounded-full", cfg.dot].join(" ")} />
      {cfg.icon}
      <span>{cfg.label}</span>
    </div>
  );
}
