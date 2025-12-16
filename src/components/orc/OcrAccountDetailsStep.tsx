// src/components/orc/OcrAccountDetailsStep.tsx
"use client";

import React from "react";
import type { AccountDetails, StatementStatus } from "./bankTypes";
import { DOC_TYPE_CONFIG } from "./ocrTypeConfig";

type OcrAccountDetailsStepProps = {
  accountDetails: AccountDetails;
  statementStatus: StatementStatus; // reviewer/unapproved/approved
  onChangeAccountDetails: (next: AccountDetails) => void;
};

export function OcrAccountDetailsStep({
  accountDetails,
  statementStatus,
  onChangeAccountDetails,
}: OcrAccountDetailsStepProps) {
  const handleChange =
    <K extends keyof AccountDetails>(key: K) =>
    (value: AccountDetails[K]) => {
      onChangeAccountDetails({
        ...accountDetails,
        [key]: value,
      });
    };

  // ดึง option ของ Bank Statement
  const bankOptions = DOC_TYPE_CONFIG.BANK_STATEMENT.options;

  const fallbackBankLabel = "None";
  const selectedBankName =
    accountDetails.bankName && accountDetails.bankName.trim().length > 0
      ? accountDetails.bankName
      : fallbackBankLabel;

  const statusLabel =
    statementStatus === "approved"
      ? "Approved"
      : statementStatus === "unapproved"
      ? "Unapproved"
      : "Reviewing";

  const statusClasses =
    statementStatus === "approved"
      ? "border-emerald-500 text-emerald-200 bg-emerald-900/40"
      : statementStatus === "unapproved"
      ? "border-amber-500 text-amber-200 bg-amber-900/40"
      : "border-slate-500 text-slate-200 bg-slate-800/60";

  return (
    <div className="flex min-h-full flex-col bg-[#252526] text-[#F0EEE9]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#3C3C3C] bg-[#2D2D2D] px-5 pt-4 pb-3">
        <div>
          <p className="text-sm font-semibold text-[#F0EEE9]">
            Account Details
          </p>
          <p className="text-xs text-[#F0EEE9B3]">
            สรุปหัวเอกสารจาก Bank Statement
          </p>
        </div>

        <span
          className={
            "inline-flex items-center rounded-full border px-3 py-1 text-[11px] " +
            statusClasses
          }
        >
          {statusLabel}
        </span>
      </div>

      {/* ฟอร์ม account */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-4 md:grid-cols-2">
        {/* Bank Name */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            Bank Name{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              ชื่อธนาคาร
            </span>
          </label>
          <select
            value={selectedBankName}
            onChange={(e) => handleChange("bankName")(e.target.value)}
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          >
            {bankOptions.map((opt) => (
              <option
                key={opt.value}
                value={opt.label}
                className="bg-[#1E1E1E] text-[#F0EEE9]"
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            Account Number{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              เลขบัญชีธนาคาร
            </span>
          </label>
          <input
            value={accountDetails.accountNumber}
            onChange={(e) =>
              handleChange("accountNumber")(e.target.value)
            }
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            Account Type{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              ประเภทบัญชี
            </span>
          </label>
          <select
            value={accountDetails.accountType}
            onChange={(e) =>
              handleChange("accountType")(e.target.value)
            }
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          >
            <option value="SAVING" className="bg-[#1E1E1E] text-[#F0EEE9]">
              SAVING
            </option>
            <option value="CURRENT" className="bg-[#1E1E1E] text-[#F0EEE9]">
              CURRENT
            </option>
            <option value="FIXED" className="bg-[#1E1E1E] text-[#F0EEE9]">
              FIXED
            </option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            Start Date{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              วันที่เริ่มต้น
            </span>
          </label>
          <input
            type="date"
            value={accountDetails.startDate}
            onChange={(e) =>
              handleChange("startDate")(e.target.value)
            }
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            End Date{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              วันที่สิ้นสุด
            </span>
          </label>
          <input
            type="date"
            value={accountDetails.endDate}
            onChange={(e) =>
              handleChange("endDate")(e.target.value)
            }
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          />
        </div>

        {/* Has Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            Has Description?{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              มีคำอธิบายหรือไม่
            </span>
          </label>
          <select
            value={accountDetails.hasDescription}
            onChange={(e) =>
              handleChange("hasDescription")(
                e.target.value as "YES" | "NO"
              )
            }
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          >
            <option value="YES" className="bg-[#1E1E1E] text-[#F0EEE9]">
              YES
            </option>
            <option value="NO" className="bg-[#1E1E1E] text-[#F0EEE9]">
              NO
            </option>
          </select>
        </div>

        {/* Is Over Draft */}
        <div>
          <label className="mb-1 block text-xs font-medium text-[#F0EEE9]">
            Is Over Draft?{" "}
            <span className="ml-1 text-[11px] text-[#F0EEE9B3]">
              บัญชี O.D. หรือไม่
            </span>
          </label>
          <select
            value={accountDetails.isOverDraft}
            onChange={(e) =>
              handleChange("isOverDraft")(
                e.target.value as "YES" | "NO"
              )
            }
            className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-3 py-2 text-sm text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
          >
            <option value="NO" className="bg-[#1E1E1E] text-[#F0EEE9]">
              NO
            </option>
            <option value="YES" className="bg-[#1E1E1E] text-[#F0EEE9]">
              YES
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
