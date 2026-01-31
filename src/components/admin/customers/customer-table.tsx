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
import { Badge } from "@/components/ui/badge"
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
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { EditCustomerDialog } from "./edit-customer-dialog"
import { deleteCustomer } from "@/lib/actions/customer"
import { toast } from "sonner"

interface CustomerTableProps {
  data: {
    id: string
    meterNumber: string
    name: string
    address: string
    tariff?: { id: string; name: string; ratePerCubic: number | any; baseFee: number | any } | null
    status: "ACTIVE" | "INACTIVE"
    phoneNumber?: string | null
    tariffId?: string | null
  }[]
  tariffs?: { id: string; name: string }[]
}

export function CustomerTable({ data, tariffs = [] }: CustomerTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  async function confirmDelete() {
    if (!deleteId) return
    
    setIsDeleting(true)
    const result = await deleteCustomer(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">NAMA PELANGGAN</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">ALAMAT</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">NO. METER</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">GOLONGAN</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">STATUS</TableHead>
            <TableHead className="text-right text-xs font-bold text-slate-400 uppercase tracking-wider print:hidden">AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                Belum ada data pelanggan.
              </TableCell>
            </TableRow>
          ) : (
            data.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-slate-50/50">
                <TableCell>
                    <span className="font-bold text-slate-900">{customer.name}</span>
                </TableCell>
                <TableCell>
                    <span className="text-xs text-slate-500">{customer.address}</span>
                </TableCell>
                <TableCell className="font-medium text-slate-600">{customer.meterNumber}</TableCell>
                <TableCell>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">
                        {customer.tariff?.name || '-'}
                    </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={
                      customer.status === 'ACTIVE' 
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                  } variant="outline">
                    {customer.status === 'ACTIVE' ? 'AKTIF' : 'NON-AKTIF'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right print:hidden">
                  <div className="flex justify-end gap-1">
                      <EditCustomerDialog 
                        customer={{
                          id: customer.id,
                          name: customer.name,
                          address: customer.address,
                          meterNumber: customer.meterNumber,
                          tariffId: customer.tariffId || customer.tariff?.id,
                          status: customer.status,
                          phoneNumber: customer.phoneNumber
                        }} 
                        tariffs={tariffs} 
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => setDeleteId(customer.id)}>
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
            <AlertDialogTitle>Hapus Data Pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data pelanggan secara permanen. Apakah Anda yakin ingin melanjutkan?
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
              {isDeleting ? "Menghapus..." : "Hapus Pelanggan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
