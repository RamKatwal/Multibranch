import { PageHeader } from "@/components/layout/page-header"
import { UserActivitiesSettingsPanel } from "@/components/settings/user-activities-settings-panel"

export function UserActivitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="User Activities" />
      <UserActivitiesSettingsPanel />
    </div>
  )
}
