// src/components/orc/PdfCanvasViewer.tsx
"use client";

import React, { useEffect, useRef } from "react";

type PdfCanvasViewerProps = {
  file: File;
  page: number;
};

export function PdfCanvasViewer({ file, page }: PdfCanvasViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pdfDoc: any;

    async function renderPage() {
      try {
        const buffer = await file.arrayBuffer();
        const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");

        const loadingTask = pdfjs.getDocument({
          data: buffer,
          disableWorker: true, // ปิด worker
        } as any);

        pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        const pageObj = await pdfDoc.getPage(page);
        const viewport = pageObj.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderTask = pageObj.render({
          canvasContext: ctx,
          viewport,
          canvas, // ✅ ใส่ canvas ให้ TS ไม่บ่น RenderParameters
        } as any);

        await renderTask.promise;
      } catch (err) {
        console.error("[PdfCanvasViewer] render error", err);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      if (pdfDoc && typeof pdfDoc.destroy === "function") {
        pdfDoc.destroy();
      }
    };
  }, [file, page]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full max-h-full rounded-xl shadow bg-white"
    />
  );
}
