import {
  SectionMobileNav,
  SectionNav,
  type SectionNavItem,
} from "@/components/settings/section-nav"

type SectionShellProps = {
  title: string
  items: SectionNavItem[]
  mobileLabel: string
  children: React.ReactNode
}

function countLinks(items: SectionNavItem[]) {
  return items.reduce((sum, item) => {
    if (item.children?.length) return sum + item.children.length
    return sum + 1
  }, 0)
}

/** Shared two-pane shell (sticky nav aside + content) used by Configurations and Settings. */
export function SectionShell({
  title,
  items,
  mobileLabel,
  children,
}: SectionShellProps) {
  const total = countLinks(items)
  const unit = title.toLowerCase().includes("setting") ? "sections" : "pages"

  return (
    <div className="-mt-3 -mb-3 -ml-3 flex min-h-[calc(100svh-3.5rem)] md:-mt-4 md:-mb-4 md:-ml-4">
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-52 shrink-0 flex-col overflow-hidden border-r bg-card md:flex">
        <div className="flex shrink-0 items-center border-b px-3 py-2.5">
          <p className="text-sm font-semibold tracking-tight">{title}</p>
        </div>

        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto py-2">
          <SectionNav items={items} ariaLabel={title} />
        </div>

        <div className="shrink-0 border-t px-3 py-2 text-xs tabular-nums text-muted-foreground">
          {total} {unit}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4 pt-3 pr-0 pb-3 pl-3 md:pt-4 md:pr-0 md:pb-4 md:pl-4">
        <div className="md:hidden">
          <SectionMobileNav items={items} label={mobileLabel} />
        </div>
        {children}
      </div>
    </div>
  )
}
