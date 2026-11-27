"use client"

import * as React from "react"

import {
  DEFAULT_COMPANIES,
  getCompanies,
  type DemoCompany,
} from "@/lib/admin/demo-scenarios"
import {
  BRANCHES_CHANGE_EVENT,
  BRANCHES_STORAGE_KEY,
  getBranchCompanyId,
  readAllBranches,
} from "@/lib/branches/storage"
import { DEFAULT_BRANCH_LIMIT, getBranchLimit } from "@/lib/branches/subscription"
import { mockBranches, mockOtherCompanyBranches } from "@/lib/mock/branches"
import type { Branch } from "@/types/branch"

export type Company = DemoCompany

export function getCompanyById(companies: Company[], companyId: string) {
  return companies.find((company) => company.id === companyId)
}

export function getCompanyBranches(branches: Branch[], companyId: string) {
  return branches.filter((branch) => getBranchCompanyId(branch) === companyId)
}

export function getBranchCountsByCompany(
  branches: Branch[],
  companies: Company[]
) {
  const counts: Record<string, number> = {}
  for (const company of companies) counts[company.id] = 0
  for (const branch of branches) {
    const id = getBranchCompanyId(branch)
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

export function isBranchCodeTaken(
  branches: Branch[],
  companyId: string,
  code: string
) {
  const normalized = code.trim().toUpperCase()
  return getCompanyBranches(branches, companyId).some(
    (branch) => branch.code.toUpperCase() === normalized
  )
}

const CITY_CODES: Record<string, string> = {
  kathmandu: "KTM",
  lalitpur: "LTP",
  patan: "PTN",
  bhaktapur: "BKT",
  pokhara: "PKR",
  biratnagar: "BRT",
  birgunj: "BRG",
  butwal: "BTL",
  dharan: "DHN",
  itahari: "ITH",
  chitwan: "CTW",
  bharatpur: "BHR",
  hetauda: "HTD",
  janakpur: "JNK",
  nepalgunj: "NPJ",
  dhangadhi: "DHG",
}

/** "Kathmandu Hub" → "KTM"; "New Road Store" → "NRS". Adds a number when the code is taken. */
export function suggestBranchCode(name: string, takenCodes: string[] = []) {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  if (words.length === 0) return ""

  const city = words.find((word) => CITY_CODES[word])
  const base = city
    ? CITY_CODES[city]
    : words.length > 1
      ? words
          .slice(0, 3)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      : words[0].slice(0, 3).toUpperCase()

  const taken = new Set(takenCodes.map((code) => code.toUpperCase()))
  if (!taken.has(base)) return base
  let suffix = 2
  while (taken.has(`${base}${suffix}`)) suffix += 1
  return `${base}${suffix}`
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener)
  window.addEventListener(BRANCHES_CHANGE_EVENT, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(BRANCHES_CHANGE_EVENT, listener)
  }
}

const SERVER_BRANCHES: Branch[] = [...mockBranches, ...mockOtherCompanyBranches]
let cache: { raw: string | null; value: Branch[] } | null = null

function getBranchesSnapshot(): Branch[] {
  const raw = window.localStorage.getItem(BRANCHES_STORAGE_KEY)
  if (!cache || cache.raw !== raw) {
    cache = { raw, value: readAllBranches() }
  }
  return cache.value
}

/** The companies the account has (the demo scenario's while one is active). */
export function useCompanies(): Company[] {
  return React.useSyncExternalStore(
    subscribe,
    getCompanies,
    () => DEFAULT_COMPANIES
  )
}

/** Every listed company's branches, kept in sync with storage. */
export function useAllBranches(): Branch[] {
  const companies = useCompanies()
  const branches = React.useSyncExternalStore(
    subscribe,
    getBranchesSnapshot,
    () => SERVER_BRANCHES
  )
  return React.useMemo(() => {
    const ids = new Set(companies.map((company) => company.id))
    return branches.filter((branch) => ids.has(getBranchCompanyId(branch)))
  }, [branches, companies])
}

/** The account-wide branch limit, kept in sync with storage. */
export function useBranchLimit(): number {
  return React.useSyncExternalStore(
    subscribe,
    getBranchLimit,
    () => DEFAULT_BRANCH_LIMIT
  )
}
