// src/components/ingestion/space/space-detail/etlConfig.ts
import type { EtlActionType } from "@/components/ingestion/space/EtlActionIcon";

export const ETL_ACTIONS: EtlActionType[] = [
  "aggregate",
  "conditional",
  "convert",
  "derived",
  "lookup",
  "merge",
  "mergeJoin",
  "multicast",
  "rowCount",
  "script",
  "scd",
  "sort",
  "union",
];

export const ETL_GROUPS: { label: string; actions: EtlActionType[] }[] = [
  {
    label: "Transform",
    actions: ["aggregate", "derived", "lookup", "conditional", "sort"],
  },
  {
    label: "Merge & Flow",
    actions: ["merge", "mergeJoin", "union", "multicast"],
  },
  {
    label: "Utility",
    actions: ["convert", "rowCount", "script", "scd"],
  },
];
