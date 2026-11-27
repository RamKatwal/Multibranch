"use client"

import * as React from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  FormDialogBody,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
} from "@/components/ui/form-dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth/current-user"
import type { Company } from "@/lib/branches/company-branches"
import { currentUserBillTo, type BillTo } from "@/lib/mock/account-billing"

type BillToType = BillTo["type"]

type BillingDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  billTo: BillTo | null
  companies: Company[]
  onSave: (billTo: BillTo) => void
}

export function BillingDetailsDialog({
  open,
  onOpenChange,
  billTo,
  companies,
  onSave,
}: BillingDetailsDialogProps) {
  const user = getCurrentUser()
  const initialCompanyId =
    billTo?.type === "company" ? billTo.companyId : (companies[0]?.id ?? "")
  const [type, setType] = React.useState<BillToType>(billTo?.type ?? "company")
  const [companyId, setCompanyId] = React.useState(initialCompanyId)

  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setType(billTo?.type ?? "company")
      setCompanyId(initialCompanyId)
    }
  }

  const company = companies.find((item) => item.id === companyId)
  const canSave = type === "individual" || Boolean(company)

  function handleSave() {
    if (type === "individual") {
      onSave(currentUserBillTo())
    } else if (company) {
      onSave({ type: "company", companyId: company.id, companyName: company.name })
    } else {
      return
    }
    toast.success("Billing details saved")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <FormDialogTitle>
            {billTo ? "Change billing details" : "Set billing details"}
          </FormDialogTitle>
          <FormDialogDescription>
            Invoices are issued to a company or to you.
          </FormDialogDescription>
        </FormDialogHeader>

        <FormDialogBody>
          <Tabs
            value={type}
            onValueChange={(value) => setType(value as BillToType)}
            items={[
              { value: "company", label: "Company" },
              { value: "individual", label: "Individual" },
            ]}
          />

          {type === "company" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="bill-to-company">Company</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger id="bill-to-company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-fg-secondary">
                Invoices will be issued to your account:
              </p>
              <div className="flex items-center gap-3 rounded-lg border bg-fill1 p-3">
                <Avatar size="36">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-fg">
                    {user.name}
                  </span>
                  <span className="truncate text-sm text-fg-secondary">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          )}
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
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            Save
          </Button>
        </FormDialogFooter>
      </FormDialogContent>
    </Dialog>
  )
}
