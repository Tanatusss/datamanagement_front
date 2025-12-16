"use client";

import React, { useState } from "react";
import { ScanLine } from "lucide-react";

import { UploadDocumentsSection } from "@/components/orc/UploadDocumentsSection";
import { OcrWorkbenchModal } from "@/components/orc/OcrWorkbenchModal";

export default function OcrPage() {
  const [workbenchFile, setWorkbenchFile] = useState<File | null>(null);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0EEE9] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#12151e] bg-[#0D1117] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <ScanLine className="h-5 w-5 text-[#F0EEE9]" />
          <h1 className="text-lg font-semibold tracking-tight text-[#F0EEE9]">
            Upload Documents & OCR Workbench
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6 w-full">
        {/* Upload section */}
        <div className="bg-[#050812] border border-slate-800 rounded-xl p-4 shadow-lg shadow-black/20">
          <UploadDocumentsSection
            onOpenWorkbench={(file) => {
              setWorkbenchFile(file);
              setIsWorkbenchOpen(true);
            }}
          />
        </div>

        {/* OCR Workbench modal */}
        <OcrWorkbenchModal
          isOpen={isWorkbenchOpen}
          file={workbenchFile}
          onClose={() => {
            setIsWorkbenchOpen(false);
            setWorkbenchFile(null);
          }}
        />

        {/* footer note */}
        <div className="pb-10 text-xs text-[#F0EEE9]/50 text-center">
          * Upload files → Preview → Crop → OCR / AI Extraction
        </div>
      </main>
    </div>
  );
}
