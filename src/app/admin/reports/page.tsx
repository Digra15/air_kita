import { db } from "@/lib/db"
import { ReportsPageClient } from "@/components/admin/reports/reports-page-client"
import { format } from "date-fns"
import { getSystemSettings } from "@/lib/actions/settings"

async function getTransactions() {
  const transactions = await db.transaction.findMany({
    orderBy: {
      date: 'desc'
    }
  })
  
  return transactions.map(t => ({
    ...t,
    amount: t.amount.toNumber(),
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))
}

async function getUsageData() {
  const readings = await db.meterReading.findMany({
    include: {
      customer: {
        select: {
          name: true,
          meterNumber: true,
          address: true
        }
      }
    },
    orderBy: {
      year: 'desc'
    }
  })
  
  // Secondary sort by month desc (since we can't easily do multi-field sort with mixed direction in simple prisma syntax if we want specific complex ordering, but here standard multi-field sort is fine: year desc, month desc)
  // Actually Prisma supports: orderBy: [{ year: 'desc' }, { month: 'desc' }]
  // Let's refine the query in a moment if needed, but JS sort is fine for small datasets. 
  // For now let's trust Prisma's ability if we pass array. 
  // But wait, the previous code block didn't use array. I'll just sort in JS to be safe or update query.
  
  return readings.map(r => ({
    ...r,
    meterReading: r.meterReading.toNumber(),
    usageAmount: r.usageAmount.toNumber(),
    recordedAt: r.recordedAt.toISOString()
  })).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })
}

export default async function ReportsPage() {
  const [transactions, usageData, settings] = await Promise.all([
    getTransactions(),
    getUsageData(),
    getSystemSettings()
  ])

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan & Analytics</h2>
          <p className="text-muted-foreground">
            Statistik mendalam tentang performa perusahaan dan audit akuntansi.
          </p>
        </div>
      </div>

      <ReportsPageClient 
        transactions={transactions} 
        usageData={usageData}
        companyName={settings?.companyName || "Air Kita"}
        companyAddress={settings?.companyAddress || "Alamat Perusahaan"}
      />
    </div>
  )
}
