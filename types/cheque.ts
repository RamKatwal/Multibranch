export const CHEQUE_DIRECTIONS = ["issued", "received"] as const
export const CHEQUE_STATUSES = ["pending", "cleared", "bounced", "cancelled"] as const

export type ChequeDirection = (typeof CHEQUE_DIRECTIONS)[number]
export type ChequeStatus = (typeof CHEQUE_STATUSES)[number]

export type Cheque = {
  id: string
  chequeNumber: string
  direction: ChequeDirection
  bankAccountId: string
  partyName: string
  amount: number
  chequeDate: string
  remarks?: string
  entryBy: string
  status: ChequeStatus
}

export const chequeDirectionLabels: Record<ChequeDirection, string> = {
  issued: "Issued",
  received: "Received",
}

export const chequeStatusLabels: Record<ChequeStatus, string> = {
  pending: "Pending",
  cleared: "Cleared",
  bounced: "Bounced",
  cancelled: "Cancelled",
}
