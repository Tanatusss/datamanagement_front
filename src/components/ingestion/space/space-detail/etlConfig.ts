// src/components/ingestion/space/space-detail/etlConfig.ts
import type { EtlActionType } from "@/components/ingestion/space/EtlActionIcon";

export const ETL_ACTIONS: EtlActionType[] = [
  // ===== Common (Core) =====
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

  // ===== Other Transforms =====
  "copyColumn",
  "pivot",
  "unpivot",
  "audit",
  "characterMap",
  "percentageSampling",
  "rowSampling",
  "importColumn",
  "exportColumn",
  "fuzzyLookup",
  "fuzzyGrouping",
];

export const ETL_GROUPS: { label: string; actions: EtlActionType[] }[] = [
  {
    label: "TRANSFORM",
    actions: ["aggregate", "derived", "lookup", "conditional", "sort", "convert"],
  },
  {
    label: "MERGE & FLOW",
    actions: ["merge", "mergeJoin", "union", "multicast"],
  },
  {
    label: "UTILITY",
    actions: ["rowCount", "script", "scd"],
  },
  {
    label: "RESHAPE",
    actions: ["copyColumn", "pivot", "unpivot"],
  },
  {
    label: "DATA QUALITY",
    actions: ["audit", "characterMap", "fuzzyLookup", "fuzzyGrouping"],
  },
  {
    label: "SAMPLING / COLUMN OPS",
    actions: ["percentageSampling", "rowSampling", "importColumn", "exportColumn"],
  },
];
