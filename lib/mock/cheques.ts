import type { Cheque } from "@/types/cheque"

export const mockCheques: Cheque[] = [
  {
    id: "CHQ1",
    chequeNumber: "0234567",
    direction: "issued",
    bankAccountId: "BNK1",
    partyName: "Nepal Trading Co.",
    amount: 45000,
    chequeDate: "2026-09-02",
    remarks: "Supplier payment",
    entryBy: "admin",
    status: "cleared",
  },
  {
    id: "CHQ2",
    chequeNumber: "0234568",
    direction: "issued",
    bankAccountId: "BNK1",
    partyName: "Himalayan Distributors",
    amount: 18500,
    chequeDate: "2026-09-10",
    entryBy: "admin",
    status: "pending",
  },
  {
    id: "CHQ3",
    chequeNumber: "0098123",
    direction: "received",
    bankAccountId: "BNK2",
    partyName: "Kathmandu Retail Mart",
    amount: 62000,
    chequeDate: "2026-09-12",
    remarks: "Customer settlement",
    entryBy: "admin",
    status: "pending",
  },
]
