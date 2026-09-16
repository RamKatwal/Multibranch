import { mockSalesQuotations } from "@/lib/mock/sales-quotations"
import {
  SALES_QUOTATION_STATUSES,
  type SalesQuotation,
} from "@/types/sales-quotation"

const SALES_QUOTATIONS_STORAGE_KEY = "ibmerp-sales-quotations-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(quotation: SalesQuotation): boolean {
  return (
    typeof quotation.id === "string" &&
    typeof quotation.customerId === "string" &&
    typeof quotation.entryDate === "string" &&
    Array.isArray(quotation.items) &&
    SALES_QUOTATION_STATUSES.includes(quotation.status)
  )
}

function cloneQuotations(quotations: SalesQuotation[]): SalesQuotation[] {
  return quotations.map((quotation) => ({
    ...quotation,
    items: quotation.items.map((item) => ({ ...item })),
  }))
}

export function readSalesQuotations(): SalesQuotation[] {
  if (!canUseStorage()) return cloneQuotations(mockSalesQuotations)

  try {
    const raw = window.localStorage.getItem(SALES_QUOTATIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SalesQuotation[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneQuotations(mockSalesQuotations)
}

export function saveSalesQuotations(quotations: SalesQuotation[]) {
  if (!canUseStorage()) return quotations
  window.localStorage.setItem(
    SALES_QUOTATIONS_STORAGE_KEY,
    JSON.stringify(quotations)
  )
  return quotations
}

export function getSalesQuotationById(id: string): SalesQuotation | undefined {
  return readSalesQuotations().find((quotation) => quotation.id === id)
}

export function createSalesQuotationId(existing: SalesQuotation[]) {
  const used = new Set(existing.map((quotation) => quotation.id))
  let next = existing.length + 1
  let id = `SQ-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `SQ-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}

export function createSalesQuotationItemId(index: number) {
  return `SQI-${Date.now().toString().slice(-5)}-${index + 1}`
}
