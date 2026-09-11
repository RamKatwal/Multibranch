import type { DocumentType } from "@/types/document-type"

export type TransactionNumberingRule = {
  documentType: DocumentType
  prefix: string
  nextNumber: number
  padding: number
}

export function formatTransactionNumber(rule: {
  prefix: string
  nextNumber: number
  padding: number
}) {
  return `${rule.prefix}${String(Math.max(0, rule.nextNumber)).padStart(rule.padding, "0")}`
}
