import { organizations } from "@/config/organizations"
import {
  BRANCHES_CHANGE_EVENT,
  BRANCHES_STORAGE_KEY,
} from "@/lib/branches/storage"
import { DEMO_BRANCH_LIMIT_STORAGE_KEY } from "@/lib/branches/subscription"
import { mockBranches, mockOtherCompanyBranches } from "@/lib/mock/branches"
import type { Branch } from "@/types/branch"

/** Demo-only switcher for the admin console: loads a ready-made state so each use case can be shown. */

export type DemoCompany = { id: string; name: string; domain?: string }

export type DemoScenario = {
  id: string
  label: string
  description: string
  companies: DemoCompany[]
  branches: Branch[]
  limit: number
}

export const DEMO_SCENARIO_STORAGE_KEY = "ibmerp-demo-scenario"

const baseCompanies: DemoCompany[] = organizations.map((org) => ({
  id: org.id,
  name: org.name,
  domain: org.domain,
}))

function headOffice(companyId: string, address: string, createdAt: string): Branch {
  return {
    id: `br-${companyId}-hq`,
    companyId,
    name: "Head Office",
    code: "HQ",
    address,
    contactNumber: "",
    contactEmail: "",
    status: "active",
    createdAt,
  }
}

function branch(
  companyId: string,
  name: string,
  code: string,
  address: string,
  status: Branch["status"] = "active"
): Branch {
  return {
    id: `br-${companyId}-${code.toLowerCase()}`,
    companyId,
    name,
    code,
    address,
    contactNumber: "",
    contactEmail: "",
    status,
    createdAt: "2026-03-10",
  }
}

const defaultBranches = [...mockBranches, ...mockOtherCompanyBranches]

const manyCompanies: DemoCompany[] = [
  ...baseCompanies,
  { id: "himal-traders", name: "Himal Traders" },
  { id: "everest-foods", name: "Everest Foods" },
  { id: "lumbini-pharma", name: "Lumbini Pharma" },
  { id: "pokhara-retail", name: "Pokhara Retail" },
  { id: "terai-agro", name: "Terai Agro" },
  { id: "mustang-motors", name: "Mustang Motors" },
]

const cities = ["Pokhara", "Biratnagar", "Butwal", "Dharan", "Chitwan", "Hetauda"]
const cityCodes = ["PKR", "BRT", "BTL", "DHN", "CTW", "HTD"]

const manyBranches: Branch[] = [
  ...defaultBranches,
  ...manyCompanies.slice(2).flatMap((company, index) => [
    headOffice(company.id, "Kathmandu", "2026-02-15"),
    ...Array.from({ length: (index % 3) + 1 }, (_, i) => {
      const at = (index + i) % cities.length
      return branch(company.id, `${cities[at]} Branch`, cityCodes[at], cities[at])
    }),
  ]),
]

export const demoScenarios: DemoScenario[] = [
  {
    id: "default",
    label: "Two companies",
    description: "ABC Company and Notion, room for more branches",
    companies: baseCompanies,
    branches: defaultBranches,
    limit: 5,
  },
  {
    id: "single",
    label: "One company",
    description: "No sub-items; the sidebar links straight to its branches",
    companies: baseCompanies.slice(0, 1),
    branches: mockBranches,
    limit: 5,
  },
  {
    id: "many",
    label: "Eight companies",
    description: "More than 6: the sidebar shows 6 and View all",
    companies: manyCompanies,
    branches: manyBranches,
    limit: 30,
  },
  {
    id: "limit",
    label: "Branch limit reached",
    description: "3 of 3 used: Add branch opens the upgrade step",
    companies: baseCompanies,
    branches: defaultBranches,
    limit: 3,
  },
  {
    id: "fresh",
    label: "New account",
    description: "Each company has only its Head Office",
    companies: baseCompanies,
    branches: [
      { ...mockBranches[0] },
      ...mockOtherCompanyBranches.map((item) => ({ ...item })),
    ],
    limit: 3,
  },
  {
    id: "inactive",
    label: "Inactive branches",
    description: "Some branches deactivated, to show Activate",
    companies: baseCompanies,
    branches: [
      ...defaultBranches.map((item) =>
        item.id === "br-ktm-hub" ? { ...item, status: "inactive" as const } : item
      ),
      branch("notion", "Lalitpur Studio", "LTP", "Jhamsikhel, Lalitpur", "inactive"),
      branch("notion", "Pokhara Office", "PKR", "Lakeside, Pokhara"),
    ],
    limit: 6,
  },
]

export function readDemoScenarioId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(DEMO_SCENARIO_STORAGE_KEY)
  } catch {
    return null
  }
}

export function getDemoScenario(id: string | null) {
  return demoScenarios.find((scenario) => scenario.id === id)
}

/** The companies to show: the active scenario's, else the real list. */
export function getCompanies(): DemoCompany[] {
  return getDemoScenario(readDemoScenarioId())?.companies ?? baseCompanies
}

export const DEFAULT_COMPANIES = baseCompanies

export function applyDemoScenario(scenario: DemoScenario) {
  window.localStorage.setItem(DEMO_SCENARIO_STORAGE_KEY, scenario.id)
  window.localStorage.setItem(
    DEMO_BRANCH_LIMIT_STORAGE_KEY,
    String(scenario.limit)
  )
  window.localStorage.setItem(
    BRANCHES_STORAGE_KEY,
    JSON.stringify(scenario.branches)
  )
  window.dispatchEvent(new Event(BRANCHES_CHANGE_EVENT))
}

/** Back to the app's own data (mock seed, plan limit). */
export function clearDemoScenario() {
  window.localStorage.removeItem(DEMO_SCENARIO_STORAGE_KEY)
  window.localStorage.removeItem(DEMO_BRANCH_LIMIT_STORAGE_KEY)
  window.localStorage.removeItem(BRANCHES_STORAGE_KEY)
  window.dispatchEvent(new Event(BRANCHES_CHANGE_EVENT))
}
