import type { CostTerm } from "@/types/cost-term"

export const mockCostTerms: CostTerm[] = [
  {
    id: "ct-fob",
    name: "FOB (Free on Board)",
    description: "Buyer takes ownership once goods are loaded at origin.",
    status: "active",
  },
  {
    id: "ct-cif",
    name: "CIF (Cost, Insurance & Freight)",
    description: "Seller covers cost, insurance, and freight to destination port.",
    status: "active",
  },
  {
    id: "ct-landed",
    name: "Landed Cost",
    description: "Total cost of a product including shipping, duties, and handling.",
    status: "active",
  },
  {
    id: "ct-ex-works",
    name: "Ex Works",
    description: "Buyer bears all costs and risks from the seller's premises.",
    status: "inactive",
  },
]
