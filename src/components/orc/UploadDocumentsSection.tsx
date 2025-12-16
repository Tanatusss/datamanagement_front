"use client";

import React, {
  useRef,
  useState,
  useEffect,   // 👈 เพิ่ม useEffect
} from "react";
import { Upload, FileText, FileUp, Trash2, X } from "lucide-react";
import { UploadedDoc, bytesToPretty, uid } from "./types";

type Props = {
  onOpenWorkbench: (file: File) => void;
  onSendToOcr?: (file: File, selectedBank: string) => void;
};

type BankOption = { value: string; label: string };

const BANK_OPTIONS: BankOption[] = [
  { value: "BAAC", label: "BAAC" },
  { value: "BAY", label: "BAY" },
  { value: "BBL", label: "BBL" },
  { value: "CIMBT", label: "CIMBT" },
  { value: "CITI", label: "CITI" },
  { value: "GSB", label: "GSB" },
  { value: "KBANK", label: "KBANK" },
  { value: "KK", label: "KK" },
  { value: "KTB", label: "KTB" },
  { value: "LH", label: "LH" },
  { value: "SCB", label: "SCB" },
  { value: "TCRBANK", label: "TCRBANK" },
  { value: "UOB", label: "UOB" },
];

export function UploadDocumentsSection({ onOpenWorkbench, onSendToOcr }: Props) {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadDocType, setUploadDocType] = useState("BANK STATEMENT");
  const [uploadBank, setUploadBank] = useState<string>("");
  const [isUploadDragging, setIsUploadDragging] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  // 👇 ล็อก scroll ของ body ตอน modal เปิด
  useEffect(() => {
    if (isUploadModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // cleanup เวลา modal ปิด หรือ component unmount
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isUploadModalOpen]);

  const resetUploadModal = () => {
    setUploadFiles([]);
    setUploadDocType("BANK STATEMENT");
    setUploadBank("");
    setIsUploadDragging(false);
  };

  const handleUploadConfirm = () => {
    if (!uploadFiles.length) return;

    const newDocs: UploadedDoc[] = uploadFiles.map((file) => ({
      id: uid(),
      file,
      name: file.name,
      size: file.size,
      docType: uploadDocType,
      bank: uploadDocType === "NCB" ? null : uploadBank || null,
      status: "waiting",
    }));

    setDocs((prev) => [...prev, ...newDocs]);
    setIsUploadModalOpen(false);
    resetUploadModal();
  };

  const handleUploadDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsUploadDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    setUploadFiles((prev) => [...prev, ...files]);
  };

  const handleUploadFileInput = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const handleDeleteDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSendToOcrClick = (doc: UploadedDoc) => {
    onOpenWorkbench(doc.file);
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: "ocr_done" } : d)),
    );
  };
  return (
    <>
      {/* HEADER */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#F0EEE9]">Documents</h2>
            <p className="text-xs text-[#F0EEE9B3]">
              ฝากไฟล์แล้วกด <b>Send to OCR</b> เพื่อเปิดใน workbench
            </p>
          </div>

          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              resetUploadModal();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#007ACC] px-4 py-2 text-sm font-medium text-white hover:bg-[#007ACC]/90"
          >
            <Upload className="h-4 w-4" />
            Add files
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070B14]">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 bg-[#0B1120] text-[#F0EEE9]">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Bank</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-sm text-[#F0EEE9B3]"
                  >
                    ยังไม่มีไฟล์ — คลิก <b>Add files</b> เพื่อเริ่มอัปโหลด
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-t border-slate-800  hover:bg-[#0A0F1C]"
                  >
                    <td className="px-4 py-3 text-[#F0EEE9]">
                      <div className="flex flex-col">
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-xs text-[#F0EEE9]/50">
                          {bytesToPretty(doc.size)}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <select
                        value={doc.docType}
                        onChange={(e) =>
                          setDocs((prev) =>
                            prev.map((d) =>
                              d.id === doc.id ? { ...d, docType: e.target.value } : d,
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-slate-800  bg-[#0A0F1C] text-[#F0EEE9] px-2 py-1 text-xs focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC]"
                      >
                        <option value="BANK STATEMENT">BANK STATEMENT</option>
                        <option value="NCB">NCB</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </td>

                    {/* Bank */}
                    <td className="px-4 py-3">
                      <select
                        disabled={doc.docType !== "BANK STATEMENT"}
                        value={doc.bank ?? ""}
                        onChange={(e) =>
                          setDocs((prev) =>
                            prev.map((d) =>
                              d.id === doc.id ? { ...d, bank: e.target.value } : d,
                            ),
                          )
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-xs bg-[#0A0F1C] text-[#F0EEE9] ${
                          doc.docType !== "BANK STATEMENT"
                            ? "opacity-30 cursor-not-allowed"
                            : "border-slate-800  focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC]"
                        }`}
                      >
                        <option value="">Select bank</option>
                        {BANK_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === "ocr_done"
                            ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800"
                            : "bg-yellow-900/30 text-yellow-300 border border-yellow-800"
                        }`}
                      >
                        {doc.status === "ocr_done" ? "OCR" : "Waiting"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendToOcrClick(doc)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-800  bg-[#0A0F1C] px-3 py-1.5 text-xs text-[#F0EEE9] hover:bg-[#12151e]"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#F0EEE9]" />
                          Send to OCR
                        </button>

                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-800 bg-[#0A0F1C] px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========== UPLOAD MODAL ========== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-[#050812] border border-[#12151e] shadow-2xl text-[#F0EEE9]">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-[#12151e] px-6 py-4">
              <h2 className="text-lg font-semibold">Upload Documents</h2>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  resetUploadModal();
                }}
                className="rounded-full p-1 hover:bg-[#12151e]"
              >
                <X className="h-4 w-4 text-[#F0EEE9B3]" />
              </button>
            </div>

            {/* BODY */}
            <div className="space-y-4 px-6 py-4">
              {/* DROPZONE */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsUploadDragging(true);
                }}
                onDragLeave={() => setIsUploadDragging(false)}
                onDrop={handleUploadDrop}
                className={`relative flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition text-[#F0EEE9B3] ${
                  isUploadDragging
                    ? "border-[#007ACC] bg-[#0A0F1C]"
                    : "border-[#12151e] bg-[#0A0F1C]/60"
                }`}
              >
                <Upload className="h-7 w-7 text-[#cbd5e1]" />
                <p className="mt-2 text-sm">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก</p>
                <p className="mt-1 text-xs opacity-60">
                  รองรับ JPG, PNG, PDF (หลายไฟล์)
                </p>

                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#007ACC] px-4 py-2 text-sm hover:bg-[#007ACC]/90 text-[#F0EEE9]"
                >
                  <FileUp className="h-4 w-4" />
                  Click to upload
                </button>

                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={(e) => handleUploadFileInput(e.target.files)}
                />
              </div>

              {/* FILE LIST */}
              {uploadFiles.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-[#12151e] bg-[#0A0F1C] px-4 py-3">
                  <div className="max-h-52 space-y-2 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-[#12151e] bg-[#050812] px-3 py-2"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#12151e] bg-[#0A0F1C]">
                            <FileText className="h-4 w-4 text-[#F0EEE9]" />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="truncate text-sm font-medium text-[#F0EEE9]">
                              {file.name}
                            </span>
                            <span className="text-xs text-[#F0EEE9]/40">
                              {bytesToPretty(file.size)} • Waiting
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setUploadFiles((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="rounded-full p-1 hover:bg-[#12151e]"
                        >
                          <X className="h-4 w-4 text-[#F0EEE9]/60" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* DOCUMENT FORM */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* DOC TYPE */}
                    <div className="flex-1">
                      <p className="mb-1 text-xs text-[#F0EEE9B3]">
                        Type of Document
                      </p>
                      <select
                        value={uploadDocType}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUploadDocType(value);
                          if (value === "NCB") setUploadBank("");
                        }}
                        className="w-full rounded-lg border border-[#12151e] bg-[#0A0F1C] text-[#F0EEE9] px-3 py-2 text-sm focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC]"
                      >
                        <option value="BANK STATEMENT">Bank statement</option>
                        <option value="NCB">NCB report</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>

                    {/* BANK */}
                    <div className="flex-1">
                      <p className="mb-1 text-xs text-[#F0EEE9B3]">Bank</p>
                      <select
                        disabled={uploadDocType !== "BANK STATEMENT"}
                        value={uploadBank}
                        onChange={(e) => setUploadBank(e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm bg-[#0A0F1C] text-[#F0EEE9] ${
                          uploadDocType !== "BANK STATEMENT"
                            ? "opacity-40 cursor-not-allowed"
                            : "border-[#12151e] focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC]"
                        }`}
                      >
                        <option value="">
                          {uploadDocType === "NCB"
                            ? "Not applicable"
                            : "Select bank"}
                        </option>
                        {BANK_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#12151e] px-6 py-3">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  resetUploadModal();
                }}
                className="rounded-xl border border-[#12151e] bg-[#0A0F1C] px-4 py-2 text-sm text-[#F0EEE9] hover:bg-[#12151e]"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadConfirm}
                disabled={!uploadFiles.length}
                className="rounded-xl bg-[#007ACC] px-5 py-2 text-sm font-medium text-white hover:bg-[#007ACC]/90 disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
