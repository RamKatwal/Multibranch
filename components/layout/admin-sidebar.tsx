"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  adminNavigation,
  adminSecondaryNavigation,
} from "@/config/admin-navigation"
import { AppBrand } from "@/components/app-brand"
import {
  SidebarSubmenuItem,
  SidebarSubmenuPanel,
} from "@/components/motion/sidebar-submenu"
import { CompanyLogo } from "@/components/company-logo"
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getBranchCountsByCompany,
  useAllBranches,
  useCompanies,
} from "@/lib/branches/company-branches"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"

function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavMenuItem({
  item,
  pathname,
  muted = false,
}: {
  item: NavItem
  pathname: string
  muted?: boolean
}) {
  const Icon = item.icon
  const isActive = isNavItemActive(pathname, item.href)
  const hasChildren = Boolean(item.children?.length)
  const isGroupActive = hasChildren && isActive
  const [expanded, setExpanded] = React.useState(isGroupActive)

  const [prevGroupActive, setPrevGroupActive] = React.useState(isGroupActive)
  if (prevGroupActive !== isGroupActive) {
    setPrevGroupActive(isGroupActive)
    if (isGroupActive) setExpanded(true)
  }

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.href} />}
          tooltip={item.title}
          isActive={isActive}
          className={cn(muted && !isActive && "text-fg-tertiary")}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild
        ><SidebarMenuButton
              tooltip={item.title}
              isActive={isGroupActive}
              className="w-full">
          <Icon />
          <span>{item.title}</span>
          <ChevronRight className="ml-auto size-3.5! text-sidebar-foreground/40 transition-transform group-data-[open]/collapsible:rotate-90" />
        </SidebarMenuButton></CollapsibleTrigger>

        <SidebarSubmenuPanel open={expanded} panelKey={`${item.href}-submenu`}>
          {item.children?.map((child, index) => {
            const ChildIcon = child.icon

            return (
              <SidebarSubmenuItem key={child.href} index={index}>
                <SidebarMenuSubButton
                  render={<Link href={child.href} />}
                  isActive={isNavItemActive(pathname, child.href)}
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

const BRANCHES_HREF = "/admin/branches"
/**
 * Branch Management with every company as a child (branch count beside each). With one
 * company it links straight to that company's branches.
 */
function BranchManagementNavItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const Icon = item.icon
  const organizations = useCompanies()
  const counts = getBranchCountsByCompany(useAllBranches(), organizations)
  const isGroupActive = isNavItemActive(pathname, BRANCHES_HREF)
  const [expanded, setExpanded] = React.useState(isGroupActive)

  const [prevGroupActive, setPrevGroupActive] = React.useState(isGroupActive)
  if (prevGroupActive !== isGroupActive) {
    setPrevGroupActive(isGroupActive)
    if (isGroupActive) setExpanded(true)
  }

  if (organizations.length <= 1) {
    const href = organizations[0]
      ? `${BRANCHES_HREF}/${organizations[0].id}`
      : BRANCHES_HREF
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={href} />}
          tooltip={item.title}
          isActive={isGroupActive}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isGroupActive}
            className="w-full"
          >
            <Icon />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-3.5! text-fg-tertiary transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <SidebarSubmenuPanel open={expanded} panelKey={`${BRANCHES_HREF}-submenu`}>
          {organizations.map((org, index) => {
            const href = `${BRANCHES_HREF}/${org.id}`
            return (
              <SidebarSubmenuItem key={org.id} index={index}>
                <SidebarMenuSubButton
                  render={<Link href={href} />}
                  isActive={isNavItemActive(pathname, href)}
                >
                  <CompanyLogo name={org.name} domain={org.domain} size={16} className="size-4" />
                  <span className="truncate">{org.name}</span>
                  <span className="ml-auto text-xs text-fg-tertiary tabular-nums">
                    {counts[org.id] ?? 0}
                  </span>
                </SidebarMenuSubButton>
              </SidebarSubmenuItem>
            )
          })}
        </SidebarSubmenuPanel>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { state, isMobile, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile


  return (
    <Sidebar collapsible="icon" className="relative">
      {!isMobile ? (
        <Tooltip>
          <TooltipTrigger asChild
          ><button
                type="button"
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "absolute top-1/2 z-30 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-bg text-fg-secondary shadow-sm transition-opacity",
                  "opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-fg",
                  "-right-3"
                )}>
            {isCollapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </button></TooltipTrigger>
          <TooltipContent side="right">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      ) : null}

      <SidebarHeader className="h-14 shrink-0 justify-center gap-0 border-b border-sidebar-border px-3 py-0">
        <div className="flex h-full items-center gap-2">
          <AppBrand
            href="/admin"
            className="flex-1 text-sidebar-foreground ring-sidebar-ring focus-visible:ring-2 group-data-[collapsible=icon]:justify-center [&_span]:group-data-[collapsible=icon]:hidden"
            nameClassName="text-sidebar-foreground"
            size={28}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-1 py-2">
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {adminNavigation.map((item) =>
                item.href === BRANCHES_HREF ? (
                  <BranchManagementNavItem
                    key={item.title}
                    item={item}
                    pathname={pathname}
                  />
                ) : (
                  <NavMenuItem
                    key={item.title}
                    item={item}
                    pathname={pathname}
                  />
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto py-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {adminSecondaryNavigation.map((item) => (
                <NavMenuItem
                  key={item.title}
                  item={item}
                  pathname={pathname}
                  muted
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
