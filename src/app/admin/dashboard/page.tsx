import { getDashboardStats } from "@/lib/actions/analytics"
import { Overview } from "@/components/admin/dashboard/overview"
import { UsageOverview } from "@/components/admin/dashboard/usage-overview"
import { RecentSales } from "@/components/admin/dashboard/recent-sales"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Droplets, Users, Activity, Sparkles, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function DashboardPage() {
    const rawStats = await getDashboardStats()
    const stats = {
        ...rawStats,
        recentSales: rawStats.recentSales.map(sale => ({
            ...sale,
            amount: Number(sale.amount)
        }))
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('id-ID').format(value)
    }

    return (
        <div className="flex-1 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Eksekutif</h2>
                    <p className="text-slate-500 mt-1">Pantau metrik performa realtime Air Kita.</p>
                </div>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-full px-6">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Tanya AI
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue Card */}
                <Card className="border-none shadow-sm group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-white shadow-sm border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-1">
                                +12.5% <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PENDAPATAN</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</h3>
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Water Usage Card */}
                <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                <Droplets className="h-6 w-6" />
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-white shadow-sm border border-blue-100 text-blue-600 text-xs font-bold flex items-center gap-1">
                                +5.2% <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PENGGUNAAN AIR</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{formatNumber(stats.totalUsage)} m³</h3>
                                <ArrowUpRight className="h-4 w-4 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Users Card */}
                <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-white to-violet-50/50 border-l-4 border-l-violet-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-white shadow-sm border border-violet-100 text-violet-600 text-xs font-bold flex items-center gap-1">
                                +3 <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PELANGGAN AKTIF</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{formatNumber(stats.customerCount)}</h3>
                                <ArrowUpRight className="h-4 w-4 text-violet-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Health Card (Placeholder for 4th card) */}
                <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-white to-orange-50/50 border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-white shadow-sm border border-orange-100 text-orange-600 text-xs font-bold flex items-center gap-1">
                                99.9% <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPTIME SISTEM</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">Stabil</h3>
                                <ArrowUpRight className="h-4 w-4 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Pendapatan Bulanan</CardTitle>
                            <CardDescription className="text-slate-500">
                                Tren pendapatan.
                            </CardDescription>
                        </div>
                        <Select defaultValue="6months">
                            <SelectTrigger className="w-[150px] h-8 bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                                <SelectItem value="year">Tahun Ini</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={stats.graphData} />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Grafik Pemakaian Air</CardTitle>
                            <CardDescription className="text-slate-500">
                                Tren pemakaian air (m³).
                            </CardDescription>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                            6 Bulan Terakhir
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <UsageOverview data={stats.usageGraphData} />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Section - Moved to bottom */}
            <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900">Transaksi Terakhir</CardTitle>
                    <CardDescription className="text-slate-500">
                        Pembayaran tagihan terbaru.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentSales data={stats.recentSales} />
                </CardContent>
            </Card>
        </div>
    )
}
