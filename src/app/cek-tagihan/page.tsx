'use client'

import { useState } from "react"
import { checkBillByMeterNumber } from "@/lib/actions/public-billing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Search, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

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
    name: string
    meterNumber: string
    address: string
}

export default function CheckBillPage() {
    const [meterNumber, setMeterNumber] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{
        customer: Customer
        bills: Bill[]
    } | null>(null)

    async function handleCheck(e: React.FormEvent) {
        e.preventDefault()
        if (!meterNumber) return

        setIsLoading(true)
        setResult(null)

        const response = await checkBillByMeterNumber(meterNumber)
        
        if (response.success && response.customer) {
            setResult({
                customer: response.customer,
                bills: (response.bills || []).map((bill: any) => ({
                    ...bill,
                    amount: Number(bill.amount),
                    reading: {
                        ...bill.reading,
                        usageAmount: Number(bill.reading.usageAmount)
                    }
                }))
            })
        } else {
            toast.error(response.message)
        }
        
        setIsLoading(false)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-blue-600">Air Kita</CardTitle>
                    <CardDescription>Cek Tagihan Rekening Air Secara Online</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleCheck} className="flex gap-2">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="meterNumber" className="sr-only">ID Pelanggan</Label>
                            <Input 
                                id="meterNumber" 
                                placeholder="Masukkan ID Pelanggan / No. Meter" 
                                value={meterNumber}
                                onChange={(e) => setMeterNumber(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Cek</span>
                        </Button>
                    </form>

                    {result && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                                <h3 className="font-semibold text-blue-900 mb-2">Data Pelanggan</h3>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="text-blue-700">Nama</span>
                                    <span className="col-span-2 font-medium">: {result.customer.name}</span>
                                    <span className="text-blue-700">ID</span>
                                    <span className="col-span-2 font-medium">: {result.customer.meterNumber}</span>
                                    <span className="text-blue-700">Alamat</span>
                                    <span className="col-span-2 font-medium truncate">: {result.customer.address}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 flex items-center">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Tagihan Belum Dibayar
                                </h3>
                                {result.bills.length === 0 ? (
                                    <div className="text-center p-6 border rounded-lg bg-green-50 text-green-700">
                                        <p className="font-medium">Terima Kasih</p>
                                        <p className="text-sm">Tidak ada tagihan tertunggak.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {result.bills.map((bill) => (
                                            <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                                <div>
                                                    <p className="font-medium">Periode: {bill.reading.month}/{bill.reading.year}</p>
                                                    <p className="text-xs text-muted-foreground">Pemakaian: {Number(bill.reading.usageAmount)} m3</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-blue-600">{formatCurrency(Number(bill.amount))}</p>
                                                    <Badge variant="destructive" className="text-[10px]">Belum Lunas</Badge>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <div className="pt-4 border-t mt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-bold text-lg">Total Tagihan</span>
                                                <span className="font-bold text-xl text-blue-600">
                                                    {formatCurrency(result.bills.reduce((acc: number, b) => acc + Number(b.amount), 0))}
                                                </span>
                                            </div>
                                            <Button className="w-full" size="lg">
                                                Bayar Sekarang
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                    <p className="text-xs text-muted-foreground text-center">
                        &copy; 2026 Air Kita. All rights reserved.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
