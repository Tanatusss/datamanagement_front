// src/components/orc/OcrTransactionStep.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, X } from "lucide-react";
import type { TransactionRow, StatementStatus } from "./bankTypes";

type OcrTransactionStepProps = {
  transactions: TransactionRow[];
  statementStatus: StatementStatus;
  onBackToAccount: () => void;

  currentPage: number;
  totalPages: number;
  onChangePage: (page: number) => void;

  onChangeTransactions: (rows: TransactionRow[]) => void;
};

export function OcrTransactionStep({
  transactions,
  statementStatus,
  onBackToAccount,
  currentPage,
  totalPages,
  onChangePage,
  onChangeTransactions,
}: OcrTransactionStepProps) {
  const [pageInput, setPageInput] = useState<string>(
    String(currentPage || 1)
  );

  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  useEffect(() => {
    setPageInput(String(currentPage || 1));
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (!totalPages) return;
    const clamped = Math.min(Math.max(page, 1), totalPages);
    onChangePage(clamped);
  };

  const handlePrev = () => {
    goToPage(currentPage - 1);
  };

  const handleNext = () => {
    goToPage(currentPage + 1);
  };

  const handlePageInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return;
    const value = Number(pageInput);
    if (Number.isNaN(value)) return;
    goToPage(value);
  };

  const handleDeleteRow = (id: number) => {
    onChangeTransactions(transactions.filter((tx) => tx.id !== id));
    if (editingRowId === id) {
      setEditingRowId(null);
    }
  };

  const handleChangeTextField = (
    id: number,
    field: "date" | "code" | "description" | "channel",
    value: string
  ) => {
    onChangeTransactions(
      transactions.map((tx) =>
        tx.id === id
          ? {
            ...tx,
            [field]: value,
          }
          : tx
      )
    );
  };

  const handleChangeNumberField = (
    id: number,
    field: "debit" | "credit" | "balance",
    value: string
  ) => {
    const num = value === "" ? 0 : Number(value);
    onChangeTransactions(
      transactions.map((tx) =>
        tx.id === id
          ? {
            ...tx,
            [field]: Number.isNaN(num) ? 0 : num,
          }
          : tx
      )
    );
  };

  const handleAddRow = () => {
    const nextId =
      transactions.length > 0
        ? Math.max(...transactions.map((t) => t.id)) + 1
        : 1;

    const newRow: TransactionRow = {
      id: nextId,
      date: "",
      code: "",
      channel: "",
      debit: 0,
      credit: 0,
      balance: 0,
      description: "",
    };

    onChangeTransactions([...transactions, newRow]);
    setEditingRowId(nextId);
  };

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
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#F0EEE9]">
            Page {currentPage} – Transactions
          </p>
          <p className="text-xs text-[#F0EEE9B3]">
            รายการเคลื่อนไหวบัญชี • Total {totalPages} pages
          </p>

          {/* Page controls */}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#F0EEE9B3]">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 rounded-full border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-0.5 text-[11px] text-[#F0EEE9B3] hover:bg-[#333333] disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </button>

            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={totalPages || 1}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={handlePageInputKeyDown}
                className="w-14 rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-1.5 py-0.5 text-center text-[11px] text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
              />
              <span className="text-[11px] text-[#F0EEE9B3]">
                / {totalPages || 1}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-0.5 text-[11px] text-[#F0EEE9B3] hover:bg-[#333333] disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
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

      {/* ตาราง Transactions */}
      <div className="px-5 py-4">
        <div className="max-h-[320px] overflow-auto rounded-xl border border-[#3C3C3C] bg-[#252526] dark-scrollbar">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="sticky top-0 z-10 border-b border-[#3C3C3C] bg-[#2D2D2D] text-[#F0EEE9B3]">
              <tr>
                <th className="w-10 px-3 py-2 text-left">#</th>
                <th className="w-30 px-3 py-2 text-left">Date</th>
                <th className="w-15 px-3 py-2 text-right">Code</th>
                <th className="w-28 px-3 py-2 text-left">Channel</th>
                <th className="w-50 px-3 py-2 text-right">Debit</th>
                <th className="w-50 px-3 py-2 text-right">Credit</th>
                <th className="w-50 px-3 py-2 text-right">Balance</th>
                <th className="min-w-[180px] px-3 py-2 text-left">
                  Description
                </th>
                <th className="w-24 px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => {
                const isEditing = editingRowId === tx.id;

                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[#333333] transition hover:bg-[#333333]"
                  >
                    {/* # */}
                    <td className="px-3 py-2 text-[#F0EEE9B3]">{tx.id}</td>

                    {/* Date */}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tx.date}
                          onChange={(e) =>
                            handleChangeTextField(
                              tx.id,
                              "date",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-xs text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
                          placeholder="YYYY-MM-DD"
                        />
                      ) : (
                        <span className="text-[#F0EEE9]">
                          {tx.date || "-"}
                        </span>
                      )}
                    </td>

                    {/* Code */}
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tx.code}
                          onChange={(e) =>
                            handleChangeTextField(
                              tx.id,
                              "code",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-xs text-right text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
                          placeholder="Code"
                        />
                      ) : (
                        <span className="text-[#F0EEE9]">
                          {tx.code || "-"}
                        </span>
                      )}
                    </td>

                    {/* Channel */}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tx.channel}
                          onChange={(e) =>
                            handleChangeTextField(
                              tx.id,
                              "channel",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-xs text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
                          placeholder="Channel"
                        />
                      ) : (
                        <span className="text-[#F0EEE9]">
                          {tx.channel || "-"}
                        </span>
                      )}
                    </td>

                    {/* Debit */}
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tx.debit}
                          onChange={(e) =>
                            handleChangeNumberField(
                              tx.id,
                              "debit",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-xs text-right text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
                        />
                      ) : (
                        <span className="text-[#F0EEE9]">
                          {tx.debit.toLocaleString("en-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </td>

                    {/* Credit */}
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tx.credit}
                          onChange={(e) =>
                            handleChangeNumberField(
                              tx.id,
                              "credit",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-xs text-right text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
                        />
                      ) : (
                        <span className="text-[#F0EEE9]">
                          {tx.credit.toLocaleString("en-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <input
                          type="text"
                          value={tx.balance}
                          onChange={(e) =>
                            handleChangeNumberField(
                              tx.id,
                              "balance",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-xs text-right text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC33]"
                        />
                      ) : (
                        <span className="text-[#F0EEE9]">
                          {tx.balance.toLocaleString("en-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <textarea
                          value={tx.description}
                          onChange={(e) =>
                            handleChangeTextField(
                              tx.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-full rounded-lg border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1.5 text-xs leading-5 text-[#F0EEE9] outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC33]"
                        />
                      ) : (
                        <div className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap text-[#F0EEE9B3]">
                          {tx.description}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-[11px] text-[#F0EEE9B3] hover:bg-[#333333]"
                          onClick={() =>
                            setEditingRowId((prev) =>
                              prev === tx.id ? null : tx.id
                            )
                          }
                          title="แก้ไขทั้งแถว"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md border border-[#3C3C3C] bg-[#1E1E1E] px-2 py-1 text-[11px] text-[#F0EEE9B3] hover:bg-[#333333]"
                          onClick={() => handleDeleteRow(tx.id)}
                          title="ลบแถวนี้"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ปุ่ม + เพิ่มแถว */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#007ACC] bg-[#007ACC] px-3 py-1.5 text-xs text-[#F0EEE9] hover:bg-[#007ACC]/90 hover:text-white sm:text-sm"
          >
            <span className="text-lg leading-none">＋</span>
            เพิ่มรายการใหม่
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto sticky bottom-0 left-0 right-0 flex items-center justify-end border-t border-[#3C3C3C] bg-[#252526] px-5 py-3 text-xs sm:text-sm">
        <button
          type="button"
          onClick={() => console.log("Save clicked")}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-white shadow hover:bg-emerald-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
