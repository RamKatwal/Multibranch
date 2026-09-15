import type { TransactionNumberingRule } from "@/types/transaction-numbering"

export const mockTransactionNumbering: TransactionNumberingRule[] = [
  { documentType: "sales_order", prefix: "SO-", nextNumber: 1, padding: 6 },
  { documentType: "sales_invoice", prefix: "INV-", nextNumber: 1, padding: 6 },
  { documentType: "sales_return", prefix: "SR-", nextNumber: 1, padding: 6 },
  { documentType: "quotation", prefix: "QT-", nextNumber: 1, padding: 6 },
  { documentType: "delivery_note", prefix: "DN-", nextNumber: 1, padding: 6 },
  { documentType: "purchase_order", prefix: "PO-", nextNumber: 1, padding: 6 },
  { documentType: "purchase_invoice", prefix: "PINV-", nextNumber: 1, padding: 6 },
  { documentType: "purchase_return", prefix: "PR-", nextNumber: 1, padding: 6 },
  { documentType: "payment_receipt", prefix: "RCT-", nextNumber: 1, padding: 6 },
  { documentType: "payment_voucher", prefix: "PV-", nextNumber: 1, padding: 6 },
]
