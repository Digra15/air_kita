import { getCustomerDashboardData } from "@/lib/actions/customer-portal"
import { UsageChart } from "@/components/customer/usage-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CreditCard, Droplets, History } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default async function CustomerDashboard() {
    const data = await getCustomerDashboardData()

    if (!data) {
        return (
            <div className="p-8">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <CardTitle>Akun tidak terhubung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        Akun Anda belum terhubung dengan data pelanggan. Silakan hubungi admin.
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { customer, unpaidBills, totalUnpaid, readings } = data

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Halo, {customer.name}</h1>
                <p className="text-muted-foreground">Selamat datang di dashboard pelanggan Air Kita.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tagihan Belum Dibayar</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</div>
                        <p className="text-xs text-muted-foreground">
                            {unpaidBills.length} tagihan aktif
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pemakaian Bulan Ini</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {readings.length > 0 ? readings[readings.length - 1].usage : 0} m3
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Berdasarkan pencatatan terakhir
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Golongan Tarif</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.tariff.name}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(Number(customer.tariff.ratePerCubic))} / m3
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Usage Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Riwayat Pemakaian Air</CardTitle>
                        <CardDescription>Grafik konsumsi air bulanan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <UsageChart data={readings} />
                    </CardContent>
                </Card>

                {/* Recent Bills */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Tagihan Terakhir</CardTitle>
                        <CardDescription>
                            Daftar tagihan terbaru Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {customer.bills.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">Belum ada tagihan.</p>
                            ) : (
                                customer.bills.slice(0, 5).map((bill) => (
                                    <div key={bill.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {bill.reading.month}/{bill.reading.year}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Jatuh Tempo: {format(new Date(bill.dueDate), "dd MMM yyyy", { locale: localeId })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">{formatCurrency(Number(bill.amount))}</div>
                                            {bill.status === 'PAID' ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-[10px] h-5">Lunas</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="text-[10px] h-5">Belum Bayar</Badge>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {unpaidBills.length > 0 && (
                            <div className="mt-6">
                                <Button className="w-full">
                                    Bayar Tagihan ({formatCurrency(totalUnpaid)})
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
