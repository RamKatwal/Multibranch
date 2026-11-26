"use client"

import * as React from "react"

import { CompanyListsV2Page } from "@/components/admin/home-v2/company-lists-v2-page"
import { OrganizationCreatedDialog } from "@/components/admin/home/organization-created-dialog"

export function AdminHomeV2Page() {
  return (
    <div className="flex flex-col gap-4">
      <React.Suspense fallback={null}>
        <CompanyListsV2Page />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <OrganizationCreatedDialog />
      </React.Suspense>
    </div>
  )
}
