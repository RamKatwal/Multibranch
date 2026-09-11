import { SectionShell } from "@/components/settings/section-shell"
import { configurationsNavigation } from "@/config/configurations-navigation"

type ConfigurationsShellProps = {
  children: React.ReactNode
}

export function ConfigurationsShell({ children }: ConfigurationsShellProps) {
  return (
    <SectionShell
      title="Configurations"
      items={configurationsNavigation}
      mobileLabel="Configuration section"
    >
      {children}
    </SectionShell>
  )
}
