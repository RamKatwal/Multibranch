/** Shared id-generation helper for lookup/master-data domains (mirrors createBranchId in lib/branches/storage.ts). */
export function createSlugId(prefix: string, value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return `${prefix}-${slug || "item"}-${Date.now()}`
}
