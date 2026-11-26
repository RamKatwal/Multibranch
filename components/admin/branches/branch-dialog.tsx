"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { organizations } from "@/config/organizations"
import {
  getCompanyBranches,
  isBranchCodeTaken,
  suggestBranchCode,
  useAllBranches,
  useBranchLimit,
} from "@/lib/branches/company-branches"
import {
  BRANCHES_CHANGE_EVENT,
  createBranchId,
  saveAllBranches,
  todayIsoDate,
} from "@/lib/branches/storage"
import { persistBranchLimit } from "@/lib/branches/subscription"
import type { Branch } from "@/types/branch"

const USER_MANAGEMENT_HREF = "/admin/settings/users-permissions/users"

const branchSchema = z.object({
  companyId: z.string().min(1, { message: "Select a company" }),
  name: z
    .string()
    .trim()
    .min(1, { message: "Branch name is required" })
    .max(100, { message: "Branch name is too long" }),
  code: z
    .string()
    .trim()
    .min(1, { message: "Branch code is required" })
    .max(20, { message: "Branch code is too long" })
    .regex(/^[A-Za-z0-9_-]+$/, {
      message: "Use letters, numbers, hyphens or underscores only",
    }),
  location: z
    .string()
    .trim()
    .min(1, { message: "Location is required" })
    .max(250, { message: "Location is too long" }),
})

type BranchValues = z.infer<typeof branchSchema>

export type BranchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this branch; omit to add one. */
  branch?: Branch | null
  /** Preset company. Without it, the dialog shows a Company select. */
  companyId?: string
}

export function BranchDialog({
  open,
  onOpenChange,
  branch,
  companyId,
}: BranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        {/* Radix unmounts the content when closed, so each open starts fresh. */}
        <BranchDialogInner
          branch={branch ?? null}
          companyId={companyId}
          onClose={() => onOpenChange(false)}
        />
      </FormDialogContent>
    </Dialog>
  )
}

function BranchDialogInner({
  branch,
  companyId,
  onClose,
}: {
  branch: Branch | null
  companyId?: string
  onClose: () => void
}) {
  const allBranches = useAllBranches()
  const branchLimit = useBranchLimit()
  const isEdit = Boolean(branch)
  const [step, setStep] = React.useState<"upgrade" | "form">(() =>
    !isEdit && allBranches.length >= branchLimit ? "upgrade" : "form"
  )

  if (step === "upgrade") {
    return (
      <UpgradeStep
        used={allBranches.length}
        limit={branchLimit}
        onCancel={onClose}
        onContinue={() => {
          persistBranchLimit(branchLimit + 1)
          window.dispatchEvent(new Event(BRANCHES_CHANGE_EVENT))
          setStep("form")
        }}
      />
    )
  }

  return (
    <BranchForm
      allBranches={allBranches}
      branch={branch}
      companyId={companyId}
      onClose={onClose}
    />
  )
}

function UpgradeStep({
  used,
  limit,
  onCancel,
  onContinue,
}: {
  used: number
  limit: number
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>Add more branches</FormDialogTitle>
        <FormDialogDescription>
          You&apos;re using {used} of {limit} branches on your plan. Add a
          branch to your plan to continue.
        </FormDialogDescription>
      </FormDialogHeader>
      <FormDialogBody>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-fill1 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-fg">1 extra branch</span>
            <span className="text-xs text-fg-secondary">
              Your limit goes from {limit} to {limit + 1} branches.
            </span>
          </div>
          <span className="text-sm font-medium text-fg tabular-nums">
            Demo
          </span>
        </div>
        <p className="text-xs text-fg-tertiary">
          This is a preview. No payment is taken.
        </p>
      </FormDialogBody>
      <FormDialogFooter>
        <Button variant="outline" color="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onContinue}>
          <PlusIcon />
          Add branch to plan
        </Button>
      </FormDialogFooter>
    </>
  )
}

function BranchForm({
  allBranches,
  branch,
  companyId,
  onClose,
}: {
  allBranches: Branch[]
  branch: Branch | null
  companyId?: string
  onClose: () => void
}) {
  const router = useRouter()
  const isEdit = Boolean(branch)
  const showCompanySelect = !isEdit && !companyId
  const [codeEdited, setCodeEdited] = React.useState(isEdit)

  const form = useForm<BranchValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      companyId:
        branch?.companyId ??
        companyId ??
        (organizations.length > 1 ? "" : organizations[0].id),
      name: branch?.name ?? "",
      code: branch?.code ?? "",
      location: branch?.address ?? "",
    },
  })

  function suggestCode(name: string, forCompanyId: string) {
    if (codeEdited) return
    const taken = getCompanyBranches(allBranches, forCompanyId).map(
      (item) => item.code
    )
    form.setValue("code", suggestBranchCode(name, taken))
  }

  function handleSubmit(values: BranchValues) {
    if (branch) {
      saveAllBranches(
        allBranches.map((item) =>
          item.id === branch.id
            ? { ...item, name: values.name.trim(), address: values.location.trim() }
            : item
        )
      )
      toast.success("Branch updated")
      onClose()
      return
    }

    const code = values.code.trim().toUpperCase()
    if (isBranchCodeTaken(allBranches, values.companyId, code)) {
      form.setError("code", {
        message: "This code is already used by another branch in this company",
      })
      return
    }

    const nextBranch: Branch = {
      id: createBranchId(code),
      companyId: values.companyId,
      name: values.name.trim(),
      code,
      address: values.location.trim(),
      contactNumber: "",
      contactEmail: "",
      status: "active",
      createdAt: todayIsoDate(),
    }
    saveAllBranches([...allBranches, nextBranch])
    toast.success("Branch created", {
      action: {
        label: "Assign users",
        onClick: () => router.push(USER_MANAGEMENT_HREF),
      },
    })
    onClose()
  }

  return (
    <>
      <FormDialogHeader>
        <FormDialogTitle>{isEdit ? "Edit branch" : "Add branch"}</FormDialogTitle>
        <FormDialogDescription>
          {isEdit
            ? "Update the branch name and location."
            : "The new branch is active right away."}
        </FormDialogDescription>
      </FormDialogHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FormDialogBody>
            {showCompanySelect ? (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        suggestCode(form.getValues("name"), value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Kathmandu Hub"
                      autoFocus
                      {...field}
                      onChange={(event) => {
                        field.onChange(event)
                        suggestCode(event.target.value, form.getValues("companyId"))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. KTM"
                      readOnly={isEdit}
                      disabled={isEdit}
                      {...field}
                      onChange={(event) => {
                        setCodeEdited(true)
                        field.onChange(event.target.value.toUpperCase())
                      }}
                    />
                  </FormControl>
                  <FormDescription>Can&apos;t be changed later.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kalimati, Kathmandu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormDialogBody>

          <FormDialogFooter>
            <Button
              type="button"
              variant="outline"
              color="neutral"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add branch"}</Button>
          </FormDialogFooter>
        </form>
      </Form>
    </>
  )
}
