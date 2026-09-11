import { mockCostTerms } from "@/lib/mock/cost-terms"
import { createSlugId } from "@/lib/slug"
import type { CostTerm } from "@/types/cost-term"

const COST_TERMS_STORAGE_KEY = "ibmerp-cost-terms-v1"

export function readCostTerms(): CostTerm[] {
  try {
    const saved = window.localStorage.getItem(COST_TERMS_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as CostTerm[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockCostTerms.map((term) => ({ ...term }))
}

export function saveCostTerms(terms: CostTerm[]) {
  window.localStorage.setItem(COST_TERMS_STORAGE_KEY, JSON.stringify(terms))
  return terms
}

export function createCostTermId(name: string) {
  return createSlugId("ct", name)
}
