'use client'

import { useState } from "react"
import { checkBill } from "@/lib/actions/public-billing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Search, CreditCard, Droplets, User, MapPin, Calendar, ArrowLeft, Receipt, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface BillReading {
    month: number
    year: number
    usageAmount: number | string
}

interface Bill {
    id: string
    amount: number | string
    reading: BillReading
}

interface Customer {
    id: string
    name: string
    meterNumber: string
    address: string
}

interface SearchResult {
    customer: Customer
    bills: Bill[]
}

export default function CheckBillPage() {
    const [query, setQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<SearchResult | null>(null)

    async function handleCheck(e: React.FormEvent) {
        e.preventDefault()
        if (!query) return

        setIsLoading(true)
        setResults([])
        setSelectedCustomer(null)

        const response = await checkBill(query)
        
        if (response.success && response.results) {
            const data = response.results as SearchResult[]
            if (data.length === 1) {
                setSelectedCustomer(data[0])
            } else {
                setResults(data)
            }
        } else {
            toast.error(response.message)
        }
        
        setIsLoading(false)
    }

    const handleSelectCustomer = (customerData: SearchResult) => {
        setSelectedCustomer(customerData)
        setResults([]) // Clear list to show detail
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    const getMonthName = (month: number) => {
        const date = new Date();
        date.setMonth(month - 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 mb-6 hover:scale-105 transition-transform">
                        <Droplets className="h-8 w-8 text-white" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cek Tagihan Air</h1>
                    <p className="mt-3 text-lg text-slate-600 max-w-md mx-auto">
                        Masukkan Nama atau Nomor Meter Anda untuk melihat tagihan terkini.
                    </p>
                </div>

                <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white ring-1 ring-slate-100">
                    <CardHeader className="bg-white border-b border-slate-100 pb-8 pt-8">
                        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input 
                                    id="query" 
                                    placeholder="Contoh: Budi Santoso atau 100001" 
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-10 h-12 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <Button type="submit" disabled={isLoading} size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-medium shadow-md shadow-blue-600/10">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cek Tagihan"}
                            </Button>
                        </form>
                    </CardHeader>

                    {/* Customer Selection List */}
                    {results.length > 0 && !selectedCustomer && (
                        <CardContent className="pt-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 px-1">
                                Pilih Pelanggan ({results.length} ditemukan)
                            </h3>
                            <div className="space-y-3">
                                {results.map((item) => (
                                    <div 
                                        key={item.customer.id} 
                                        onClick={() => handleSelectCustomer(item)}
                                        className="cursor-pointer group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-3 rounded-full text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-base group-hover:text-blue-700">{item.customer.name}</p>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="font-mono bg-slate-100 px-1.5 rounded text-xs">{item.customer.meterNumber}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.customer.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    )}

                    {/* Bill Detail View */}
                    {selectedCustomer && (
                        <CardContent className="pt-8 pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Back button if coming from selection */}
                            {results.length > 1 && (
                                <button 
                                    onClick={() => setSelectedCustomer(null)}
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4"
                                >
                                    &larr; Pilih pelanggan lain
                                </button>
                            )}
                            
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Data Pelanggan
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-blue-600/80 font-medium mb-1 block">Nama Pelanggan</label>
                                        <p className="font-semibold text-slate-900 text-lg">{selectedCustomer.customer.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-blue-600/80 font-medium mb-1 block">Nomor Meter</label>
                                        <p className="font-mono font-medium text-slate-700 bg-white/50 inline-block px-2 py-0.5 rounded border border-blue-100">
                                            {selectedCustomer.customer.meterNumber}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-blue-600/80 font-medium mb-1 block flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Alamat
                                        </label>
                                        <p className="text-slate-700 leading-relaxed">{selectedCustomer.customer.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 px-1">
                                    <Receipt className="h-4 w-4 text-slate-500" /> Daftar Tagihan
                                </h3>
                                
                                {selectedCustomer.bills.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedCustomer.bills.map((bill) => (
                                            <div key={bill.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Calendar className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-lg">
                                                            {getMonthName(bill.reading.month)} {bill.reading.year}
                                                        </p>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            Pemakaian: <span className="font-medium text-slate-700">{Number(bill.reading.usageAmount)} m³</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                                    <div className="text-lg font-bold text-blue-600 mb-1">
                                                        {formatCurrency(Number(bill.amount))}
                                                    </div>
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                                                        Belum Lunas
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                            <CreditCard className="h-6 w-6 text-green-600" />
                                        </div>
                                        <p className="text-slate-900 font-medium">Tidak ada tagihan tertunggak</p>
                                        <p className="text-sm text-slate-500 mt-1">Terima kasih sudah membayar tepat waktu</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    )}
                </Card>

                <div className="text-center">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>
        </div>
    )
}
