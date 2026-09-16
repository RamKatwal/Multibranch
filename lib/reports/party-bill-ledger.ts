import { PURCHASE_MOCK_DATASET_TODAY } from "@/lib/reports/purchase-date-range"

export { PURCHASE_MOCK_DATASET_TODAY as PARTY_LEDGER_DATASET_TODAY }

const PAYMENT_TERM_DAYS = 15
const PAYMENT_LAG_DAYS = 5

export type PartyBill = {
  id: string
  partyId: string
  partyName: string
  date: string
  amount: number
}

export type PartyBillDetail = PartyBill & {
  dueDate: string
  paidAmount: number
  remainingBalance: number
  status: "Paid" | "Partially Paid" | "Unpaid"
}

export type PartyLedgerEntry = {
  partyId: string
  partyName: string
  date: string
  type: string
  reference: string
  debit: number
  credit: number
}

function addDays(dateIso: string, days: number) {
  const [year, month, day] = dateIso.split("-").map(Number)
  const date = new Date(year, month - 1, day + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function daysBetween(fromIso: string, toIso: string) {
  const [fy, fm, fd] = fromIso.split("-").map(Number)
  const [ty, tm, td] = toIso.split("-").map(Number)
  const from = new Date(fy, fm - 1, fd)
  const to = new Date(ty, tm - 1, td)
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

/** Deterministic partial-payment simulation, seeded from the bill's own id. */
function seedFromId(id: string) {
  return Number(id.replace(/\D/g, "")) || 1
}

export function computeBillDetail(bill: PartyBill): PartyBillDetail {
  const seed = seedFromId(bill.id)
  const paidRatio = seed % 3 === 0 ? 1 : seed % 3 === 1 ? 0.5 : 0
  // Full payment always clears the bill exactly; only partial payments round.
  const paidAmount = paidRatio === 1 ? bill.amount : Math.round(bill.amount * paidRatio)
  const remainingBalance = Math.max(bill.amount - paidAmount, 0)
  const dueDate = addDays(bill.date, PAYMENT_TERM_DAYS)
  const status: PartyBillDetail["status"] =
    remainingBalance === 0 ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid"

  return { ...bill, dueDate, paidAmount, remainingBalance, status }
}

export function overdueDaysAsOf(dueDate: string, asOfDate: string) {
  return Math.max(0, daysBetween(dueDate, asOfDate))
}

export type AgeingBucket = "current" | "0-4" | "5-9" | "10+"

export function ageingBucket(overdueDays: number): AgeingBucket {
  if (overdueDays <= 0) return "current"
  if (overdueDays <= 4) return "0-4"
  if (overdueDays <= 9) return "5-9"
  return "10+"
}

/**
 * Two ledger entries per bill: the bill itself (increases the party's
 * balance on `billSide`) and, if the deterministic simulation paid any of
 * it, a payment a few days later (decreases the balance on the opposite side).
 */
export function buildPartyLedgerEntries(
  bills: PartyBill[],
  billType: string,
  paymentType: string,
  billSide: "debit" | "credit"
): PartyLedgerEntry[] {
  const paymentSide = billSide === "debit" ? "credit" : "debit"
  const entries: PartyLedgerEntry[] = []

  for (const bill of bills) {
    const detail = computeBillDetail(bill)

    entries.push({
      partyId: bill.partyId,
      partyName: bill.partyName,
      date: bill.date,
      type: billType,
      reference: bill.id,
      debit: billSide === "debit" ? bill.amount : 0,
      credit: billSide === "credit" ? bill.amount : 0,
    })

    if (detail.paidAmount > 0) {
      entries.push({
        partyId: bill.partyId,
        partyName: bill.partyName,
        date: addDays(bill.date, PAYMENT_LAG_DAYS),
        type: paymentType,
        reference: `PAY-${bill.id}`,
        debit: paymentSide === "debit" ? detail.paidAmount : 0,
        credit: paymentSide === "credit" ? detail.paidAmount : 0,
      })
    }
  }

  return entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

/**
 * Signed running balance (debit − credit) rendered as an absolute amount
 * with a Dr/Cr suffix — positive is a debit balance, negative a credit one,
 * the standard accounting convention this codebase's live reference uses.
 */
export function formatPartyBalance(balance: number): { amount: number; suffix: "Dr" | "Cr" } {
  return balance < 0
    ? { amount: Math.abs(balance), suffix: "Cr" }
    : { amount: balance, suffix: "Dr" }
}

export type PartyLedgerRow = PartyLedgerEntry & { balance: number }

/** Ledger entries with a running balance, computed per-party so interleaved parties don't bleed into each other's running total. */
export function withRunningBalance(entries: PartyLedgerEntry[]): PartyLedgerRow[] {
  const runningByParty = new Map<string, number>()
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  return sorted.map((entry) => {
    const current = runningByParty.get(entry.partyId) ?? 0
    const next = current + entry.debit - entry.credit
    runningByParty.set(entry.partyId, next)
    return { ...entry, balance: next }
  })
}
