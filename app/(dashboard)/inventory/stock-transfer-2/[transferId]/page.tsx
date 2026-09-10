import { StockTransferDetailPage } from "@/components/stock-transfer-2/stock-transfer-detail-page"

export default async function StockTransferDetailRoute({
  params,
}: {
  params: Promise<{ transferId: string }>
}) {
  const { transferId } = await params

  return <StockTransferDetailPage transferId={transferId} />
}
