'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Trash } from "lucide-react"
import { EditTariffDialog } from "./edit-tariff-dialog"
import { deleteTariff } from "@/lib/actions/tariff"
import { toast } from "sonner"

interface TariffTableProps {
  data: {
    id: string
    name: string
    description?: string | null
    ratePerCubic: number | string
    baseFee: number | string
    _count: { customers: number }
  }[]
}

export function TariffTable({ data }: TariffTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  async function confirmDelete() {
    if (!deleteId) return
    
    setIsDeleting(true)
    const result = await deleteTariff(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  // Helper to format currency
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
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px] text-xs font-bold text-slate-400 uppercase tracking-wider">NAMA GOLONGAN</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">TARIF / M3</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">BIAYA BEBAN</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">JUMLAH PELANGGAN</TableHead>
            <TableHead className="text-right text-xs font-bold text-slate-400 uppercase tracking-wider">AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Belum ada data tarif.
              </TableCell>
            </TableRow>
          ) : (
            data.map((tariff) => (
              <TableRow key={tariff.id}>
                <TableCell className="font-medium">
                    <div>{tariff.name}</div>
                    <div className="text-xs text-muted-foreground">{tariff.description}</div>
                </TableCell>
                <TableCell>{formatCurrency(Number(tariff.ratePerCubic))}</TableCell>
                <TableCell>{formatCurrency(Number(tariff.baseFee))}</TableCell>
                <TableCell>{tariff._count.customers} Pelanggan</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                      <EditTariffDialog tariff={tariff} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => setDeleteId(tariff.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Golongan Tarif?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data tarif secara permanen. Apakah Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-lg">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-lg text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus Tarif"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
