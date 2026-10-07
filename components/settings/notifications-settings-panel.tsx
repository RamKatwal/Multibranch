"use client"

import * as React from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type NotificationPreference = {
  id: string
  label: string
  description: string
  email: boolean
  inApp: boolean
}

const defaultPreferences: NotificationPreference[] = [
  {
    id: "mentions",
    label: "Mentions & replies",
    description: "When someone mentions you or replies to your comment.",
    email: true,
    inApp: true,
  },
  {
    id: "assignments",
    label: "Task assignments",
    description: "When a task or approval is assigned to you.",
    email: true,
    inApp: true,
  },
  {
    id: "orders",
    label: "Order updates",
    description: "Status changes on purchase and sales orders.",
    email: false,
    inApp: true,
  },
  {
    id: "inventory",
    label: "Low stock alerts",
    description: "When inventory falls below the reorder threshold.",
    email: true,
    inApp: true,
  },
  {
    id: "billing",
    label: "Billing & subscription",
    description: "Invoices, payment failures, and plan changes.",
    email: true,
    inApp: false,
  },
  {
    id: "digest",
    label: "Weekly digest",
    description: "A summary of activity across your workspace.",
    email: true,
    inApp: false,
  },
]

type NotificationsSettingsPanelProps = {
  className?: string
}

export function NotificationsSettingsPanel({
  className,
}: NotificationsSettingsPanelProps) {
  const [preferences, setPreferences] =
    React.useState(defaultPreferences)

  function togglePreference(
    id: string,
    channel: "email" | "inApp",
    checked: boolean
  ) {
    setPreferences((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [channel]: checked } : item
      )
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[minmax(0,1.4fr)_5rem_5rem] gap-3 border-b bg-muted/30 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Notification</span>
          <span className="text-center">Email</span>
          <span className="text-center">In-app</span>
        </div>

        {preferences.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,1.4fr)_5rem_5rem] items-center gap-3 border-b px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div className="flex justify-center">
              <Switch
                size="20"
                checked={item.email}
                onCheckedChange={(checked) =>
                  togglePreference(item.id, "email", checked)
                }
                aria-label={`${item.label} email notifications`}
              />
            </div>
            <div className="flex justify-center">
              <Switch
                size="20"
                checked={item.inApp}
                onCheckedChange={(checked) =>
                  togglePreference(item.id, "inApp", checked)
                }
                aria-label={`${item.label} in-app notifications`}
              />
            </div>
          </div>
        ))}
      </div>

      <SettingsToggleRow
        label="Desktop notifications"
        description="Show browser notifications when the app is in the background."
        defaultChecked={false}
      />
      <SettingsToggleRow
        label="Sound alerts"
        description="Play a sound for urgent in-app notifications."
        defaultChecked={true}
      />
    </div>
  )
}

function SettingsToggleRow({
  label,
  description,
  defaultChecked,
}: {
  label: string
  description: string
  defaultChecked: boolean
}) {
  const [checked, setChecked] = React.useState(defaultChecked)

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch size="20" checked={checked} onCheckedChange={setChecked} />
    </div>
  )
}
