import { StockTransferDetailPage } from "@/components/stock-transfer/stock-transfer-detail-page"

export default async function StockTransferDetailRoute({
  params,
}: {
  params: Promise<{ transferId: string }>
}) {
  const { transferId } = await params

  return <StockTransferDetailPage transferId={transferId} />
}
