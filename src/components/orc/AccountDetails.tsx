"use client";

import { CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import React, { useState } from "react";

type AccountDetails = {
  bankName: string;
  accountNumber: string;
  accountType: string;
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  hasDescription: "YES" | "NO";
  isOverdraft: "YES" | "NO";
};

type TransactionRow = {
  id: number;
  date: string;      // dd/mm/yyyy หรือ string ที่คุณต้องการ
  debit: number;
  credit: number;
  balance: number;
  description: string;
};

type Props = {
  account: AccountDetails;
  transactions: TransactionRow[];
};

export default function BankStatementResultPage({
  account: initialAccount,
  transactions,
}: Props) {
  // step: account details หรือ transactions
  const [step, setStep] = useState<"account" | "transactions">("account");
  const [status, setStatus] = useState<"unapproved" | "approved">("unapproved");
  const [account, setAccount] = useState<AccountDetails>(initialAccount);

  const handleApprove = () => {
    setStatus("approved");
    setStep("transactions");
  };

  const isApproved = status === "approved";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header title + status */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {step === "account" ? "Account Details" : "Page 55 – Transactions"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Review และยืนยันรายละเอียดจาก Bank Statement
            </p>
          </div>

          {/* Status pill (เหมือนมุมขวาบนในรูป) */}
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm shadow-sm ${
              isApproved
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{isApproved ? "Approved" : "Unapproved"}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </div>

        {/* CARD */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
          {step === "account" ? (
            <>
              {/* Account Details form */}
              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Bank Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {/* Bank Name <span className="text-[11px] text-slate-400 ml-1">ชื่อธนาคาร</span> */}
                    ชื่อบริษัทจำกัด <span className="text-[11px] text-slate-400 ml-1"></span>
                  </label>
                  <select
                    value={account.bankName}
                    onChange={(e) =>
                      setAccount((prev) => ({ ...prev, bankName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  >
                    {/* <option value="SCB - ธนาคารไทยพาณิชย์">
                      SCB - ธนาคารไทยพาณิชย์
                    </option>
                    <option value="KBANK - ธนาคารกสิกรไทย">
                      KBANK - ธนาคารกสิกรไทย
                    </option>
                    <option value="BBL - ธนาคารกรุงเทพ">
                      BBL - ธนาคารกรุงเทพ
                    </option> */}
                    <p>ธรรมรักษาดีเวลลอปเม้นท์</p>
                    {/* เพิ่ม option ตามจริงได้ */}
                  </select>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Account Number{" "}
                    <span className="text-[11px] text-slate-400 ml-1">
                      เลขบัญชีธนาคาร
                    </span>
                  </label>
                  <input
                    value={account.accountNumber}
                    onChange={(e) =>
                      setAccount((prev) => ({
                        ...prev,
                        accountNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Account Type{" "}
                    <span className="text-[11px] text-slate-400 ml-1">
                      ประเภทบัญชี
                    </span>
                  </label>
                  <select
                    value={account.accountType}
                    onChange={(e) =>
                      setAccount((prev) => ({
                        ...prev,
                        accountType: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="SAVING">SAVING</option>
                    <option value="CURRENT">CURRENT</option>
                    <option value="FIXED">FIXED</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Start Date{" "}
                    <span className="text-[11px] text-slate-400 ml-1">
                      วันที่เริ่มต้น
                    </span>
                  </label>
                  <input
                    type="date"
                    value={account.startDate}
                    onChange={(e) =>
                      setAccount((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    End Date{" "}
                    <span className="text-[11px] text-slate-400 ml-1">
                      วันที่สิ้นสุด
                    </span>
                  </label>
                  <input
                    type="date"
                    value={account.endDate}
                    onChange={(e) =>
                      setAccount((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                {/* Has Description? */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Has Description?
                    <span className="text-[11px] text-slate-400 ml-1">
                      มีคำอธิบายหรือไม่
                    </span>
                  </label>
                  <select
                    value={account.hasDescription}
                    onChange={(e) =>
                      setAccount((prev) => ({
                        ...prev,
                        hasDescription: e.target.value as "YES" | "NO",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                  </select>
                </div>

                {/* Is Over Draft? */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Is Over Draft?
                    <span className="text-[11px] text-slate-400 ml-1">
                      บัญชี O.D. หรือไม่
                    </span>
                  </label>
                  <select
                    value={account.isOverdraft}
                    onChange={(e) =>
                      setAccount((prev) => ({
                        ...prev,
                        isOverdraft: e.target.value as "YES" | "NO",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="NO">NO</option>
                    <option value="YES">YES</option>
                  </select>
                </div>
              </div>

              {/* footer ปุ่ม */}
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
                <p className="text-xs text-slate-400">
                  ตรวจสอบให้ครบถ้วนก่อนกด Approve
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Transactions table */}
              <div className="px-6 py-5">
                <div className="overflow-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left w-10">#</th>
                        <th className="px-3 py-2 text-left w-28">Date</th>
                        <th className="px-3 py-2 text-right w-28">Debit</th>
                        <th className="px-3 py-2 text-right w-28">Credit</th>
                        <th className="px-3 py-2 text-right w-32">Balance</th>
                        <th className="px-3 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-3 py-2 text-slate-500">{tx.id}</td>
                          <td className="px-3 py-2">{tx.date}</td>
                          <td className="px-3 py-2 text-right">
                            {tx.debit.toLocaleString("en-TH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {tx.credit.toLocaleString("en-TH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {tx.balance.toLocaleString("en-TH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {tx.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
                <span>Approved • Ready for export / save</span>
                {/* ปุ่มอื่นๆ เช่น Download, Save to Backend เอามาใส่ตรงนี้ได้ */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
