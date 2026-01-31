import { getReadings, getUsageStats, getCustomersForSelect } from "@/lib/actions/usage"
import { getSystemSettings } from "@/lib/data/settings"
import { UsageTable } from "@/components/admin/usage/usage-table"
import { UsageFilter } from "@/components/admin/usage/usage-filter"
import { ManualInputDialog } from "@/components/admin/usage/manual-input-dialog"
import { ExportButton } from "@/components/admin/usage/export-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UsagePageProps {
  searchParams: Promise<{
    q?: string
    month?: string
    year?: string
  }>
}

export default async function UsagePage({ searchParams }: UsagePageProps) {
  const params = await searchParams
  const query = params.q || ""
  const currentDate = new Date()
  const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear()

  // Fetch data in parallel
  const [readings, stats, rawCustomers, settings] = await Promise.all([
    getReadings(month, year, query),
    getUsageStats(month, year),
    getCustomersForSelect(),
    getSystemSettings()
  ])

  const companyName = settings?.companyName || "Air Kita"
  const companyAddress = settings?.companyAddress || "Jl. Contoh No. 123"

  const customers = rawCustomers.map(c => ({
    ...c,
    tariff: {
      ...c.tariff,
      ratePerCubic: Number(c.tariff.ratePerCubic),
      baseFee: Number(c.tariff.baseFee)
    }
  }))

  const monthName = new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Pemakaian Air</h1>
          <p className="text-slate-500 mt-1">Monitor konsumsi air real-time dan riwayat pencatatan meter.</p>
        </div>
        <ExportButton 
          data={readings} 
          monthName={monthName} 
          year={year} 
          companyName={companyName}
          companyAddress={companyAddress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-3 space-y-6">
          <UsageFilter />
          <UsageTable data={readings} />
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-1 space-y-6">
          {/* Progress Card */}
          <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="font-bold text-slate-900">Progress Catat Meter</div>
              </div>

              <div className="mb-2 flex justify-between items-end">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  PERIODE {monthName} <br /> {year}
                </div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {stats.percentage}% COMPLETE
                </div>
              </div>

              <Progress value={stats.percentage} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />

              <div className="mt-6 flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{stats.recordedCount.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">METER TERCATAT</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-400">{stats.remaining.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">TERSISA</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Input Card */}
          <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-blue-600 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-2">Input Manual</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Gunakan fitur ini jika aplikasi petugas lapangan bermasalah atau untuk koreksi manual.
              </p>
              <ManualInputDialog customers={customers} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
