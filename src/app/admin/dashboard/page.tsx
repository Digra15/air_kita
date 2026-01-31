import { getDashboardStats } from "@/lib/actions/analytics"
import { Overview } from "@/components/admin/dashboard/overview"
import { RecentSales } from "@/components/admin/dashboard/recent-sales"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Droplets, Users, Activity } from "lucide-react"

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
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pendapatan
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total pendapatan dari tagihan lunas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pelanggan
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.customerCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Pelanggan aktif saat ini
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Konsumsi Air
                        </CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsage} m3</div>
                        <p className="text-xs text-muted-foreground">
                            Total pemakaian air tercatat
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Status Sistem
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Aktif</div>
                        <p className="text-xs text-muted-foreground">
                            Server berjalan normal
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview Pendapatan</CardTitle>
                        <CardDescription>
                            Grafik pendapatan per bulan (6 bulan terakhir).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={stats.graphData} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Transaksi Terakhir</CardTitle>
                        <CardDescription>
                            Pembayaran tagihan terbaru.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentSales data={stats.recentSales} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
