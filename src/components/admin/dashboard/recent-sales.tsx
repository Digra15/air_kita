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
                data.map((sale) => (
                    <div key={sale.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{sale.customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {sale.customer.meterNumber}
                            </p>
                        </div>
                        <div className="ml-auto font-medium">
                            +{formatCurrency(Number(sale.amount))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
