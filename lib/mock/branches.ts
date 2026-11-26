import type { Branch } from "@/types/branch"

/** Branches of the default company (ABC). The ERP works with these only. */
export const mockBranches: Branch[] = [
  {
    id: "br-hq",
    companyId: "abc",
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
    companyId: "abc",
    name: "Kathmandu Hub",
    code: "KTM",
    address: "Kalimati, Kathmandu",
    contactNumber: "+977-1-4221000",
    contactEmail: "kathmandu@abccompany.com",
    status: "active",
    createdAt: "2026-01-18",
  },
]

/** Branches of the other companies, managed from the admin console. */
export const mockOtherCompanyBranches: Branch[] = [
  {
    id: "br-notion-hq",
    companyId: "notion",
    name: "Head Office",
    code: "HQ",
    address: "Pulchowk, Lalitpur",
    contactNumber: "+977-1-5520000",
    contactEmail: "hq@notion.so",
    status: "active",
    createdAt: "2026-02-04",
  },
]
