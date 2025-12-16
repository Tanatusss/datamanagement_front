// src/components/orc/bankTypes.ts


export type StatementStatus = "reviewer" | "unapproved" | "approved";

export type AccountDetails = {
  bankName: string;
  accountNumber: string;
  accountType: string;
  startDate: string; // yyyy-mm-dd
  endDate: string;
  hasDescription: "YES" | "NO";
  isOverDraft: "YES" | "NO";
};

export type TransactionRow = {
  id: number;
  date: string;
  channel: string,
  code: string;
  debit: number;
  credit: number;
  balance: number;
  description: string;
};

export type BankType =
  | "SCB"
  | "KBANK"
  | "BBL"
  | "KTB"
  | "BAY"
  | "CIMBT"
  | "GSB"
  | "UOB"
  | "OTHERS";

// Mock เดิมที่ใช้ใน OCR Workbench
export const MOCK_ACCOUNT_DETAILS: AccountDetails = {
  bankName: "SCB - ธนาคารไทยพาณิชย์",
  accountNumber: "xxxxxxxxxx",
  accountType: "SAVING",
  startDate: "2022-12-01",
  endDate: "2022-12-31",
  hasDescription: "YES",
  isOverDraft: "NO",
};

