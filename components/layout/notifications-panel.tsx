"use client"

import * as React from "react"
import {
  CalendarIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  StarIcon,
  TrendingDownIcon,
  UsersIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useSettingsModal } from "@/components/settings/settings-modal-provider"
import {
  getAllNotifications,
  markAllNotificationsRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from "@/lib/notifications/storage"
import { cn } from "@/lib/utils"
import type {
  AppNotification,
  NotificationActor,
  NotificationBadge,
  NotificationIconKind,
  NotificationRichContent,
} from "@/types/notification"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

type NotificationsPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const iconMap: Record<
  NotificationIconKind,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  trend: {
    icon: TrendingDownIcon,
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  check: {
    icon: CheckCircle2Icon,
    className: "bg-warning/15 text-warning-foreground dark:text-warning",
  },
  users: {
    icon: UsersIcon,
    className: "bg-success/10 text-success",
  },
  star: {
    icon: StarIcon,
    className: "bg-success/10 text-success",
  },
  calendar: {
    icon: CalendarIcon,
    className: "bg-chart-5/15 text-chart-5-active",
  },
}

const badgeToneClass: Record<NotificationBadge["tone"], string> = {
  urgent: "border-transparent bg-destructive/10 text-destructive",
  priority:
    "border-transparent bg-warning/15 text-warning-foreground dark:text-warning",
  success: "border-transparent bg-success/10 text-success",
  neutral: "border-transparent bg-muted text-muted-foreground",
}

function NotificationLeading({
  notification,
}: {
  notification: AppNotification
}) {
  if (notification.actor) {
    return <PersonAvatar person={notification.actor} />
  }

  if (notification.icon) {
    const entry = iconMap[notification.icon]
    const Icon = entry.icon
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          entry.className
        )}
      >
        <Icon className="size-4" />
      </div>
    )
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <StarIcon className="size-4" />
    </div>
  )
}

function PersonAvatar({
  person,
  size = "default",
}: {
  person: NotificationActor
  size?: "default" | "sm"
}) {
  return (
    <Avatar size={size}>
      <AvatarFallback className={cn("text-xs font-medium", person.color)}>
        {person.initials}
      </AvatarFallback>
    </Avatar>
  )
}

function NotificationRich({ content }: { content: NotificationRichContent }) {
  if (content.type === "rating") {
    const max = content.max ?? 5
    return (
      <div className="mt-1.5 flex items-center gap-0.5" aria-label={`${content.value} of ${max} stars`}>
        {Array.from({ length: max }, (_, index) => (
          <StarIcon
            key={index}
            className={cn(
              "size-3.5",
              index < content.value
                ? "fill-warning text-warning"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    )
  }

  if (content.type === "avatars") {
    return (
      <AvatarGroup className="mt-2">
        {content.people.map((person) => (
          <PersonAvatar key={person.name} person={person} size="sm" />
        ))}
      </AvatarGroup>
    )
  }

  if (content.type === "progress") {
    const max = content.max ?? 100
    const percent = Math.min(100, Math.round((content.value / max) * 100))
    return (
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-success"
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2 rounded-md bg-muted/70 px-2.5 py-2 text-foreground">
        <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium">{content.dateLabel}</span>
        <span className="text-muted-foreground">{content.timeLabel}</span>
      </div>
      {content.locationLabel ? (
        <p className="text-muted-foreground">
          Where:{" "}
          {content.locationHref ? (
            <a
              href={content.locationHref}
              target="_blank"
              rel="noreferrer"
              className="text-info hover:underline"
            >
              {content.locationLabel}
            </a>
          ) : (
            content.locationLabel
          )}
        </p>
      ) : null}
    </div>
  )
}

function NotificationItem({
  notification,
}: {
  notification: AppNotification
}) {
  return (
    <article
      className={cn(
        "flex gap-3 border-b px-5 py-4 last:border-b-0",
        !notification.read && "bg-muted/30"
      )}
    >
      <NotificationLeading notification={notification} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {notification.title}
          </h3>
          {notification.badges?.length ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              {notification.badges.map((badge) => (
                <Badge
                  key={`${badge.label}-${badge.tone}`}
                  variant="secondary"
                  className={cn("h-5 rounded-md px-1.5 text-[10px]", badgeToneClass[badge.tone])}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {notification.description ? (
          <p className="mt-0.5 text-xs/relaxed text-muted-foreground">
            {notification.description}
          </p>
        ) : null}

        {notification.rich ? <NotificationRich content={notification.rich} /> : null}

        {notification.actions?.length ? (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant === "primary" ? "default" : "outline"}
                className="h-7 px-2.5 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        <p className="mt-2 text-[11px] text-muted-foreground">
          {notification.timestamp}
        </p>
      </div>
    </article>
  )
}

export function NotificationsPanel({
  open,
  onOpenChange,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    []
  )
  const { openSettings } = useSettingsModal()

  const refresh = React.useCallback(() => {
    setNotifications(getAllNotifications())
  }, [])

  React.useEffect(() => {
    refresh()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh)
    }
  }, [refresh])

  React.useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  const unreadCount = notifications.filter((item) => !item.read).length

  function markAllAsRead() {
    setNotifications(markAllNotificationsRead())
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
    >
      <DrawerContent className="[--drawer-content-width:100%] sm:[--drawer-content-width:28rem]">
        <DrawerHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b px-5 py-4 text-left">
          <div className="flex items-center gap-2">
            <DrawerTitle className="text-base font-semibold">
              Notifications
            </DrawerTitle>
            <Badge className="size-5 justify-center rounded-full p-0 text-[10px]">
              {unreadCount || notifications.length}
            </Badge>
            <DrawerDescription className="sr-only">
              Recent activity and alerts across your workspace.
            </DrawerDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Mark all as read"
              disabled={unreadCount === 0}
              onClick={markAllAsRead}
            >
              <CheckCheckIcon className="size-4" />
            </Button>
            <DrawerClose
              render={
                <Button type="button" variant="ghost" size="icon-sm" />
              }
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>

        <DrawerFooter className="border-t p-0">
          <button
            type="button"
            className="block w-full py-3.5 text-center text-sm font-medium text-foreground hover:bg-muted/50"
            onClick={() => {
              onOpenChange(false)
              openSettings("notifications")
            }}
          >
            Notification settings
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
