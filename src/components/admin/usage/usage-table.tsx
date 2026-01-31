'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, User } from "lucide-react"
import { deleteReading } from "@/lib/actions/usage"
import { toast } from "sonner"
import { useState } from "react"
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

interface UsageTableProps {
  data: {
    id: string
    customerId: string
    customerName: string
    meterNumber: string
    currentReading: number
    usageAmount: number
    initialReading: number
    recordedAt: Date
  }[]
}

export function UsageTable({ data }: UsageTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteId) return
    
    setIsDeleting(true)
    const result = await deleteReading(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-transparent border-b border-slate-100">
            <TableHead className="w-[250px] py-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-6">PELANGGAN</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">AWAL (M³)</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">AKHIR (M³)</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">PEMAKAIAN (M³)</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">STATUS</TableHead>
            <TableHead className="text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-6">AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                Belum ada data pencatatan untuk periode ini.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">{item.customerName}</div>
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.meterNumber}</div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="font-medium text-slate-600">{item.initialReading.toLocaleString('id-ID')}</TableCell>
                <TableCell className="font-medium text-slate-600">{item.currentReading.toLocaleString('id-ID')}</TableCell>
                <TableCell>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-md px-2 py-1 font-bold">
                        {item.usageAmount.toLocaleString('id-ID')} m³
                    </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" variant="outline">
                    VERIFIED
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => setDeleteId(item.id)}>
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
            <AlertDialogTitle>Hapus Data Pencatatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data pencatatan dan tagihan terkait secara permanen. Apakah Anda yakin ingin melanjutkan?
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
              {isDeleting ? "Menghapus..." : "Hapus Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}