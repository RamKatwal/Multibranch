import type { TdsType } from "@/types/tds-type"

export const mockTdsTypes: TdsType[] = [
  { id: "tds-rent", name: "Rent", rate: 10, status: "active" },
  { id: "tds-commission", name: "Commission", rate: 15, status: "active" },
  { id: "tds-service-fee", name: "Service Fee", rate: 15, status: "active" },
  { id: "tds-contractor-payment", name: "Contractor Payment", rate: 1.5, status: "active" },
  { id: "tds-interest", name: "Interest", rate: 15, status: "inactive" },
]
