"use client"

import * as React from "react"
import { PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Group } from "@/types/group"

type RoleSelectProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  roles: Group[]
  disabled?: boolean
  placeholder?: string
  active?: boolean
  className?: string
  "aria-invalid"?: boolean
  onCreateNew?: () => void
}

export function RoleSelect({
  value,
  onChange,
  onBlur,
  roles,
  disabled,
  placeholder = "Select role…",
  active = true,
  className,
  "aria-invalid": ariaInvalid,
  onCreateNew,
}: RoleSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    if (!active) {
      setOpen(false)
      setQuery("")
    }
  }, [active])

  const selectedRole = roles.find((role) => role.id === value)
  const filteredRoles = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return roles
    return roles.filter((role) => role.name.toLowerCase().includes(needle))
  }, [query, roles])

  function handleOpenChange(next: boolean, eventDetails?: { reason?: string }) {
    if (!next && eventDetails?.reason === "trigger-press") {
      return
    }

    setOpen(next)
    if (!next) {
      setQuery("")
      onBlur?.()
    }
  }

  function selectRole(roleId: string) {
    onChange(roleId)
    setQuery("")
    setOpen(false)
    onBlur?.()
  }

  function handleCreateNew() {
    setOpen(false)
    setQuery("")
    onCreateNew?.()
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          asChild
          disabled={disabled}
        >
          <Input
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-invalid={ariaInvalid}
            disabled={disabled}
            autoComplete="off"
            placeholder={open ? "Search roles…" : placeholder}
            className="cursor-pointer pr-9"
            value={open ? query : (selectedRole?.name ?? "")}
            onChange={(event) => {
              setQuery(event.target.value)
              if (!open) setOpen(true)
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-64">
              <CommandEmpty>No role found.</CommandEmpty>
              <CommandGroup>
                {filteredRoles.map((role) => (
                  <CommandItem
                    key={role.id}
                    value={role.name}
                    data-checked={value === role.id ? "true" : undefined}
                    onSelect={() => selectRole(role.id)}
                  >
                    <span className="truncate">{role.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {onCreateNew ? (
            <div className="border-t p-1">
              <Button
                type="button"
                variant="ghost"
                color="neutral"
                size="32"
                className="h-8 w-full justify-start font-normal"
                onClick={handleCreateNew}
              >
                <PlusIcon />
                Create New
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      <SearchIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground opacity-50" />
    </div>
  )
}
