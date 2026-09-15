import { mockUnits } from "@/lib/mock/units"
import type { UnitOfMeasure } from "@/types/unit"

const UNITS_STORAGE_KEY = "ibmerp-units-v1"

export function readUnits(): UnitOfMeasure[] {
  try {
    const saved = window.localStorage.getItem(UNITS_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as UnitOfMeasure[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockUnits.map((unit) => ({ ...unit }))
}

export function saveUnits(units: UnitOfMeasure[]) {
  window.localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units))
  return units
}

export function createUnitId(units: UnitOfMeasure[]) {
  const max = units.reduce((highest, unit) => {
    const match = /^UOM(\d+)$/i.exec(unit.id)
    if (!match) return highest
    return Math.max(highest, Number(match[1]))
  }, 0)

  return `UOM${max + 1}`
}
