import { SectionShell } from "@/components/settings/section-shell"
import { settingsNavigation } from "@/config/settings-navigation"

type SettingsShellProps = {
  children: React.ReactNode
}

export function SettingsShell({ children }: SettingsShellProps) {
  return (
    <SectionShell
      title="Settings"
      items={settingsNavigation}
      mobileLabel="Settings section"
    >
      {children}
    </SectionShell>
  )
}
