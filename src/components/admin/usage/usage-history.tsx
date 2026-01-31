'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { deleteReading } from "@/lib/actions/usage"
import { toast } from "sonner"

interface UsageHistoryProps {
    data: {
        id: string
        recordedAt: string | Date
        customer: {
            name: string
            meterNumber: string
        }
        month: number
        year: number
        meterReading: number | string
        usageAmount: number | string
        bill?: {
            status: string
        } | null
    }[]
}

export function UsageHistory({ data }: UsageHistoryProps) {
    async function handleDelete(id: string) {
        if (confirm("Apakah Anda yakin ingin menghapus riwayat ini? Tagihan yang belum dibayar juga akan dihapus.")) {
            const result = await deleteReading(id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Meteran</TableHead>
                        <TableHead>Pakai</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Belum ada riwayat pencatatan.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((reading) => (
                            <TableRow key={reading.id}>
                                <TableCell>
                                    {format(new Date(reading.recordedAt), "dd MMM yyyy", { locale: localeId })}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{reading.customer.name}</div>
                                    <div className="text-xs text-muted-foreground">{reading.customer.meterNumber}</div>
                                </TableCell>
                                <TableCell>{reading.month}/{reading.year}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{Number(reading.meterReading)}</div>
                                </TableCell>
                                <TableCell className="font-bold">
                                    {Number(reading.usageAmount)} m3
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(reading.id)}
                                        disabled={reading.bill?.status === 'PAID'}
                                        title={reading.bill?.status === 'PAID' ? "Sudah dibayar, tidak bisa dihapus" : "Hapus Riwayat"}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
