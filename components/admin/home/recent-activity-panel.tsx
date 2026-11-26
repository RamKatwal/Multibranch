"use client"

import Link from "next/link"
import {
  Building2Icon,
  GitBranchIcon,
  ShieldIcon,
  SparklesIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import {
  formatActivityRelativeTime,
  type AdminActivityEvent,
  type AdminActivityEventType,
} from "@/lib/mock/admin-activity"
import { cn } from "@/lib/utils"

const activityIcons: Record<AdminActivityEventType, LucideIcon> = {
  branch_added: GitBranchIcon,
  plan_upgraded: SparklesIcon,
  permission_changed: ShieldIcon,
  org_onboarded: Building2Icon,
  subscription_renewed: SparklesIcon,
  user_invited: UserPlusIcon,
}

type RecentActivityPanelProps = {
  events: AdminActivityEvent[]
}

export function RecentActivityPanel({ events }: RecentActivityPanelProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">Recent Activity</h2>
          <p className="text-xs text-fg-secondary">
            Latest platform events across organizations
          </p>
        </div>
        <span
          className="cursor-not-allowed text-xs text-fg-secondary/60"
          aria-disabled="true"
          title="Full activity log coming soon"
        >
          View all activity
        </span>
      </div>

      <ul className="divide-y">
        {events.map((event) => {
          const Icon = activityIcons[event.type]
          const content = (
            <>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-fill2 text-fg-secondary">
                <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm leading-snug">{event.message}</p>
                <p className="text-xs text-fg-secondary tabular-nums">
                  {formatActivityRelativeTime(event.occurredAt)}
                </p>
              </div>
            </>
          )

          return (
            <li key={event.id}>
              {event.href ? (
                <Link
                  href={event.href}
                  className={cn(
                    "flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-fill2/40"
                  )}
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-2.5 px-4 py-3">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
