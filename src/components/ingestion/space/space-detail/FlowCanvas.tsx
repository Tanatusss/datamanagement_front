// src/components/ingestion/space/space-detail/FlowCanvas.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  reconnectEdge,
  useNodesState,
  useEdgesState,
  Position,
  type Connection,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { WorkspaceNode, WorkspaceNodeData } from "@/components/ingestion/space/WorkspaceNode";
import { Database, ChevronRight, Plus, Wrench } from "lucide-react";

import {
  FlowNode,
  type FlowNodeData,
} from "@/components/ingestion/space/FlowNode";
import { OrthogonalEdge } from "@/components/ingestion/space/OrthogonalEdge";
import {
  TemplateModal,
  type ConnectionItem,
} from "@/components/ingestion/space/TemplateModal";
import { SchemaPreviewModal } from "@/components/ingestion/space/SchemaPreviewModal";
import {
  EtlActionIcon,
  normalizeEtlAction,
  type EtlActionType,
} from "@/components/ingestion/space/EtlActionIcon";
import { getDbIconForType, type DbType } from "@/components/ingestion/dbCatalog";

import type {
  NodeTemplate,
  PalettePanel,
  AppEdge,
  AppNode,
} from "./flowTypes";
import { ETL_ACTIONS, ETL_GROUPS } from "./etlConfig";

/** ✅ NodeSpec ที่ WorkspacePanel จะส่งมา */
export type NodeSpec = {
  kind: "dataset" | "field" | "source" | "sql_draft";
  label: string;
  payload?: any;
};

type Props = {
  slug: string;

  connections: any[];
  resolveConnectionName: (id: string) => string;
  resolveConnectionById: (id: string) => any | undefined;

  templates: NodeTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<NodeTemplate[]>>;

  /** ✅ ให้ parent ขอ handler ไปใช้ (Workspace กด Generate -> ส่งมาที่นี่) */
  onProvideGenerateHandler?: (
    fn: (nodes: NodeSpec[], meta?: { mode?: "transform" | "sql"; raw?: string }) => void
  ) => void;
};

const nodeTypes = { dbNode: FlowNode, workspaceNode: WorkspaceNode };
const edgeTypes = { etlSmooth: OrthogonalEdge };

export function FlowCanvas({
  slug,
  connections,
  resolveConnectionName,
  resolveConnectionById,
  templates,
  setTemplates,
  onProvideGenerateHandler,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);

  const edgeReconnectSuccessful = useRef(true);

  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<AppNode, AppEdge> | null>(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const [schema, setSchema] = useState("");
  const [table, setTable] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // selection
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // palette
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [palettePanel, setPalettePanel] = useState<PalettePanel>("node");

  // minimap
  const [minimapOpen, setMinimapOpen] = useState(true);

  // ---------- edge data helper ----------
  const withEdgeCallbacks = useCallback(
    (edgeId: string, partial?: Partial<AppEdge["data"]>) => {
      return {
        ...(partial || {}),
        onPlus: (id: string) => {
          setSelectedEdgeId(id);
          setPalettePanel("etl");
          setPaletteOpen(true);
        },
        onClearAction: (id: string) => {
          setEdges((prev) =>
            prev.map((e) =>
              e.id === id
                ? {
                  ...e,
                  type: "etlSmooth",
                  data: { ...(e.data || {}), action: undefined },
                }
                : e
            )
          );
        },
      };
    },
    [setEdges]
  );

  // ---------- ✅ Generate nodes from Workspace ----------
const handleGenerateNodes = useCallback(
  (specs: NodeSpec[], _meta?: { mode?: "transform" | "sql"; raw?: string }) => {
    const COL_X: Record<NodeSpec["kind"], number> = {
      dataset: 120,
      field: 420,
      source: 740,
      sql_draft: 1020,
    };

    const baseY = 120 + Math.max(0, nodes.length) * 6;
    const ROW_GAP = 86;

    // helper: แยก schema/table จาก label (ถ้ามี "schema.table")
    const splitSchemaTable = (label: string) => {
      const trimmed = (label ?? "").trim();
      const dotIdx = trimmed.indexOf(".");
      if (dotIdx > 0) {
        return {
          schema: trimmed.slice(0, dotIdx),
          table: trimmed.slice(dotIdx + 1),
        };
      }
      return { schema: "", table: trimmed };
    };

    setNodes((prev) => {
      const countByKind: Record<NodeSpec["kind"], number> = {
        dataset: 0,
        field: 0,
        source: 0,
        sql_draft: 0,
      };

      for (const n of prev as any[]) {
        const k = (n?.data as any)?.kind as NodeSpec["kind"] | undefined;
        if (k && k in countByKind) countByKind[k] += 1;
      }

      const created: AppNode[] = specs.map((s) => {
        const idx = countByKind[s.kind];
        countByKind[s.kind] += 1;

        const id = crypto.randomUUID();
        const { schema: sSchema, table: sTable } = splitSchemaTable(s.label);

        const data: WorkspaceNodeData = {
          label: sTable || s.label, // ใช้ label โชว์บน node
          kind: s.kind,
          payload: s.payload ?? null,
          // ถ้าอยากโชว์ schema ด้วย ให้คอมเมนต์บรรทัดบน แล้วใช้บรรทัดนี้แทน:
          // label: sSchema ? `${sSchema}.${sTable || s.label}` : (sTable || s.label),
        };

        return {
          id,
          type: "workspaceNode",
          position: { x: COL_X[s.kind], y: baseY + idx * ROW_GAP },

          // ✅ บังคับ handle ซ้าย/ขวา
          targetPosition: Position.Left,
          sourcePosition: Position.Right,

          data,
        } as AppNode;
      });

      return [...prev, ...created];
    });
  },
  [nodes.length, setNodes]
);



  // ✅ expose generate handler to parent (SpaceDetailPage)
  useEffect(() => {
    if (!onProvideGenerateHandler) return;
    onProvideGenerateHandler(handleGenerateNodes);
  }, [onProvideGenerateHandler, handleGenerateNodes]);

  // ---------- Modal helpers ----------
  const resetModal = () => {
    setSelectedConnectionId("");
    setSchema("");
    setTable("");
    setPreviewOpen(false);
  };

  const handleOpenModal = () => {
    resetModal();
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    resetModal();
  };

  const handleOk = () => {
    if (!selectedConnectionId || !schema || !table) return;

    setTemplates((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        connectionId: selectedConnectionId,
        schema,
        table,
      },
    ]);

    setModalOpen(false);
    resetModal();
  };

  const handlePreview = () => {
    if (!modalOpen) return;
    setPreviewOpen(true);
  };

  // ---------- React Flow: connect / reconnect ----------
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const id = crypto.randomUUID();

        const next = addEdge(
          {
            ...params,
            id,
            type: "etlSmooth",
            style: { stroke: "#38bdf8", strokeWidth: 2.5 },
            markerEnd: { type: "arrowclosed", color: "#38bdf8" },
            data: {
              spaceSlug: slug,
              action: undefined,
              ...withEdgeCallbacks(id),
            },
          },
          eds
        );

        setSelectedEdgeId(id);
        return next;
      }),
    [slug, withEdgeCallbacks]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: AppEdge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;

      setEdges((els) => {
        const next = reconnectEdge(oldEdge, newConnection, els) as AppEdge[];

        // บังคับ type + callback กลับ (กันหลุด)
        return next.map((e) =>
          e.id === oldEdge.id
            ? {
              ...e,
              type: "etlSmooth",
              data: {
                ...(e.data || {}),
                ...withEdgeCallbacks(e.id),
              },
            }
            : e
        );
      });
    },
    [withEdgeCallbacks]
  );

  // ✅ ถ้า reconnect fail → ลบ edge (ตาม logic เดิมของคุณ)
  const onReconnectEnd = useCallback((_event: any, edge: AppEdge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, []);

  // ✅ คลิก node → update query โดย "ไม่ทิ้ง left เดิม"
  const onNodeClick: NodeMouseHandler<AppNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();

      const d = node.data as any; // FlowNodeData

      // ✅ 1) เก็บ payload ลง sessionStorage ให้ NodeDetail อ่านได้
      try {
        const key = `nodePreview:${slug}:${node.id}`;
        sessionStorage.setItem(
          key,
          JSON.stringify({
            connectionId: d.connectionId,
            connectionName: d.connectionName,
            schema: d.schema,
            table: d.table,
          })
        );
      } catch { }

      // ✅ 2) ใส่ query เพิ่ม (ไม่ทิ้ง left เดิม)
      const qp = new URLSearchParams(searchParams.toString());
      qp.set("nodeId", node.id);
      qp.set("schema", d.schema || "public");
      qp.set("table", d.table || "");
      if (d.connectionId) qp.set("connectionId", d.connectionId);
      if (d.connectionName) qp.set("connection", d.connectionName);

      router.push(`${pathname}?${qp.toString()}`);
    },
    [router, pathname, searchParams, slug]
  );

  // (ถ้ายังอยากใช้ดับเบิ้ลคลิกด้วยก็ผูกให้เหมือนกัน)
  const onNodeDoubleClick: NodeMouseHandler<AppNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();

      const d = node.data as FlowNodeData;

      const qp = new URLSearchParams(searchParams.toString());
      qp.set("nodeId", node.id);
      qp.set("schema", d.schema || "public");
      qp.set("table", d.table || "");

      router.push(`${pathname}?${qp.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const onEdgeClick: EdgeMouseHandler<AppEdge> = useCallback((_event, edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, []);

  // ---------- drag helpers ----------
  const handleTemplateDragStart = (templateId: string, e: React.DragEvent) => {
    e.dataTransfer.setData("application/templateId", templateId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleEtlDragStart = (action: EtlActionType, e: React.DragEvent) => {
    e.dataTransfer.setData("application/etl-action", action);
    e.dataTransfer.setData("text/plain", action);
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const findClosestEdgeId = useCallback(
    (pos: { x: number; y: number }): string | null => {
      if (!nodes.length || !edges.length) return null;

      let bestId: string | null = null;
      let bestDist = Infinity;

      for (const e of edges) {
        const sourceNode = nodes.find((n) => n.id === e.source);
        const targetNode = nodes.find((n) => n.id === e.target);
        if (!sourceNode || !targetNode) continue;

        const sx = sourceNode.position.x + (sourceNode.width ?? 0) / 2;
        const sy = sourceNode.position.y + (sourceNode.height ?? 0) / 2;
        const tx = targetNode.position.x + (targetNode.width ?? 0) / 2;
        const ty = targetNode.position.y + (targetNode.height ?? 0) / 2;

        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;

        const dx = pos.x - mx;
        const dy = pos.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bestDist) {
          bestDist = dist;
          bestId = e.id;
        }
      }

      return bestDist <= 260 ? bestId : null;
    },
    [nodes, edges]
  );

  const handleDropOnFlow = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!rfInstance) return;

      const flowPos = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 1) ETL drag/drop
      let actionRaw = event.dataTransfer.getData("application/etl-action") || "";
      if (!actionRaw) actionRaw = event.dataTransfer.getData("text/plain") || "";

      if (actionRaw) {
        const normalized = normalizeEtlAction(actionRaw);
        if (normalized && ETL_ACTIONS.includes(normalized)) {
          const targetId = findClosestEdgeId(flowPos);
          if (!targetId) return;

          setEdges((eds) =>
            eds.map((e) =>
              e.id === targetId
                ? {
                  ...e,
                  type: "etlSmooth",
                  data: {
                    ...(e.data || {}),
                    action: normalized,
                    spaceSlug: slug,
                    ...withEdgeCallbacks(e.id),
                  },
                }
                : e
            )
          );

          setSelectedEdgeId(targetId);
          return;
        }
      }

      // 2) template → node
      const templateId = event.dataTransfer.getData("application/templateId");
      if (!templateId) return;

      const tmpl = templates.find((t) => t.id === templateId);
      if (!tmpl) return;

      const id = crypto.randomUUID();
      const conn = resolveConnectionById(tmpl.connectionId);
      const connectionName = resolveConnectionName(tmpl.connectionId);

      let dbType: DbType | undefined;
      let dbIcon: string | undefined;

      if (conn) {
        dbType = conn.type as DbType;
        dbIcon = getDbIconForType(dbType);
      }

      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "dbNode",
          position: flowPos,
          data: {
            connectionId: tmpl.connectionId, // ✅ เพิ่มบรรทัดนี้
            connectionName,
            schema: tmpl.schema,
            table: tmpl.table,
            dbIcon,
            dbType,
            onOpen: () => {
              // 1) เก็บ payload ให้ NodeDetail อ่าน (ยังไม่มี API ก็ใส่ meta ก่อน)
              try {
                const key = `nodePreview:${slug}:${id}`;
                sessionStorage.setItem(
                  key,
                  JSON.stringify({
                    connectionId: tmpl.connectionId,
                    connectionName,
                    table: tmpl.table,
                  })
                );
              } catch { }

              // 2) push ไปหน้า detail พร้อม query
              const qp = new URLSearchParams();
              qp.set("nodeId", id);
              qp.set("connectionId", tmpl.connectionId);
              qp.set("connection", connectionName);
              qp.set("table", tmpl.table);

              router.push(
                `/ingestion/space/${encodeURIComponent(slug)}/${encodeURIComponent(
                  tmpl.schema
                )}?${qp.toString()}`
              );
            },

            onDelete: () => {
              setNodes((current) => current.filter((n) => n.id !== id));
              setEdges((eds) =>
                eds.filter((e) => e.source !== id && e.target !== id)
              );
            },
          },
        },
      ]);
    },
    [
      rfInstance,
      templates,
      resolveConnectionById,
      resolveConnectionName,
      findClosestEdgeId,
      slug,
      withEdgeCallbacks,
      router,
    ]
  );

  const handleDragOverFlow = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const applyActionToSelectedEdge = (action: EtlActionType) => {
    setEdges((eds) => {
      let targetId = selectedEdgeId;
      if (!targetId && eds.length > 0) targetId = eds[eds.length - 1].id;
      if (!targetId) return eds;

      return eds.map((e) =>
        e.id === targetId
          ? {
            ...e,
            type: "etlSmooth",
            data: {
              ...(e.data || {}),
              action,
              spaceSlug: slug,
              ...withEdgeCallbacks(e.id),
            },
          }
          : e
      );
    });
  };

  // ---------- UI ----------
  return (
    <div className="relative h-[min(750px,calc(100vh-250px))] rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-inner shadow-black/40">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-[#F0EEE9]">Flow space</h2>
        </div>
      </div>

      {/* wrapper for DnD */}
      <div
        className="relative mt-3 h-[min(610px,calc(85vh-200px))] overflow-hidden rounded-xl border border-slate-700 bg-[#020617]"
        onDrop={handleDropOnFlow}
        onDragOver={handleDragOverFlow}
      >
        <ReactFlow<AppNode, AppEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          // onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onInit={(instance) => setRfInstance(instance)}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          className="h-full w-full"
          edgesReconnectable={true}
          // ✅ กัน double click ถูกใช้ไป zoom
          zoomOnDoubleClick={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={25}
            size={2}
            color="#4B5563"
          />

          {minimapOpen && (
            <MiniMap
              pannable
              zoomable
              className="reactflow-minimap"
              style={{
                background: "rgba(71, 85, 105, 0.6)",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
              maskColor="rgba(2, 6, 23, 0.4)"
              nodeColor={() => "rgba(56, 189, 248, 0.85)"}
              nodeStrokeColor={() => "rgba(125, 211, 252, 0.95)"}
              nodeStrokeWidth={1.3}
            />
          )}

          <Controls className="reactflow-controls" position="bottom-left" />
        </ReactFlow>

        {/* Node palette */}
        <div className="pointer-events-auto absolute right-4 top-4 z-30">
          {paletteOpen ? (
            <div className="w-80 rounded-2xl bg-slate-900/95 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md">
              {/* header */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-200">
                    {palettePanel === "node" ? "NODE PALETTE" : "ETL ACTIONS"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-slate-300">
                    {palettePanel === "node"
                      ? "สร้าง template แล้วลากเข้ามาใน canvas"
                      : "ลากมาวางกลางเส้น หรือคลิกเพื่อเปลี่ยน ACTION"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {palettePanel === "node" ? (
                    <button
                      type="button"
                      onClick={() => setPalettePanel("etl")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-700/60 text-slate-200 hover:bg-slate-600"
                      title="ETL Actions"
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPalettePanel("node")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-700/60 text-slate-200 hover:bg-slate-600"
                      title="Back"
                    >
                      <ChevronRight className="h-5 w-5 rotate-180" />
                    </button>
                  )}

                  {palettePanel === "node" && (
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-slate-900 shadow hover:brightness-110"
                      title="Create node template"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setPaletteOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-700/60 text-slate-200 hover:bg-slate-600"
                    title="Collapse"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-700/70 pt-2">
                {palettePanel === "node" ? (
                  templates.length === 0 ? (
                    <p className="text-[11px] text-slate-400">
                      ยังไม่มี template — กดปุ่ม + เพื่อสร้าง node template
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1 node-palette-scroll">
                      {templates.map((t) => {
                        const conn = resolveConnectionById(t.connectionId);
                        const dbType = conn?.type as DbType | undefined;
                        const dbIcon = dbType ? getDbIconForType(dbType) : undefined;

                        return (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => handleTemplateDragStart(t.id, e)}
                            className="cursor-grab active:cursor-grabbing rounded-xl border border-slate-500/70 bg-slate-800/90 px-3 py-2.5 text-[12px] shadow-sm hover:border-sky-500 hover:bg-slate-700/90 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900/90 ring-1 ring-slate-500/80">
                                {dbIcon ? (
                                  <img
                                    src={dbIcon}
                                    alt={conn?.type ?? "connection"}
                                    className="h-8 w-8 object-contain"
                                  />
                                ) : (
                                  <Database className="h-4 w-4 text-slate-300" />
                                )}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <p className="truncate font-semibold text-slate-50">
                                  {resolveConnectionName(t.connectionId)}
                                </p>
                                <p className="truncate text-[10px] text-slate-300">
                                  {t.schema}
                                </p>
                                <p className="truncate text-[10px] text-slate-300">
                                  {t.table}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="max-h-[420px] overflow-y-auto pr-1 node-palette-scroll">
                    {ETL_GROUPS.map((group) => (
                      <div key={group.label} className="mt-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          {group.label}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {group.actions.map((action) => (
                            <button
                              key={action}
                              draggable
                              onDragStart={(e) => handleEtlDragStart(action, e)}
                              onClick={() => applyActionToSelectedEdge(action)}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-100 hover:bg-slate-700"
                            >
                              <EtlActionIcon action={action} compact />
                              <span className="capitalize">{action}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/90 text-slate-100 shadow-lg hover:bg-slate-800"
              title="Open palette"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <TemplateModal
        open={modalOpen}
        connections={connections as ConnectionItem[]}
        selectedConnectionId={selectedConnectionId}
        schema={schema}
        table={table}
        onChangeConnection={setSelectedConnectionId}
        onChangeSchema={setSchema}
        onChangeTable={setTable}
        onOk={handleOk}
        onCancel={handleCancel}
        onPreview={handlePreview}
      />

      {previewOpen && (
        <SchemaPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          connectionName={
            selectedConnectionId ? resolveConnectionName(selectedConnectionId) : undefined
          }
          schema={schema || "public"}
          table={table || "sample_table"}
        />
      )}
    </div>
  );
}
