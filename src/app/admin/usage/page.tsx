import { getCustomersForSelect, getRecentReadings } from "@/lib/actions/usage"
import { UsageForm } from "@/components/admin/usage/usage-form"
import { UsageHistory } from "@/components/admin/usage/usage-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UsagePage() {
    const rawCustomers = await getCustomersForSelect()
    const customers = rawCustomers.map(c => ({
        ...c,
        tariff: {
            ...c.tariff,
            ratePerCubic: Number(c.tariff.ratePerCubic),
            baseFee: Number(c.tariff.baseFee)
        }
    }))

    const rawReadings = await getRecentReadings()
    const recentReadings = rawReadings.map(r => ({
        ...r,
        meterReading: Number(r.meterReading),
        usageAmount: Number(r.usageAmount)
    }))

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Pencatatan Pemakaian Air</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <UsageForm customers={customers} />
                </div>
                
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Input Terakhir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UsageHistory data={recentReadings} />
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    )
}
