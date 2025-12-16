// src/components/ingestion/space/space-detail/flowTypes.ts
import type { Edge, Node } from "@xyflow/react";
import type { EtlActionType } from "@/components/ingestion/space/EtlActionIcon";
import type { FlowNodeData } from "@/components/ingestion/space/FlowNode";

export type NodeTemplate = {
  id: string;
  connectionId: string;
  schema: string;
  table: string;
};

/**
 * ⚠️ ใช้เป็น data ภายใน edge เท่านั้น
 * React Flow จะไม่ enforce type นี้
 */
export type EtlEdgeData = {
  spaceSlug: string;
  action?: EtlActionType;
  onDelete?: (edgeId: string) => void;
  onOpenEtlPanel?: (edgeId: string) => void;
};

/**
 * ✅ สำคัญ: AppEdge ต้องเป็น Edge<any>
 * ไม่งั้น CurvedEdge / ReactFlow จะพัง
 */
export type AppEdge = Edge<any>;
export type AppNode = Node<FlowNodeData, "dbNode">;

export type LeftPanel = "none" | "transform" | "sql";
export type PalettePanel = "node" | "etl";
