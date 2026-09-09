import Image from "next/image"

import { appBrand } from "@/config/navigation"
import { formatCurrency } from "@/lib/format"
import type { InvoiceReceiptData } from "@/lib/mock/invoice-receipt"
import { cn } from "@/lib/utils"

const receiptGrid =
  "grid grid-cols-[minmax(0,2.2fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-6"

function formatReceiptLongDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatReceiptPeriod(start: string, end: string) {
  const parse = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    return match
      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      : new Date(value)
  }

  const startDate = parse(start)
  const endDate = parse(end)

  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return `${startLabel}–${endLabel}`
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-x-8 text-[15px] leading-6">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  )
}

type InvoiceReceiptViewProps = {
  receipt: InvoiceReceiptData
  className?: string
}

export function InvoiceReceiptView({ receipt, className }: InvoiceReceiptViewProps) {
  const total = receipt.subtotal - (receipt.discount?.amount ?? 0)
  const paidSummary = `${formatCurrency(receipt.amountPaid, receipt.currency)} paid on ${formatReceiptLongDate(receipt.datePaid)}`

  return (
    <div
      className={cn(
        "min-h-screen bg-white text-neutral-900 print:bg-white print:text-black",
        className
      )}
    >
      <div className="mx-auto max-w-[760px] px-8 py-12 print:max-w-none print:px-0 print:py-0">
        <div className="mb-12 flex items-start justify-between gap-6">
          <h1 className="text-[2rem] font-semibold tracking-tight">Invoice</h1>
          <Image
            src={appBrand.logo}
            alt={appBrand.name}
            width={36}
            height={36}
            className="size-9 rounded-[22%] object-contain"
            priority
          />
        </div>

        <div className="space-y-1.5">
          <MetaRow label="Invoice number" value={receipt.invoiceNumber} />
          <MetaRow
            label="Date paid"
            value={formatReceiptLongDate(receipt.datePaid)}
          />
        </div>

        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          <div>
            <p className="text-[15px] font-semibold text-neutral-900">
              Providhy (@providhy)
            </p>
            <address className="mt-3 space-y-0.5 text-[15px] not-italic leading-6 text-neutral-500">
              <p>Thamel, Kathmandu 44600</p>
              <p>Bagmati Province, Nepal</p>
              <p>+977 1-5550123</p>
              <p>billing@providhy.com</p>
            </address>
          </div>

          <div>
            <p className="text-[15px] font-semibold text-neutral-900">
              Bill to
            </p>
            <div className="mt-3 space-y-0.5 text-[15px] leading-6 text-neutral-500">
              <p className="text-neutral-900">{receipt.billTo.companyName}</p>
              <p>{receipt.billTo.address}</p>
              <p>{receipt.billTo.email}</p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[1.75rem] font-semibold leading-tight tracking-tight">
          {paidSummary}
        </p>

        <div className="mt-10">
          <div
            className={cn(
              receiptGrid,
              "border-b border-neutral-200 pb-3 text-sm font-medium text-neutral-500"
            )}
          >
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
          </div>

          <div
            className={cn(
              receiptGrid,
              "border-b border-neutral-200 py-5 text-[15px] leading-6"
            )}
          >
            <div>
              <p className="font-medium text-neutral-900">{receipt.planName}</p>
              <p className="mt-1 text-neutral-500">
                {formatReceiptPeriod(receipt.periodStart, receipt.periodEnd)}
              </p>
            </div>
            <p className="text-right tabular-nums">{receipt.quantity}</p>
            <p className="text-right tabular-nums">
              {formatCurrency(receipt.unitPrice, receipt.currency)}
            </p>
            <p className="text-right tabular-nums">
              {formatCurrency(receipt.subtotal, receipt.currency)}
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-[280px] space-y-3 text-[15px]">
              <div className="flex items-center justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="tabular-nums text-neutral-900">
                  {formatCurrency(receipt.subtotal, receipt.currency)}
                </span>
              </div>
              {receipt.discount ? (
                <div className="flex items-center justify-between text-neutral-500">
                  <span>{receipt.discount.label}</span>
                  <span className="tabular-nums text-neutral-900">
                    -{formatCurrency(receipt.discount.amount, receipt.currency)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between rounded-md bg-neutral-100 px-4 py-3 font-semibold text-neutral-900">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(total, receipt.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-[1.35rem] font-semibold tracking-tight">
            Payment history
          </h2>

          <div className="mt-5">
            <div
              className={cn(
                receiptGrid,
                "border-b border-neutral-200 pb-3 text-sm font-medium text-neutral-500"
              )}
            >
              <span>Payment method</span>
              <span>Date</span>
              <span className="text-right">Amount paid</span>
              <span className="text-right">Invoice number</span>
            </div>

            {receipt.paymentHistory.length === 0 ? (
              <p className="py-5 text-[15px] text-neutral-500">
                No payments recorded yet.
              </p>
            ) : (
              receipt.paymentHistory.map((entry) => (
                <div
                  key={`${entry.invoiceNumber}-${entry.date}`}
                  className={cn(
                    receiptGrid,
                    "border-b border-neutral-200 py-5 text-[15px] last:border-0"
                  )}
                >
                  <p className="text-neutral-900">{entry.method}</p>
                  <p className="text-neutral-500">
                    {formatReceiptLongDate(entry.date)}
                  </p>
                  <p className="text-right tabular-nums text-neutral-900">
                    {formatCurrency(entry.amountPaid, receipt.currency)}
                  </p>
                  <p className="text-right tabular-nums text-neutral-900">
                    {entry.invoiceNumber}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="mt-16 space-y-1 text-sm leading-6 text-neutral-500">
          <p>Providhy Technologies Pvt. Ltd.</p>
          <p>Company Registration No. 312456/078/079</p>
          <p>VAT No. 609876543</p>
        </footer>
      </div>
    </div>
  )
}
