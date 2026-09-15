export const TDS_TYPE_STATUSES = ["active", "inactive"] as const

export type TdsTypeStatus = (typeof TDS_TYPE_STATUSES)[number]

export type TdsType = {
  id: string
  name: string
  rate: number
  status: TdsTypeStatus
}

export const tdsTypeStatusLabels: Record<TdsTypeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
