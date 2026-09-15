export const UNIT_STATUSES = ["active", "inactive"] as const

export type UnitStatus = (typeof UNIT_STATUSES)[number]

export type UnitOfMeasure = {
  id: string
  shortName: string
  name: string
  entryBy: string
  status: UnitStatus
}

export const unitStatusLabels: Record<UnitStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
