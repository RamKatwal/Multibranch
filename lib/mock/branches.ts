import type { Branch } from "@/types/branch"

export const mockBranches: Branch[] = [
  {
    id: "br-hq",
    name: "Head Office",
    code: "HQ",
    address: "Durbar Marg, Kathmandu 44600",
    contactNumber: "+977-1-4210000",
    contactEmail: "hq@abccompany.com",
    status: "active",
    createdAt: "2025-11-12",
  },
  {
    id: "br-ktm-hub",
    name: "Kathmandu Hub",
    code: "KTM",
    address: "Kalimati, Kathmandu",
    contactNumber: "+977-1-4221000",
    contactEmail: "kathmandu@abccompany.com",
    status: "active",
    createdAt: "2026-01-18",
  },
]
