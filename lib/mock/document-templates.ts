import type { DocumentTemplate } from "@/types/document-template"

export const mockDocumentTemplates: DocumentTemplate[] = [
  {
    id: "dt-sales-invoice-standard",
    name: "Standard Sales Invoice",
    documentType: "sales_invoice",
    isDefault: true,
    status: "active",
    content:
      "{{company.name}}\n{{company.address}}\n\nInvoice #{{document.number}}\nDate: {{document.date}}\n\n{{lineItems}}\n\nTotal: {{document.total}}",
  },
  {
    id: "dt-sales-order-standard",
    name: "Standard Sales Order",
    documentType: "sales_order",
    isDefault: true,
    status: "active",
    content:
      "{{company.name}}\n\nSales Order #{{document.number}}\nDate: {{document.date}}\n\n{{lineItems}}",
  },
  {
    id: "dt-purchase-order-standard",
    name: "Standard Purchase Order",
    documentType: "purchase_order",
    isDefault: true,
    status: "active",
    content:
      "{{company.name}}\n\nPurchase Order #{{document.number}}\nDate: {{document.date}}\nSupplier: {{supplier.name}}\n\n{{lineItems}}",
  },
  {
    id: "dt-quotation-standard",
    name: "Standard Quotation",
    documentType: "quotation",
    isDefault: true,
    status: "active",
    content:
      "{{company.name}}\n\nQuotation #{{document.number}}\nValid until: {{document.validUntil}}\n\n{{lineItems}}",
  },
  {
    id: "dt-delivery-note-standard",
    name: "Standard Delivery Note",
    documentType: "delivery_note",
    isDefault: true,
    status: "active",
    content:
      "{{company.name}}\n\nDelivery Note #{{document.number}}\nDate: {{document.date}}\n\n{{lineItems}}",
  },
]
