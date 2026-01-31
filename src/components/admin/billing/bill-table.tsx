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
import { CheckCircle, Printer, MoreHorizontal, Undo2, AlertCircle, Info } from "lucide-react"
import { markAsPaid, markAsUnpaid } from "@/lib/actions/billing"
import { toast } from "sonner"
import { BillStatus } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

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
        dueDate: string
        amount: number | string
        status: "PAID" | "UNPAID" | "OVERDUE"
    }[]
}

export function BillTable({ data }: BillTableProps) {
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'pay' | 'unpay' | null;
        billId: string | null;
    }>({
        isOpen: false,
        type: null,
        billId: null
    });

    const [isLoading, setIsLoading] = useState(false);

    async function handleConfirmAction() {
        if (!confirmDialog.billId || !confirmDialog.type) return;

        setIsLoading(true);
        try {
            let result;
            if (confirmDialog.type === 'pay') {
                result = await markAsPaid(confirmDialog.billId);
            } else {
                result = await markAsUnpaid(confirmDialog.billId);
            }

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat memproses permintaan");
        } finally {
            setIsLoading(false);
            setConfirmDialog({ isOpen: false, type: null, billId: null });
        }
    }

    const openPayDialog = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            type: 'pay',
            billId: id
        });
    }

    const openUnpayDialog = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            type: 'unpay',
            billId: id
        });
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
                        <TableHead className="w-[200px] text-xs font-bold uppercase tracking-wider text-muted-foreground">NO. INVOICE</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">NAMA PELANGGAN</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">JUMLAH</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">STATUS</TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">AKSI</TableHead>
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
                                <TableCell className="font-medium text-muted-foreground text-xs">
                                    INV/{bill.reading.year}/{bill.reading.month}/{bill.id.substring(0, 3).toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold text-gray-900">{bill.customer.name}</div>
                                    <div className="text-xs font-bold text-muted-foreground">{bill.customer.meterNumber}</div>
                                </TableCell>
                                <TableCell className="font-bold text-gray-900">
                                    {formatCurrency(Number(bill.amount))}
                                </TableCell>
                                <TableCell>
                                    {bill.status === BillStatus.PAID ? (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 uppercase text-[10px] font-bold px-2 py-0.5">LUNAS</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 uppercase text-[10px] font-bold px-2 py-0.5">BELUM BAYAR</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                                            onClick={() => window.open(`/admin/billing/print/${bill.id}`, '_blank')}
                                            title="Cetak Struk"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {bill.status === BillStatus.UNPAID && (
                                                    <DropdownMenuItem onClick={() => openPayDialog(bill.id)} className="text-green-600 cursor-pointer">
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Tandai Lunas
                                                    </DropdownMenuItem>
                                                )}
                                                {bill.status === BillStatus.PAID && (
                                                    <DropdownMenuItem onClick={() => openUnpayDialog(bill.id)} className="text-red-600 cursor-pointer">
                                                        <Undo2 className="mr-2 h-4 w-4" />
                                                        Batal Bayar
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
                <AlertDialogContent className="bg-white border-blue-100 shadow-xl sm:max-w-[425px] rounded-xl">
                    <AlertDialogHeader className="flex flex-col items-center">
                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
                            confirmDialog.type === 'pay' ? 'bg-blue-50' : 'bg-orange-50'
                        }`}>
                            {confirmDialog.type === 'pay' ? (
                                <CheckCircle className="h-8 w-8 text-blue-600" />
                            ) : (
                                <AlertCircle className="h-8 w-8 text-orange-600" />
                            )}
                        </div>
                        <AlertDialogTitle className="text-center text-xl font-bold text-gray-900">
                            {confirmDialog.type === 'pay' ? 'Konfirmasi Pembayaran' : 'Batalkan Pembayaran'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-gray-500 max-w-[85%]">
                            {confirmDialog.type === 'pay' 
                                ? 'Apakah Anda yakin ingin menandai tagihan ini sebagai LUNAS? Tindakan ini akan mencatat pembayaran secara sistem.' 
                                : 'Apakah Anda yakin ingin membatalkan status lunas tagihan ini? Status akan kembali menjadi BELUM BAYAR.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 mt-6 w-full sm:space-x-0">
                        <AlertDialogCancel disabled={isLoading} className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg">
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmAction();
                            }} 
                            disabled={isLoading}
                            className={`flex-1 rounded-lg text-white font-semibold transition-all
                                ${confirmDialog.type === 'pay' 
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300' 
                                    : 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 hover:shadow-orange-300'
                                }
                            `}
                        >
                            {isLoading ? 'Memproses...' : (confirmDialog.type === 'pay' ? 'Ya, Tandai Lunas' : 'Ya, Batalkan')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
