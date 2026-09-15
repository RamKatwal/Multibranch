export const COST_TERM_STATUSES = ["active", "inactive"] as const

export type CostTermStatus = (typeof COST_TERM_STATUSES)[number]

export type CostTerm = {
  id: string
  name: string
  description: string
  status: CostTermStatus
}

export const costTermStatusLabels: Record<CostTermStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
