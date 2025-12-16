"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useSpaces } from "@/components/ingestion/SpaceContext";
import { CreateSpaceModal } from "@/components/ingestion/space/CreateSpaceModal";
import { useAuth } from "@/context/AuthContext";
import SpaceCard from "@/components/ingestion/space/SpaceCard";

export default function SpacePage() {
  const router = useRouter();

  const { user } = useAuth();
  const currentUserName = user?.username || "Current User";

  const { spaces, createSpace, toggleSpaceStatus, openSpaceDetail } =
    useSpaces();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCreateFromPage = (name: string) => {
    createSpace(name);
    setCreateModalOpen(false);
  };

  const handleDetail = (spaceId: string) => {
    openSpaceDetail(spaceId);
  };

  // Sorting enabled first
  const sortedSpaces = [...spaces].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "enabled" ? -1 : 1;
  });

  const enabledSpaces = sortedSpaces.filter((s) => s.status === "enabled");
  const disabledSpaces = sortedSpaces.filter((s) => s.status === "disabled");

  return (
    <div className="min-h-full w-full bg-[#0D1117]">
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-[#F0EEE9]">Spaces</h1>
        <p className="mt-1 text-sm text-[#9aa4b2]">
          จัดการพื้นที่ทำงาน (Spaces) สำหรับ ingestion แต่ละโดเมน
        </p>
      </header>

      {/* ====================== SECTIONS ====================== */}
      <div className="space-y-8">
        {/* ---------- ENABLED SECTION ---------- */}
        <section className="relative mt-2 rounded-2xl border border-[#1e293b] bg-[#0b1120]/80 px-5 py-6 shadow-md backdrop-blur-sm">
          <span className="absolute -top-3 left-6 inline-flex items-center 
                rounded-full bg-[#0b1120] px-3 py-0.5 text-xs 
                font-semibold uppercase tracking-wide text-[#9aa4b2] border border-[#1e293b]">
            Enabled
          </span>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Enabled spaces */}
            {enabledSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                currentUserName={currentUserName}
                onDetail={handleDetail}
                onToggle={(id) => toggleSpaceStatus(id)}
                onOpen={(slug) =>
                  router.push(`/ingestion/space/${encodeURIComponent(slug)}`)
                }
              />
            ))}

            {/* CREATE NEW SPACE BUTTON */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex h-full min-h-[190px] flex-col items-center justify-center 
                         rounded-2xl border-2 border-dashed border-sky-500
                         bg-[#111827]/40 text-[#F0EEE9] hover:bg-[#1e293b]/40 
                         hover:border-sky-400 transition"
            >
              <div
                className="mb-2 flex h-10 w-10 items-center justify-center rounded-full 
                            bg-sky-500 text-white shadow-lg"
              >
                <Plus className="h-5 w-5" />
              </div>

              <div className="text-sm font-medium">Create new space</div>
              <div className="mt-1 text-xs text-[#9aa4b2]">
                เพิ่ม path ย่อยใหม่เหมือนปุ่ม + ที่ sidebar
              </div>
            </button>
          </div>
        </section>

        {/* ---------- DISABLED SECTION ---------- */}
        {disabledSpaces.length > 0 && (
          <section className="relative rounded-2xl border border-[#1e293b] bg-[#0b1120]/80 px-5 py-6 shadow-md backdrop-blur-sm">
            <span className="absolute -top-3 left-6 inline-flex items-center 
                  rounded-full bg-[#0b1120] px-3 py-0.5 text-xs 
                  font-semibold uppercase tracking-wide text-[#9aa4b2] border border-[#1e293b]">
              Disabled
            </span>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {disabledSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  currentUserName={currentUserName}
                  onDetail={handleDetail}
                  onToggle={(id) => toggleSpaceStatus(id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ====================== CREATE MODAL ====================== */}
      <CreateSpaceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateFromPage}
      />
    </div>
  );
}
