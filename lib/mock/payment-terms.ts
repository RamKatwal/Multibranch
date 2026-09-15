import type { PaymentTerm } from "@/types/payment-term"

export const mockPaymentTerms: PaymentTerm[] = [
  {
    id: "pt-due-receipt",
    name: "Due on Receipt",
    days: 0,
    description: "Payment is due immediately upon receipt of the invoice.",
    status: "active",
  },
  {
    id: "pt-net-15",
    name: "Net 15",
    days: 15,
    description: "Payment is due within 15 days of the invoice date.",
    status: "active",
  },
  {
    id: "pt-net-30",
    name: "Net 30",
    days: 30,
    description: "Payment is due within 30 days of the invoice date.",
    status: "active",
  },
  {
    id: "pt-net-45",
    name: "Net 45",
    days: 45,
    description: "Payment is due within 45 days of the invoice date.",
    status: "active",
  },
  {
    id: "pt-net-60",
    name: "Net 60",
    days: 60,
    description: "Payment is due within 60 days of the invoice date.",
    status: "inactive",
  },
]
