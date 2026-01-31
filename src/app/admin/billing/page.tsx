import { getBills } from "@/lib/actions/billing"
import { BillTable } from "@/components/admin/billing/bill-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function BillingPage() {
    const rawBills = await getBills()
    const bills = rawBills.map(bill => ({
        ...bill,
        amount: Number(bill.amount),
        reading: {
            ...bill.reading,
            usageAmount: Number(bill.reading.usageAmount)
        }
    }))

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tagihan & Pembayaran</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Tagihan Pelanggan</CardTitle>
                </CardHeader>
                <CardContent>
                    <BillTable data={bills} />
                </CardContent>
            </Card>
        </div>
    )
}
