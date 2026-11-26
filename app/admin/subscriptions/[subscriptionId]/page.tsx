import { SubscriptionDetailPage } from "@/components/admin/subscriptions/subscription-detail-page"

export default async function AdminSubscriptionDetailRoute({
  params,
}: {
  params: Promise<{ subscriptionId: string }>
}) {
  const { subscriptionId } = await params

  return <SubscriptionDetailPage subscriptionId={subscriptionId} />
}
