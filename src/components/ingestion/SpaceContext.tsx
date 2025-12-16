// src/components/ingestion/SpaceContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type SpaceStatus = "enabled" | "disabled";

export type Space = {
  id: string;
  name: string;
  slug: string;
  status: SpaceStatus;
  owner?: string; // created by
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
};

type SpaceContextValue = {
  spaces: Space[];
  createSpace: (name: string) => Space;
  toggleSpaceStatus: (id: string) => void;

  openSpaceDetail: (id: string) => void;
  closeSpaceDetail: () => void;
};

const SpaceContext = createContext<SpaceContextValue | null>(null);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const currentUserName = user?.username || "Current User";

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // LOAD จาก localStorage + migrate owner/updatedBy ให้มีชื่อ user
  // ------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("spaces");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Space[];
      const now = new Date().toISOString();

      const migrated = parsed.map((s) => {
        const hasRealOwner =
          s.owner && s.owner !== "Unknown" && s.owner !== "Current User";

        const owner = hasRealOwner ? s.owner! : currentUserName;
        const createdAt = s.createdAt ?? now;
        const updatedAt = s.updatedAt ?? createdAt;

        const hasRealUpdatedBy =
          s.updatedBy && s.updatedBy !== "Unknown" && s.updatedBy !== "Current User";

        const updatedBy = hasRealUpdatedBy ? s.updatedBy! : owner;

        return {
          ...s,
          owner,
          createdAt,
          updatedAt,
          updatedBy,
        };
      });

      setSpaces(migrated);
    } catch {
      // ignore
    }
  }, [currentUserName]);

  // เซฟกลับ localStorage ทุกครั้งที่ spaces เปลี่ยน
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("spaces", JSON.stringify(spaces));
    } catch {
      // ignore
    }
  }, [spaces]);

  // ------------------------------------------------------------------
  // CREATE
  // ------------------------------------------------------------------
  const createSpace = (name: string): Space => {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    const now = new Date().toISOString();

    const space: Space = {
      id: crypto.randomUUID(),
      name,
      slug,
      status: "enabled",
      owner: currentUserName,
      createdAt: now,
      updatedAt: now,
      updatedBy: currentUserName,
    };

    setSpaces((prev) => [...prev, space]);
    return space;
  };

  // ------------------------------------------------------------------
  // TOGGLE STATUS
  // ------------------------------------------------------------------
  const toggleSpaceStatus = (id: string) => {
    const now = new Date().toISOString();

    setSpaces((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "enabled" ? "disabled" : "enabled",
              updatedAt: now,
              updatedBy: currentUserName,
            }
          : s
      )
    );
  };

  // ------------------------------------------------------------------
  // DETAIL MODAL
  // ------------------------------------------------------------------
  const openSpaceDetail = (id: string) => {
    setDetailId(id);
  };

  const closeSpaceDetail = () => {
    setDetailId(null);
  };

  const value = useMemo(
    () => ({
      spaces,
      createSpace,
      toggleSpaceStatus,
      openSpaceDetail,
      closeSpaceDetail,
    }),
    [spaces, currentUserName] // toggleSpaceStatus/createSpace อิง currentUserName อยู่แล้ว
  );

  const selectedSpace =
    detailId != null ? spaces.find((s) => s.id === detailId) ?? null : null;

  return (
    <SpaceContext.Provider value={value}>
      {children}

      <SpaceDetailModal
        open={detailId !== null && !!selectedSpace}
        onClose={closeSpaceDetail}
        space={selectedSpace}
      />
    </SpaceContext.Provider>
  );
}

export function useSpaces() {
  const ctx = useContext(SpaceContext);
  if (!ctx) {
    throw new Error("useSpaces must be used within SpaceProvider");
  }
  return ctx;
}

/* =======================================================================
   Modal แสดงรายละเอียด Space  (VSCode Dark Theme)
   ======================================================================= */

type SpaceDetailModalProps = {
  open: boolean;
  onClose: () => void;
  space: Space | null;
};

function SpaceDetailModal({ open, onClose, space }: SpaceDetailModalProps) {
  if (!open || !space) return null;

  const createdBy = space.owner || "Unknown";
  const lastUpdateBy = space.updatedBy || space.owner || "Unknown";
  const lastUpdateWhen = space.updatedAt
    ? new Date(space.updatedAt).toLocaleString()
    : "N/A";

  const statusLabel = space.status === "enabled" ? "Enabled" : "Disabled";
  const statusClass =
    space.status === "enabled"
      ? "text-emerald-300"
      : "text-rose-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#1F2937] bg-[#111827] px-6 py-5 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#F0EEE9]">
            Space detail
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#9CA3AF] hover:bg-[#1F2937]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-sm">
          <DetailRow label="Space name" value={space.name} />
          <DetailRow label="Created by" value={createdBy} />
          <DetailRow label="Last update by" value={lastUpdateBy} />
          <DetailRow label="Last update when" value={lastUpdateWhen} />
          <DetailRow
            label="Status"
            value={statusLabel}
            valueClass={statusClass}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="
              inline-flex items-center justify-center rounded-full 
              bg-sky-500 px-4 py-1.5 text-xs font-medium 
              text-black hover:bg-sky-400 transition
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* Helper row */
function DetailRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </span>
      <span className={`text-sm text-[#E5E7EB] ${valueClass}`}>{value}</span>
    </div>
  );
}
