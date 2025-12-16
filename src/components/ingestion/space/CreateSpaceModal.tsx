"use client";

import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function CreateSpaceModal({ open, onClose, onCreate }: Props) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Modal */}
      <div
        className="
          w-full max-w-md rounded-xl
          bg-[#111827] border border-[#1F2937]
          shadow-[0_8px_30px_rgba(0,0,0,0.45)]
          animate-[fadeIn_0.15s_ease-out]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
          <h2 className="text-sm font-semibold text-[#F0EEE9]">
            Create a space
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <p className="text-xs text-[#94a3b8]">
            Spaces help you organize ingestion flows for different domains or
            teams within your project.
          </p>

          {/* Name input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#CBD5E1]">
              Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing, Product, Finance"
              className="
                w-full rounded-md px-3 py-2 text-sm
                bg-[#0F172A] border border-[#1E293B]
                text-[#F0EEE9] placeholder-[#64748B]
                outline-none
                focus:border-sky-500 focus:ring-1 focus:ring-sky-500
                transition
              "
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-3 py-1.5 text-xs rounded-md
                border border-[#334155] text-[#CBD5E1]
                hover:bg-[#1E293B] transition
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                px-3 py-1.5 text-xs rounded-md font-medium
                bg-sky-500 text-[#F0EEE9]
                border border-sky-500
                hover:bg-sky-400 hover:border-sky-400
                transition
              "
            >
              Create Space
            </button>
          </div>
        </form>
      </div>
    </div>,

    document.body
  );
}
