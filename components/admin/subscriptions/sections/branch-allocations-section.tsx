"use client"

import { Badge } from "@/components/ui/badge"
import type { SubscriptionAssignedBranch } from "@/types/subscription"

type BranchAllocationsSectionProps = {
  branches: SubscriptionAssignedBranch[]
  used: number
  limit: number
}

export function BranchAllocationsSection({
  branches,
  used,
  limit,
}: BranchAllocationsSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Branch allocations</h2>
          <p className="text-xs text-fg-secondary">
            {used} of {limit} branch slots assigned to this subscription.
          </p>
        </div>
      </div>

      {branches.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-fg-secondary">
          No branches assigned yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-sm">
            <thead className="border-b bg-fill2/40 text-left text-xs text-fg-secondary">
              <tr>
                <th className="px-4 py-2.5 font-medium">Branch Name</th>
                <th className="px-4 py-2.5 font-medium">Branch Code</th>
                <th className="px-4 py-2.5 font-medium">Branch ID</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.branchId} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium">{branch.branchName}</td>
                  <td className="px-4 py-2.5 text-fg-secondary">
                    {branch.branchCode}
                  </td>
                  <td className="px-4 py-2.5 text-fg-secondary">
                    {branch.branchId}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge size="20"
                      variant="soft"
                      color={branch.status === "Active" ? "success" : "neutral"}
                    >
                      {branch.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
