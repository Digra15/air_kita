'use client'

import { useState } from "react"
import { BillTable } from "@/components/admin/billing/bill-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BillStatus, PaymentMethod } from "@prisma/client"
import { 
    Search, 
    Wallet, 
    QrCode, 
    CreditCard, 
    Banknote, 
    CheckCircle, 
    AlertCircle, 
    DollarSign,
    FileText,
    Download,
    Plus,
    Printer,
    Clock,
    Send,
    MoreHorizontal,
    AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { markAsPaid } from "@/lib/actions/billing"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BillingPageClientProps {
    bills: {
        id: string
        customer: {
            name: string
            meterNumber: string
        }
        reading: {
            month: number
            year: number
            usageAmount: number | string
            meterReading: number | string
        }
        dueDate: string
        amount: number | string
        status: "PAID" | "UNPAID" | "OVERDUE"
        paidAt: string | null
        paymentMethod: PaymentMethod | null
    }[]
    companyName: string
    companyAddress: string
}

import { BillingExportButton } from "@/components/admin/billing/billing-export-button"

export function BillingPageClient({ bills, companyName, companyAddress }: BillingPageClientProps) {
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState("cash")
    const [historyFilter, setHistoryFilter] = useState("SEMUA")
    const [selectedMonth, setSelectedMonth] = useState<string>("all")
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

    // Stats Calculations
    const totalCollection = bills
        .filter(b => b.status === "PAID")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
    
    const totalArrears = bills
        .filter(b => (b.status === "UNPAID" && new Date(b.dueDate) < new Date()) || b.status === "OVERDUE")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
    
    const averageBill = bills.length > 0 
        ? bills.reduce((acc, curr) => acc + Number(curr.amount), 0) / bills.length 
        : 0

    const arrearsCount = bills.filter(b => (b.status === "UNPAID" && new Date(b.dueDate) < new Date()) || b.status === "OVERDUE").length

    // Filter logic
    const filteredBills = bills.filter(bill => {
        if (activeTab === "all") {
             const matchesSearch = searchTerm === "" || 
                 bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 bill.customer.meterNumber.includes(searchTerm)
             
             const matchesMonth = selectedMonth === "all" || 
                 bill.reading.month.toString() === selectedMonth

             const matchesYear = selectedYear === "all" || 
                 bill.reading.year.toString() === selectedYear

             return matchesSearch && matchesMonth && matchesYear
        }
        if (activeTab === "payment_process") return bill.status === BillStatus.UNPAID
        if (activeTab === "history") {
             const isPaid = bill.status === BillStatus.PAID
             if (!isPaid) return false
             if (historyFilter === "SEMUA") return true
             if (historyFilter === "TUNAI") return bill.paymentMethod === "CASH"
             if (historyFilter === "VA") return bill.paymentMethod === "TRANSFER"
             return bill.paymentMethod === historyFilter
        }
        if (activeTab === "arrears") {
             const isOverdue = new Date(bill.dueDate) < new Date() && bill.status === BillStatus.UNPAID
             return isOverdue || bill.status === BillStatus.OVERDUE
        }
        return true
    })

    const tabs = [
        { id: "all", label: "Daftar Tagihan", icon: FileText },
        { id: "payment_process", label: "Proses Pembayaran", icon: Wallet },
        { id: "history", label: "Riwayat Transaksi", icon: CheckCircle },
        { id: "arrears", label: "Laporan Tunggakan", icon: AlertCircle },
    ]

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    // Payment Process Logic
    const handleSearch = () => {
        // Implement search logic if needed, currently filtering in render
    }

    const handleConfirmPayment = async () => {
        if (!selectedBillId) {
            toast.error("Pilih tagihan terlebih dahulu")
            return
        }
        
        const result = await markAsPaid(selectedBillId, paymentMethod)
        if (result.success) {
            toast.success(result.message)
            setSelectedBillId(null)
            setSearchTerm("")
        } else {
            toast.error(result.message)
        }
    }

    // Filter bills for search in Payment Process
    const searchResults = bills.filter(bill => 
        bill.status === "UNPAID" && 
        (bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         bill.customer.meterNumber.includes(searchTerm))
    )

    const selectedBill = bills.find(b => b.id === selectedBillId)

    // Arrears Processing
    const arrears30 = bills
        .filter(b => b.status === "UNPAID" && (new Date().getTime() - new Date(b.dueDate).getTime()) < 30 * 24 * 60 * 60 * 1000)
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    const arrears60 = bills
        .filter(b => b.status === "UNPAID" && 
            (new Date().getTime() - new Date(b.dueDate).getTime()) >= 30 * 24 * 60 * 60 * 1000 &&
            (new Date().getTime() - new Date(b.dueDate).getTime()) < 90 * 24 * 60 * 60 * 1000
        )
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    const arrears90 = bills
        .filter(b => b.status === "UNPAID" && (new Date().getTime() - new Date(b.dueDate).getTime()) >= 90 * 24 * 60 * 60 * 1000)
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

    // Group arrears by customer for critical accounts table
    const criticalAccountsMap = new Map()
    bills.filter(b => (b.status === "UNPAID" && new Date(b.dueDate) < new Date()) || b.status === "OVERDUE")
         .forEach(bill => {
            if (!criticalAccountsMap.has(bill.customer.meterNumber)) {
                criticalAccountsMap.set(bill.customer.meterNumber, {
                    name: bill.customer.name,
                    meterNumber: bill.customer.meterNumber,
                    totalArrears: 0,
                    unpaidMonths: 0
                })
            }
            const data = criticalAccountsMap.get(bill.customer.meterNumber)
            data.totalArrears += Number(bill.amount)
            data.unpaidMonths += 1
         })
    
    const criticalAccounts = Array.from(criticalAccountsMap.values())
        .sort((a, b) => b.unpaidMonths - a.unpaidMonths) // Sort by most months unpaid

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Billing & Collections</h2>
                    <p className="text-sm text-muted-foreground">Kelola tagihan, proses pembayaran, dan monitor tunggakan pelanggan.</p>
                </div>
                <div className="flex gap-2">
                        <BillingExportButton 
                        data={filteredBills} 
                        companyName={companyName}
                        companyAddress={companyAddress}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                    />
                </div>
            </div>


            {/* Stats Cards - Only show on main dashboard or all tabs? 
                Keeping them visible as they provide context.
            */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-in zoom-in duration-500 delay-200">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Koleksi (Bulan Ini)</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(totalCollection)}</h3>
                            <p className="text-xs text-green-600 font-medium">82% Keberhasilan</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 animate-in zoom-in duration-500 delay-300">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Total Tunggakan</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(totalArrears)}</h3>
                            <p className="text-xs text-red-600 font-medium">{arrearsCount} Akun Kritis</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 animate-in zoom-in duration-500 delay-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Rata-rata Tagihan</p>
                            <h3 className="text-2xl font-bold">{formatCurrency(averageBill)}</h3>
                            <p className="text-xs text-blue-600 font-medium">+4.2% dari bulan lalu</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 border-b overflow-x-auto bg-white p-1 rounded-t-lg">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 whitespace-nowrap rounded-md",
                                activeTab === tab.id 
                                    ? "bg-blue-50 text-blue-600" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Tab Content */}
            {activeTab === "payment_process" ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Search & Results */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Search className="h-5 w-5 text-blue-500" />
                                    Cari Tagihan Pelanggan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="ID Pelanggan atau Nama..." 
                                        className="flex-1"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
                                        Cari
                                    </Button>
                                </div>
                                
                                {/* Search Results Preview */}
                                {searchTerm.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                                        <p className="text-xs text-muted-foreground mb-2">Hasil Pencarian:</p>
                                        {searchResults.length === 0 ? (
                                            <div className="text-sm text-center py-4 text-muted-foreground">
                                                Tidak ditemukan tagihan belum lunas.
                                            </div>
                                        ) : (
                                            searchResults.map(bill => (
                                                <div 
                                                    key={bill.id}
                                                    onClick={() => setSelectedBillId(bill.id)}
                                                    className={cn(
                                                        "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-blue-50",
                                                        selectedBillId === bill.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">{bill.customer.name}</p>
                                                            <p className="text-xs text-muted-foreground">ID: {bill.customer.meterNumber}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-blue-600">{formatCurrency(Number(bill.amount))}</p>
                                                            <p className="text-xs text-muted-foreground">{bill.reading.month}/{bill.reading.year}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Selected Bill Details Summary (Optional/Extra) */}
                        {selectedBill && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">Rincian Pembayaran</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pelanggan</span>
                                            <span className="font-medium">{selectedBill.customer.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Periode</span>
                                            <span className="font-medium">{selectedBill.reading.month}/{selectedBill.reading.year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pemakaian</span>
                                            <span className="font-medium">{selectedBill.reading.usageAmount} m3</span>
                                        </div>
                                        <div className="border-t border-blue-200 my-2 pt-2 flex justify-between text-base">
                                            <span className="font-semibold text-blue-900">Total</span>
                                            <span className="font-bold text-blue-900">{formatCurrency(Number(selectedBill.amount))}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Payment Methods */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-blue-500" />
                                    Metode Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div 
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50",
                                            paymentMethod === "cash" ? "border-blue-500 bg-blue-50/50" : "border-gray-100"
                                        )}
                                        onClick={() => setPaymentMethod("cash")}
                                    >
                                        <div className="mb-2">
                                            <Banknote className={cn("h-6 w-6", paymentMethod === "cash" ? "text-blue-600" : "text-gray-500")} />
                                        </div>
                                        <div className="font-semibold text-sm">CASH</div>
                                        <div className="text-xs text-muted-foreground">Tunai / Loket</div>
                                    </div>

                                    <div 
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50",
                                            paymentMethod === "qris" ? "border-blue-500 bg-blue-50/50" : "border-gray-100"
                                        )}
                                        onClick={() => setPaymentMethod("qris")}
                                    >
                                        <div className="mb-2">
                                            <QrCode className={cn("h-6 w-6", paymentMethod === "qris" ? "text-blue-600" : "text-gray-500")} />
                                        </div>
                                        <div className="font-semibold text-sm">QRIS</div>
                                        <div className="text-xs text-muted-foreground">Scan & Pay</div>
                                    </div>

                                    <div 
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50",
                                            paymentMethod === "transfer" ? "border-blue-500 bg-blue-50/50" : "border-gray-100"
                                        )}
                                        onClick={() => setPaymentMethod("transfer")}
                                    >
                                        <div className="mb-2">
                                            <Wallet className={cn("h-6 w-6", paymentMethod === "transfer" ? "text-blue-600" : "text-gray-500")} />
                                        </div>
                                        <div className="font-semibold text-sm">TRANSFER</div>
                                        <div className="text-xs text-muted-foreground">VA Bank BCA</div>
                                    </div>

                                    <div 
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50",
                                            paymentMethod === "edc" ? "border-blue-500 bg-blue-50/50" : "border-gray-100"
                                        )}
                                        onClick={() => setPaymentMethod("edc")}
                                    >
                                        <div className="mb-2">
                                            <CreditCard className={cn("h-6 w-6", paymentMethod === "edc" ? "text-blue-600" : "text-gray-500")} />
                                        </div>
                                        <div className="font-semibold text-sm">EDC</div>
                                        <div className="text-xs text-muted-foreground">Debit / Kredit</div>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full h-12 text-lg bg-emerald-500 hover:bg-emerald-600"
                                    disabled={!selectedBillId}
                                    onClick={handleConfirmPayment}
                                >
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Konfirmasi Pembayaran
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : activeTab === "history" ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Jurnal Penerimaan Kas (Loket)</CardTitle>
                        <div className="flex space-x-2">
                            {["SEMUA", "TUNAI", "QRIS", "VA"].map((filter) => (
                                <Button
                                    key={filter}
                                    variant={historyFilter === filter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setHistoryFilter(filter)}
                                    className={cn(
                                        historyFilter === filter && "bg-blue-600 hover:bg-blue-700"
                                    )}
                                >
                                    {filter}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">WAKTU TRANSAKSI</TableHead>
                                    <TableHead>NO. REFF / INVOICE</TableHead>
                                    <TableHead>PELANGGAN</TableHead>
                                    <TableHead>METODE</TableHead>
                                    <TableHead className="text-right">JUMLAH</TableHead>
                                    <TableHead className="w-[80px]">STRUK</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBills.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Tidak ada riwayat transaksi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBills.map((bill) => (
                                        <TableRow key={bill.id}>
                                            <TableCell className="font-medium text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {bill.paidAt ? format(new Date(bill.paidAt), "HH:mm") : "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                                                    INV/{bill.reading.year}/{bill.reading.month}/{bill.id.substring(0, 6).toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-semibold">{bill.customer.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                    {bill.paymentMethod === "CASH" ? "Tunai" : 
                                                     bill.paymentMethod === "TRANSFER" ? "VA BCA" : 
                                                     bill.paymentMethod || "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(Number(bill.amount))}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : activeTab === "arrears" ? (
                <div className="space-y-6">
                    {/* Arrears Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="bg-yellow-50/50 border-yellow-100">
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-yellow-600 uppercase mb-1">TUNGGAKAN 30 HARI</p>
                                <h3 className="text-2xl font-bold text-yellow-700">{formatCurrency(arrears30)}</h3>
                                <p className="text-xs text-yellow-600/80 mt-1">Estimasi Aktif</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-orange-50/50 border-orange-100">
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-orange-600 uppercase mb-1">TUNGGAKAN 60 HARI</p>
                                <h3 className="text-2xl font-bold text-orange-700">{formatCurrency(arrears60)}</h3>
                                <p className="text-xs text-orange-600/80 mt-1">Perlu Perhatian</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50/50 border-red-100">
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-red-600 uppercase mb-1">TUNGGAKAN 90+ HARI</p>
                                <h3 className="text-2xl font-bold text-red-700">{formatCurrency(arrears90)}</h3>
                                <p className="text-xs text-red-600/80 mt-1">Kritis</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-50/50 border-blue-100">
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">POTENSI PENDAPATAN</p>
                                <h3 className="text-2xl font-bold text-blue-700">{formatCurrency(totalArrears)}</h3>
                                <p className="text-xs text-blue-600/80 mt-1">TUNGGAKAN TOTAL</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Critical Accounts Table */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Akun Tunggakan Kritis</CardTitle>
                                    <CardDescription>Segera lakukan penagihan atau pemutusan sementara.</CardDescription>
                                </div>
                            </div>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800">
                                <Send className="mr-2 h-4 w-4" />
                                Kirim Reminder Batch
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PELANGGAN</TableHead>
                                        <TableHead>NO. METER</TableHead>
                                        <TableHead>LAMA TUNGGAKAN</TableHead>
                                        <TableHead className="text-right">TOTAL TAGIHAN</TableHead>
                                        <TableHead className="text-right">AKSI</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {criticalAccounts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                Tidak ada akun dengan tunggakan kritis.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        criticalAccounts.map((account: any) => (
                                            <TableRow key={account.meterNumber}>
                                                <TableCell className="font-semibold">{account.name}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{account.meterNumber}</TableCell>
                                                <TableCell>
                                                    <Badge variant={account.unpaidMonths >= 3 ? "destructive" : "secondary"} className={cn(
                                                        account.unpaidMonths >= 3 ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                                    )}>
                                                        {account.unpaidMonths} Bulan
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatCurrency(account.totalArrears)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <Button variant="outline" size="sm" className="h-8">
                                                            KIRIM WA
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari Nama Pelanggan atau ID Meter..." 
                                    className="pl-10 h-10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Bulan</SelectItem>
                                    <SelectItem value="1">Januari</SelectItem>
                                    <SelectItem value="2">Februari</SelectItem>
                                    <SelectItem value="3">Maret</SelectItem>
                                    <SelectItem value="4">April</SelectItem>
                                    <SelectItem value="5">Mei</SelectItem>
                                    <SelectItem value="6">Juni</SelectItem>
                                    <SelectItem value="7">Juli</SelectItem>
                                    <SelectItem value="8">Agustus</SelectItem>
                                    <SelectItem value="9">September</SelectItem>
                                    <SelectItem value="10">Oktober</SelectItem>
                                    <SelectItem value="11">November</SelectItem>
                                    <SelectItem value="12">Desember</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Pilih Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1).map(year => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <BillTable data={filteredBills} />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
