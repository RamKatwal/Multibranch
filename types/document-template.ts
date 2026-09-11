import type { DocumentType } from "@/types/document-type"

export const DOCUMENT_TEMPLATE_STATUSES = ["active", "inactive"] as const

export type DocumentTemplateStatus = (typeof DOCUMENT_TEMPLATE_STATUSES)[number]

export type DocumentTemplate = {
  id: string
  name: string
  documentType: DocumentType
  isDefault: boolean
  status: DocumentTemplateStatus
  content: string
}

export const documentTemplateStatusLabels: Record<DocumentTemplateStatus, string> = {
  active: "Active",
  inactive: "Inactive",
}
