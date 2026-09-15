"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react"

import { AppBrand } from "@/components/app-brand"
import { BranchSwitcher } from "@/components/layout/branch-switcher"
import {
  SidebarSubmenuItem,
  SidebarSubmenuPanel,
} from "@/components/motion/sidebar-submenu"
import { mainNavigation, utilityNavigation } from "@/config/navigation"
import { useHomeView } from "@/components/dashboard/home/home-view-context"
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { SidebarTrialFooter } from "@/components/layout/sidebar-trial-footer"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMac } from "@/hooks/use-is-mac"
import { getNavShortcutKeys } from "@/lib/keyboard/shortcuts"
import { formatShortcutLabel } from "@/lib/keyboard/utils"
import { cn } from "@/lib/utils"
import type { NavItem } from "@/types/navigation"

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavShortcutTooltipLabel({
  title,
  shortcutKeys,
}: {
  title: string
  shortcutKeys?: string[] | null
}) {
  const isMac = useIsMac()

  return (
    <>
      <span>{title}</span>
      {shortcutKeys?.length ? (
        <kbd
          data-slot="kbd"
          className="pointer-events-none ml-1 inline-flex h-5 items-center rounded border border-background/20 bg-background/15 px-1.5 font-mono text-[10px] font-medium text-background"
        >
          {formatShortcutLabel(shortcutKeys, isMac)}
        </kbd>
      ) : null}
    </>
  )
}

function navTooltip(title: string, href: string) {
  const shortcutKeys = getNavShortcutKeys(href)

  return {
    children: (
      <NavShortcutTooltipLabel title={title} shortcutKeys={shortcutKeys} />
    ),
  }
}

function HomeMoreActions() {
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const {
    isFullscreen,
    expandToFullscreen,
    exitFullscreen,
    layoutActions,
  } = useHomeView()

  const isHomePage = pathname === "/"
  const canEdit = Boolean(
    isHomePage && layoutActions?.canEdit && !layoutActions.isLayoutEditing
  )
  const showFullscreenAction = isHomePage || isFullscreen

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger
          render={
            <TooltipTrigger
              render={<SidebarMenuAction showOnHover aria-label="More actions" />}
            />
          }
        >
          <MoreHorizontal />
          <span className="sr-only">More actions</span>
        </DropdownMenuTrigger>
        <TooltipContent side="right">More actions</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align="start"
        className="w-52"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>More actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {canEdit ? (
            <DropdownMenuItem onClick={() => layoutActions?.startEditing()}>
              <LayoutGrid />
              Edit layout
            </DropdownMenuItem>
          ) : null}
          {canEdit && layoutActions?.hasCustomLayout ? (
            <DropdownMenuItem onClick={() => layoutActions?.resetLayout()}>
              <RotateCcw />
              Reset layout
            </DropdownMenuItem>
          ) : null}
          {showFullscreenAction ? (
            isFullscreen ? (
              <DropdownMenuItem onClick={exitFullscreen}>
                <Minimize2 />
                Back to default
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={expandToFullscreen}>
                <Maximize2 />
                Expand to full screen
              </DropdownMenuItem>
            )
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavMenuItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon
  const isActive = isNavItemActive(pathname, item.href)
  const hasChildren = Boolean(item.children?.length)
  const isGroupActive = hasChildren && isActive
  const [expanded, setExpanded] = React.useState(isGroupActive)
  const isHome = item.href === "/"

  React.useEffect(() => {
    if (isGroupActive) {
      setExpanded(true)
    }
  }, [isGroupActive])

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={item.href} />}
          tooltip={navTooltip(item.title, item.href)}
          isActive={isActive}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
        {isHome ? <HomeMoreActions /> : null}
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
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              tooltip={navTooltip(item.title, item.href)}
              isActive={isGroupActive}
              className="w-full"
            />
          }
        >
          <Icon />
          <span>{item.title}</span>
          <ChevronRight className="ml-auto size-3.5! text-sidebar-foreground/40 transition-transform group-data-[open]/collapsible:rotate-90" />
        </CollapsibleTrigger>

        <SidebarSubmenuPanel open={expanded} panelKey={`${item.href}-submenu`}>
          {item.children?.map((child, index) => {
            const ChildIcon = child.icon
            const shortcutKeys = getNavShortcutKeys(child.href)

            const content = (
              <>
                <ChildIcon />
                <span>{child.title}</span>
              </>
            )

            return (
              <SidebarSubmenuItem key={child.href} index={index}>
                {shortcutKeys ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <SidebarMenuSubButton
                          render={<Link href={child.href} />}
                          isActive={isNavItemActive(pathname, child.href)}
                        />
                      }
                    >
                      {content}
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      <NavShortcutTooltipLabel
                        title={child.title}
                        shortcutKeys={shortcutKeys}
                      />
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuSubButton
                    render={<Link href={child.href} />}
                    isActive={isNavItemActive(pathname, child.href)}
                  >
                    {content}
                  </SidebarMenuSubButton>
                )}
              </SidebarSubmenuItem>
            )
          })}
        </SidebarSubmenuPanel>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state, isMobile, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon" className="relative">
      {!isMobile ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "absolute top-1/2 z-30 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-background text-muted-foreground shadow-sm transition-opacity",
                  "opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground",
                  "-right-3"
                )}
              />
            }
          >
            {isCollapsed ? (
              <ChevronRight className="size-3.5" />
            ) : (
              <ChevronLeft className="size-3.5" />
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            <NavShortcutTooltipLabel
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              shortcutKeys={["Mod", "B"]}
            />
          </TooltipContent>
        </Tooltip>
      ) : null}

      <SidebarHeader className="h-14 shrink-0 justify-center gap-0 border-b border-sidebar-border px-3 py-0">
        <div className="flex h-full items-center gap-2">
          <AppBrand
            href="/"
            className="flex-1 ring-sidebar-ring focus-visible:ring-2 group-data-[collapsible=icon]:justify-center"
            nameClassName="text-sidebar-foreground group-data-[collapsible=icon]:hidden"
            imageClassName="h-7 w-7 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7"
            priority
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-1 py-2">
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainNavigation.map((item) => (
                <NavMenuItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        <SidebarMenu className="gap-0.5">
          {utilityNavigation.map((item) => (
            <NavMenuItem key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>

        <SidebarTrialFooter daysRemaining={3} />

        <SidebarMenu>
          <SidebarMenuItem>
            <BranchSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
