import { getBills } from "@/lib/actions/billing"
import { getSystemSettings } from "@/lib/actions/settings"
import { BillingPageClient } from "@/components/admin/billing/billing-page-client"

export default async function BillingPage() {
    const [rawBills, systemSettings] = await Promise.all([
        getBills(),
        getSystemSettings()
    ])
    
    // Transform Decimal to number and Date to string for client component
    const bills = rawBills.map(bill => ({
        ...bill,
        amount: Number(bill.amount),
        reading: {
            ...bill.reading,
            usageAmount: Number(bill.reading.usageAmount),
            meterReading: Number(bill.reading.meterReading)
        },
        dueDate: bill.dueDate.toISOString(),
        paidAt: bill.paidAt ? bill.paidAt.toISOString() : null,
        createdAt: bill.createdAt.toISOString(),
        updatedAt: bill.updatedAt.toISOString(),
    }))

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tagihan & Pembayaran</h1>
            <BillingPageClient 
                bills={bills} 
                companyName={systemSettings?.companyName || "Air Kita"}
                companyAddress={systemSettings?.companyAddress || "Alamat Perusahaan"}
            />
        </div>
    )
}
