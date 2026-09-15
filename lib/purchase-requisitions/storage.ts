import { mockPurchaseRequisitions } from "@/lib/mock/purchase-requisitions"
import {
  PURCHASE_REQUISITION_STATUSES,
  type PurchaseRequisition,
} from "@/types/purchase-requisition"

/**
 * Client-side stub. No purchase-requisition API exists yet — persist to
 * localStorage instead of guessing at a contract.
 */
const PURCHASE_REQUISITIONS_STORAGE_KEY = "ibmerp-purchase-requisitions-v1"

function canUseStorage() {
  return typeof window !== "undefined"
}

function isCurrentSchema(
  requisition: PurchaseRequisition
): requisition is PurchaseRequisition {
  return (
    typeof requisition.id === "string" &&
    typeof requisition.entryDate === "string" &&
    Array.isArray(requisition.items) &&
    PURCHASE_REQUISITION_STATUSES.includes(requisition.status)
  )
}

function cloneRequisitions(
  requisitions: PurchaseRequisition[]
): PurchaseRequisition[] {
  return requisitions.map((requisition) => ({
    ...requisition,
    items: requisition.items.map((item) => ({ ...item })),
  }))
}

export function readPurchaseRequisitions(): PurchaseRequisition[] {
  if (!canUseStorage()) return cloneRequisitions(mockPurchaseRequisitions)

  try {
    const raw = window.localStorage.getItem(PURCHASE_REQUISITIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PurchaseRequisition[]
      if (Array.isArray(parsed)) {
        return parsed.filter(isCurrentSchema)
      }
    }
  } catch {
    // Fall back to mock seed data.
  }

  return cloneRequisitions(mockPurchaseRequisitions)
}

export function savePurchaseRequisitions(requisitions: PurchaseRequisition[]) {
  if (!canUseStorage()) return requisitions
  window.localStorage.setItem(
    PURCHASE_REQUISITIONS_STORAGE_KEY,
    JSON.stringify(requisitions)
  )
  return requisitions
}

export function getPurchaseRequisitionById(
  id: string
): PurchaseRequisition | undefined {
  return readPurchaseRequisitions().find((requisition) => requisition.id === id)
}

export function createPurchaseRequisitionId(existing: PurchaseRequisition[]) {
  const used = new Set(existing.map((requisition) => requisition.id))
  let next = existing.length + 1
  let id = `REQ-${String(next).padStart(6, "0")}-2082/83`

  while (used.has(id)) {
    next += 1
    id = `REQ-${String(next).padStart(6, "0")}-2082/83`
  }

  return id
}

export function createPurchaseRequisitionItemId(index: number) {
  return `REQI-${Date.now().toString().slice(-5)}-${index + 1}`
}
