"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDownToLineIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpFromLineIcon,
  BoxesIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ProductListPanel } from "@/components/products/product-list-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { formatLongDate } from "@/lib/format"
import {
  getActiveBranchContext,
  getBranchProductStock,
  getProductBranchStock,
  type ProductBranchStock,
} from "@/lib/inventory/branch-stock"
import {
  getProductDetailById,
  getProductTransactions,
  type ProductTransaction,
} from "@/lib/mock/products"
import { cn } from "@/lib/utils"
import {
  productStatusLabels,
  productTypeLabels,
  type ProductDetail,
  type ProductStatus,
} from "@/types/product"

function statusBadgeClassName(status: ProductStatus) {
  return status === "active"
    ? "border-transparent bg-success/15 text-success"
    : "border-border text-muted-foreground"
}

function dash(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—"
  if (typeof value === "string" && value.trim() === "") return "—"
  return value
}

function formatRs(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-xs font-medium wrap-break-word">
        {children}
      </dd>
    </div>
  )
}

function DetailGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-3">
      <p className="mb-1 text-xs font-semibold text-foreground">{title}</p>
      <dl className="flex flex-col">{children}</dl>
    </div>
  )
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card size="sm" className="ring-foreground/10">
      <CardHeader className="border-b pb-3">
        <CardTitle>{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3",
        accent && "border-primary/30 bg-primary/5"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
          accent && "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-lg font-semibold leading-tight tabular-nums">
          {value}
        </span>
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

function transactionTypeBadgeClassName(type: ProductTransaction["type"]) {
  switch (type) {
    case "Sales":
      return "border-transparent bg-primary/10 text-primary"
    case "Purchase":
      return "border-transparent bg-success/15 text-success"
    case "Adjustment":
      return "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400"
    default:
      return "border-border text-muted-foreground"
  }
}

function TransactionsCard({
  title,
  transactions,
  limit,
  ledgerHref,
}: {
  title: string
  transactions: ProductTransaction[]
  limit?: number
  ledgerHref?: string
}) {
  const rows = limit ? transactions.slice(0, limit) : transactions

  return (
    <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title}</h3>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {transactions.length}
          </span>
        </div>
        {ledgerHref ? (
          <Button
            variant="link"
            size="sm"
            className="h-auto gap-1 px-0 text-xs"
            nativeButton={false}
            render={<Link href={ledgerHref} />}
          >
            Product ledger
            <ArrowRightIcon className="size-3.5" />
          </Button>
        ) : null}
      </div>

      {rows.length ? (
        <div className="thin-scrollbar overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Date</th>
                <th className="px-4 py-2 text-left font-medium">Reference</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-right font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((txn) => (
                <tr key={txn.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatLongDate(txn.date)}
                  </td>
                  <td className="px-4 py-2.5 font-medium">
                    <span className="font-mono text-xs">{txn.reference}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      variant="outline"
                      className={transactionTypeBadgeClassName(txn.type)}
                    >
                      {txn.type}
                    </Badge>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-medium tabular-nums",
                      txn.quantity >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {txn.quantity >= 0 ? `+${txn.quantity}` : txn.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          No transactions recorded for this product yet.
        </div>
      )}
    </div>
  )
}

function BranchesStockCard({
  branches,
}: {
  branches: ProductBranchStock[]
}) {
  const totals = branches.reduce(
    (acc, row) => ({
      availableQuantity: acc.availableQuantity + row.availableQuantity,
      stockIn: acc.stockIn + row.stockIn,
      stockOut: acc.stockOut + row.stockOut,
      totalQuantity: acc.totalQuantity + row.totalQuantity,
    }),
    {
      availableQuantity: 0,
      stockIn: 0,
      stockOut: 0,
      totalQuantity: 0,
    }
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={PackageIcon}
          label="Total Available"
          value={totals.availableQuantity}
        />
        <StatTile
          icon={ArrowDownToLineIcon}
          label="Total Stock In"
          value={totals.stockIn}
        />
        <StatTile
          icon={ArrowUpFromLineIcon}
          label="Total Stock Out"
          value={totals.stockOut}
        />
        <StatTile
          icon={BoxesIcon}
          label="Overall Total Stock"
          value={totals.totalQuantity}
          accent
        />
      </div>

      <div className="overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Branch Stock</h3>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {branches.length}
            </span>
          </div>
        </div>

        {branches.length ? (
          <div className="thin-scrollbar overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Branch</th>
                  <th className="px-4 py-2 text-right font-medium">Available</th>
                  <th className="px-4 py-2 text-right font-medium">Stock In</th>
                  <th className="px-4 py-2 text-right font-medium">Stock Out</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((row) => (
                  <tr key={row.branchId} className="border-b last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium">{row.branchName}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {row.branchCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {row.availableQuantity}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-success">
                      +{row.stockIn}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-destructive">
                      -{row.stockOut}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {row.totalQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/40 text-sm font-semibold">
                  <td className="px-4 py-2.5">Overall</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {totals.availableQuantity}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-success">
                    +{totals.stockIn}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-destructive">
                    -{totals.stockOut}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {totals.totalQuantity}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No branch stock recorded for this product yet.
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function ProductDetailPage({ productId }: { productId: string }) {
  const [product, setProduct] = React.useState<ProductDetail | undefined>(() =>
    getProductDetailById(productId)
  )
  const [loadedId, setLoadedId] = React.useState(productId)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [activeBranch, setActiveBranch] = React.useState<{
    id: string
    name: string
  } | null>(null)

  if (productId !== loadedId) {
    setLoadedId(productId)
    setProduct(getProductDetailById(productId))
    setActiveTab("overview")
  }

  React.useEffect(() => {
    const { branch } = getActiveBranchContext()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveBranch(branch ? { id: branch.id, name: branch.name } : null)
  }, [])

  const transactions = React.useMemo(
    () => getProductTransactions(productId),
    [productId]
  )

  const branchStock = React.useMemo(
    () => getProductBranchStock(productId),
    [productId]
  )

  const branchOnHand = activeBranch
    ? getBranchProductStock(activeBranch.id, productId)
    : (product?.totalQuantity ?? 0)

  const notFound = (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-xl font-semibold">Product not found</h1>
      <p className="text-sm text-muted-foreground">
        This product does not exist or has been removed.
      </p>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/inventory/products" />}
      >
        Back to Products
      </Button>
    </div>
  )

  if (!product) {
    return (
      <div className="-mt-3 -mb-3 -ml-3 flex min-h-[calc(100svh-3.5rem)] md:-mt-4 md:-mb-4 md:-ml-4">
        <ProductListPanel
          selectedId={productId}
          className="hidden md:flex"
        />
        <div className="flex min-w-0 flex-1 flex-col pt-3 pr-0 pb-3 pl-3 md:pt-4 md:pb-4 md:pl-4">
          {notFound}
        </div>
      </div>
    )
  }

  const isActive = product.status === "active"

  function toggleStatus() {
    setProduct((current) =>
      current
        ? {
            ...current,
            status: current.status === "active" ? "inactive" : "active",
          }
        : current
    )
    toast.success(
      isActive
        ? `Product "${product?.name}" deactivated.`
        : `Product "${product?.name}" activated.`
    )
  }

  const openingAmount =
    product.openingQuantity != null && product.openingRate != null
      ? product.openingQuantity * product.openingRate
      : null

  const ledgerHref = `/inventory/products/${product.id}?tab=transactions`

  return (
    <div className="-mt-3 -mb-3 -ml-3 flex min-h-[calc(100svh-3.5rem)] md:-mt-4 md:-mb-4 md:-ml-4">
      <ProductListPanel
        selectedId={product.id}
        className="hidden md:flex"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-5 pt-3 pr-0 pb-3 pl-3 md:pt-4 md:pb-4 md:pl-4">
        <PageHeader
          title={product.name}
          count={product.id}
          badge={
            <Badge
              variant="outline"
              className={statusBadgeClassName(product.status)}
            >
              {productStatusLabels[product.status]}
            </Badge>
          }
          breadcrumb={
            <Button
              variant="link"
              size="sm"
              className="mb-0.5 h-auto self-start px-0 text-muted-foreground md:hidden"
              nativeButton={false}
              render={<Link href="/inventory/products" />}
            >
              <ArrowLeftIcon />
              Products
            </Button>
          }
          actions={
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Product editing is coming soon.")}
              >
                <PencilIcon />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="More actions"
                    />
                  }
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuItem
                    onClick={() => toast.info("Duplicate is coming soon.")}
                  >
                    <CopyIcon />
                    Duplicate product
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleStatus}>
                    {isActive ? <EyeOffIcon /> : <EyeIcon />}
                    {isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => toast.info("Delete is coming soon.")}
                  >
                    <Trash2Icon />
                    Delete product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-8"
                aria-label="Close product detail"
                nativeButton={false}
                render={<Link href="/inventory/products" />}
              >
                <XIcon />
              </Button>
            </>
          }
        />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(String(value))}
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="transactions">
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-1">
            <div className="grid items-start gap-4 lg:grid-cols-3">
              <Card
                size="sm"
                className="gap-0 divide-y py-0 ring-foreground/10"
              >
                <DetailGroup title="Identification">
                  <Row label="ID">{product.id}</Row>
                  <Row label="Name">{product.name}</Row>
                  <Row label="Alias">{dash(product.alias)}</Row>
                  <Row label="SKU">{dash(product.sku)}</Row>
                  <Row label="HS code">{dash(product.hsCode)}</Row>
                  <Row label="Item code">{dash(product.itemCode)}</Row>
                  <Row label="Tax">{dash(product.tax)}</Row>
                  <Row label="Stock valuation">
                    {product.stockValuation}
                  </Row>
                  <Row label="Expiry date">
                    {dash(product.expiryDate)}
                  </Row>
                </DetailGroup>

                <DetailGroup title="Configuration">
                  <Row label="Entry by">
                    <span className="capitalize">{product.entryBy}</span>
                  </Row>
                  <Row label="Batch">
                    {product.batchTracking ? "On" : "Off"}
                  </Row>
                  <Row label="Inventory">
                    {product.inventoryManaged ? "Managed" : "Not managed"}
                  </Row>
                  <Row label="Sellable">
                    {product.isSellable ? "Yes" : "No"}
                  </Row>
                  <Row label="Record status">
                    {productStatusLabels[product.status]}
                  </Row>
                </DetailGroup>

                <DetailGroup title="Classification">
                  <Row label="Product type">
                    {productTypeLabels[product.type]}
                  </Row>
                  <Row label="Primary unit">{product.primaryUnit}</Row>
                  <Row label="Category">{product.category}</Row>
                  <Row label="Sub category">
                    {dash(product.subCategory)}
                  </Row>
                  <Row label="Reorder qty">
                    {dash(product.reorderQty)}
                  </Row>
                </DetailGroup>

                <DetailGroup title="GL mapping">
                  <Row label="Purchase account">
                    {product.purchaseAccount}
                  </Row>
                  <Row label="Sales account">{product.salesAccount}</Row>
                  <Row label="Inventory account">
                    {product.inventoryAccount}
                  </Row>
                </DetailGroup>

                <DetailGroup title="Pricing">
                  <Row label="Cost price">
                    {formatRs(product.costPrice)}
                  </Row>
                  <Row label="Selling price">
                    {formatRs(product.sellingPrice)}
                  </Row>
                  <Row label="Discount">{product.discountPercent}%</Row>
                </DetailGroup>

                <DetailGroup title="Opening balance">
                  <Row label="Opening qty">
                    {dash(product.openingQuantity)}
                  </Row>
                  <Row label="Opening rate">
                    {product.openingRate == null
                      ? "—"
                      : formatRs(product.openingRate)}
                  </Row>
                  <Row label="Amount">
                    {openingAmount == null ? "—" : formatRs(openingAmount)}
                  </Row>
                </DetailGroup>
              </Card>

              <div className="flex flex-col gap-4 lg:col-span-2">
                <SectionCard
                  title="Inventory Details"
                  action={
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/5 text-primary"
                    >
                      {product.id}
                    </Badge>
                  }
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatTile
                      icon={PackageIcon}
                      label={`Available at ${activeBranch?.name ?? "branch"}`}
                      value={branchOnHand}
                      accent
                    />
                    <StatTile
                      icon={LayersIcon}
                      label="Hold Units"
                      value={product.holdQuantity}
                    />
                    <StatTile
                      icon={BoxesIcon}
                      label="Catalogue Total"
                      value={product.totalQuantity}
                    />
                  </div>
                </SectionCard>

                <TransactionsCard
                  title="Recent Transactions"
                  transactions={transactions}
                  limit={5}
                  ledgerHref={ledgerHref}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="branches" className="mt-1">
            <BranchesStockCard branches={branchStock} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-1">
            <TransactionsCard
              title="Transaction History"
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-1">
            <EmptyPanel message="No documents attached to this product yet." />
          </TabsContent>

          <TabsContent value="activity" className="mt-1">
            <EmptyPanel message="No activity has been logged for this product yet." />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
