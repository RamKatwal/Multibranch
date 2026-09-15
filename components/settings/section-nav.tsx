"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

export type SectionNavItem = {
  title: string
  href: string
  description?: string
  children?: SectionNavItem[]
}

function flattenSectionLinks(items: SectionNavItem[]) {
  return items.flatMap((section) => {
    if (section.children?.length) {
      return section.children.map((child) => ({
        label: `${section.title} / ${child.title}`,
        href: child.href,
      }))
    }

    return [{ label: section.title, href: section.href }]
  })
}

function SectionLink({
  title,
  href,
  active,
}: {
  title: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block truncate rounded-lg border-l-2 border-transparent px-3 py-2 text-sm leading-none transition-colors",
        active
          ? "border-l-primary bg-primary/5 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {title}
    </Link>
  )
}

export function SectionNav({
  items,
  ariaLabel,
  className,
}: {
  items: SectionNavItem[]
  ariaLabel: string
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-0.5 px-2", className)} aria-label={ariaLabel}>
      {items.map((section) => {
        const hasChildren = Boolean(section.children?.length)

        if (!hasChildren) {
          return (
            <SectionLink
              key={section.href}
              title={section.title}
              href={section.href}
              active={pathname === section.href}
            />
          )
        }

        return (
          <div key={section.href} className="flex flex-col gap-0.5 py-1">
            <p className="px-3 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground/70 uppercase">
              {section.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.children!.map((item) => (
                <li key={item.href}>
                  <SectionLink
                    title={item.title}
                    href={item.href}
                    active={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export function SectionMobileNav({
  items,
  label,
}: {
  items: SectionNavItem[]
  label: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const links = React.useMemo(() => flattenSectionLinks(items), [items])

  const selected =
    links.find(
      (link) =>
        pathname === link.href || pathname.startsWith(`${link.href}/`)
    )?.href ?? pathname

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        value={selected}
        onChange={(event) => {
          router.push(event.target.value)
        }}
      >
        {links.map((link) => (
          <option key={link.href} value={link.href}>
            {link.label}
          </option>
        ))}
      </select>
    </label>
  )
}
