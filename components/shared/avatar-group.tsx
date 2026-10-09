import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, type AvatarProps } from "@/components/ui/avatar"

/**
 * Overlapping row of avatars. Radian has no avatar group, so this lives here
 * (tier 2) on top of the Radian `Avatar`: each avatar gets a ring in the page
 * background so the overlap reads as separate circles. An avatar inside
 * `TooltipTrigger asChild` gets the trigger's data-slot, so both slots are ringed;
 * other children (the unportaled tooltip's wrapper) are left alone.
 */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-bg *:data-[slot=tooltip-trigger]:ring-2 *:data-[slot=tooltip-trigger]:ring-bg",
        className
      )}
      {...props}
    />
  )
}

/** The "+N" circle at the end of an `AvatarGroup`: an avatar with a neutral fallback. */
function AvatarGroupCount({
  size = "24",
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <Avatar size={size} className={cn("font-medium", className)} {...props}>
      <AvatarFallback className="border border-border bg-fill2 text-fg-secondary">
        {children}
      </AvatarFallback>
    </Avatar>
  )
}

export { AvatarGroup, AvatarGroupCount }
