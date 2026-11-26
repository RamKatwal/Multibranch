"use client"

import Link from "next/link"
import { CheckCircle2Icon } from "lucide-react"

import { CompanyAvatar } from "@/components/company-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  attentionIssueLabels,
  type AttentionIssueType,
  type NeedsAttentionItem,
} from "@/lib/admin/home-metrics"
import { formatLongDate } from "@/lib/format"
import { cn } from "@/lib/utils"

function issueBadgeClassName(issueType: AttentionIssueType) {
  switch (issueType) {
    case "payment_failed":
      return "border-transparent bg-destructive/10 text-error-text"
    case "trial_expiring":
      return "border-transparent bg-warning/15 text-warning-foreground dark:text-warning"
    case "near_branch_limit":
      return "border-transparent bg-primary/10 text-primary"
    case "subscription_error":
    default:
      return "border-border text-fg-secondary"
  }
}

type NeedsAttentionPanelProps = {
  items: NeedsAttentionItem[]
}

export function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Needs Attention</h2>
          <p className="text-xs text-fg-secondary">
            Cross-tenant items that need action today
          </p>
        </div>
        {items.length > 0 ? (
          <span className="rounded-md bg-fill2 px-1.5 py-0.5 text-xs font-medium text-fg-secondary tabular-nums">
            {items.length}
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <CheckCircle2Icon
            className="size-8 text-success"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-sm text-fg-secondary">
            Nothing needs attention right now.
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((item) => {
            const ctaLabel =
              item.issueType === "payment_failed" ||
              item.issueType === "subscription_error"
                ? "Resolve"
                : "View"

            return (
              <li
                key={item.id}
                className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-fill2/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <CompanyAvatar
                    name={item.companyName}
                    domain={item.companyDomain}
                    showTooltip={false}
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {item.companyName}
                      </p>
                      <Badge variant="strong" color="primary" size="20"
                        className={cn(
                          "",
                          issueBadgeClassName(item.issueType)
                        )}
                      >
                        {attentionIssueLabels[item.issueType]}
                      </Badge>
                    </div>
                    <p className="text-xs text-fg-secondary">{item.label}</p>
                    <p className="text-xs text-fg-secondary tabular-nums">
                      {formatLongDate(item.date)}
                    </p>
                  </div>
                </div>
                <Button size="32" variant="outline" color="neutral"
                  className="shrink-0 self-start sm:self-center" asChild
                ><Link href={item.href}>
                  {ctaLabel}
                </Link></Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
