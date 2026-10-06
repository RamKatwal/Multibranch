"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"

import {
  type DataTableRowSize,
  DataTableCard,
  useDataTable,
  useDataTableFullscreen,
} from "@/components/data-table/data-table"
import { PageHeader } from "@/components/layout/page-header"
import { groupColumns } from "@/components/settings/group-management/group-columns"
import { Button } from "@/components/ui/button"
import {
  readCustomGroups,
  readGroupConfiguration,
} from "@/lib/groups/storage"
import { mockGroups } from "@/lib/mock/groups"

export function GroupManagementPage() {
  const router = useRouter()
  const [groups, setGroups] = React.useState(mockGroups)
  const [rowSize, setRowSize] = React.useState<DataTableRowSize>("md")
  const { isFullscreen, toggleFullscreen } = useDataTableFullscreen()

  React.useEffect(() => {
    const savedGroups = [...mockGroups, ...readCustomGroups()].map((group) => {
      const configuration = readGroupConfiguration(group)
      return {
        id: configuration.id,
        name: configuration.name,
        description: configuration.description,
      }
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGroups(savedGroups)
  }, [])

  const table = useDataTable({
    data: groups,
    columns: groupColumns,
    pageSize: 10,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = filterValue.toLowerCase()
      const item = row.original

      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="User Roles"
        count={`${groups.length} roles`}
        actions={
          <Button
            size="32"
            asChild
          >
            <Link href="/configurations/users/group-management/new">
              <PlusIcon />
              New Role
            </Link>
          </Button>
        }
      />

      <DataTableCard
        table={table}
        columnCount={groupColumns.length}
        searchPlaceholder="Search roles..."
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        emptyMessage="No roles found."
        onRowClick={(group) =>
          router.push(`/configurations/users/group-management/${group.id}`)
        }
      />
    </div>
  )
}
