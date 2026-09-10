"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { buttonVariants } from "@/components/ui/button"
import { buttonGroupVariants } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"

export type TabItem<T extends string = string> = {
  value: T
  label: React.ReactNode
  count?: number
  disabled?: boolean
}

type TabsProps = TabsPrimitive.Root.Props & {
  /**
   * Optional shortcut for filter / status bars (same look as compound TabsList).
   * Prefer compound `TabsList` + `TabsTrigger` when panels or custom triggers are needed.
   */
  items?: readonly TabItem[]
}

/**
 * Project-wide tabs. Visual pattern matches Purchase Return status tabs
 * (button group: active = default, inactive = outline).
 *
 * Filter bar:
 * ```tsx
 * <Tabs items={items} value={value} onValueChange={setValue} />
 * ```
 *
 * With panels:
 * ```tsx
 * <Tabs value={value} onValueChange={setValue}>
 *   <TabsList>
 *     <TabsTrigger value="inventory">Inventory</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="inventory">…</TabsContent>
 * </Tabs>
 * ```
 */
function Tabs({ className, items, children, orientation = "horizontal", ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    >
      {items ? (
        <TabsList>
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              count={item.count}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : null}
      {children}
    </TabsPrimitive.Root>
  )
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        buttonGroupVariants({ orientation: "horizontal" }),
        "h-auto w-fit flex-wrap",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  children,
  count,
  ...props
}: TabsPrimitive.Tab.Props & {
  count?: number
}) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "group/tabs-trigger bg-card",
        "data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/80",
        "dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
      {count != null ? (
        <span
          data-slot="tabs-trigger-count"
          className="tabular-nums text-muted-foreground group-data-active/tabs-trigger:text-primary-foreground/80"
        >
          {count}
        </span>
      ) : null}
    </TabsPrimitive.Tab>
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
