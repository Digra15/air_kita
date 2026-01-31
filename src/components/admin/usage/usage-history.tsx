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
    }[]
}

export function UsageHistory({ data }: UsageHistoryProps) {
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
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
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
