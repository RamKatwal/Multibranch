"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  companyInitials,
  getFaviconUrl,
  logoImageSize,
} from "@/lib/brand/favicon"
import { cn } from "@/lib/utils"

type CompanyLogoBaseProps = {
  name: string
  domain?: string | null
  logoUrl?: string | null
  className?: string
}

const avatarDisplayPx = {
  sm: 24,
  default: 32,
  lg: 40,
} as const

type CompanyAvatarProps = CompanyLogoBaseProps & {
  size?: "sm" | "default" | "lg"
  showTooltip?: boolean
  avatarClassName?: string
  fallbackClassName?: string
}

/** Circular avatar with high-res favicon + initials fallback. */
export function CompanyAvatar({
  name,
  domain,
  logoUrl,
  size = "sm",
  showTooltip = true,
  className,
  avatarClassName,
  fallbackClassName,
}: CompanyAvatarProps) {
  const avatar = (
    <Avatar
      size={size}
      className={cn("after:border-border/60", avatarClassName, className)}
      aria-label={name}
    >
      {logoUrl || domain ? (
        <AvatarImage
          src={
            logoUrl ??
            getFaviconUrl(domain!, logoImageSize(avatarDisplayPx[size]))
          }
          alt=""
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-muted text-[10px] font-semibold text-foreground",
          fallbackClassName
        )}
      >
        {companyInitials(name)}
      </AvatarFallback>
    </Avatar>
  )

  if (!showTooltip) return avatar

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {avatar}
      </TooltipTrigger>
      <TooltipContent side="top">{name}</TooltipContent>
    </Tooltip>
  )
}

type CompanyLogoProps = CompanyLogoBaseProps & {
  size?: number
}

/** Square logo image (for sidebars, lists, org cards, etc.). */
export function CompanyLogo({
  name,
  domain,
  logoUrl,
  size = 16,
  className,
}: CompanyLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-[4px] object-contain", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  if (!domain) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[4px] bg-muted text-[10px] font-semibold text-foreground",
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {companyInitials(name)}
      </span>
    )
  }

  return (
    <img
      src={getFaviconUrl(domain, logoImageSize(size))}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-[4px] object-contain", className)}
      style={{ width: size, height: size }}
    />
  )
}
