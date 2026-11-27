"use client"

import { PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BASE_MODULES } from "@/lib/mock/account-billing"
import type { AdditionalModule } from "@/lib/onboarding/plans"
import { cn } from "@/lib/utils"

type SubscribedModulesCardProps = {
  modules: AdditionalModule[]
  canAddModule: boolean
  onAddModule: () => void
  className?: string
}

export function SubscribedModulesCard({
  modules,
  canAddModule,
  onAddModule,
  className,
}: SubscribedModulesCardProps) {
  return (
    <Card size="sm" className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle>Subscribed modules</CardTitle>
        <CardDescription>
          These modules are available in all your companies.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-wrap content-start gap-1.5">
        {BASE_MODULES.map((name) => (
          <Badge key={name} size="20" variant="soft" color="neutral">
            {name}
          </Badge>
        ))}
        {modules.map((item) => (
          <Badge key={item.id} size="20" variant="soft" color="info">
            {item.name}
          </Badge>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          size="32"
          variant="outline"
          color="neutral"
          disabled={!canAddModule}
          onClick={onAddModule}
        >
          <PlusIcon />
          Add module
        </Button>
      </CardFooter>
    </Card>
  )
}
