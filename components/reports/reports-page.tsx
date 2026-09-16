"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { Input } from "@/components/ui/input"
import { Tabs, type TabItem } from "@/components/ui/tabs"
import {
  reportCatalog,
  type ReportCategory,
  type ReportLink,
} from "@/lib/reports/catalog"
import { cn } from "@/lib/utils"

export function ReportsPage() {
  const [query, setQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")

  const needle = query.trim().toLowerCase()

  const filteredCatalog = React.useMemo(() => {
    if (!needle) return reportCatalog

    return reportCatalog
      .map((category) => ({
        ...category,
        reports: category.reports.filter(
          (report) =>
            report.title.toLowerCase().includes(needle) ||
            category.title.toLowerCase().includes(needle)
        ),
      }))
      .filter((category) => category.reports.length > 0)
  }, [needle])

  const activeCategory =
    categoryFilter === "all" ||
    filteredCatalog.some((category) => category.id === categoryFilter)
      ? categoryFilter
      : "all"

  const categories = React.useMemo(() => {
    if (activeCategory === "all") return filteredCatalog
    return filteredCatalog.filter((category) => category.id === activeCategory)
  }, [activeCategory, filteredCatalog])

  const total = reportCatalog.reduce(
    (sum, category) => sum + category.reports.length,
    0
  )

  const tabItems = React.useMemo<TabItem[]>(() => {
    const items: TabItem[] = [
      {
        value: "all",
        label: "All",
        count: filteredCatalog.reduce(
          (sum, category) => sum + category.reports.length,
          0
        ),
      },
    ]

    for (const category of reportCatalog) {
      const match = filteredCatalog.find((item) => item.id === category.id)
      items.push({
        value: category.id,
        label: category.title,
        count: match?.reports.length ?? 0,
        disabled: !match,
      })
    }

    return items
  }, [filteredCatalog])

  const singleCategory = activeCategory !== "all" && categories.length === 1

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Reports"
        count={`${total} reports`}
        actions={
          <div className="relative w-full sm:w-60">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 pl-9 text-xs"
            />
          </div>
        }
      />

      <Tabs
        items={tabItems}
        value={activeCategory}
        onValueChange={(value) => {
          if (typeof value === "string") setCategoryFilter(value)
        }}
      />

      {categories.length === 0 ? (
        <div className="rounded-xl bg-card px-4 py-12 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No reports match &ldquo;{query}&rdquo;.
        </div>
      ) : singleCategory ? (
        <CategoryPanel category={categories[0]!} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: ReportCategory }) {
  const Icon = category.icon

  return (
    <section className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <h2 className="truncate text-sm font-semibold tracking-tight">
          {category.title}
        </h2>
        <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {category.reports.length}
        </span>
      </div>
      <ul className="flex flex-col px-1.5 py-1.5">
        {category.reports.map((report) => (
          <li key={report.title}>
            <ReportLinkItem report={report} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function CategoryPanel({ category }: { category: ReportCategory }) {
  const Icon = category.icon

  return (
    <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
        <h2 className="truncate text-sm font-semibold tracking-tight">
          {category.title}
        </h2>
        <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
          {category.reports.length}
        </span>
      </div>
      <ul className="grid gap-x-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-1.5 py-1.5">
        {category.reports.map((report) => (
          <li key={report.title}>
            <ReportLinkItem report={report} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ReportLinkItem({ report }: { report: ReportLink }) {
  if (report.href) {
    return (
      <Link
        href={report.href}
        className="block rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
      >
        {report.title}
      </Link>
    )
  }

  return (
    <span
      className={cn(
        "block cursor-default rounded-md px-2 py-1.5 text-sm text-muted-foreground/45"
      )}
      title="Coming soon"
    >
      {report.title}
    </span>
  )
}
