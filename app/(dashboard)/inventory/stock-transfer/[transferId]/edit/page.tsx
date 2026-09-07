import { EditStockTransferPage } from "@/components/stock-transfer/edit-stock-transfer-page"

export default async function EditStockTransferRoute({
  params,
}: {
  params: Promise<{ transferId: string }>
}) {
  const { transferId } = await params

  return <EditStockTransferPage transferId={transferId} />
}
