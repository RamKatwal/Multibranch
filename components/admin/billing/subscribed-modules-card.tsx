"use client"

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
    <Card className={className}>
      <CardHeader>
        <CardTitle>Subscribed Modules</CardTitle>
        <CardDescription>
          These modules are available in all your companies.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-wrap content-start gap-2">
        {BASE_MODULES.map((name) => (
          <Badge key={name} size="24" variant="soft" color="neutral">
            {name}
          </Badge>
        ))}
        {modules.map((item) => (
          <Badge key={item.id} size="24" variant="soft" color="info">
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
          Add module
        </Button>
      </CardFooter>
    </Card>
  )
}
