"use client";

import React, { useState } from "react";
import { ScanLine } from "lucide-react";

import { UploadDocumentsSection } from "@/components/orc/UploadDocumentsSection";
import { OcrWorkbenchModal } from "@/components/orc/OcrWorkbenchModal";

export default function OcrPage() {
  const [workbenchFile, setWorkbenchFile] = useState<File | null>(null);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);

  return (
    <div className="w-full">
      {/* ✅ Page Header (ไม่ sticky เพื่อไม่ชน Topbar ของ AppShell) */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <ScanLine className="h-5 w-5 text-[#F0EEE9]" />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-[#F0EEE9]">
              Upload Documents & OCR Workbench
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#F0EEE9]/60">
              Upload files → Preview → Crop → OCR / AI Extraction
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Content */}
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Upload section */}
          <div className="bg-[#050812] border border-slate-800 rounded-xl p-3 sm:p-4 lg:p-5 shadow-lg shadow-black/20">
            <UploadDocumentsSection
              onOpenWorkbench={(file) => {
                setWorkbenchFile(file);
                setIsWorkbenchOpen(true);
              }}
            />
          </div>

          {/* footer note (ซ่อนบนจอเล็กถ้ารก) */}
          <div className="pb-6 sm:pb-10 text-[11px] sm:text-xs text-[#F0EEE9]/50 text-center">
            * Upload files → Preview → Crop → OCR / AI Extraction
          </div>
        </div>
      </main>

      {/* OCR Workbench modal */}
      <OcrWorkbenchModal
        isOpen={isWorkbenchOpen}
        file={workbenchFile}
        onClose={() => {
          setIsWorkbenchOpen(false);
          setWorkbenchFile(null);
        }}
      />
    </div>
  );
}
