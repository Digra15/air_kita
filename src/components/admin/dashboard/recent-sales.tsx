import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentSalesProps {
    data: {
        id: string
        amount: number | string
        customer: {
            name: string
            meterNumber: string
        }
    }[]
}

export function RecentSales({ data }: RecentSalesProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="space-y-8">
            {data.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground">Belum ada transaksi.</p>
            ) : (
                data.map((sale, index) => (
                    <div 
                        key={sale.id} 
                        className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                    >
                        <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-xs">
                                {sale.customer.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-bold text-slate-800 leading-none">{sale.customer.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {sale.customer.meterNumber}
                            </p>
                        </div>
                        <div className="ml-auto font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs border border-emerald-100">
                            +{formatCurrency(Number(sale.amount))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
