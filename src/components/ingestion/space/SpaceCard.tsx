"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export default function SpaceCard({
  space,
  currentUserName,
  onDetail,
  onToggle,
  onOpen,
}: {
  space: any;
  currentUserName: string;
  onDetail: (id: string) => void;
  onToggle: (id: string) => void;
  onOpen?: (slug: string) => void;
}) {
  const isEnabled = space.status === "enabled";

  const statusClasses = isEnabled
    ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40"
    : "bg-rose-500/25 text-rose-200 border border-rose-400/40";

  const actionClasses = isEnabled
    ? "border border-rose-400/60 text-rose-300 hover:bg-rose-500/30"
    : "border border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/30";

  const handleCardClick = () => {
    if (onOpen) onOpen(space.name);
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group relative cursor-pointer
        transition-transform duration-200 hover:-translate-y-1
      "
    >
      {/* Glow hover */}
      <div
        className="
          pointer-events-none absolute inset-0 -z-10
          rounded-3xl bg-gradient-to-br from-sky-500/25 via-sky-400/15 to-emerald-400/10
          opacity-0 blur-xl transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* CARD */}
      <div
        className="
          flex min-h-[200px] flex-col rounded-3xl
          border border-[#1F2937]
          bg-[#111827] 
          px-5 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.25)]
          transition-all duration-300
          group-hover:border-sky-500/60 
          group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94a3b8]">
              Space
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-[#1E293B] px-2 py-0.5 text-[10px] text-[#CBD5E1]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Ingestion Flow
            </span>
          </div>

          {/* STATUS */}
          <div
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-sm",
              statusClasses,
            ].join(" ")}
          >
            {isEnabled ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            <span>{isEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </div>

        {/* BODY */}
        <div className="mt-5 mb-4">
          <h2 className="line-clamp-1 text-lg font-semibold text-[#E2E8F0]">
            {space.name}
          </h2>

          <p className="mt-1 text-xs text-[#94a3b8]">
            Space for ingestion configuration and data pipeline mapping.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[#CBD5E1]">
              Owner:{" "}
              <span className="font-medium">
                {space.owner || currentUserName}
              </span>
            </span>

            <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[#CBD5E1]">
              Nodes:{" "}
              <span className="font-medium">{space.nodeCount ?? 0}</span>
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-[#1F2937]" />

        {/* FOOTER */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetail(space.id);
            }}
            className="
              inline-flex items-center justify-center gap-1 rounded-full
              border border-sky-500 bg-sky-500/20 px-3 py-1
              font-medium text-[#E2E8F0]
              transition-colors
              hover:bg-sky-500 hover:text-white
            "
          >
            Detail
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(space.id);
            }}
            className={[
              "inline-flex items-center justify-center rounded-full px-3 py-1 font-medium transition-colors",
              actionClasses,
            ].join(" ")}
          >
            {isEnabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>
    </div>
  );
}
