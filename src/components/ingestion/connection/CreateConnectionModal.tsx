// src/components/ingestion/connection/CreateConnectionModal.tsx
"use client";

import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ConnectionSettingsStep } from "./ConnectionSettingsStep";
import {
  DB_SECTIONS,
  DbType,
  getDbIconForType,
} from "@/components/ingestion/dbCatalog";

// db ที่รองรับตอนนี้
const SUPPORTED_TYPES: DbType[] = ["PostgreSQL", "Oracle", "SQL Server"];

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, type: DbType) => void;
};

export function CreateConnectionModal({ open, onClose, onCreate }: Props) {
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<DbType | null>(null);
  const [name, setName] = useState("");

  // test connection modal
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "pass" | "fail"
  >("idle");
  const [testModalOpen, setTestModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSelectedType(null);
    setName("");
    setTestStatus("idle");
    setTestModalOpen(false);
  }, [open]);

  if (!mounted) return null;

  const handleNext = () => {
    if (!selectedType) return;
    if (!name.trim()) setName(`${selectedType} connection`);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setTestStatus("idle");
    setTestModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !name.trim()) return;
    onCreate(name.trim(), selectedType);
  };

  const handleTestConnection = () => {
    setTestModalOpen(true);
    setTestStatus("testing");
    setTimeout(() => setTestStatus("pass"), 900);
  };

  /* ========================= MODAL ========================= */

  const mainModal = open ? (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm p-4">
      <div
        className="
          w-full max-w-4xl max-h-[90vh]
          overflow-hidden flex flex-col
          rounded-2xl bg-[#111827]
          border border-[#1F2937]
          shadow-[0_12px_40px_rgba(0,0,0,0.7)]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
          <h2 className="text-sm font-semibold text-[#F0EEE9]">
            {step === 1 ? "Add a new source" : "Connection Settings"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-6">
            {step === 1 ? (
              DB_SECTIONS.map((section) => (
                <div key={section.key} className="space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    {section.label}
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {section.items
                      .slice()
                      .sort((a, b) => {
                        const aSupported = SUPPORTED_TYPES.includes(a.type as DbType);
                        const bSupported = SUPPORTED_TYPES.includes(b.type as DbType);

                        // ⭐ active / supported มาก่อน
                        if (aSupported !== bSupported) {
                          return aSupported ? -1 : 1;
                        }

                        // ⭐ ภายในกลุ่มเดียวกัน เรียงตามชื่อ
                        return a.type.localeCompare(b.type);
                      })
                      .map((item) => {
                        const type = item.type as DbType;
                        const isSupported = SUPPORTED_TYPES.includes(type);
                        const isSelected = selectedType === type;
                        const icon = getDbIconForType(type);

                        return (
                          <button
                            key={item.type}
                            type="button"
                            disabled={!isSupported}
                            onClick={() => {
                              if (!isSupported) return;
                              setSelectedType(type);
                              setName(`${type} connection`);
                            }}
                            className={[
                              // ⭐ FIX หลัก: ล็อกความสูงเท่ากันทุกใบ
                              "h-24 w-full",
                              "rounded-md border",
                              "flex flex-col items-center justify-between",
                              "px-2 py-2",
                              "text-xs sm:text-sm font-medium",
                              isSupported
                                ? "bg-[#020617] text-[#E5E7EB] border-[#1F2937] hover:border-sky-500/70"
                                : "bg-[#020617]/70 text-slate-500 border-slate-800 opacity-40 cursor-not-allowed",
                              isSelected
                                ? "border-sky-500 ring-1 ring-sky-500/60"
                                : "",
                            ].join(" ")}
                          >
                            {/* Icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#020617] border border-[#1F2937]">
                              {icon ? (
                                <img
                                  src={icon}
                                  alt={item.type}
                                  className="h-8 w-8 object-contain"
                                  draggable={false}
                                />
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  {item.type}
                                </span>
                              )}
                            </div>

                            {/* Name (บรรทัดเดียว) */}
                            <span className="w-full truncate text-center">
                              {item.type}
                            </span>

                            {/* Coming soon (จองพื้นที่เท่ากันทุกใบ) */}
                            <span
                              className={[
                                "text-[10px] leading-none",
                                isSupported
                                  ? "invisible"
                                  : "text-slate-500",
                              ].join(" ")}
                            >
                              Coming soon
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))
            ) : (
              <ConnectionSettingsStep
                selectedType={selectedType!}
                name={name}
                onChangeName={setName}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#1F2937] bg-[#020617]/80">
            {step === 2 ? (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="px-3 py-1.5 rounded-md bg-sky-500 text-[#020617]"
              >
                {testStatus === "testing" ? "Testing..." : "Test Connection"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-1.5 rounded-md border border-[#374151]"
                >
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedType}
                  className="px-4 py-1.5 rounded-md bg-sky-500 text-[#020617]"
                >
                  Next
                </button>
              )}

              {step === 2 && (
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-sky-500 text-[#020617]"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return createPortal(mainModal, document.body);
}
