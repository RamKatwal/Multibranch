"use client"

import * as React from "react"
import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react"

import { AddCompanySlotsDialog } from "@/components/admin/billing/add-company-slots-dialog"
import { AddModuleDialog } from "@/components/admin/billing/add-module-dialog"
import { BillingDetailsCard } from "@/components/admin/billing/billing-details-card"
import { BillingDetailsDialog } from "@/components/admin/billing/billing-details-dialog"
import { BillingSandboxPanel } from "@/components/admin/billing/billing-sandbox-panel"
import { CurrentPlanCard } from "@/components/admin/billing/current-plan-card"
import { PaymentHistoryCard } from "@/components/admin/billing/payment-history-card"
import { SubscribedModulesCard } from "@/components/admin/billing/subscribed-modules-card"
import { useAccountBilling } from "@/components/admin/billing/use-account-billing"
import { RenewPlanDialog } from "@/components/admin/subscriptions/renew-plan-dialog"
import { UpdatePlanLimitsDialog } from "@/components/admin/subscriptions/update-plan-limits-dialog"
import { PageHeader } from "@/components/layout/page-header"
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatLongDate } from "@/lib/format"
import { ADDITIONAL_MODULES } from "@/lib/onboarding/plans"

type OpenDialog = "renew" | "branches" | "users" | "companies" | "module" | "billTo" | null

export function BillingPage() {
  const billing = useAccountBilling()
  const { subscription, renewalState, daysLeft } = billing
  const [dialog, setDialog] = React.useState<OpenDialog>(null)

  const close = (open: boolean) => {
    if (!open) setDialog(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Billing"
        badge={
          <Badge
            size="20"
            variant="soft"
            color={
              renewalState === "expired"
                ? "error"
                : renewalState === "expiring"
                  ? "warning"
                  : "success"
            }
          >
            {renewalState === "expired"
              ? "Expired"
              : renewalState === "expiring"
                ? `${daysLeft} days left`
                : "Active"}
          </Badge>
        }
        actions={
          <BillingSandboxPanel
            onRenewalChange={billing.setRenewalScenario}
            onBillToChange={billing.setBillToScenario}
            onPaymentsChange={billing.setPaymentsScenario}
          />
        }
      />

      {renewalState !== "active" ? (
        <Alert
          color={renewalState === "expired" ? "error" : "warning"}
          variant="soft-outline"
        >
          <AlertIcon>
            {renewalState === "expired" ? <CircleAlertIcon /> : <TriangleAlertIcon />}
          </AlertIcon>
          <AlertContent>
            <AlertTitle>
              {renewalState === "expired"
                ? "Your plan has expired"
                : `Your plan expires in ${daysLeft} days`}
            </AlertTitle>
            <AlertDescription>
              {renewalState === "expired"
                ? `It ended on ${formatLongDate(subscription.periodEnd)}. Renew now to restore access for your companies.`
                : `Renew before ${formatLongDate(subscription.periodEnd)} to keep every company running without interruption.`}
            </AlertDescription>
          </AlertContent>
          <AlertToolbar>
            <Button
              size="32"
              variant={renewalState === "expired" ? "strong" : "outline"}
              color={renewalState === "expired" ? "primary" : "neutral"}
              onClick={() => setDialog("renew")}
            >
              {renewalState === "expired" ? "Renew now" : "Renew"}
            </Button>
          </AlertToolbar>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <CurrentPlanCard
          className="lg:col-span-2"
          subscription={subscription}
          daysLeft={daysLeft}
          renewalState={renewalState}
          onAddCompany={() => setDialog("companies")}
          onAddBranch={() => setDialog("branches")}
          onAddUsers={() => setDialog("users")}
          onRenew={() => setDialog("renew")}
        />
        <SubscribedModulesCard
          modules={billing.modules}
          canAddModule={billing.moduleIds.length < ADDITIONAL_MODULES.length}
          onAddModule={() => setDialog("module")}
        />
      </div>

      <BillingDetailsCard
        billTo={billing.billTo}
        onChange={() => setDialog("billTo")}
      />

      <PaymentHistoryCard subscription={subscription} />

      <RenewPlanDialog
        open={dialog === "renew"}
        onOpenChange={close}
        subscription={subscription}
        onConfirm={billing.renew}
      />
      <UpdatePlanLimitsDialog
        open={dialog === "branches" || dialog === "users"}
        focus={dialog === "users" ? "users" : "branches"}
        onOpenChange={close}
        subscription={subscription}
        onConfirm={billing.updateLimits}
      />
      <AddCompanySlotsDialog
        open={dialog === "companies"}
        onOpenChange={close}
        subscription={subscription}
        onConfirm={billing.addCompanies}
      />
      <AddModuleDialog
        open={dialog === "module"}
        onOpenChange={close}
        subscription={subscription}
        ownedModuleIds={billing.moduleIds}
        onConfirm={billing.addModules}
      />
      <BillingDetailsDialog
        open={dialog === "billTo"}
        onOpenChange={close}
        billTo={billing.billTo}
        companies={billing.companies}
        onSave={billing.setBillTo}
      />
    </div>
  )
}
