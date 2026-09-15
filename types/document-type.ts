/** Shared vocabulary of transactional document types, used by both Document Template and Transaction Numbering. */
export const DOCUMENT_TYPES = [
  "sales_order",
  "sales_invoice",
  "sales_return",
  "quotation",
  "delivery_note",
  "purchase_order",
  "purchase_invoice",
  "purchase_return",
  "payment_receipt",
  "payment_voucher",
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const documentTypeLabels: Record<DocumentType, string> = {
  sales_order: "Sales Order",
  sales_invoice: "Sales Invoice",
  sales_return: "Sales Return",
  quotation: "Quotation",
  delivery_note: "Delivery Note",
  purchase_order: "Purchase Order",
  purchase_invoice: "Purchase Invoice",
  purchase_return: "Purchase Return",
  payment_receipt: "Payment Receipt",
  payment_voucher: "Payment Voucher",
}
