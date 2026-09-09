import { cn } from "@/lib/utils"

type SetupProgressBarProps = {
  percent: number
  className?: string
}

export function SetupProgressBar({ percent, className }: SetupProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-foreground/70 transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
