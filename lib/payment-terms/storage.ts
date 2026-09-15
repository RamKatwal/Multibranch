import { mockPaymentTerms } from "@/lib/mock/payment-terms"
import { createSlugId } from "@/lib/slug"
import type { PaymentTerm } from "@/types/payment-term"

const PAYMENT_TERMS_STORAGE_KEY = "ibmerp-payment-terms-v1"

export function readPaymentTerms(): PaymentTerm[] {
  try {
    const saved = window.localStorage.getItem(PAYMENT_TERMS_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as PaymentTerm[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockPaymentTerms.map((term) => ({ ...term }))
}

export function savePaymentTerms(terms: PaymentTerm[]) {
  window.localStorage.setItem(PAYMENT_TERMS_STORAGE_KEY, JSON.stringify(terms))
  return terms
}

export function createPaymentTermId(name: string) {
  return createSlugId("pt", name)
}
