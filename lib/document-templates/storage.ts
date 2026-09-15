import { mockDocumentTemplates } from "@/lib/mock/document-templates"
import { createSlugId } from "@/lib/slug"
import type { DocumentTemplate } from "@/types/document-template"

const DOCUMENT_TEMPLATES_STORAGE_KEY = "ibmerp-document-templates-v1"

export function readDocumentTemplates(): DocumentTemplate[] {
  try {
    const saved = window.localStorage.getItem(DOCUMENT_TEMPLATES_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as DocumentTemplate[]
    }
  } catch {
    // Fall back to mock seed data.
  }

  return mockDocumentTemplates.map((template) => ({ ...template }))
}

export function saveDocumentTemplates(templates: DocumentTemplate[]) {
  window.localStorage.setItem(
    DOCUMENT_TEMPLATES_STORAGE_KEY,
    JSON.stringify(templates)
  )
  return templates
}

export function createDocumentTemplateId(name: string) {
  return createSlugId("dt", name)
}
