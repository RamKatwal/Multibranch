import { mockCheques } from "@/lib/mock/cheques"
import type { Cheque } from "@/types/cheque"

const CHEQUES_STORAGE_KEY = "ibmerp-cheques-v1"

export function readCheques(): Cheque[] {
  try {
    const saved = window.localStorage.getItem(CHEQUES_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as Cheque[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockCheques.map((cheque) => ({ ...cheque }))
}

export function saveCheques(cheques: Cheque[]) {
  window.localStorage.setItem(CHEQUES_STORAGE_KEY, JSON.stringify(cheques))
  return cheques
}

export function createChequeId(cheques: Cheque[]) {
  const max = cheques.reduce((highest, cheque) => {
    const match = /^CHQ(\d+)$/i.exec(cheque.id)
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)

  return `CHQ${max + 1}`
}
