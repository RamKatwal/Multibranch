"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut, Upload, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser } from "@/lib/auth/current-user"
import { cn } from "@/lib/utils"

type ProfileSettingsPanelProps = {
  className?: string
}

export function ProfileSettingsPanel({ className }: ProfileSettingsPanelProps) {
  const router = useRouter()
  const currentUser = getCurrentUser()
  const username = currentUser.email.split("@")[0] ?? "user"

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <SettingsField
        label="Profile photo"
        description="A photo helps your teammates recognize you."
      >
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="text-sm">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" color="neutral" size="32">
              <Upload className="size-3.5" />
              Change
            </Button>
            <Button type="button" variant="outline" color="neutral" size="32">
              <X className="size-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </SettingsField>

      <SettingsField label="Full name" description="Your display name in the workspace.">
        <Input defaultValue={currentUser.name} />
      </SettingsField>

      <SettingsField
        label="Email address"
        description="Used for sign-in and notifications."
        badge={<Badge variant="strong" color="primary" size="20" className="bg-success/10 text-success">Verified</Badge>}
      >
        <Input defaultValue={currentUser.email} type="email" />
      </SettingsField>

      <SettingsField label="Username" description="Your unique handle across the workspace.">
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            @
          </span>
          <Input defaultValue={username} className="pl-7" />
        </div>
      </SettingsField>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Public details</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Information visible to other members in your organization.
          </p>
        </div>

        <SettingsField label="Role" description="Your position within the organization.">
          <NativeSelect defaultValue="Staff Product Lead">
            <option>Staff Product Lead</option>
            <option>Administrator</option>
            <option>Accountant</option>
            <option>Sales Manager</option>
          </NativeSelect>
        </SettingsField>

        <SettingsField label="Time zone" description="Used for scheduling and timestamps.">
          <NativeSelect defaultValue="(GMT+5:45) Kathmandu">
            <option>(GMT-5) New York</option>
            <option>(GMT+0) London</option>
            <option>(GMT+5:45) Kathmandu</option>
            <option>(GMT+8) Singapore</option>
          </NativeSelect>
        </SettingsField>

        <SettingsField label="Website" description="Optional link to your personal site.">
          <Input placeholder="https://" />
        </SettingsField>
      </div>

      <SettingsField label="Bio" description="A short summary about you.">
        <Textarea
          placeholder="Tell your team a little about yourself..."
          className="min-h-24 resize-none"
        />
      </SettingsField>

      <div className="border-t pt-6">
        <SettingsField
          label="Sign out"
          description="End your current session and return to the sign-up page."
        >
          <Button
            type="button"
            variant="outline"
            color="neutral"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => router.push("/signup")}
          >
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </SettingsField>
      </div>
    </div>
  )
}

function SettingsField({
  label,
  description,
  badge,
  children,
}: {
  label: string
  description: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-start">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{label}</p>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}
