"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const recentActivities = [
  {
    id: "act-1",
    action: "Updated product configuration",
    module: "Configurations",
    timestamp: "2 minutes ago",
    status: "success" as const,
  },
  {
    id: "act-2",
    action: "Created purchase order PO-1042",
    module: "Purchase",
    timestamp: "18 minutes ago",
    status: "neutral" as const,
  },
  {
    id: "act-3",
    action: "Approved stock adjustment #SA-88",
    module: "Inventory",
    timestamp: "1 hour ago",
    status: "success" as const,
  },
  {
    id: "act-4",
    action: "Failed login attempt",
    module: "Security",
    timestamp: "3 hours ago",
    status: "warning" as const,
  },
  {
    id: "act-5",
    action: "Exported sales report",
    module: "Reports",
    timestamp: "Yesterday at 4:32 PM",
    status: "neutral" as const,
  },
  {
    id: "act-6",
    action: "Changed group permissions for Staff",
    module: "Configurations",
    timestamp: "Yesterday at 11:15 AM",
    status: "success" as const,
  },
]

const statusStyles = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground dark:text-warning",
  neutral: "bg-muted text-muted-foreground",
}

type UserActivitiesSettingsPanelProps = {
  className?: string
}

export function UserActivitiesSettingsPanel({
  className,
}: UserActivitiesSettingsPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="overflow-hidden rounded-lg border">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start justify-between gap-3 border-b px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activity.module} · {activity.timestamp}
              </p>
            </div>
            <Badge
              variant="soft"
              size="20"
              className={cn("shrink-0 capitalize", statusStyles[activity.status])}
            >
              {activity.status}
            </Badge>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Showing recent activity for your account. Full audit logs will be
        available in a future release.
      </p>
    </div>
  )
}
