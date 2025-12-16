"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSpaces } from "@/components/ingestion/SpaceContext";
import { useConnections } from "@/components/ingestion/ConnectionsContext";

import type { LeftPanel, NodeTemplate } from "@/components/ingestion/space/space-detail/flowTypes";

import { SpaceDetailHeader } from "@/components/ingestion/space/space-detail/SpaceDetailHeader";
import { SpaceDetailLayout } from "@/components/ingestion/space/space-detail/SpaceDetailLayout";
import { LeftWorkspacePanel } from "@/components/ingestion/space/space-detail/LeftWorkspacePanel";
import { FlowCanvas, type NodeSpec } from "@/components/ingestion/space/space-detail/FlowCanvas";

export default function SpaceDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);

  const { spaces } = useSpaces();
  const { connections } = useConnections();
  const space = spaces.find((s) => s.name === slug);

  const [leftPanel, setLeftPanel] = useState<LeftPanel>("none");
  const [templates, setTemplates] = useState<NodeTemplate[]>([]);

  // ✅ เก็บ handler ที่ FlowCanvas provide มา
  const genRef = useRef<
    null | ((nodes: NodeSpec[], meta?: { mode?: "transform" | "sql"; raw?: string }) => void)
  >(null);

  // sync ?left=transform|sql
  useEffect(() => {
    const left = (searchParams.get("left") as LeftPanel | null) ?? null;
    if (left === "transform" || left === "sql") setLeftPanel(left);
    else setLeftPanel("none");
  }, [searchParams]);

  const openLeftPanel = (p: Exclude<LeftPanel, "none">) => {
    router.push(`/ingestion/space/${encodeURIComponent(slug)}?left=${p}`);
    setLeftPanel(p);
  };

  const closeLeftPanel = useCallback(() => {
    router.push(`/ingestion/space/${encodeURIComponent(slug)}`);
    setLeftPanel("none");
  }, [router, slug]);

  const resolveConnectionById = useCallback(
    (id: string) => connections.find((c) => c.id === id),
    [connections]
  );

  const resolveConnectionName = useCallback(
    (id: string) => resolveConnectionById(id)?.name || "Unknown connection",
    [resolveConnectionById]
  );

  // ✅ handler ที่ส่งให้ LeftWorkspacePanel เรียกตอนกด Generate
  const handleGenerateFromWorkspace = useCallback(
    (nodes: NodeSpec[], meta: { mode: "transform" | "sql"; raw: string }) => {
      genRef.current?.(nodes, meta);
    },
    []
  );

  const right = useMemo(() => {
    if (!space) return null;

    return (
      <FlowCanvas
        slug={slug}
        connections={connections as any[]}
        resolveConnectionById={resolveConnectionById}
        resolveConnectionName={resolveConnectionName}
        templates={templates}
        setTemplates={setTemplates}
        onProvideGenerateHandler={(fn) => {
          genRef.current = fn;
        }}
      />
    );
  }, [space, slug, connections, templates, resolveConnectionById, resolveConnectionName]);

  const left = useMemo(() => {
    if (leftPanel === "none") return null;

    return (
      <LeftWorkspacePanel
        leftPanel={leftPanel}
        onClose={closeLeftPanel}
        onGenerateNodes={handleGenerateFromWorkspace}
      />
    );
  }, [leftPanel, closeLeftPanel, handleGenerateFromWorkspace]);

  if (!space) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/ingestion/space")}
          className="text-sm text-sky-400 hover:underline"
        >
          ← Back to Spaces
        </button>
        <p className="text-sm text-rose-400">Space &quot;{slug}&quot; not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F0EEE9]">
      <SpaceDetailHeader
        spaceName={space.name}
        onBack={() => router.push("/ingestion/space")}
        active={leftPanel}
        onOpenTransform={() => openLeftPanel("transform")}
        onOpenSql={() => openLeftPanel("sql")}
      />

      <SpaceDetailLayout leftPanel={leftPanel} left={left} right={right} />
    </div>
  );
}
