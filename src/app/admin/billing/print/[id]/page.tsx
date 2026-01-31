import { getBillById } from "@/lib/actions/billing"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Receipt, Droplets } from "lucide-react"
import { getSystemSettings } from "@/lib/data/settings"
import PrintButton from "@/components/admin/billing/print-button"
import CloseButton from "@/components/admin/billing/close-button"

interface PrintPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function PrintPage({ params }: PrintPageProps) {
    const { id } = await params
    const [bill, settings] = await Promise.all([
        getBillById(id),
        getSystemSettings()
    ])

    if (!bill) {
        notFound()
    }

    const companyName = settings?.companyName || "AQUAFLOW ENTERPRISE"
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    const usage = Number(bill.reading.usageAmount)
    const rate = Number(bill.customer.tariff.ratePerCubic)
    const baseFee = Number(bill.customer.tariff.baseFee)
    const usageCost = usage * rate
    
    // Invoice Number Format: INV/YYYY/MM/ID-Last3
    const invoiceNo = `INV/${bill.reading.year}/${bill.reading.month}/${bill.id.slice(-3).toUpperCase()}`

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 print:bg-white print:p-0">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:rounded-none">
                {/* Card Content */}
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">STRUK TAGIHAN AIR</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{companyName}</p>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-slate-200"></div>

                    {/* Meta Data */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">NO. INVOICE</span>
                            <span className="font-bold text-slate-700 font-mono">{invoiceNo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">TANGGAL</span>
                            <span className="font-bold text-slate-700">{format(new Date(), "d/M/yyyy")}</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <p className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">PELANGGAN:</p>
                        <p className="text-lg font-bold text-slate-900">{bill.customer.name}</p>
                        <p className="text-sm font-bold text-slate-400">{bill.customer.meterNumber}</p>
                    </div>

                    {/* Calculation Box */}
                    <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Pemakaian Air</span>
                            <span className="font-bold text-slate-900">{usage} m³</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Biaya Beban</span>
                            <span className="font-bold text-slate-900">{formatCurrency(baseFee)}</span>
                        </div>
                        
                        <div className="border-t border-slate-200 pt-3 mt-1">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-600 font-bold">TOTAL</span>
                                <span className="text-xl font-bold text-blue-600">{formatCurrency(Number(bill.amount))}</span>
                            </div>
                        </div>

                        {/* Calculation Detail */}
                        <div className="pt-2 mt-1">
                             <p className="text-[10px] text-slate-400 text-center italic">
                                ({usage} m³ x {formatCurrency(rate)}) + {formatCurrency(baseFee)} = {formatCurrency(Number(bill.amount))}
                            </p>
                        </div>
                    </div>

                    {/* Footer Message */}
                    <p className="text-center text-xs text-slate-400 italic leading-relaxed px-4">
                        "Terima kasih telah melakukan pembayaran tepat waktu demi kelancaran distribusi air bersih."
                    </p>
                </div>

                {/* Actions Footer */}
                <div className="bg-slate-50 p-6 flex gap-4 print:hidden">
                    <CloseButton />
                    <PrintButton />
                </div>
            </div>
        </div>
    )
}
