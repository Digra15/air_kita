import { getBillById } from "@/lib/actions/billing"
import PrintButton from "@/components/admin/billing/print-button"
import { notFound } from "next/navigation"
import { format } from "date-fns"

interface PrintPageProps {
    params: {
        id: string
    }
}

export default async function PrintPage({ params }: PrintPageProps) {
    const bill = await getBillById(params.id)

    if (!bill) {
        notFound()
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="min-h-screen bg-white p-8 text-black">
            <div className="mx-auto max-w-[80mm] space-y-4 print:max-w-none">
                {/* Header */}
                <div className="text-center border-b pb-4 border-black">
                    <h1 className="text-xl font-bold uppercase">Air Kita</h1>
                    <p className="text-xs">Jalan Air Bersih No. 123</p>
                    <p className="text-xs">Telp: 0812-3456-7890</p>
                    <h2 className="mt-2 font-bold border-t border-black pt-2">BUKTI PEMBAYARAN AIR</h2>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>No. Transaksi</span>
                        <span className="font-mono">{bill.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal Cetak</span>
                        <span>{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="border-b border-dashed border-black my-2"></div>
                    
                    <div className="grid grid-cols-3 gap-1">
                        <span className="col-span-1">Pelanggan</span>
                        <span className="col-span-2 font-bold">: {bill.customer.name}</span>
                        
                        <span className="col-span-1">ID Pel.</span>
                        <span className="col-span-2">: {bill.customer.meterNumber}</span>
                        
                        <span className="col-span-1">Alamat</span>
                        <span className="col-span-2 truncate">: {bill.customer.address}</span>
                        
                        <span className="col-span-1">Golongan</span>
                        <span className="col-span-2">: {bill.customer.tariff.name}</span>
                    </div>

                    <div className="border-b border-dashed border-black my-2"></div>

                    <div className="grid grid-cols-2 gap-1">
                        <span>Periode Tagihan</span>
                        <span className="text-right">{bill.reading.month} / {bill.reading.year}</span>
                        
                        <span>Stand Meter</span>
                        <span className="text-right">{Number(bill.reading.usageAmount)} m3</span>
                        
                        <span>Tarif / m3</span>
                        <span className="text-right">{formatCurrency(Number(bill.customer.tariff.ratePerCubic))}</span>
                        
                        <span>Biaya Beban</span>
                        <span className="text-right">{formatCurrency(Number(bill.customer.tariff.baseFee))}</span>
                    </div>
                </div>

                {/* Totals */}
                <div className="border-t border-black pt-2 mt-4">
                    <div className="flex justify-between text-sm font-bold">
                        <span>TOTAL TAGIHAN</span>
                        <span>{formatCurrency(Number(bill.amount))}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>Status</span>
                        <span className="uppercase">{bill.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] mt-8 pt-4 border-t border-dashed border-black">
                    <p>Terima kasih atas pembayaran Anda</p>
                    <p>Simpan struk ini sebagai bukti pembayaran yang sah</p>
                </div>

                {/* Print Button - Hidden when printing */}
                <div className="mt-8 text-center print:hidden">
                    <PrintButton />
                </div>
            </div>
        </div>
    )
}
