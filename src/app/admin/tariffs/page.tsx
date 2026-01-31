import { getTariffs } from "@/lib/actions/tariff"
import { TariffTable } from "@/components/admin/tariffs/tariff-table"
import { AddTariffDialog } from "@/components/admin/tariffs/add-tariff-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TariffsPage() {
  const rawTariffs = await getTariffs()
  const tariffs = rawTariffs.map(t => ({
      ...t,
      ratePerCubic: Number(t.ratePerCubic),
      baseFee: Number(t.baseFee)
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Tarif & Golongan</h1>
        <AddTariffDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Golongan Tarif</CardTitle>
        </CardHeader>
        <CardContent>
          <TariffTable data={tariffs} />
        </CardContent>
      </Card>
    </div>
  )
}
