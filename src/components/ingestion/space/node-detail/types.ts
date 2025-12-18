// src/components/ingestion/node-detail/types.ts
export type TabKey = "summary" | "explore" | "chart";

export type Row = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  balance: number;
};

export const COLUMNS = [
  { id: "id", label: "id", type: "integer" },
  { id: "date", label: "date", type: "date" },
  { id: "description", label: "description", type: "string" },
  { id: "category", label: "category", type: "string" },
  { id: "amount", label: "amount", type: "number" },
  { id: "balance", label: "balance", type: "number" },
] as const;

export type ColumnId = (typeof COLUMNS)[number]["id"];

export type SortConfig =
  | { columnId: ColumnId; direction: "asc" | "desc" }
  | null;

export type FilterConfig =
  | { columnId: ColumnId; value: string }
  | null;

  