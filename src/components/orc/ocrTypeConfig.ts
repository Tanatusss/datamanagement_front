// src/components/orc/ocrTypeConfig.ts

import type { AccountDetails, TransactionRow } from "./bankTypes";

/**
 * Main document type ที่ใช้ classify ไฟล์หลัก
 * - BANK_STATEMENT: รายการเดินบัญชี
 * - INVOICE: ใบแจ้งหนี้ / ใบกำกับภาษี
 * - PAYSLIP: สลิปเงินเดือน
 */
export type MainDocType = "BANK_STATEMENT" | "INVOICE" | "PAYSLIP";

export type DocSubtypeOption = {
  value: string;
  label: string;
};

export type DocTypeConfig = {
  code: MainDocType;
  title: string;        // ใช้บนหัว modal
  description: string;  // ใช้อธิบายใต้หัว
  selectLabel: string;  // label ด้านบน dropdown
  options: DocSubtypeOption[];
};

/**
 * CONFIG สำหรับ dropdown "Type of document / Subtype"
 * ใช้ในหน้า UploadDocumentsSection หรือ modal เลือก type ต่าง ๆ
 */
export const DOC_TYPE_CONFIG: Record<MainDocType, DocTypeConfig> = {
  BANK_STATEMENT: {
    code: "BANK_STATEMENT",
    title: "Select Bank Statement's Bank",
    description:
      "Please select the bank to which the following bank statement(s) belong.",
    selectLabel: "Bank",
    options: [
      { value: "", label: "None" },
      { value: "BAAC", label: "BAAC" },
      { value: "BAY", label: "BAY - ธนาคารกรุงศรีอยุธยา" },
      { value: "BBL", label: "BBL - ธนาคารกรุงเทพ" },
      { value: "CIMBT", label: "CIMBT - ธนาคารซีไอเอ็มบีไทย" },
      { value: "CITI", label: "CITI" },
      { value: "GSB", label: "GSB - ธนาคารออมสิน" },
      { value: "KBANK", label: "KBANK - ธนาคารกสิกรไทย" },
      { value: "KK", label: "KK" },
      { value: "KTB", label: "KTB - ธนาคารกรุงไทย" },
      { value: "LH", label: "LH" },
      { value: "SCB", label: "SCB - ธนาคารไทยพาณิชย์" },
      { value: "TCRBANK", label: "TCRBANK" },
      { value: "UOB", label: "UOB" },
    ],
  },

  INVOICE: {
    code: "INVOICE",
    title: "Select Invoice Vendor",
    description:
      "Please select the vendor for the following invoice document(s).",
    selectLabel: "Vendor",
    options: [
      { value: "", label: "None" },
      { value: "PTT", label: "PTT" },
      { value: "TRUE", label: "True Corp" },
      { value: "AIS", label: "AIS" },
    ],
  },

  PAYSLIP: {
    code: "PAYSLIP",
    title: "Select Payroll Provider",
    description:
      "Please select the payroll provider for the following payslip(s).",
    selectLabel: "Provider",
    options: [
      { value: "", label: "None" },
      { value: "IN_HOUSE", label: "In-house" },
      { value: "DELOITTE", label: "Deloitte" },
      { value: "PWC", label: "PwC" },
    ],
  },
};

/* ------------------------------------------------------------------
 * MOCK DATA สำหรับใช้ใน OCR Workbench (Bank Statement)
 * ใช้ร่วมกับ OcrWorkbenchModal.tsx
 * ------------------------------------------------------------------ */

export const MOCK_ACCOUNT_DETAILS: AccountDetails = {
  bankName: "SCB - ธนาคารไทยพาณิชย์",
  accountNumber: "xxxxxxxxxx",
  accountType: "SAVING",
  startDate: "2022-11-01",
  endDate: "2022-11-30",
  hasDescription: "YES",
  isOverDraft: "NO",
};

export const MOCK_TRANSACTIONS: TransactionRow[] = [
  {
    id: 1,
    date: "01/11/22",
    code: "X2",
    channel: "ENET",
    debit: 0,
    credit: 8816.00,
    balance: 158967.90,
    description: "จ่ายบิล NEXT CAPITAL PC",
  },
  // 01/11/22 13:21 X2 ENET 8,816.00 158,967.90 จายบิล NEXT CAPITAL PC
  {
    id: 2,
    date: "01/11/22",
    code: "X2",
    channel: "ENET",
    debit: 0,
    credit: 8816.00,
    balance: 150151.90,
    description: "จ่ายบิล NEXT CAPITAL PC",
  },
  // 01/11/22 13:24 X2 ENET 8,816.00 150,151.90 จายบิล NEXT CAPITAL PC
  {
    id: 3,
    date: "01/11/22",
    code: "C2",
    channel: "ATM",
    debit: 0,
    credit: 20000.00,
    balance: 130151.90,
    description: "SCB/PATONGIPHUKET)",
  },
  // 01/11/22 15:47 C2 ATM 20.000.00 130.151.90 SCB/PATONGIPHUKET)
  {
    id: 4,
    date: "01/11/22",
    code: "X2",
    channel: "ENET",
    debit: 0,
    credit: 50000.00,
    balance: 80151.90,
    description: "จ่ายบิล GHBANK LOAN PAYMENT",
  },
  // 01/11/22 16:13 X2 ENET 50,000.00 80,151.90 จ่ายบิล GHBANK LOAN PAYMENT
  {
    id: 5,
    date: "01/11/22",
    code: "X2",
    channel: "ENET",
    debit: 0,
    credit: 9634.00,
    balance: 70517.90,
    description: "โอนไป SCB x6515 นาง พัชรี ทองรักษา",
  },
  // 01/11/22 17:12 X2 ENET 9,634.00 70,517.90 โอนไป SCB ×6515 นาง พัชรี ทองรักษา
  {
    id: 6,
    date: "01/01/22",
    code: "X2",
    channel: "ENET",
    debit: 0,
    credit: 23257.00,
    balance: 47260.90,
    description: "PromptPay x7858 นางสาว พิชชา อภิฏ",
  },
  // 01/11/22 17:14 X2 ENET 23,257.00 47,260.90 PromptPay x7858 นางสาว พิชชา อภิฏ
  {
    id: 7,
    date: "01/11/22",
    code: "X2",
    channel: "ENET",
    debit: 0,
    credit: 24000.00,
    balance: 23180.90,
    description: "PromptPay x3275 นาย ณณหัต ประทีป ณถลา",
  },
];
// 01/11/22 17:15 X2 ENET 24,080.00 23,180.90 PromptPay ×3275 นาย ณณหัต ประทีป ณถลา

export const MOCK_FIELDS = [
      { label: "ธนาคาร", text: "กสิกรไทย" },
      { label: "เลขที่อ้างอิง", text: "22110208370044451707" },
      { label: "รอบระหว่างวันที่", text: "01/10/2022-31/10/2022" },
      { label: "สาขาเจ้าของบัญชี", text: "สาขาจักรวรร" },
      { label: "ยอดยกไป", text: "2,383,055.77" },
      { label: "รวมถอนเงิน 45 รายการ", text: "3,699,651.79" },
      { label: "รวมฝากเงิน 23 รายการ", text: "5,118,016.16" },
    ]; 