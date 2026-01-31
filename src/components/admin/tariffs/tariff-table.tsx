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
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  
  async function handleDelete(id: string) {
      if(confirm('Apakah Anda yakin ingin menghapus tarif ini?')) {
          const result = await deleteTariff(id)
          if(result.success) {
            toast.success(result.message)
          } else {
            toast.error(result.message)
          }
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
          <TableRow>
            <TableHead>Nama Golongan</TableHead>
            <TableHead>Tarif / m3</TableHead>
            <TableHead>Biaya Beban</TableHead>
            <TableHead>Jumlah Pelanggan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(tariff.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
