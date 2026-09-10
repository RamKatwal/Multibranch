"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { reportCatalog } from "@/lib/reports/catalog"
import { cn } from "@/lib/utils"

export function ReportsPage() {
  const [query, setQuery] = React.useState("")

  const needle = query.trim().toLowerCase()

  const categories = React.useMemo(() => {
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

  const total = reportCatalog.reduce(
    (sum, category) => sum + category.reports.length,
    0
  )

  return (
    <div className="flex flex-col gap-4">
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

      {categories.length === 0 ? (
        <div className="rounded-xl bg-card px-4 py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No reports match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon

            return (
              <Card key={category.id} size="sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col">
                    {category.reports.map((report) => (
                      <li key={report.title}>
                        {report.href ? (
                          <Link
                            href={report.href}
                            className="block rounded-md py-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
                          >
                            {report.title}
                          </Link>
                        ) : (
                          <span
                            className={cn(
                              "block cursor-default py-1.5 text-xs text-muted-foreground/50"
                            )}
                            title="Coming soon"
                          >
                            {report.title}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
