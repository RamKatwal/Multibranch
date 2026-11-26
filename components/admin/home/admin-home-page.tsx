"use client"

import * as React from "react"

import { OrganizationCreatedDialog } from "@/components/admin/home/organization-created-dialog"
import { CompanyListsPage } from "@/components/admin/company-lists-page"

export function AdminHomePage() {
  return (
    <div className="flex flex-col gap-4">
      <React.Suspense fallback={null}>
        <CompanyListsPage />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <OrganizationCreatedDialog />
      </React.Suspense>
    </div>
  )
}
