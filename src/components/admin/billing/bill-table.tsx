'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CheckCircle, Printer } from "lucide-react"
import { markAsPaid } from "@/lib/actions/billing"
import { toast } from "sonner"
import { BillStatus } from "@prisma/client"

interface BillTableProps {
    data: {
        id: string
        customer: {
            name: string
            meterNumber: string
        }
        reading: {
            month: number
            year: number
            usageAmount: number | string
        }
        dueDate: string | Date
        amount: number | string
        status: "PAID" | "UNPAID" | "OVERDUE"
    }[]
}

export function BillTable({ data }: BillTableProps) {
    
    async function handleMarkPaid(id: string) {
        if(confirm('Tandai tagihan ini sebagai LUNAS?')) {
            const result = await markAsPaid(id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Periode</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead>Pemakaian</TableHead>
                        <TableHead>Total Tagihan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Belum ada data tagihan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((bill) => (
                            <TableRow key={bill.id}>
                                <TableCell>
                                    {bill.reading.month}/{bill.reading.year}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{bill.customer.name}</div>
                                    <div className="text-xs text-muted-foreground">{bill.customer.meterNumber}</div>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(bill.dueDate), "dd MMM yyyy", { locale: localeId })}
                                </TableCell>
                                <TableCell>
                                    {Number(bill.reading.usageAmount)} m3
                                </TableCell>
                                <TableCell className="font-bold">
                                    {formatCurrency(Number(bill.amount))}
                                </TableCell>
                                <TableCell>
                                    {bill.status === BillStatus.PAID ? (
                                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">LUNAS</Badge>
                                    ) : (
                                        <Badge variant="destructive">BELUM BAYAR</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {bill.status === BillStatus.UNPAID && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleMarkPaid(bill.id)}
                                                title="Tandai Lunas"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" /> Bayar
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={() => window.open(`/admin/billing/print/${bill.id}`, '_blank')}
                                            title="Cetak Struk"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
