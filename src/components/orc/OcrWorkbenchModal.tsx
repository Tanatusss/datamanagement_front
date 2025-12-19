// src/components/orc/OcrWorkbenchModal.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FileImage,
  FileText,
  FileType,
  Highlighter,
  LayoutPanelLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  X,
  CreditCard,
} from "lucide-react";
import {
  AiRow,
  OcrLine,
  OcrResult,
  bytesToPretty,
  isImage,
  isPdf,
  uid,
} from "./types";
import type { AccountDetails, TransactionRow } from "./bankTypes";
import {
  MOCK_ACCOUNT_DETAILS,
  MOCK_TRANSACTIONS,
  MOCK_FIELDS,
} from "./ocrTypeConfig";
import { OcrAccountDetailsStep } from "./OcrAccountDetailsStep";
import { OcrTransactionStep } from "./OcrTransactionsStep";
import { AiPanel } from "./AiPanel";

import { getPdfPageCount } from "./pdfUtils";
import { PdfCanvasViewer } from "./PdfCanvasViewer";
import { createPortal } from "react-dom";

/* ---------- mock OCR ---------- */
async function mockOcr(file: File): Promise<OcrResult> {
  const a = MOCK_ACCOUNT_DETAILS;

  const pairs = [
    { label: "Bank Name", value: a.bankName },
    { label: "Account Number", value: a.accountNumber },
    { label: "Account Type", value: a.accountType },
    { label: "Start Date", value: a.startDate },
    { label: "End Date", value: a.endDate },
    { label: "Has Description?", value: a.hasDescription },
    { label: "Is Over Draft?", value: a.isOverDraft },
  ];

  const lines: OcrLine[] = pairs.map((p, i) => ({
    id: uid(),
    label: p.label,
    text: p.value,
    confidence: Math.max(0.55, 0.95 - i * 0.03),
    bbox: { x: 5, y: 5 + i * 9, w: 90, h: 8 },
    page: 1,
    source: "ocr",
  }));

  await new Promise((r) => setTimeout(r, 450));

  return {
    fileName: file.name,
    mime: file.type || "application/octet-stream",
    pages: 0,
    lines,
    createdAt: new Date().toISOString(),
  };
}

type Props = {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
};

type OcrViewStep = "account" | "transactions";
type StatementStatus = "reviewing" | "unapproved" | "approved";

export function OcrWorkbenchModal({ isOpen, file, onClose }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  // panel: OCR / Crop / AI
  const [activePanel, setActivePanel] = useState<"ocr" | "crop" | "ai">("ocr");
  const [isCropMode, setIsCropMode] = useState(false);
  const [highlightedLineId, setHighlightedLineId] = useState<string | null>(null);
  const [cropFocusOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "crop">("all");
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [resizingCropId, setResizingCropId] = useState<string | null>(null);
  const resizeInfoRef = useRef<{
    startX: number;
    startY: number;
    orig: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const [aiRows, setAiRows] = useState<AiRow[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [ocrViewStep, setOcrViewStep] = useState<OcrViewStep>("account");
  const [statementStatus, setStatementStatus] = useState<StatementStatus>("reviewing");

  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  // ✅ กัน hydration/portal issue
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---------- helper: เคลียร์ state + ลบ lines ที่ครอป ----------
  const resetCropStateAndRemoveLines = useCallback(() => {
    setIsCropMode(false);
    setIsCropping(false);
    setCropRect(null);
    setResizingCropId(null);
    resizeInfoRef.current = null;
    setHighlightedLineId(null);
    setEditingLineId(null);

    setResult((prev) =>
      prev
        ? { ...prev, lines: prev.lines.filter((l) => l.source !== "crop") }
        : prev
    );
  }, []);

  // ---------- load file ----------
  const loadFile = useCallback(async (f: File) => {
    setIsLoading(true);
    setEditingLineId(null);
    setIsCropMode(false);
    setHighlightedLineId(null);
    setIsCropping(false);
    setCropRect(null);
    setResizingCropId(null);
    resizeInfoRef.current = null;
    setActivePanel("ocr");
    setAiRows([]);
    setOcrViewStep("account");
    setStatementStatus("reviewing");

    try {
      const isPdfFile = isPdf(f.type || "") || f.name.toLowerCase().endsWith(".pdf");

      const [ocrResult, pageCount] = await Promise.all([
        mockOcr(f),
        isPdfFile
          ? getPdfPageCount(f).catch((err) => {
              console.error("[loadFile] getPdfPageCount error", err);
              return 1;
            })
          : Promise.resolve(1),
      ]);

      const merged: OcrResult = { ...ocrResult, pages: pageCount };

      setResult(merged);
      setCurrentPage(1);

      setAccountDetails(MOCK_ACCOUNT_DETAILS);
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!result) return;
    const total = result.pages || 1;
    setCurrentPage((prev) => {
      if (prev < 1) return 1;
      if (prev > total) return total;
      return prev;
    });
  }, [result]);

  useEffect(() => {
    if (!isOpen || !file) return;
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    loadFile(file);
    return () => URL.revokeObjectURL(url);
  }, [isOpen, file, loadFile]);

  const ensureAiRows = useCallback(() => {
    setAiRows((prev) => {
      if (prev.length) return prev;
      return [
        { id: uid(), label: "ธนาคาร", text: "" },
        { id: uid(), label: "เลขที่อ้างอิง", text: "" },
        { id: uid(), label: "รอบระหว่างวันที่", text: "" },
        { id: uid(), label: "สาขาเจ้าของบัญชี", text: "" },
      ];
    });
  }, []);

  const updateLine = (id: string, patch: Partial<OcrLine>) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lines: prev.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      };
    });
  };

  const handleRemoveCrop = (id: string) => {
    setResult((prev) => {
      if (!prev) return prev;
      const filtered = prev.lines.filter((l) => l.id !== id);
      return { ...prev, lines: filtered };
    });
    setHighlightedLineId((prev) => (prev === id ? null : prev));
    setEditingLineId((prev) => (prev === id ? null : prev));
    if (resizingCropId === id) {
      setResizingCropId(null);
      resizeInfoRef.current = null;
    }
  };

  const visibleLines = React.useMemo(() => {
    if (!result) return [];
    return result.lines.filter((l) => l.source === "crop");
  }, [result]);

  const copyAll = useCallback(() => {
    if (activePanel === "ai") {
      if (!aiRows.length) return;
      const text = aiRows.map((r) => `${r.label}: ${r.text}`).join("\n");
      navigator.clipboard.writeText(text);
      return;
    }

    if (activePanel === "ocr") {
      if (ocrViewStep === "account" && accountDetails) {
        const lines = [
          `Bank Name: ${accountDetails.bankName}`,
          `Account Number: ${accountDetails.accountNumber}`,
          `Account Type: ${accountDetails.accountType}`,
          `Start Date: ${accountDetails.startDate}`,
          `End Date: ${accountDetails.endDate}`,
          `Has Description?: ${accountDetails.hasDescription}`,
          `Is Over Draft?: ${accountDetails.isOverDraft}`,
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        return;
      }

      if (ocrViewStep === "transactions" && transactions.length) {
        const header = "No.,Date,Debit,Credit,Balance,Description";
        const rows = transactions.map((t) =>
          [t.id, t.date, t.debit.toFixed(2), t.credit.toFixed(2), t.balance.toFixed(2), t.description].join(",")
        );
        navigator.clipboard.writeText([header, ...rows].join("\n"));
        return;
      }
    }

    if (!result) return;

    const src =
      activePanel === "crop"
        ? result.lines.filter((l) => l.source === "crop")
        : result.lines.filter((l) => l.source !== "crop");

    const text = src.map((l) => `${l.label}: ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
  }, [activePanel, aiRows, accountDetails, transactions, ocrViewStep, result]);

  // -------- crop handlers --------
  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropMode) return;
    if (e.button !== 0) return;
    if (!previewRef.current) return;
    if (resizingCropId) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsCropping(true);
    setCropRect({ x, y, w: 0, h: 0 });
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();

    if (resizingCropId && resizeInfoRef.current && result) {
      const { startX, startY, orig } = resizeInfoRef.current;
      const dxPx = e.clientX - startX;
      const dyPx = e.clientY - startY;
      const dxPct = (dxPx / rect.width) * 100;
      const dyPct = (dyPx / rect.height) * 100;

      const newW = Math.max(5, Math.min(100 - orig.x, orig.w + dxPct));
      const newH = Math.max(3, Math.min(100 - orig.y, orig.h + dyPct));

      setResult((prev) =>
        prev
          ? {
              ...prev,
              lines: prev.lines.map((l) =>
                l.id === resizingCropId && l.bbox ? { ...l, bbox: { ...l.bbox, w: newW, h: newH } } : l
              ),
            }
          : prev
      );
      return;
    }

    if (!isCropping || !cropRect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setCropRect({ x: cropRect.x, y: cropRect.y, w: currentX - cropRect.x, h: currentY - cropRect.y });
  };

  const finalizeCrop = () => {
    if (!isCropping || !cropRect || !previewRef.current || !result) {
      setIsCropping(false);
      setCropRect(null);
      return;
    }

    const rect = previewRef.current.getBoundingClientRect();
    const startX = cropRect.x;
    const startY = cropRect.y;
    const endX = startX + cropRect.w;
    const endY = startY + cropRect.h;

    const left = Math.max(0, Math.min(startX, endX));
    const top = Math.max(0, Math.min(startY, endY));
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 20 || height < 20) {
      setIsCropping(false);
      setCropRect(null);
      return;
    }

    const xPct = (left / rect.width) * 100;
    const yPct = (top / rect.height) * 100;
    const wPct = (width / rect.width) * 100;
    const hPct = (height / rect.height) * 100;

    const newLines: OcrLine[] = MOCK_FIELDS.map((mf) => ({
      id: uid(),
      label: mf.label,
      text: mf.text,
      confidence: 1,
      bbox: { x: xPct, y: yPct, w: wPct, h: hPct },
      page: 1,
      source: "crop" as const,
    }));

    setResult((prev) => (prev ? { ...prev, lines: [...prev.lines, ...newLines] } : prev));

    setHighlightedLineId(newLines[0].id);
    setViewMode("crop");

    setIsCropping(false);
    setCropRect(null);
  };

  const handleCropMouseUp = () => {
    if (resizingCropId) {
      setResizingCropId(null);
      resizeInfoRef.current = null;
      return;
    }
    finalizeCrop();
  };

  const handleCropMouseLeave = () => {
    if (resizingCropId) {
      setResizingCropId(null);
      resizeInfoRef.current = null;
      return;
    }
    if (!isCropping) return;
    finalizeCrop();
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent<HTMLDivElement>, line: OcrLine) => {
    e.stopPropagation();
    if (!previewRef.current || !line.bbox) return;

    const startX = e.clientX;
    const startY = e.clientY;

    resizeInfoRef.current = { startX, startY, orig: { ...line.bbox } };
    setResizingCropId(line.id);
    setHighlightedLineId(line.id);
  };

  const handleToggleCropMode = () => {
    if (!result) return;

    if (isCropMode) {
      resetCropStateAndRemoveLines();
      setActivePanel("ocr");
      return;
    }

    setActivePanel("crop");
    setIsCropMode(true);
  };

  const runAiGenerate = () => {
    const mockTextMap: Record<string, string> = {
      ธนาคาร: "กสิกรไทย",
      เลขที่อ้างอิง: "22110208370044451707",
      รอบระหว่างวันที่: "01/10/2022-31/10/2022",
      สาขาเจ้าของบัญชี: "สาขาจักรวรร",
    };

    setAiRows((prev) =>
      prev.map((row) => ({
        ...row,
        text: mockTextMap[row.label] || row.text,
      }))
    );

    setActivePanel("ai");
  };

  const statementStatusLabel = (() => {
    switch (statementStatus) {
      case "unapproved":
        return "Unapproved";
      case "approved":
        return "Approved";
      default:
        return "Reviewing";
    }
  })();

  const statementStatusClasses = (() => {
    switch (statementStatus) {
      case "unapproved":
        return "bg-amber-900/40 text-amber-200 border-amber-700";
      case "approved":
        return "bg-emerald-900/40 text-emerald-200 border-emerald-700";
      default:
        return "bg-[#3C3C3C] text-[#F0EEE9B3] border-[#3C3C3C]";
    }
  })();

  if (!isOpen || !file) return null;
  if (!mounted) return null;

  const isPdfFile = isPdf(file.type || "") || file.name.toLowerCase().endsWith(".pdf");

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* modal wrapper */}
      <div className="mx-4 flex w-full max-w-7xl max-h-[90vh] flex-col rounded-3xl border border-[#3C3C3C] bg-[#1E1E1E] shadow-2xl text-[#F0EEE9]">
        {/* header modal */}
        <div className="flex items-center justify-between border-b border-[#3C3C3C] bg-[#252526] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#F0EEE9]">OCR Workbench</h2>
          <button
            onClick={() => {
              resetCropStateAndRemoveLines();
              onClose();
            }}
            className="rounded-full p-1 hover:bg-[#3C3C3C]"
          >
            <X className="h-5 w-5 text-[#F0EEE9B3]" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden px-6 pb-5 pt-4 flex flex-col bg-[#1E1E1E]">
          {/* Statement status bar */}
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#3C3C3C] bg-[#252526] px-4 py-2 text-xs sm:text-sm text-[#F0EEE9B3]">
            <div className="flex items-center gap-2">
              <span
                className={
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs " +
                  statementStatusClasses
                }
              >
                {statementStatusLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatementStatus("unapproved")}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs ${
                    statementStatus === "unapproved"
                      ? "border-amber-500 bg-amber-900/50 text-amber-200"
                      : "border-[#3C3C3C] bg-[#1E1E1E] text-[#F0EEE9B3] hover:bg-[#2D2D2D]"
                  }`}
                >
                  Unapproved
                </button>
                <button
                  type="button"
                  onClick={() => setStatementStatus("approved")}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs ${
                    statementStatus === "approved"
                      ? "border-emerald-500 bg-emerald-900/50 text-emerald-200"
                      : "border-[#3C3C3C] bg-[#1E1E1E] text-[#F0EEE9B3] hover:bg-[#2D2D2D]"
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Responsive layout
              - mobile/iPad: Preview (รูป) ขึ้นก่อน
              - desktop: ซ้ายเป็นรูป ขวาเป็น panel เหมือนเดิม
          */}
          <div className="grid flex-1 min-h-0 grid-cols-1 gap-4 lg:grid-cols-12">
            {/* LEFT: preview (mobile first) */}
            <div className="order-1 col-span-1 min-h-0 lg:order-1 lg:col-span-7">
              <div className="flex h-full min-h-0 items-center justify-center rounded-[24px] border border-[#3C3C3C] bg-[#252526] overflow-hidden">
                {!objectUrl ? (
                  <div className="flex flex-col items-center px-6 py-10 text-center text-sm text-[#F0EEE9B3]">
                    ไม่พบไฟล์สำหรับแสดงผล
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col">
                    {/* file header */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 text-xs text-[#F0EEE9B3] bg-[#2D2D2D]">
                      <div className="flex items-center gap-2 truncate">
                        {isImage(file.type) ? (
                          <FileImage className="h-4 w-4 text-[#F0EEE9B3]" />
                        ) : isPdf(file.type) ? (
                          <FileText className="h-4 w-4 text-[#F0EEE9B3]" />
                        ) : (
                          <FileType className="h-4 w-4 text-[#F0EEE9B3]" />
                        )}
                        <span className="max-w-[200px] truncate">{file.name}</span>
                        <span>• {bytesToPretty(file.size)}</span>
                        {result && <span>• {result.pages} หน้า</span>}
                        {isLoading && <span className="ml-1 text-[#F0EEE9B3]">กำลังประมวลผล OCR...</span>}
                      </div>

                      <button
                        onClick={() => setIsPreviewExpanded((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#3C3C3C] bg-[#333333] px-3 py-1 text-[#F0EEE9B3] hover:bg-[#444444]"
                      >
                        {isPreviewExpanded ? (
                          <>
                            <Minimize2 className="h-3.5 w-3.5" />
                            ย่อ
                          </>
                        ) : (
                          <>
                            <Maximize2 className="h-3.5 w-3.5" />
                            ขยาย
                          </>
                        )}
                      </button>
                    </div>

                    {/* preview */}
                    <div
                      className={`bg-[#1E1E1E] transition-all dark-scrollbar ${
                        isPreviewExpanded
                          ? "h-[45dvh] overflow-auto lg:h-[70vh]"
                          : "h-[220px] overflow-hidden lg:h-[280px]"
                      }`}
                    >
                      <div ref={previewRef} className="relative flex h-full w-full items-start justify-center p-3">
                        {isImage(file.type) && (
                          <img
                            src={objectUrl}
                            alt="preview"
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            className={
                              isPreviewExpanded
                                ? "self-start max-w-full rounded-xl shadow-xl"
                                : "self-start max-h-full max-w-full rounded-xl object-contain shadow-xl"
                            }
                          />
                        )}

                        {isPdfFile && (
                          <>
                            {!isCropMode && (
                              <iframe
                                key={currentPage}
                                src={`${objectUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                                className="h-full w-full rounded-xl bg-white shadow-xl"
                                title="pdf-preview"
                              />
                            )}

                            {isCropMode && <PdfCanvasViewer file={file} page={currentPage} />}
                          </>
                        )}

                        {/* overlay */}
                        <div
                          className="absolute inset-0"
                          style={{
                            pointerEvents: isCropMode || isCropping || resizingCropId ? "auto" : "none",
                          }}
                          onMouseDown={handleCropMouseDown}
                          onMouseMove={handleCropMouseMove}
                          onMouseUp={handleCropMouseUp}
                          onMouseLeave={handleCropMouseLeave}
                        >
                          {result &&
                            result.lines
                              .filter(
                                (l) =>
                                  l.source === "crop" &&
                                  l.bbox &&
                                  (!cropFocusOnly || l.id === highlightedLineId)
                              )
                              .map((line) => {
                                const { x, y, w, h } = line.bbox!;
                                const isActive = highlightedLineId === line.id;
                                return (
                                  <div
                                    key={line.id}
                                    className={`absolute rounded-md border shadow-sm transition ${
                                      isActive
                                        ? "border-[#007ACC] bg-cyan-300/25"
                                        : "border-[#3157E0] bg-cyan-200/10 hover:bg-cyan-200/20"
                                    }`}
                                    style={{
                                      left: `${x}%`,
                                      top: `${y}%`,
                                      width: `${w}%`,
                                      height: `${h}%`,
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setHighlightedLineId(line.id);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHighlightedLineId(line.id);
                                    }}
                                  >
                                    {isActive && (
                                      <div className="absolute right-1 top-1 flex gap-1">
                                        <button
                                          className="inline-flex items-center justify-center rounded-full border border-[#3C3C3C] bg-[#1E1E1E]/90 p-1 shadow-sm hover:bg-[#2D2D2D]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCrop(line.id);
                                          }}
                                          title="ลบบรรทัดที่ครอปนี้"
                                        >
                                          <X className="h-3 w-3 text-[#F0EEE9]" />
                                        </button>
                                      </div>
                                    )}

                                    <div
                                      className="absolute right-0 bottom-0 h-3 w-3 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border border-[#007ACC] bg-white shadow"
                                      onMouseDown={(e) => handleResizeHandleMouseDown(e, line)}
                                    />
                                  </div>
                                );
                              })}

                          {isCropping && cropRect && (
                            <div
                              className="pointer-events-none absolute border-2 border-[#007ACC] bg-cyan-300/20"
                              style={{
                                left: `${Math.min(cropRect.x, cropRect.x + cropRect.w)}px`,
                                top: `${Math.min(cropRect.y, cropRect.y + cropRect.h)}px`,
                                width: `${Math.abs(cropRect.w)}px`,
                                height: `${Math.abs(cropRect.h)}px`,
                              }}
                            />
                          )}

                          {isCropMode && <div className="pointer-events-none absolute inset-0 cursor-crosshair" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: panel (mobile second) */}
            <div className="order-2 col-span-1 min-h-0 lg:order-2 lg:col-span-5">
              <div className="flex h-full flex-col rounded-[24px] border border-[#3C3C3C] bg-[#252526]">
                {/* header tabs */}
                <div className="flex items-center justify-between border-b border-[#3C3C3C] bg-[#2D2D2D] px-4 pt-3 pb-2">
                  <div className="flex flex-1 items-center gap-2">
                    <LayoutPanelLeft className="h-4 w-4 text-[#F0EEE9]" />

                    <div className="flex rounded-full p-1 gap-2">
                      <button
                        onClick={() => {
                          if (activePanel === "crop" || isCropMode) resetCropStateAndRemoveLines();
                          setActivePanel("ocr");
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs sm:text-sm ${
                          activePanel === "ocr"
                            ? "border border-[#007ACC] bg-[#333333] text-[#F0EEE9] shadow-sm"
                            : "text-[#F0EEE9B3] border border-[#3C3C3C]"
                        }`}
                      >
                        ผลลัพธ์ OCR
                      </button>

                      <button
                        onClick={() => {
                          if (!result) return;
                          if (activePanel === "crop" || isCropMode) resetCropStateAndRemoveLines();
                          setActivePanel("ai");
                          ensureAiRows();
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs sm:text-sm ${
                          activePanel === "ai"
                            ? "border border-[#007ACC] bg-[#333333] text-[#F0EEE9] shadow-sm"
                            : "text-[#F0EEE9B3] border border-[#3C3C3C]"
                        }`}
                      >
                        AI Generate
                      </button>
                    </div>

                    {activePanel === "ocr" && (
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setOcrViewStep("account")}
                          disabled={ocrViewStep === "account"}
                          title="Account Details"
                          className="inline-flex items-center justify-center rounded-full border border-[#3C3C3C] bg-[#1E1E1E] p-1.5 text-[#F0EEE9B3] hover:bg-[#2D2D2D] disabled:opacity-40"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setOcrViewStep("transactions")}
                          disabled={ocrViewStep === "transactions"}
                          title="View Transactions"
                          className="inline-flex items-center justify-center rounded-full border border-[#3C3C3C] bg-[#1E1E1E] p-1.5 text-[#F0EEE9B3] hover:bg-[#2D2D2D] disabled:opacity-40"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {activePanel === "ai" && (
                    <button
                      onClick={runAiGenerate}
                      className="ml-3 inline-flex items-center gap-1 rounded-full bg-[#007ACC] px-3 py-1.5 text-xs text-white hover:bg-[#007ACC]/90 sm:text-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Try AI...</span>
                    </button>
                  )}
                </div>

                {/* content */}
                <div className="flex-1 min-h-0 overflow-auto">
                  {activePanel === "ocr" && (
                    <>
                      {!result && isLoading ? (
                        <div className="p-6 text-sm text-[#F0EEE9B3]">กำลังโหลดผลลัพธ์ OCR...</div>
                      ) : !accountDetails ? (
                        <div className="p-6 text-sm text-[#F0EEE9B3]">
                          ยังไม่มีข้อมูล Account Details (ลองโหลดไฟล์อีกครั้ง)
                        </div>
                      ) : (
                        <div className="flex min-h-full flex-col">
                          {ocrViewStep === "account" ? (
                            <OcrAccountDetailsStep
                              accountDetails={accountDetails}
                              statementStatus={statementStatus === "approved" ? "approved" : "unapproved"}
                              onChangeAccountDetails={(nextAccount) => setAccountDetails(nextAccount)}
                            />
                          ) : (
                            <OcrTransactionStep
                              transactions={transactions}
                              statementStatus={statementStatus === "approved" ? "approved" : "unapproved"}
                              onBackToAccount={() => setOcrViewStep("account")}
                              currentPage={currentPage}
                              totalPages={result?.pages ?? 1}
                              onChangePage={setCurrentPage}
                              onChangeTransactions={setTransactions}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {activePanel === "ai" && (
                    <>
                      {result ? (
                        <AiPanel aiRows={aiRows} setAiRows={setAiRows} />
                      ) : (
                        <div className="p-6 text-sm text-[#F0EEE9B3]">ต้องมีผลลัพธ์ OCR ก่อนจึงจะใช้ AI Generate ได้</div>
                      )}
                    </>
                  )}
                </div>

                {/* footer */}
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#3C3C3C] bg-[#252526] px-4 py-2">
                  <button
                    onClick={() => {
                      if (!result) return;
                      if (activePanel === "crop" || isCropMode) {
                        resetCropStateAndRemoveLines();
                      } else {
                        setIsCropMode(false);
                      }
                      setActivePanel("ai");
                      ensureAiRows();
                    }}
                    disabled={!result}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm bg-[#007ACC] text-[#F0EEE9] hover:bg-[#007ACC]/90 disabled:opacity-50 ${
                      activePanel === "ai" ? "border-[#007ACC] ring-2 ring-[#1D3559]" : "border-[#3C3C3C]"
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Assistance
                  </button>

                  {/* โหมดครอบข้อความ – future */}
                  {/*
                  <button
                    onClick={handleToggleCropMode}
                    disabled={!result || !(isImage(result?.mime || "") || isPdf(result?.mime || ""))}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm bg-[#1E1E1E] text-[#F0EEE9] hover:bg-[#2D2D2D] disabled:opacity-50 ${
                      isCropMode && activePanel === "crop"
                        ? "border-[#00A6DF] ring-2 ring-[#1D3559]"
                        : "border-[#3C3C3C]"
                    }`}
                  >
                    <Highlighter className="h-4 w-4" />
                    โหมดครอบข้อความ
                  </button>
                  */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
