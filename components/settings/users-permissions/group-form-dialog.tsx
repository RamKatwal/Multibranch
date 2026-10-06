"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  CompanyBranchMultiselect,
  getCompanyNamesForIds,
} from "@/components/settings/users-permissions/company-branch-multiselect"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
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
import { ADMIN_ROLE_ID, normalizeGroupCompanies, type Group } from "@/types/group"

const groupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Role name is required" })
    .max(100, { message: "Role name is too long" }),
  companyIds: z
    .array(z.string())
    .min(1, { message: "Select at least one company branch" }),
  branchIds: z
    .array(z.string())
    .min(1, { message: "Select at least one branch or head office" }),
})

export type PermissionGroupFormValues = z.infer<typeof groupFormSchema>

type PermissionGroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  group?: Group | null
  existingNames: string[]
  onSubmit: (
    values: PermissionGroupFormValues & { companyNames: string[] }
  ) => void
}

const emptyValues: PermissionGroupFormValues = {
  name: "",
  companyIds: [],
  branchIds: [],
}

export function PermissionGroupFormDialog({
  open,
  onOpenChange,
  mode,
  group,
  existingNames,
  onSubmit,
}: PermissionGroupFormDialogProps) {
  const isEdit = mode === "edit"

  const form = useForm<PermissionGroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: emptyValues,
  })

  React.useEffect(() => {
    if (!open) return

    if (isEdit && group) {
      const normalized = normalizeGroupCompanies(group)
      form.reset({
        name: normalized.name,
        companyIds: normalized.companyIds ?? [],
        branchIds: normalized.branchIds ?? [],
      })
      return
    }

    form.reset(emptyValues)
  }, [open, isEdit, group, form])

  function handleSubmit(values: PermissionGroupFormValues) {
    const normalizedName = values.name.trim()
    const reservedAdminName =
      normalizedName.toLowerCase() === "admin" &&
      (!isEdit || group?.id !== ADMIN_ROLE_ID)

    if (reservedAdminName) {
      form.setError("name", {
        message: "Admin is a reserved role and cannot be created",
      })
      return
    }

    const nameTaken = existingNames.some(
      (name) =>
        name.toLowerCase() === normalizedName.toLowerCase() &&
        (!isEdit ||
          !group ||
          group.name.toLowerCase() !== normalizedName.toLowerCase())
    )

    if (nameTaken) {
      form.setError("name", {
        message: "A role with this name already exists",
      })
      return
    }

    onSubmit({
      name: normalizedName,
      companyIds: values.companyIds,
      companyNames: getCompanyNamesForIds(values.companyIds),
      branchIds: values.branchIds,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {isEdit ? "Edit User Role" : "Add User Role"}
          </FormDialogTitle>
        </FormDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <FormDialogBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Warehouse Supervisor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Companies & branches</FormLabel>
                    <FormControl>
                      <CompanyBranchMultiselect
                        active={open}
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
              <Button type="submit">{isEdit ? "Save changes" : "Save"}</Button>
            </FormDialogFooter>
          </form>
        </Form>
      </FormDialogContent>
    </Dialog>
  )
}
