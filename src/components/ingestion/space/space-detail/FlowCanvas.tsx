// src/components/ingestion/space/space-detail/FlowCanvas.tsx
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  reconnectEdge,
  useNodesState,
  useEdgesState,
  Position,
  type Connection,
  type EdgeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { NodeConfigModal, type NodeConfigValue } from "./NodeConfigModal";
import { Database, ChevronRight, ChevronDown, ChevronLeft } from "lucide-react";

import { FlowNode, type FlowNodeData } from "@/components/ingestion/space/FlowNode";
import { WorkspaceNode } from "@/components/ingestion/space/WorkspaceNode";
import { OrthogonalEdge } from "@/components/ingestion/space/OrthogonalEdge";
import {
  EtlActionIcon,
  normalizeEtlAction,
  type EtlActionType,
  getEtlActionLabel,
} from "@/components/ingestion/space/EtlActionIcon";
import {
  DB_SECTIONS,
  getDbIconForType,
  type DbType,
} from "@/components/ingestion/dbCatalog";

import type { AppNode, AppEdge } from "./flowTypes";
import { ETL_ACTIONS, ETL_GROUPS } from "./etlConfig";

type Props = {
  slug: string;
  connections: any[];
  resolveConnectionName: (id: string) => string;
  resolveConnectionById: (id: string) => any | undefined;
};

const nodeTypes = {
  dbNode: FlowNode,
  workspaceNode: WorkspaceNode,
};
const edgeTypes = { etlSmooth: OrthogonalEdge };

type ConnLite = { id: string; name: string; dbType: DbType; dbIcon: string };

export function FlowCanvas({
  slug,
  connections,
  resolveConnectionName,
  resolveConnectionById,
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([]);
  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<AppNode, AppEdge> | null>(null);

  const edgeReconnectSuccessful = useRef(true);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // ---------- palette ----------
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [sourceOpen, setSourceOpen] = useState(true);
  const [destinationOpen, setDestinationOpen] = useState(true);
  const [etlOpen, setEtlOpen] = useState(true);

  // ---------- node config modal ----------
  const [configOpen, setConfigOpen] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);

  const openConfig = useCallback((nodeId: string) => {
    setConfigNodeId(nodeId);
    setConfigOpen(true);
  }, []);

  const closeConfig = useCallback(() => {
    setConfigOpen(false);
    setConfigNodeId(null);
  }, []);

  // ---------- created DB connections (supported by dbCatalog only) ----------
  const createdDbConnections: ConnLite[] = useMemo(() => {
    return (connections ?? [])
      .map((c: any) => String(c?.id ?? c?.connectionId ?? ""))
      .filter(Boolean)
      .map((id) => {
        const conn = resolveConnectionById(id);
        const dbType = conn?.type as DbType | undefined;
        if (!dbType) return null;

        const dbIcon = getDbIconForType(dbType);
        if (!dbIcon) return null;

        return {
          id,
          name: resolveConnectionName(id),
          dbType,
          dbIcon,
        };
      })
      .filter(Boolean) as ConnLite[];
  }, [connections, resolveConnectionById, resolveConnectionName]);

  // ✅ dbType -> first connectionId
  const firstConnectionIdByType = useMemo(() => {
    const map = new Map<DbType, string>();
    for (const c of createdDbConnections) {
      if (!map.has(c.dbType)) map.set(c.dbType, c.id);
    }
    return map;
  }, [createdDbConnections]);

  const availableTypes = useMemo(() => {
    return new Set<DbType>(createdDbConnections.map((c) => c.dbType));
  }, [createdDbConnections]);

  // ---------- drag helpers ----------
  const handleDbTypeDragStart = (dbType: DbType, e: React.DragEvent) => {
    e.dataTransfer.setData("application/dbType", String(dbType));
    e.dataTransfer.setData("text/plain", String(dbType));
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const handleEtlDragStart = (action: EtlActionType, e: React.DragEvent) => {
    e.dataTransfer.setData("application/etl-action", action);
    e.dataTransfer.setData("text/plain", action);
    e.dataTransfer.effectAllowed = "copyMove";
  };

  // ---------- edge helpers ----------
  const withEdgeCallbacks = useCallback(
    (edgeId: string) => ({
      onPlus: (id: string) => setSelectedEdgeId(id),
      onClearAction: (id: string) =>
        setEdges((prev) =>
          prev.map((e) =>
            e.id === id
              ? { ...e, data: { ...(e.data || {}), action: undefined } }
              : e
          )
        ),
    }),
    [setEdges]
  );

  // ---------- connect ----------
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const id = crypto.randomUUID();
        return addEdge(
          {
            ...params,
            id,
            type: "etlSmooth",
            style: { stroke: "#38bdf8", strokeWidth: 2.5 },
            markerEnd: { type: "arrowclosed", color: "#38bdf8" },
            data: { spaceSlug: slug, ...withEdgeCallbacks(id) },
          } as any,
          eds
        );
      }),
    [slug, withEdgeCallbacks, setEdges]
  );

  const onReconnectStart = () => {
    edgeReconnectSuccessful.current = false;
  };

  const onReconnect = (oldEdge: AppEdge, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) =>
      reconnectEdge(oldEdge, newConnection, els).map((e) =>
        e.id === oldEdge.id
          ? { ...e, data: { ...(e.data || {}), ...withEdgeCallbacks(e.id) } }
          : e
      )
    );
  };

  const onReconnectEnd = (_: any, edge: AppEdge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  };

  const onEdgeClick: EdgeMouseHandler<AppEdge> = (_, edge) => {
    setSelectedEdgeId(edge.id);
  };

  const onPaneClick = () => setSelectedEdgeId(null);

  // ---------- create db node ----------
  const createDbNodeAt = useCallback(
    (connectionId: string, pos: { x: number; y: number }, kind: "source" | "destination") => {
      const id = crypto.randomUUID();

      const conn = resolveConnectionById(connectionId);
      const dbType = conn?.type as DbType | undefined;
      const dbIcon = dbType ? getDbIconForType(dbType) : undefined;

      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "dbNode",
          position: pos,
          targetPosition: Position.Left,
          sourcePosition: Position.Right,
          data: {
            kind, // ✅ role marker
            // ✅ start unconfigured
            connectionId: "",
            connectionName: "",
            schema: "",
            table: "",
            dbType,
            dbIcon,
            onOpen: () => openConfig(id),
            onDelete: () => {
              setNodes((n) => n.filter((x) => x.id !== id));
              setEdges((e) => e.filter((x) => x.source !== id && x.target !== id));
            },
          } satisfies FlowNodeData,
        } as AppNode,
      ]);
    },
    [resolveConnectionById, openConfig, setNodes, setEdges]
  );

  const handleNodesChange = useCallback(
  (changes: any) => {
    onNodesChange(changes);
    // ✅ rebind callbacks (กันกรณี data หาย/ถูก clone)
    setNodes((prev) =>
      prev.map((n) => {
        if (n.type !== "dbNode") return n;
        const d: any = n.data || {};
        return {
          ...n,
          data: {
            ...d,
            onOpen: () => openConfig(n.id),
            onDelete:
              d.onDelete ??
              (() => {
                setNodes((xs) => xs.filter((x) => x.id !== n.id));
                setEdges((es) => es.filter((e) => e.source !== n.id && e.target !== n.id));
              }),
          },
        };
      })
    );
  },
  [onNodesChange, setNodes, openConfig, setEdges]
);


  // ---------- drop ----------
  const handleDropOnFlow = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!rfInstance) return;

      const pos = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // 1) ETL action (drag/drop)
      const actionRaw =
        event.dataTransfer.getData("application/etl-action") ||
        event.dataTransfer.getData("text/plain");

      if (actionRaw) {
        const normalized = normalizeEtlAction(actionRaw);
        if (normalized && ETL_ACTIONS.includes(normalized)) {
          const target = selectedEdgeId ?? edges.at(-1)?.id;
          if (!target) return;

          setEdges((eds) =>
            eds.map((e) =>
              e.id === target
                ? {
                    ...e,
                    data: {
                      ...(e.data || {}),
                      action: normalized,
                      ...withEdgeCallbacks(e.id),
                    },
                  }
                : e
            )
          );
          return;
        }
      }

      // 2) DB type tile (drag/drop) -> create node immediately
      const dbTypeRaw =
        event.dataTransfer.getData("application/dbType") ||
        event.dataTransfer.getData("text/plain");

      const roleRaw =
        event.dataTransfer.getData("application/nodeKind") ||
        event.dataTransfer.getData("application/role") ||
        "source";

      const kind = roleRaw === "destination" ? "destination" : "source";

      if (dbTypeRaw && (availableTypes as Set<string>).has(dbTypeRaw)) {
        const dbType = dbTypeRaw as DbType;
        const connectionId = firstConnectionIdByType.get(dbType);
        if (!connectionId) return;
        createDbNodeAt(connectionId, pos, kind);
        return;
      }

      // legacy: dragging connectionId directly
      const connectionId = event.dataTransfer.getData("application/connectionId");
      if (connectionId) {
        createDbNodeAt(connectionId, pos, kind);
      }
    },
    [
      rfInstance,
      edges,
      selectedEdgeId,
      withEdgeCallbacks,
      setEdges,
      availableTypes,
      firstConnectionIdByType,
      createDbNodeAt,
    ]
  );

  const handleDragOverFlow = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const applyActionToSelectedEdge = (action: EtlActionType) => {
    const target = selectedEdgeId ?? edges.at(-1)?.id;
    if (!target) return;

    setEdges((eds) =>
      eds.map((e) =>
        e.id === target
          ? { ...e, data: { ...(e.data || {}), action, ...withEdgeCallbacks(e.id) } }
          : e
      )
    );
  };

  // ---------- source out columns for destination mapping ----------
  const sourceOutColumns = useMemo(() => {
    const sourceNode = nodes.find((n) => (n.data as any)?.kind === "source");
    const sm = (sourceNode?.data as any)?.sourceMapping as any[] | undefined;

    if (sm?.length) {
      const cols = sm
        .filter((r) => r.mode !== "ignore")
        .map((r) =>
          r.mode === "edit"
            ? (r.editedName?.trim() || r.out?.name)
            : r.out?.name
        )
        .filter(Boolean) as string[];

      return cols.length ? cols : undefined;
    }

    return undefined;
  }, [nodes]);

  // ---------- UI helpers ----------
  const renderDbTypeGrid = (sectionKey: "source" | "destination") => {
    return (
      <div className="mt-3 space-y-6">
        {DB_SECTIONS.map((section) => {
          const items = section.items.filter((it) => availableTypes.has(it.type));
          if (items.length === 0) return null;

          return (
            <div key={`${sectionKey}-${section.key}`}>
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                {section.label}
              </p>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {items.map((it) => (
                  <div
                    key={`${sectionKey}-${String(it.type)}`}
                    draggable
                    onDragStart={(e) => {
                      // ✅ mark role for drop
                      e.dataTransfer.setData("application/nodeKind", sectionKey);
                      handleDbTypeDragStart(it.type, e);
                    }}
                    className={[
                      "group cursor-grab active:cursor-grabbing",
                      "rounded-2xl border border-slate-700 bg-slate-800/50",
                      "hover:border-sky-500/60 hover:bg-slate-800/80 transition-colors",
                      "touch-none select-none",
                      "flex items-center justify-center",
                      "p-3 min-h-[84px]",
                    ].join(" ")}
                    title="Drag to canvas to add"
                  >
                    <div className="flex h-15 w-15 items-center justify-center rounded-xl bg-slate-950/60 ring-1 ring-slate-700/60">
                      <img
                        src={it.icon}
                        alt={String(it.type)}
                        className="h-12 w-12 object-contain"
                        draggable={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {availableTypes.size === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-[11px] text-slate-300">
            No database connections yet. Create a connection first.
          </div>
        )}
      </div>
    );
  };

  // ---------- modal render ----------
  const modalEl = useMemo(() => {
    if (!configOpen || !configNodeId) return null;
    const node = nodes.find((n) => n.id === configNodeId);
    if (!node) return null;

    const d: any = node.data || {};
    const role = d.kind === "source" ? "source" : "destination";

    const connectionOptions = (connections ?? [])
      .map((c: any) => String(c?.id ?? c?.connectionId ?? ""))
      .filter(Boolean)
      .filter((id) => {
        const conn = resolveConnectionById(id);
        return conn?.type === d.dbType;
      })
      .map((id) => ({ id, name: resolveConnectionName(id), type: d.dbType }));

    return (
      <NodeConfigModal
        open={configOpen}
        onClose={closeConfig}
        role={role}
        dbType={d.dbType}
        dbIcon={d.dbIcon}
        connectionOptions={connectionOptions}
        sourceOutColumns={role === "destination" ? sourceOutColumns : undefined}
        initial={{
          connectionId: d.connectionId,
          connectionName: d.connectionName,
          schema: d.schema,
          table: d.table,
          sourceMapping: d.sourceMapping,
          destinationMapping: d.destinationMapping,
        }}
        onSave={(val: NodeConfigValue) => {
          setNodes((prev) =>
            prev.map((n) =>
              n.id !== configNodeId
                ? n
                : {
                    ...n,
                    data: {
                      ...(n.data as any),
                      connectionId: val.connectionId,
                      connectionName: val.connectionName,
                      schema: val.schema,
                      table: val.table,
                      sourceMapping: val.sourceMapping,
                      destinationMapping: val.destinationMapping,
                      previewRows: val.previewRows,
                    },
                  }
            )
          );
          closeConfig();
        }}
      />
    );
  }, [
    configOpen,
    configNodeId,
    nodes,
    connections,
    resolveConnectionById,
    resolveConnectionName,
    closeConfig,
    setNodes,
    sourceOutColumns,
  ]);

  // ---------- UI ----------
  return (
    <div className="relative h-[min(750px,calc(100vh-250px))] rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-inner shadow-black/40">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-[#F0EEE9]">Flow space</h2>
        </div>
      </div>

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
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onInit={setRfInstance}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          className="h-full w-full"
          edgesReconnectable
          zoomOnDoubleClick={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={25}
            size={2}
            color="#4B5563"
          />
          <Controls className="reactflow-controls" position="bottom-left" />
        </ReactFlow>

        {/* ✅ Modal overlay */}
        {modalEl}

        {/* ✅ Docked Palette */}
        <div className="pointer-events-auto absolute top-3 bottom-3 right-3 z-30">
          {paletteOpen ? (
            <div
              className={[
                "w-[380px]",
                "h-full",
                "overflow-hidden",
                "rounded-2xl bg-slate-900/95 p-3 text-xs text-slate-100 shadow-xl backdrop-blur-md",
                "flex flex-col",
              ].join(" ")}
            >
              <div className="flex-1 overflow-y-auto pr-1 overscroll-contain">
                {/* SOURCE */}
                <button
                  type="button"
                  onClick={() => setSourceOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-[11px] font-bold text-slate-300"
                >
                  Source
                  {sourceOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {sourceOpen && renderDbTypeGrid("source")}

                {/* DESTINATION */}
                <button
                  type="button"
                  onClick={() => setDestinationOpen((v) => !v)}
                  className="mt-5 flex w-full items-center justify-between text-[11px] font-bold text-slate-300"
                >
                  Destination
                  {destinationOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {destinationOpen && renderDbTypeGrid("destination")}

                {/* ETL */}
                <button
                  type="button"
                  onClick={() => setEtlOpen((v) => !v)}
                  className="mt-5 flex w-full items-center justify-between text-[11px] font-bold text-slate-300"
                >
                  Tools
                  {etlOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {etlOpen && (
                  <div className="mt-2 space-y-3 pb-1">
                    {ETL_GROUPS.map((group) => (
                      <div key={group.label} className="mt-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          {group.label}
                        </p>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {group.actions.map((action) => (
                            <button
                              key={action}
                              draggable
                              onDragStart={(e) => handleEtlDragStart(action, e)}
                              onClick={() => applyActionToSelectedEdge(action)}
                              className={[
                                "inline-flex items-center gap-2",
                                "rounded-full bg-slate-800/80 px-3 py-2 text-[12px] text-slate-100",
                                "hover:bg-slate-700 touch-none",
                              ].join(" ")}
                              title={getEtlActionLabel(action)}
                            >
                              <EtlActionIcon action={action} compact />
                              <span className="truncate">{getEtlActionLabel(action)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="mt-3 w-full rounded-lg bg-slate-800 py-1.5 text-[11px] text-slate-100 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className={[
                "inline-flex h-11 w-11 items-center justify-center rounded-full",
                "bg-slate-900/85 text-slate-100 shadow-lg",
                "ring-1 ring-slate-700/70 hover:bg-slate-800/90",
                "backdrop-blur-md",
              ].join(" ")}
              title="Open palette"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
