"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleDashedIcon, LockIcon } from "lucide-react"

import { SetupProgressBar } from "@/components/admin/setup/setup-progress-bar"
import { CompanyAvatar } from "@/components/company-logo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getOrganizationSetupByCompanyId,
  markAllSetupStepsComplete,
  markSetupStepComplete,
  markSetupStepIncomplete,
  SETUP_STEP_COUNT,
  subscribeSetupOverrides,
  type ResolvedSetupStep,
} from "@/lib/admin/organization-setup"

function StepStatusIcon({
  complete,
  locked,
}: {
  complete: boolean
  locked: boolean
}) {
  if (locked) {
    return (
      <LockIcon
        className="size-4 shrink-0 text-fg-secondary"
        strokeWidth={1.75}
        aria-label="Locked"
      />
    )
  }

  if (complete) {
    return (
      <CircleCheckIcon
        className="size-4 shrink-0 text-success"
        strokeWidth={1.75}
        aria-label="Complete"
      />
    )
  }

  return (
    <CircleDashedIcon
      className="size-4 shrink-0 text-fg-secondary"
      strokeWidth={1.75}
      aria-label="Incomplete"
    />
  )
}

function SetupStepActions({
  companyId,
  step,
  onChanged,
  onNavigateAway,
}: {
  companyId: string
  step: ResolvedSetupStep
  onChanged: () => void
  onNavigateAway: () => void
}) {
  if (step.locked) {
    return (
      <Button size="32" variant="outline" color="neutral"
        disabled
        tabIndex={-1}
        className="pointer-events-none opacity-60"
      >
        {step.lockLabel ?? "Requires branch setup first"}
      </Button>
    )
  }

  if (step.complete) {
    return (
      <Button size="32" variant="outline" color="neutral"
        onClick={() => {
          markSetupStepIncomplete(companyId, step.id)
          onChanged()
        }}
      >
        Undo
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button size="32" variant="outline" color="neutral"
        onClick={() => {
          markSetupStepComplete(companyId, step.id)
          onChanged()
        }}
      >
        Mark as done
      </Button>
      <Button size="32" asChild
        onClick={onNavigateAway}
      ><Link href={step.href}>
        Set up →
      </Link></Button>
    </div>
  )
}

function SetupStepRow({
  companyId,
  step,
  onChanged,
  onNavigateAway,
}: {
  companyId: string
  step: ResolvedSetupStep
  onChanged: () => void
  onNavigateAway: () => void
}) {
  return (
    <li className="flex flex-col gap-3 border-b px-1 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5">
          <StepStatusIcon complete={step.complete} locked={step.locked} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{step.title}</p>
          <p className="mt-0.5 text-xs text-fg-secondary">
            {step.description}
          </p>
        </div>
      </div>

      <div className="shrink-0 sm:pl-4">
        <SetupStepActions
          companyId={companyId}
          step={step}
          onChanged={onChanged}
          onNavigateAway={onNavigateAway}
        />
      </div>
    </li>
  )
}

type OrganizationSetupDialogProps = {
  companyId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrganizationSetupDialog({
  companyId,
  open,
  onOpenChange,
}: OrganizationSetupDialogProps) {
  const [, setTick] = React.useState(0)

  const refresh = React.useCallback(() => {
    setTick((value) => value + 1)
  }, [])

  React.useEffect(() => {
    return subscribeSetupOverrides(refresh)
  }, [refresh])

  const progress = companyId
    ? getOrganizationSetupByCompanyId(companyId)
    : undefined

  if (!progress) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" />
      </Dialog>
    )
  }

  const { org, steps, completedCount, percent } = progress

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-11/12 flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12">
          <div className="flex items-start gap-3">
            <CompanyAvatar
              name={org.companyName}
              domain={org.companyDomain}
              logoUrl={org.companyLogoUrl}
              size="40"
              showTooltip={false}
              avatarClassName="size-10"
            />
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold tracking-tight">
                {org.companyName}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                Complete steps in any order
              </DialogDescription>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <p className="text-xs text-fg-secondary tabular-nums">
              {completedCount} of {SETUP_STEP_COUNT} complete
            </p>
            <SetupProgressBar percent={percent} />
          </div>
        </DialogHeader>

        <ul className="min-h-0 flex-1 overflow-y-auto px-5">
          {steps.map((step) => (
            <SetupStepRow
              key={step.id}
              companyId={org.companyId}
              step={step}
              onChanged={refresh}
              onNavigateAway={() => onOpenChange(false)}
            />
          ))}
        </ul>

        {completedCount < SETUP_STEP_COUNT ? (
          <div className="shrink-0 border-t px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  Don&apos;t need step-by-step help?
                </p>
                <p className="mt-0.5 text-xs text-fg-secondary">
                  Mark every step complete if you&apos;ve already set things up
                  elsewhere.
                </p>
              </div>
              <Button size="32" variant="outline" color="neutral"
                className="shrink-0"
                onClick={() => {
                  markAllSetupStepsComplete(org.companyId)
                  refresh()
                }}
              >
                Complete all
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
