import { PageHeader } from "@/components/layout/page-header"
import { NotificationsSettingsPanel } from "@/components/settings/notifications-settings-panel"

export function NotificationPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Notification" />
      <NotificationsSettingsPanel />
    </div>
  )
}
