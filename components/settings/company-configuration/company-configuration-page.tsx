"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { CameraIcon, PencilIcon } from "lucide-react"

import { CompanyAvatar } from "@/components/company-logo"
import { CompanyDetailField } from "@/components/settings/company-configuration/company-detail-field"
import { CompanyConfigurationFormDialog } from "@/components/settings/company-configuration/company-configuration-form-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Button, IconButton } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { appBrand } from "@/config/navigation"
import {
  getDefaultCompanyId,
  readCompanyProfile,
  saveCompanyProfile,
} from "@/lib/companies/profile"
import type { CompanyConfigurationFormValues } from "@/lib/companies/schema"
import type { CompanyProfile } from "@/types/company"

type CompanyConfigurationPageProps = {
  companyId?: string
  backHref?: string
  backLabel?: string
}

function websiteDomain(website?: string) {
  if (!website?.trim()) return null
  try {
    const url = website.startsWith("http") ? website : `https://${website}`
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result)
      else reject(new Error("Could not read image"))
    }
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"))
    reader.readAsDataURL(file)
  })
}

export function CompanyConfigurationPage({
  companyId,
  backHref,
  backLabel,
}: CompanyConfigurationPageProps) {
  const [profile, setProfile] = React.useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [editOpen, setEditOpen] = React.useState(false)
  const [logoBusy, setLogoBusy] = React.useState(false)
  const logoInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const resolvedId = companyId ?? getDefaultCompanyId()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(readCompanyProfile(resolvedId) ?? null)
    setIsLoading(false)
  }, [companyId])

  function handleSave(values: CompanyConfigurationFormValues) {
    if (!profile) return

    const next: CompanyProfile = {
      ...profile,
      ...values,
      companyWebsite: values.companyWebsite?.trim() || undefined,
      employeeNumber: values.employeeNumber?.trim() || undefined,
      domain: websiteDomain(values.companyWebsite) ?? profile.domain,
    }

    saveCompanyProfile(next)
    setProfile(next)
  }

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !profile) return
    if (!file.type.startsWith("image/")) return

    setLogoBusy(true)
    try {
      const logoUrl = await readImageAsDataUrl(file)
      const next: CompanyProfile = { ...profile, logoUrl }
      saveCompanyProfile(next)
      setProfile(next)
    } catch {
      // Ignore read failures (quota / corrupt file).
    } finally {
      setLogoBusy(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading company profile…
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-semibold">Company not found</h1>
        <p className="text-sm text-muted-foreground">
          This company does not exist or has been removed.
        </p>
        {backHref ? (
          <Button
            variant="outline"
            color="neutral"
            asChild
          >
            <Link href={backHref}>
              {backLabel ?? "Go back"}
            </Link>
          </Button>
        ) : null}
      </div>
    )
  }

  const avatarDomain =
    profile.domain ?? websiteDomain(profile.companyWebsite) ?? null
  const logoSrc = profile.logoUrl ?? (!companyId ? appBrand.logo : null)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Company Profile" />

      <section className="rounded-xl border bg-card shadow-xs">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative size-16 shrink-0">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={profile.companyName}
                    width={64}
                    height={64}
                    unoptimized={logoSrc.startsWith("data:")}
                    className="size-16 rounded-[22%] object-contain"
                  />
                ) : (
                  <CompanyAvatar
                    name={profile.companyName}
                    domain={avatarDomain}
                    size="lg"
                    showTooltip={false}
                    avatarClassName="size-16"
                    fallbackClassName="text-base"
                  />
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleLogoChange}
                />
                <IconButton
                  type="button"
                  size="32"
                  variant="outline"
                  color="neutral"
                  disabled={logoBusy}
                  className="absolute -right-1 -bottom-1 size-7 rounded-full bg-background shadow-xs"
                  aria-label="Change company image"
                  title="Change company image"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <CameraIcon className="size-3.5" />
                </IconButton>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight">
                  {profile.companyName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.email}
                  {profile.contact ? ` · ${profile.contact}` : ""}
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="32"
              onClick={() => setEditOpen(true)}
            >
              <PencilIcon className="size-4" />
              Edit profile
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-6 p-4 sm:p-5">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Company details
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CompanyDetailField label="PAN" value={profile.pan} />
              <CompanyDetailField label="Contact" value={profile.contact} />
              <CompanyDetailField label="Email" value={profile.email} />
              <CompanyDetailField
                label="Industry type"
                value={profile.industryType}
              />
              <CompanyDetailField
                label="Employee number"
                value={profile.employeeNumber}
              />
              <CompanyDetailField
                label="Company website"
                value={profile.companyWebsite}
              />
              <CompanyDetailField label="Registered with VAT">
                {profile.registeredWithVat ? "Yes" : "No"}
              </CompanyDetailField>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight">Address</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CompanyDetailField label="Province" value={profile.province} />
              <CompanyDetailField label="District" value={profile.district} />
              <CompanyDetailField
                label="Full address"
                value={profile.fullAddress}
              />
            </dl>
          </div>
        </div>
      </section>

      <CompanyConfigurationFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSubmit={handleSave}
      />
    </div>
  )
}
