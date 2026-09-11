"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"

import { CompanyDetailField } from "@/components/settings/company-configuration/company-detail-field"
import {
  ProductConfigurationFormDialog,
  type ProductConfigurationFormValues,
} from "@/components/settings/product-configuration/product-configuration-form-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import {
  readProductConfiguration,
  saveProductConfiguration,
} from "@/lib/product-configuration/storage"
import { mockProductConfiguration } from "@/lib/mock/product-configuration"
import {
  barcodeFormatLabels,
  costingMethodLabels,
  type ProductConfiguration,
} from "@/types/product-configuration"

export function ProductConfigurationPage() {
  const [configuration, setConfiguration] = React.useState<ProductConfiguration>(
    mockProductConfiguration
  )
  const [editOpen, setEditOpen] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfiguration(readProductConfiguration())
  }, [])

  function handleSave(values: ProductConfigurationFormValues) {
    setConfiguration(saveProductConfiguration(values))
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Product Configuration"
        actions={
          <Button type="button" size="sm" onClick={() => setEditOpen(true)}>
            <PencilIcon className="size-4" />
            Edit
          </Button>
        }
      />

      <section className="rounded-xl border bg-card shadow-xs">
        <div className="flex flex-col gap-6 p-4 sm:p-5">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CompanyDetailField
              label="Default unit"
              value={configuration.defaultUnit}
            />
            <CompanyDetailField
              label="Costing method"
              value={costingMethodLabels[configuration.costingMethod]}
            />
            <CompanyDetailField label="Auto-generate SKU">
              {configuration.autoGenerateSku ? "Yes" : "No"}
            </CompanyDetailField>
            <CompanyDetailField
              label="SKU prefix"
              value={configuration.skuPrefix}
            />
            <CompanyDetailField label="Low stock threshold">
              {configuration.lowStockThreshold}
            </CompanyDetailField>
            <CompanyDetailField
              label="Barcode format"
              value={barcodeFormatLabels[configuration.barcodeFormat]}
            />
          </dl>
        </div>
      </section>

      <ProductConfigurationFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        configuration={configuration}
        onSubmit={handleSave}
      />
    </div>
  )
}
