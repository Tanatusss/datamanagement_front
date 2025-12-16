// src/components/orc/pdfUtils.ts
"use client";

export async function getPdfPageCount(file: File): Promise<number> {
  // กันกรณีเผลอเรียกจาก server
  if (typeof window === "undefined") {
    return 1;
  }

  const buffer = await file.arrayBuffer();

  // ใช้ dynamic import เพื่อไม่ให้ pdfjs รันตอน SSR
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");

  // ✅ ตั้ง workerSrc ให้ถูก (ใช้ unpkg + version เดียวกับที่ติดตั้ง)
  if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjs.getDocument({
    data: buffer,
  } as any);

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages || 1;
  console.log("[getPdfPageCount] file:", file.name, "pages:", numPages);
  return numPages;
}
