"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { CompanyBranchMultiselect } from "@/components/settings/users-permissions/company-branch-multiselect"
import {
  PermissionGroupFormDialog,
  type PermissionGroupFormValues,
} from "@/components/settings/users-permissions/group-form-dialog"
import { branchChipLabel } from "@/components/settings/users-permissions/grouped-branch-chips"
import {
  dataTableClassNames,
  getDataTableHeaderCellClass,
} from "@/components/data-table/data-table-styles"
import { Button, IconButton } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  findCompanyForBranch,
  groupBranchesByCompany,
} from "@/lib/companies/options"
import { cn } from "@/lib/utils"
import { normalizeGroupCompanies, type Group } from "@/types/group"
import type { AppUser } from "@/types/user"

const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name is too long" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  address: z.string().trim().max(250, { message: "Address is too long" }),
  contact: z
    .string()
    .trim()
    .min(1, { message: "Contact is required" })
    .min(7, { message: "Please enter a valid contact number" })
    .max(30, { message: "Contact is too long" }),
  designation: z
    .string()
    .trim()
    .max(100, { message: "Designation is too long" }),
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username is too long" }),
  companyIds: z
    .array(z.string())
    .min(1, { message: "Select at least one company branch" }),
  branchIds: z
    .array(z.string())
    .min(1, { message: "Select at least one branch or head office" }),
  roleByBranch: z.record(z.string(), z.string()),
})

type UserFormInput = z.infer<typeof userFormSchema>

export type UserFormValues = UserFormInput & {
  assignments: Array<{ branchId: string; groupId: string }>
}

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  user?: AppUser | null
  roles: Group[]
  existingEmails: string[]
  existingUsernames: string[]
  existingRoleNames?: string[]
  onSubmit: (values: UserFormValues) => void
  onCreateRole?: (
    values: PermissionGroupFormValues & { companyNames: string[] }
  ) => Group
}

function RequiredMark() {
  return <span className="text-destructive"> *</span>
}

function CompactRoleDropdown({
  value,
  roles,
  onChange,
  ariaLabel,
  invalid,
}: {
  value: string
  roles: Group[]
  onChange: (value: string) => void
  ariaLabel: string
  invalid?: boolean
}) {
  const selected = roles.find((role) => role.id === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={roles.length === 0}
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            aria-invalid={invalid}
            className={cn(
              "flex h-7 w-full cursor-pointer items-center justify-between gap-1 rounded-md border border-input bg-transparent px-2 text-left text-xs shadow-xs outline-none transition-[color,box-shadow] select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30",
              selected ? "text-foreground" : "text-muted-foreground"
            )}
          />
        }
      >
        <span className="min-w-0 truncate">
          {selected?.name ?? "Select role…"}
        </span>
        <ChevronDownIcon className="size-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            className="cursor-pointer text-xs"
            onClick={() => onChange(role.id)}
          >
            {role.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function companyIdsFromBranches(branchIds: string[]) {
  const ids = new Set<string>()
  for (const branchId of branchIds) {
    const company = findCompanyForBranch(branchId)
    if (company) ids.add(company.id)
  }
  return Array.from(ids)
}

function roleCoversBranch(role: Group, branchId: string) {
  const company = findCompanyForBranch(branchId)
  if (!company) return false
  const normalized = normalizeGroupCompanies(role)
  return (
    (normalized.branchIds ?? []).includes(branchId) &&
    (normalized.companyIds ?? []).includes(company.id)
  )
}

function rolesForBranch(roles: Group[], branchId: string) {
  return roles.filter((role) => roleCoversBranch(role, branchId))
}

function valuesFromUser(user: AppUser) {
  const branchIds = user.assignments.map((assignment) => assignment.branchId)
  const roleByBranch: Record<string, string> = {}
  for (const assignment of user.assignments) {
    roleByBranch[assignment.branchId] = assignment.groupId
  }
  return {
    branchIds,
    companyIds: companyIdsFromBranches(branchIds),
    roleByBranch,
  }
}

const emptyValues: UserFormInput = {
  name: "",
  email: "",
  address: "",
  contact: "",
  designation: "",
  username: "",
  companyIds: [],
  branchIds: [],
  roleByBranch: {},
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  roles,
  existingEmails,
  existingUsernames,
  existingRoleNames = [],
  onSubmit,
  onCreateRole,
}: UserFormDialogProps) {
  const isEdit = mode === "edit"
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  const selectedBranchIds = form.watch("branchIds")
  const roleByBranch = form.watch("roleByBranch")
  const selectedGroups = React.useMemo(
    () => groupBranchesByCompany(selectedBranchIds),
    [selectedBranchIds]
  )

  React.useEffect(() => {
    if (!open) {
      setRoleDialogOpen(false)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return

    if (isEdit && user) {
      const fromUser = valuesFromUser(user)
      form.reset({
        name: user.name,
        email: user.email,
        address: user.address ?? "",
        contact: user.contact ?? "",
        designation: user.designation ?? "",
        username: user.username ?? "",
        companyIds: fromUser.companyIds,
        branchIds: fromUser.branchIds,
        roleByBranch: fromUser.roleByBranch,
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, user, form])

  React.useEffect(() => {
    if (!open) return

    const branchIds = form.getValues("branchIds")
    const current = form.getValues("roleByBranch")
    const next: Record<string, string> = {}
    let changed = false

    for (const branchId of branchIds) {
      const validIds = new Set(
        rolesForBranch(roles, branchId).map((role) => role.id)
      )
      const assigned = current[branchId] ?? ""
      next[branchId] = validIds.has(assigned) ? assigned : ""
      if (next[branchId] !== assigned || !(branchId in current)) {
        changed = true
      }
    }

    for (const branchId of Object.keys(current)) {
      if (!branchIds.includes(branchId)) {
        changed = true
      }
    }

    if (changed) {
      form.setValue("roleByBranch", next, { shouldValidate: false })
    }
  }, [form, open, roles, selectedBranchIds])

  function applyBranchIds(nextBranchIds: string[]) {
    form.setValue("companyIds", companyIdsFromBranches(nextBranchIds), {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue("branchIds", nextBranchIds, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  function setBranchRole(branchId: string, groupId: string) {
    form.setValue(
      "roleByBranch",
      { ...form.getValues("roleByBranch"), [branchId]: groupId },
      { shouldDirty: true, shouldValidate: true }
    )
    form.clearErrors(`roleByBranch.${branchId}` as `roleByBranch.${string}`)
  }

  function handleCreateRole(
    values: PermissionGroupFormValues & { companyNames: string[] }
  ) {
    onCreateRole?.(values)
  }

  function uncoveredBranchIds() {
    return selectedBranchIds.filter(
      (branchId) => rolesForBranch(roles, branchId).length === 0
    )
  }

  function missingRoleBranchIds() {
    return selectedBranchIds.filter((branchId) => {
      const valid = rolesForBranch(roles, branchId)
      if (valid.length === 0) return false
      return !(roleByBranch[branchId] ?? "").trim()
    })
  }

  const hasUncoveredBranches = uncoveredBranchIds().length > 0
  const hasMissingRoles = missingRoleBranchIds().length > 0
  const submitBlocked = hasUncoveredBranches || hasMissingRoles

  function handleSubmit(values: UserFormInput) {
    const normalizedEmail = values.email.trim().toLowerCase()
    const emailTaken = existingEmails.some(
      (email) =>
        email.toLowerCase() === normalizedEmail &&
        (!isEdit || !user || user.email.toLowerCase() !== normalizedEmail)
    )

    if (emailTaken) {
      form.setError("email", {
        message: "A user with this email already exists",
      })
      return
    }

    const normalizedUsername = values.username.trim().toLowerCase()
    const usernameTaken = existingUsernames.some(
      (username) =>
        username.toLowerCase() === normalizedUsername &&
        (!isEdit ||
          !user ||
          (user.username ?? "").toLowerCase() !== normalizedUsername)
    )

    if (usernameTaken) {
      form.setError("username", {
        message: "A user with this username already exists",
      })
      return
    }

    const uncovered = values.branchIds.filter(
      (branchId) => rolesForBranch(roles, branchId).length === 0
    )
    if (uncovered.length > 0) {
      form.setError("branchIds", {
        message:
          "Every selected branch needs a role configured in User Roles before you can save",
      })
      return
    }

    let missingRole = false
    for (const branchId of values.branchIds) {
      const groupId = (values.roleByBranch[branchId] ?? "").trim()
      const valid = rolesForBranch(roles, branchId)
      if (!groupId || !valid.some((role) => role.id === groupId)) {
        missingRole = true
        form.setError(`roleByBranch.${branchId}` as `roleByBranch.${string}`, {
          message: "Select a role",
        })
      }
    }

    if (missingRole) {
      form.setError("roleByBranch", {
        message: "Assign a role to every selected branch",
      })
      return
    }

    onSubmit({
      ...values,
      email: normalizedEmail,
      username: values.username.trim(),
      assignments: values.branchIds.map((branchId) => ({
        branchId,
        groupId: values.roleByBranch[branchId],
      })),
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={roleDialogOpen}
    >
      <FormDialogContent size="2xl">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit User" : "Create User"}
          </FormDialogTitle>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Username
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchIds"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 lg:col-span-3">
                    <FormLabel>
                      Companies & branches
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <CompanyBranchMultiselect
                        active={open}
                        placeholder="Select companies & branches…"
                        value={{
                          companyIds: form.watch("companyIds"),
                          branchIds: field.value,
                        }}
                        onChange={(next) => {
                          form.setValue("companyIds", next.companyIds, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                          field.onChange(next.branchIds)
                        }}
                        aria-invalid={
                          Boolean(form.formState.errors.branchIds) ||
                          Boolean(form.formState.errors.companyIds)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {form.formState.errors.companyIds &&
                    !form.formState.errors.branchIds ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.companyIds.message}
                      </p>
                    ) : null}
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assign role
                    {selectedBranchIds.length > 0 ? <RequiredMark /> : null}
                  </div>
                  {onCreateRole ? (
                    <Button
                      type="button"
                      variant="ghost"
                      color="neutral"
                      size="32"
                      className="h-7 px-2 text-xs"
                      onClick={() => setRoleDialogOpen(true)}
                    >
                      Create role
                    </Button>
                  ) : null}
                </div>

                {selectedGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Select companies and branches above to assign a role to
                    each one.
                  </p>
                ) : (
                  <div
                    className="overflow-hidden rounded-md border border-border"
                    data-slot="data-table"
                  >
                    <table
                      className={cn(dataTableClassNames.table, "text-xs")}
                      data-row-size="sm"
                    >
                      <thead>
                        <tr className={dataTableClassNames.headerRow}>
                          <th className={getDataTableHeaderCellClass("sm")}>
                            Branch
                          </th>
                          <th
                            className={cn(
                              getDataTableHeaderCellClass("sm"),
                              "w-44"
                            )}
                          >
                            Role
                          </th>
                          <th
                            className={cn(
                              getDataTableHeaderCellClass("sm"),
                              "w-10 last:border-r-0"
                            )}
                          >
                            <span className="sr-only">Remove</span>
                          </th>
                        </tr>
                      </thead>
                      {selectedGroups.map((group) => (
                        <tbody key={group.companyId}>
                          <tr className="border-b border-border bg-muted/30">
                            <td
                              colSpan={3}
                              className="px-3 py-1.5 text-xs font-medium"
                            >
                              {group.companyName}
                            </td>
                          </tr>
                          {group.branches.map((branch) => {
                            const validRoles = rolesForBranch(roles, branch.id)
                            const selectedRoleId =
                              roleByBranch[branch.id] ?? ""
                            const uncovered = validRoles.length === 0
                            const roleError =
                              form.formState.errors.roleByBranch?.[branch.id]
                                ?.message

                            return (
                              <tr
                                key={branch.id}
                                className="border-b border-border bg-card transition-colors hover:bg-muted/40"
                              >
                                <td className="h-auto min-h-8 border-r border-border px-3 py-1.5 align-middle">
                                  <p className="font-medium">
                                    {branchChipLabel(branch)}
                                  </p>
                                  {uncovered ? (
                                    <p className="text-[10px] leading-tight text-destructive">
                                      No role configured for this branch — set
                                      one up in User Roles
                                    </p>
                                  ) : roleError ? (
                                    <p className="text-[10px] leading-tight text-destructive">
                                      {roleError}
                                    </p>
                                  ) : null}
                                </td>
                                <td className="h-auto min-h-8 w-44 border-r border-border px-2 py-1.5 align-middle">
                                  {uncovered ? (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  ) : (
                                    <CompactRoleDropdown
                                      value={selectedRoleId}
                                      roles={validRoles}
                                      invalid={Boolean(roleError)}
                                      ariaLabel={`Role for ${group.companyName} ${branchChipLabel(branch)}`}
                                      onChange={(groupId) =>
                                        setBranchRole(branch.id, groupId)
                                      }
                                    />
                                  )}
                                </td>
                                <td className="h-auto min-h-8 w-10 px-1 py-1.5 align-middle">
                                  <IconButton
                                    type="button"
                                    variant="ghost"
                                    color="neutral"
                                    size="32"
                                    className="size-7"
                                    aria-label={`Remove ${group.companyName} ${branchChipLabel(branch)}`}
                                    onClick={() =>
                                      applyBranchIds(
                                        selectedBranchIds.filter(
                                          (id) => id !== branch.id
                                        )
                                      )
                                    }
                                  >
                                    <XIcon />
                                  </IconButton>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      ))}
                    </table>
                  </div>
                )}

                {typeof form.formState.errors.roleByBranch?.message ===
                "string" ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.roleByBranch.message}
                  </p>
                ) : null}
              </div>
            </FormDialogBody>

            <FormDialogFooter>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedBranchIds.length > 0 && submitBlocked}
              >
                {isEdit ? "Save changes" : "Save"}
              </Button>
            </FormDialogFooter>
          </form>
        </Form>

        {onCreateRole ? (
          <PermissionGroupFormDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            mode="create"
            existingNames={existingRoleNames}
            onSubmit={handleCreateRole}
          />
        ) : null}
      </FormDialogContent>
    </Dialog>
  )
}
