"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { adminNavigation } from "@/config/admin-navigation"
import { AppBrand } from "@/components/app-brand"
import {
  SidebarSubmenuItem,
  SidebarSubmenuPanel,
} from "@/components/motion/sidebar-submenu"
import { OrganizationsNavList } from "@/components/layout/organization-switcher"
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"

function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavMenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
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

function OrganizationsNavSection({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  return (
    <SidebarGroup className="mt-1 border-t border-sidebar-border pt-2">
      <SidebarGroupLabel className="px-2 text-xs font-medium text-sidebar-foreground/50">
        Organizations
      </SidebarGroupLabel>
      <SidebarGroupAction
        title="Add organization"
        aria-label="Add organization"
        className="top-3.5 right-2 text-sidebar-foreground/50 hover:text-sidebar-foreground"
        render={<Link href="/onboarding/company" />}
      >
        <Plus className="size-3.5!" />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <OrganizationsNavList
          navItems={item.children ?? []}
          pathname={pathname}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { state, isMobile, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  const organizationsItem = adminNavigation.find(
    (item) => item.href === "/admin/organizations"
  )
  const primaryNavItems = adminNavigation.filter(
    (item) => item.href !== "/admin/organizations"
  )

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
              {primaryNavItems.map((item) => (
                <NavMenuItem
                  key={item.title}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {organizationsItem ? (
          <OrganizationsNavSection
            item={organizationsItem}
            pathname={pathname}
          />
        ) : null}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
