"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type TabsVariant = VariantProps<typeof tabsListStyles>["variant"];
export type TabsListWidth = VariantProps<typeof tabsListStyles>["width"];
export type TabsListContextType = {
  variant?: TabsVariant;
  width?: TabsListWidth;
};
// Local addition (design-system.md §9): `items` renders a filter / status bar without panels.
export type TabItem<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
};
export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  items?: readonly TabItem[];
};
export type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & TabsListContextType;
export type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  count?: number;
};
export type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;

const tabsListStyles = cva(
  "no-scrollbar flex shrink-0 overflow-x-scroll data-[orientation=horizontal]:h-9 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center data-[orientation=horizontal]:justify-start data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-center",
  {
    variants: {
      width: {
        fit: "w-max max-w-full min-w-max",
        full: "data-[orientation=horizontal]:w-full data-[orientation=horizontal]:items-stretch data-[orientation=horizontal]:*:flex-1",
      }, // default medium
      variant: {
        default: "bg-fill2",
        open: "border-border data-[orientation=horizontal]:border-b data-[orientation=vertical]:border-r",
        ghost: "",
        // Local variant (design-system.md §9): joined buttons, the app's tab look (ui-tabs.mdc)
        button: "min-w-0 flex-wrap overflow-visible data-[orientation=horizontal]:h-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      width: "fit",
    },
    compoundVariants: [
      {
        variant: "default",
        className: "rounded-lg p-0.5",
      },
      {
        variant: "open",
        className: "data-[orientation=horizontal]:gap-3 data-[orientation=vertical]:gap-2",
      },
    ],
  },
);

const tabsTriggerStyles = cva(
  "text-fg-secondary data-[state=active]:text-fg [&>svg]:text-fg-tertiary disabled:text-fg-disabled disabled:[&>svg]:text-fg-disabled box-border inline-flex w-max cursor-pointer items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring focus-visible:ring-offset-1 disabled:cursor-not-allowed data-[orientation=vertical]:w-full [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "data-[state=active]:bg-elevation-level2 data-[state=active]:border-soft-alpha border border-transparent data-[state=active]:border data-[state=active]:drop-shadow-xs",
        open: "data-[state=active][orientation=horizontal]:border-b-2 data-[state=active][orientation=vertical]:border-r-2 data-[state=active]:border-primary border-transparent data-[orientation=horizontal]:border-b-2 data-[orientation=vertical]:border-r-2",
        ghost: "data-[state=active]:bg-primary-accent data-[state=active]:text-primary-text",
        button: "",
      },
    },
    compoundVariants: [
      {
        variant: ["default"],
        className: "h-full rounded-md px-2.5 py-1.5",
      },
      {
        variant: "open",
        className: "h-9 data-[orientation=horizontal]:py-2 data-[orientation=vertical]:px-2",
      },
      {
        variant: ["ghost"],
        className: "h-full p-2 data-[state=active]:rounded-lg",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  },
);

// Local variant "button": an outline button per tab, joined; the active tab is a primary button.
const tabsButtonTriggerStyles = cn(
  buttonVariants({ variant: "outline", color: "neutral", size: "32" }),
  "group/tabs-trigger bg-elevation-level1 text-fg rounded-none not-first:border-l-0 first:rounded-l-md last:rounded-r-md focus-visible:relative focus-visible:z-10 [&>svg]:text-current",
  "data-[state=active]:bg-primary data-[state=active]:text-primary-fg data-[state=active]:hover:bg-primary-hover data-[state=active]:border-transparent",
);

const TabsListContext = React.createContext<TabsListContextType | null>(null);

function useTabsList() {
  const context = React.use(TabsListContext);
  if (!context) {
    throw new Error("useTabsList must be used within a Context Provider");
  }
  return context;
}

function Tabs({ className, items, children, activationMode, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      // a filter row changes data, so arrow keys only move focus there
      activationMode={activationMode ?? (items ? "manual" : "automatic")}
      className={cn(
        "no-scrollbar flex flex-col gap-3 data-[orientation=vertical]:flex-row",
        className,
      )}
      {...props}
    >
      {items ? (
        <TabsList variant="button">
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
  );
}
Tabs.displayName = TabsPrimitive.Root.displayName;

function TabsList({
  className,
  width = "fit",
  children,
  variant = "default",
  ...props
}: TabsListProps) {
  const ctxValues = React.useMemo(() => ({ variant, width }), [variant, width]);
  return (
    <TabsListContext.Provider value={ctxValues}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListStyles({ variant, width }), className)}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  );
}
TabsList.displayName = TabsPrimitive.List.displayName;

function TabsTrigger({
  className,
  children,
  count,
  ...props
}: TabsTriggerProps) {
  const { variant } = useTabsList();
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerStyles({ variant }),
        variant === "button" && tabsButtonTriggerStyles,
        className,
      )}
      {...props}
    >
      {children}
      {count != null ? (
        <span
          data-slot="tabs-trigger-count"
          className="text-fg-secondary tabular-nums group-disabled/tabs-trigger:text-fg-disabled group-data-[state=active]/tabs-trigger:text-primary-fg/80"
        >
          {count}
        </span>
      ) : null}
    </TabsPrimitive.Trigger>
  );
}
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none data-[state=inactive]:hidden", className)}
      {...props}
    />
  );
}

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
