import { mockTdsTypes } from "@/lib/mock/tds-types"
import { createSlugId } from "@/lib/slug"
import type { TdsType } from "@/types/tds-type"

const TDS_TYPES_STORAGE_KEY = "ibmerp-tds-types-v1"

export function readTdsTypes(): TdsType[] {
  try {
    const saved = window.localStorage.getItem(TDS_TYPES_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as TdsType[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockTdsTypes.map((type) => ({ ...type }))
}

export function saveTdsTypes(types: TdsType[]) {
  window.localStorage.setItem(TDS_TYPES_STORAGE_KEY, JSON.stringify(types))
  return types
}

export function createTdsTypeId(name: string) {
  return createSlugId("tds", name)
}
