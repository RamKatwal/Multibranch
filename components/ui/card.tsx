import * as React from "react";
import { cn } from "@/lib/utils";

// Local addition (design-system.md §9): size="sm" is the app's compact card (12px spacing, 14px title).
// Spacing goes through --card-spacing (Radian's 24px by default) so the parts follow the size.
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card bg-elevation-level1 text-fg flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl border py-(--card-spacing) shadow-sm [--card-spacing:--spacing(6)]",
        "data-[size=sm]:text-xs/relaxed data-[size=sm]:[--card-spacing:--spacing(3)]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-(--card-spacing) group-data-[size=sm]/card:grid-rows-none group-data-[size=sm]/card:gap-1 group-data-[size=sm]/card:has-data-[slot=card-description]:grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "heading-6 leading-none font-semibold group-data-[size=sm]/card:text-sm group-data-[size=sm]/card:leading-5 group-data-[size=sm]/card:font-medium group-data-[size=sm]/card:tracking-normal",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-fg-secondary text-sm group-data-[size=sm]/card:text-xs/relaxed", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-(--card-spacing) [.border-t]:pt-(--card-spacing)", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
