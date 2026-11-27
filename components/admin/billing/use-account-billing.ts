"use client"

import * as React from "react"

import {
  pricingFor,
  shiftPeriodEnd,
} from "@/components/admin/subscriptions/billing-utils"
import type { UpdatePlanLimitsResult } from "@/components/admin/subscriptions/update-plan-limits-dialog"
import {
  useAllBranches,
  useBranchLimit,
  useCompanies,
} from "@/lib/branches/company-branches"
import { raiseBranchLimit } from "@/lib/branches/subscription"
import {
  buildAccountSubscription,
  daysUntil,
  DEFAULT_INDIVIDUAL_BILL_TO,
  periodEndForScenario,
  renewalStateFor,
  toIsoDate,
  type BillTo,
  type BillToScenario,
  type RenewalScenario,
} from "@/lib/mock/account-billing"
import { invoiceReceiptPath } from "@/lib/mock/invoice-receipt"
import {
  ADDITIONAL_MODULES,
  type AdditionalModuleId,
  type PaymentMethodId,
} from "@/lib/onboarding/plans"
import type {
  InvoiceChargeType,
  Subscription,
  SubscriptionInvoice,
} from "@/types/subscription"

type InvoiceExtras = Partial<
  Pick<
    SubscriptionInvoice,
    "addedUsers" | "addedBranches" | "addedCompanies" | "periodStart" | "periodEnd"
  >
>

function newInvoice(
  subscription: Subscription,
  chargeType: InvoiceChargeType,
  paymentMethod: PaymentMethodId,
  amountPaid: number,
  extras: InvoiceExtras = {}
): SubscriptionInvoice {
  const today = toIsoDate(new Date())
  const stamp = Date.now()
  const invoiceId = `inv_account_${stamp}`
  return {
    invoiceId,
    invoiceNumber: `INV-ACC-${String(stamp).slice(-6)}`,
    issueDate: today,
    periodStart: today,
    periodEnd: subscription.periodEnd,
    amountPaid,
    currency: subscription.currency,
    status: "Paid",
    pdfDownloadUrl: invoiceReceiptPath(invoiceId),
    planName: subscription.planName,
    chargeType,
    interval: subscription.interval,
    paymentMethod: {
      provider: paymentMethod,
      billingEmail: subscription.paymentMethod?.billingEmail ?? "",
    },
    usersUsed: subscription.usersUsed,
    usersLimit: subscription.usersLimit,
    branchesUsed: subscription.branchesUsed,
    branchesLimit: subscription.branchesLimit,
    ...extras,
  }
}

/**
 * State for `/admin/billing`. Plan, users, companies limit, modules, invoices and bill-to are
 * held here (mock); branches and companies used, and the branch limit, come from branch
 * storage so they agree with Branch Management.
 */
export function useAccountBilling() {
  const companies = useCompanies()
  const branches = useAllBranches()
  const branchLimit = useBranchLimit()

  const [base, setBase] = React.useState(buildAccountSubscription)
  const [moduleIds, setModuleIds] = React.useState<AdditionalModuleId[]>([])
  const [billTo, setBillTo] = React.useState<BillTo | null>(() =>
    companies[0]
      ? {
          type: "company",
          companyId: companies[0].id,
          companyName: companies[0].name,
        }
      : null
  )

  const daysLeft = daysUntil(base.periodEnd)
  const renewalState = renewalStateFor(daysLeft)

  const subscription: Subscription = React.useMemo(() => {
    const live: Subscription = {
      ...base,
      branchesUsed: branches.length,
      branchesLimit: branchLimit,
      companiesUsed: companies.length,
      // A demo scenario can list more companies than the mock limit; never show "8 / 3".
      companiesLimit: Math.max(base.companiesLimit ?? 0, companies.length),
      remainingDays: Math.max(0, daysLeft),
      nextBillingDate: base.periodEnd,
      status: renewalState === "expired" ? "past_due" : "active",
    }
    return {
      ...live,
      amount: pricingFor(live, live.usersLimit, live.branchesLimit).total,
    }
  }, [base, branches.length, branchLimit, companies.length, daysLeft, renewalState])

  const modules = ADDITIONAL_MODULES.filter((item) =>
    moduleIds.includes(item.id)
  )

  function renew(paymentMethod: PaymentMethodId, amountPaid: number) {
    setBase((prev) => {
      const from =
        daysUntil(prev.periodEnd) < 0 ? toIsoDate(new Date()) : prev.periodEnd
      const periodEnd = toIsoDate(shiftPeriodEnd(from, prev.interval))
      const invoice = newInvoice(subscription, "plan", paymentMethod, amountPaid, {
        periodStart: from,
        periodEnd,
      })
      return { ...prev, periodEnd, invoices: [invoice, ...prev.invoices] }
    })
  }

  function updateLimits(result: UpdatePlanLimitsResult) {
    if (result.addedBranches > 0) raiseBranchLimit(result.addedBranches)
    setBase((prev) => ({
      ...prev,
      usersLimit: result.usersLimit,
      invoices: [
        newInvoice(subscription, result.chargeType, result.paymentMethod, result.amountPaid, {
          addedUsers: result.addedUsers,
          addedBranches: result.addedBranches,
        }),
        ...prev.invoices,
      ],
    }))
  }

  function addCompanies(
    count: number,
    paymentMethod: PaymentMethodId,
    amountPaid: number
  ) {
    setBase((prev) => ({
      ...prev,
      companiesLimit: (prev.companiesLimit ?? 0) + count,
      invoices: [
        newInvoice(subscription, "companies", paymentMethod, amountPaid, {
          addedCompanies: count,
        }),
        ...prev.invoices,
      ],
    }))
  }

  function addModules(
    ids: AdditionalModuleId[],
    paymentMethod: PaymentMethodId,
    amountPaid: number
  ) {
    setModuleIds((prev) => [...prev, ...ids.filter((id) => !prev.includes(id))])
    setBase((prev) => ({
      ...prev,
      invoices: [
        newInvoice(subscription, "modules", paymentMethod, amountPaid),
        ...prev.invoices,
      ],
    }))
  }

  /** Dev sandbox: jump to a renewal scenario. */
  function setRenewalScenario(scenario: RenewalScenario) {
    setBase((prev) => ({ ...prev, periodEnd: periodEndForScenario(scenario) }))
  }

  /** Dev sandbox: jump to a bill-to scenario. */
  function setBillToScenario(scenario: BillToScenario) {
    if (scenario === "none") return setBillTo(null)
    if (scenario === "individual") return setBillTo(DEFAULT_INDIVIDUAL_BILL_TO)
    const company = companies[0]
    setBillTo(
      company
        ? { type: "company", companyId: company.id, companyName: company.name }
        : null
    )
  }

  /** Dev sandbox: show the payment history or its empty state. */
  function setPaymentsScenario(withHistory: boolean) {
    setBase((prev) => ({
      ...prev,
      invoices: withHistory ? buildAccountSubscription().invoices : [],
    }))
  }

  return {
    subscription,
    companies,
    daysLeft,
    renewalState,
    moduleIds,
    modules,
    billTo,
    setBillTo,
    renew,
    updateLimits,
    addCompanies,
    addModules,
    setRenewalScenario,
    setBillToScenario,
    setPaymentsScenario,
  }
}

export type AccountBilling = ReturnType<typeof useAccountBilling>
