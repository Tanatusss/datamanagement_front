import { MainDocType } from "./ocrTypeConfig";

// src/components/ocr/types.ts
export type OcrLine = {
  id: string;
  label: string;
  text: string;
  confidence: number; // 0..1
  bbox?: { x: number; y: number; w: number; h: number };
  page?: number;
  source?: "ocr" | "crop";
};

export type AiRow = {
  id: string;
  label: string;
  text: string;
};

export type OcrResult = {
  fileName: string;
  mime: string;
  pages: number;
  lines: OcrLine[];
  createdAt: string;
};

export type UploadedDoc = {
  id: string;
  file: File;
  name: string;
  size: number;
  docType: string;
  bank?: string | null; // ⬅️ ใช้แทน owner
  status: "waiting" | "ocr_done";
};

// ---------- utilities ----------
export const bytesToPretty = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImage = (mime = "") => mime.startsWith("image/");
export const isPdf = (mime = "") => mime === "application/pdf";

export const uid = () => Math.random().toString(36).slice(2, 10);

export type DocRow = {
  id: string;
  file: File;                // เก็บ file object จริงไว้เลย
  fileName: string;          // file.name
  size: number;              // file.size
  typeOfDocument: MainDocType; // เช่น "BANK_STATEMENT"
  owner: string;
  status: "WAITING" | "SENT" | "DONE";
};


