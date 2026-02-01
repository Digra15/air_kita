'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CreditCard, Droplets, History, Search, User, FileText, CheckCircle2, RefreshCcw, Building, Phone, Mail, MapPin, Globe, TrendingUp, TrendingDown, BarChart3, BookOpen, LayoutDashboard, Receipt } from "lucide-react"
import { UsageChart } from "@/components/customer/usage-chart"
import { checkBill } from "@/lib/actions/public-billing"
import { updateProfile, changePassword } from "@/lib/actions/customer-portal"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UsageReport } from "@/components/admin/reports/usage-report"
import { IncomeReport } from "@/components/admin/reports/income-report"
import { ExpenseReport } from "@/components/admin/reports/expense-report"
import { StatisticsView } from "@/components/admin/reports/statistics-view"
import { AccountingView } from "@/components/admin/reports/accounting-view"

interface Bill {
    id: string
    amount: number | string
    status: string
    reading?: {
        month: number
        year: number
        meterReading: number | string
        usageAmount: number | string
    }
    createdAt: Date
}

interface CustomerData {
    name: string
    tariff: {
        name: string
        ratePerCubic: number | string
    }
    bills: Bill[]
    readings: {
        usage: number
        month: string
    }[]
}

interface CompanySettings {
    companyName: string
    companyEmail: string
    companyPhone: string
    companyAddress: string
    companyWebsite: string
    heroTitle: string
    heroDescription: string
}

interface DashboardData {
    user: {
        name?: string | null
        email?: string | null
    }
    customer: CustomerData | null
    unpaidBills: Bill[]
    totalUnpaid: number
    readings: {
        month: string
        usage: number
    }[]
    company: CompanySettings | null
    reportsData: {
        transactions: any[]
        usageData: any[]
    }
}

interface SearchResult {
    customer: {
        id: string
        name: string
        meterNumber: string
        address: string
    }
    bills: {
        id: string
        amount: number | string
        reading: {
            month: number
            year: number
            usageAmount: number | string
        }
    }[]
}

export function CustomerDashboardClient({ data }: { data: DashboardData }) {
    const { user, customer, unpaidBills, totalUnpaid, readings, company, reportsData } = data
    const [activeTab, setActiveTab] = useState("overview")

    // Bill Check State
    const [query, setQuery] = useState("")
    const [isChecking, setIsChecking] = useState(false)
    const [checkResult, setCheckResult] = useState<SearchResult | null>(null)

    // Profile State
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    const handleCheckBill = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query) return

        setIsChecking(true)
        setCheckResult(null)

        try {
            const response = await checkBill(query)
            if (response.success && response.results && response.results.length > 0) {
                setCheckResult(response.results[0] as SearchResult)
            } else {
                toast.error("Data tidak ditemukan")
            }
        } catch (error) {
            toast.error("Gagal mengecek tagihan")
        } finally {
            setIsChecking(false)
        }
    }

    const handleUpdateProfile = async (formData: FormData) => {
        setIsUpdatingProfile(true)
        const result = await updateProfile(formData)
        setIsUpdatingProfile(false)
        
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.error)
        }
    }

    const handleChangePassword = async (formData: FormData) => {
        setIsChangingPassword(true)
        const result = await changePassword(formData)
        setIsChangingPassword(false)
        
        if (result.success) {
            toast.success(result.message)
            // Reset form manually or handled by uncontrolled form
            const form = document.getElementById("password-form") as HTMLFormElement
            if (form) form.reset()
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Halo, {user?.name || 'Pengguna'}</h1>
                    <p className="text-muted-foreground">Selamat datang di dashboard pelanggan {company?.companyName || "Air Kita"}.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-0 mb-6">
                    <TabsTrigger 
                        value="overview" 
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white flex items-center gap-2"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Ringkasan
                    </TabsTrigger>
                    <TabsTrigger 
                        value="bills" 
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white flex items-center gap-2"
                    >
                        <Receipt className="h-4 w-4" />
                        Cek Tagihan
                    </TabsTrigger>
                    <TabsTrigger 
                        value="reports" 
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white flex items-center gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Laporan
                    </TabsTrigger>
                    <TabsTrigger 
                        value="profile" 
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white flex items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        Profil Saya
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {!customer ? (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-blue-700">Status Akun: Belum Terhubung</CardTitle>
                                    <CardDescription className="text-blue-600/80 mt-1">
                                        Akun Anda saat ini belum terhubung dengan ID Pelanggan. 
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="text-blue-700">
                                <p className="mb-4">
                                    Silakan hubungi admin untuk menautkan akun email Anda <strong>({user?.email})</strong> dengan ID Pelanggan Anda agar dapat melihat tagihan dan riwayat pemakaian secara otomatis di sini.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700" onClick={() => setActiveTab("bills")}>
                                        <Search className="mr-2 h-4 w-4" />
                                        Cek Tagihan Manual
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card className="shadow-lg shadow-blue-500/5 border-blue-100/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                                    <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-bold text-slate-700">Tagihan Belum Dibayar</CardTitle>
                                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-extrabold text-slate-900 mt-2">{formatCurrency(totalUnpaid)}</div>
                                        <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {unpaidBills.length} tagihan aktif
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg shadow-blue-500/5 border-blue-100/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-bold text-slate-700">Pemakaian Bulan Ini</CardTitle>
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <Droplets className="h-4 w-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-extrabold text-slate-900 mt-2">
                                            {readings.length > 0 ? readings[readings.length - 1].usage : 0} <span className="text-lg font-medium text-slate-500">m³</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 mt-1">
                                            Update terakhir: {readings.length > 0 ? readings[readings.length - 1].month : '-'}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg shadow-blue-500/5 border-blue-100/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-bold text-slate-700">Golongan Tarif</CardTitle>
                                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                            <History className="h-4 w-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900 mt-2 truncate">{customer.tariff.name}</div>
                                        <p className="text-xs font-medium text-emerald-600 mt-1">
                                            {formatCurrency(Number(customer.tariff.ratePerCubic))} / m³
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-full lg:col-span-4 shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-slate-800">Riwayat Pemakaian Air</CardTitle>
                                        <CardDescription>Grafik konsumsi air bulanan Anda dalam 6 bulan terakhir.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <UsageChart data={readings} />
                                    </CardContent>
                                </Card>
                                
                                <Card className="col-span-full lg:col-span-3 shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-slate-800">Tagihan Terbaru</CardTitle>
                                        <CardDescription>Status pembayaran tagihan terakhir Anda.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {unpaidBills.slice(0, 3).map((bill, i) => (
                                                <div key={bill.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-blue-600 shadow-sm">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">
                                                                {bill.reading ? `${new Date(0, bill.reading.month - 1).toLocaleString('id-ID', { month: 'long' })} ${bill.reading.year}` : 'Tagihan Air'}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {bill.reading ? `${bill.reading.usageAmount} m³` : '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-red-600">{formatCurrency(Number(bill.amount))}</p>
                                                        <p className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full inline-block mt-1">BELUM LUNAS</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {unpaidBills.length === 0 && (
                                                 <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                                                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3 opacity-20" />
                                                    <p className="text-sm">Tidak ada tagihan tertunggak.</p>
                                                    <p className="text-xs text-slate-400">Terima kasih telah membayar tepat waktu!</p>
                                                 </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* BILL CHECK TAB */}
                <TabsContent value="bills" className="space-y-4">
                    <Card className="shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-blue-600" />
                                Cek Tagihan
                            </CardTitle>
                            <CardDescription>
                                Cari tagihan berdasarkan Nama atau Nomor Meteran. Fitur ini dapat digunakan untuk mengecek tagihan siapa saja.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 p-6">
                            <form onSubmit={handleCheckBill} className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1 max-w-lg">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        placeholder="Masukkan Nama atau Nomor Meter..." 
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    />
                                </div>
                                <Button type="submit" disabled={isChecking} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    {isChecking ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Cek Tagihan
                                </Button>
                            </form>

                            {checkResult && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-0 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4">
                                    <div className="bg-slate-50/80 p-6 border-b border-slate-100">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-900">{checkResult.customer.name}</h3>
                                                <div className="flex items-center text-slate-500 mt-2 text-sm">
                                                    <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                                                    ID Pelanggan: <span className="font-mono ml-1 text-slate-700">{checkResult.customer.meterNumber}</span>
                                                </div>
                                                <div className="flex items-center text-slate-500 mt-1 text-sm">
                                                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                                    {checkResult.customer.address}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-slate-500" />
                                            Daftar Tagihan Belum Lunas
                                        </h4>
                                        {checkResult.bills.length > 0 ? (
                                            <div className="grid gap-4">
                                                {checkResult.bills.map((bill) => (
                                                    <div key={bill.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                                                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                <Droplets className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-lg text-slate-900">
                                                                    {new Date(0, bill.reading.month - 1).toLocaleString('id-ID', { month: 'long' })} {bill.reading.year}
                                                                </div>
                                                                <div className="text-sm text-slate-500 font-medium">
                                                                    Pemakaian: {bill.reading.usageAmount} m³
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right w-full sm:w-auto pl-[4rem] sm:pl-0">
                                                            <div className="font-extrabold text-xl text-blue-600">
                                                                {formatCurrency(Number(bill.amount))}
                                                            </div>
                                                            <Badge variant="outline" className="mt-1 text-red-600 border-red-200 bg-red-50">
                                                                BELUM LUNAS
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-12 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-center">
                                                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-emerald-800">Tagihan Lunas!</h3>
                                                <p className="text-emerald-600 mt-1">Tidak ada tagihan tertunggak untuk pelanggan ini.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REPORTS TAB */}
                <TabsContent value="reports" className="space-y-6">
                    <Card className="shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Building className="h-5 w-5" />
                                </div>
                                Laporan & Transparansi
                            </CardTitle>
                            <CardDescription className="ml-11">
                                Akses data laporan perusahaan, keuangan, statistik, dan akuntansi secara transparan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                             <Tabs defaultValue="income" className="w-full">
                                <TabsList className="w-full justify-start h-auto flex-wrap gap-3 bg-transparent p-0 mb-8">
                                    <TabsTrigger value="income" className="gap-2 px-4 py-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                        <TrendingUp className="h-4 w-4" />
                                        Pemasukan
                                    </TabsTrigger>
                                    <TabsTrigger value="expense" className="gap-2 px-4 py-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                        <TrendingDown className="h-4 w-4" />
                                        Pengeluaran
                                    </TabsTrigger>
                                    <TabsTrigger value="usage" className="gap-2 px-4 py-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                        <Droplets className="h-4 w-4" />
                                        Pemakaian
                                    </TabsTrigger>
                                    <TabsTrigger value="stats" className="gap-2 px-4 py-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                        <BarChart3 className="h-4 w-4" />
                                        Statistik
                                    </TabsTrigger>
                                    <TabsTrigger value="accounting" className="gap-2 px-4 py-2 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                                        <BookOpen className="h-4 w-4" />
                                        Akuntansi
                                    </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="income" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <IncomeReport data={reportsData.transactions} />
                                </TabsContent>
                                <TabsContent value="expense" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <ExpenseReport data={reportsData.transactions} />
                                </TabsContent>
                                <TabsContent value="usage" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <UsageReport data={reportsData.usageData} />
                                </TabsContent>
                                <TabsContent value="stats" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <StatisticsView data={reportsData.transactions} />
                                </TabsContent>
                                <TabsContent value="accounting" className="mt-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <AccountingView 
                                        data={reportsData.transactions} 
                                        companyName={company?.companyName || "Air Kita"}
                                        companyAddress={company?.companyAddress || ""}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {!customer ? (
                        <Card className="bg-slate-50 border-dashed border-2 border-slate-200 shadow-none rounded-2xl">
                             <CardHeader>
                                 <CardTitle className="flex items-center gap-2 text-slate-500">
                                     <History className="h-5 w-5" />
                                     Riwayat Pribadi
                                 </CardTitle>
                             </CardHeader>
                             <CardContent className="text-center py-8 text-slate-500">
                                 <p className="mb-2 font-medium">Riwayat tagihan dan pemakaian air hanya tersedia untuk akun yang terhubung.</p>
                                 <p className="text-sm">Silakan hubungi admin untuk menautkan akun Anda.</p>
                             </CardContent>
                         </Card>
                    ) : (
                        <div className="grid gap-4">
                             <Card className="shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <History className="h-5 w-5" />
                                        </div>
                                        Riwayat Tagihan & Pembayaran Saya
                                    </CardTitle>
                                    <CardDescription className="ml-11">
                                        Daftar tagihan bulanan dan status pembayaran Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="font-bold text-slate-700">Periode</TableHead>
                                                <TableHead className="hidden md:table-cell font-bold text-slate-700">Meter Awal</TableHead>
                                                <TableHead className="hidden md:table-cell font-bold text-slate-700">Meter Akhir</TableHead>
                                                <TableHead className="font-bold text-slate-700">Pemakaian</TableHead>
                                                <TableHead className="font-bold text-slate-700">Jumlah Tagihan</TableHead>
                                                <TableHead className="font-bold text-slate-700">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customer.bills.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                                        Belum ada data tagihan.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                customer.bills.map((bill) => (
                                                    <TableRow key={bill.id} className="hover:bg-blue-50/50 transition-colors">
                                                        <TableCell className="font-medium text-slate-900">
                                                            {bill.reading ? `${new Date(0, bill.reading.month - 1).toLocaleString('id-ID', { month: 'long' })} ${bill.reading.year}` : '-'}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-slate-600">{bill.reading ? (Number(bill.reading.meterReading) - Number(bill.reading.usageAmount)) : '-'}</TableCell>
                                                        <TableCell className="hidden md:table-cell text-slate-600">{bill.reading ? bill.reading.meterReading : '-'}</TableCell>
                                                        <TableCell className="font-medium text-blue-600">{bill.reading ? bill.reading.usageAmount : '-'} m³</TableCell>
                                                        <TableCell className="font-bold text-slate-900">{formatCurrency(Number(bill.amount))}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={bill.status === 'PAID' ? 'default' : 'outline'} className={bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' : 'text-red-600 border-red-200 bg-red-50'}>
                                                                {bill.status === 'PAID' ? 'LUNAS' : 'BELUM BAYAR'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    Informasi Akun
                                </CardTitle>
                                <CardDescription className="ml-11">
                                    Perbarui nama dan email akun Anda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form action={handleUpdateProfile} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-slate-700">Nama Lengkap</Label>
                                        <Input id="name" name="name" defaultValue={user?.name || ""} placeholder="Nama Lengkap" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-700">Email</Label>
                                        <Input id="email" name="email" defaultValue={user?.email || ""} placeholder="Email" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                                    </div>
                                    <Button type="submit" disabled={isUpdatingProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl mt-2">
                                        {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg shadow-slate-200/50 border-slate-100 rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    Ganti Password
                                </CardTitle>
                                <CardDescription className="ml-11">
                                    Amankan akun Anda dengan password yang kuat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form id="password-form" action={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword" className="text-slate-700">Password Saat Ini</Label>
                                        <Input id="currentPassword" name="currentPassword" type="password" required className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-slate-700">Password Baru</Label>
                                        <Input id="newPassword" name="newPassword" type="password" required minLength={6} className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-slate-700">Konfirmasi Password</Label>
                                        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                                    </div>
                                    <Button type="submit" variant="outline" disabled={isChangingPassword} className="w-full border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl mt-2">
                                        {isChangingPassword ? "Memproses..." : "Ubah Password"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
