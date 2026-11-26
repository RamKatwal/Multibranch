"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { CompanyLogo } from "@/components/company-logo"
import { organizations, type Organization } from "@/config/organizations"
import {
  SidebarSubmenuItem,
  SidebarSubmenuPanel,
} from "@/components/motion/sidebar-submenu"
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  readActiveOrganizationId,
  resolveActiveOrganization,
  saveActiveOrganizationId,
} from "@/lib/organizations/storage"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"

function isOrgChildActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function OrganizationLogo({
  org,
  className,
}: {
  org: Organization
  className?: string
}) {
  return (
    <CompanyLogo
      name={org.name}
      domain={org.domain}
      size={16}
      className={cn("size-4", className)}
    />
  )
}

function OrganizationNavItem({
  org,
  navItems,
  pathname,
  isActiveOrg,
  onActivate,
}: {
  org: Organization
  navItems: NavItem[]
  pathname: string
  isActiveOrg: boolean
  onActivate: () => void
}) {
  const isOnOrgRoute = navItems.some((child) =>
    isOrgChildActive(pathname, child.href)
  )
  const isGroupActive = isActiveOrg && isOnOrgRoute
  const [expanded, setExpanded] = React.useState(isGroupActive)

  const [prevGroupActive, setPrevGroupActive] = React.useState(isGroupActive)
  if (prevGroupActive !== isGroupActive) {
    setPrevGroupActive(isGroupActive)
    if (isGroupActive) setExpanded(true)
  }

  return (
    <Collapsible
      open={expanded}
      onOpenChange={(open) => {
        setExpanded(open)
        if (open) onActivate()
      }}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild
        ><SidebarMenuButton
              tooltip={org.name}
              isActive={isGroupActive}
              className="w-full">
          <OrganizationLogo org={org} />
          <span>{org.name}</span>
          <ChevronRight className="ml-auto size-3.5! text-sidebar-foreground/40 transition-transform group-data-[open]/collapsible:rotate-90" />
        </SidebarMenuButton></CollapsibleTrigger>

        <SidebarSubmenuPanel open={expanded} panelKey={`${org.id}-submenu`}>
          {navItems.map((child, index) => {
            const ChildIcon = child.icon

            return (
              <SidebarSubmenuItem key={`${org.id}-${child.href}`} index={index}>
                <SidebarMenuSubButton
                  render={<Link href={child.href} onClick={onActivate} />}
                  isActive={
                    isActiveOrg && isOrgChildActive(pathname, child.href)
                  }
                >
                  <ChildIcon />
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarSubmenuItem>
            )
          })}
        </SidebarSubmenuPanel>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const ACTIVE_ORGANIZATION_EVENT = "active-organization-change"

function subscribeActiveOrganization(listener: () => void) {
  window.addEventListener("storage", listener)
  window.addEventListener(ACTIVE_ORGANIZATION_EVENT, listener)
  return () => {
    window.removeEventListener("storage", listener)
    window.removeEventListener(ACTIVE_ORGANIZATION_EVENT, listener)
  }
}

export function OrganizationsNavList({
  navItems,
  pathname,
}: {
  navItems: NavItem[]
  pathname: string
}) {
  const activeOrgId = React.useSyncExternalStore(
    subscribeActiveOrganization,
    () => resolveActiveOrganization()?.id ?? organizations[0].id,
    () => organizations[0].id
  )

  React.useEffect(() => {
    const active = resolveActiveOrganization()
    if (active && readActiveOrganizationId() !== active.id) {
      saveActiveOrganizationId(active.id)
    }
  }, [])

  function activateOrganization(org: Organization) {
    saveActiveOrganizationId(org.id)
    window.dispatchEvent(new Event(ACTIVE_ORGANIZATION_EVENT))
  }

  return (
    <SidebarMenu className="gap-0.5">
      {organizations.map((org) => (
        <OrganizationNavItem
          key={org.id}
          org={org}
          navItems={navItems}
          pathname={pathname}
          isActiveOrg={org.id === activeOrgId}
          onActivate={() => activateOrganization(org)}
        />
      ))}
    </SidebarMenu>
  )
}
