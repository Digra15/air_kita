'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateCustomer } from "@/lib/actions/customer"
import { Edit } from "lucide-react"
import { toast } from "sonner"

interface EditCustomerDialogProps {
  customer: {
    id: string
    name: string
    address: string
    meterNumber: string
    tariffId?: string | null
    status: "ACTIVE" | "INACTIVE"
    phoneNumber?: string | null
  }
  tariffs: { id: string; name: string }[]
}

export function EditCustomerDialog({ customer, tariffs }: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateCustomer(customer.id, formData)
    setLoading(false)
    
    if (result.success) {
      setOpen(false)
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Pelanggan</DialogTitle>
          <DialogDescription>
            Ubah data pelanggan di sini. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={customer.name}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meterNumber" className="text-right">
                No. Meter
              </Label>
              <Input
                id="meterNumber"
                name="meterNumber"
                defaultValue={customer.meterNumber}
                className="col-span-3"
                required
                disabled // Usually meter number shouldn't be changed easily or needs validation
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Alamat
              </Label>
              <Input
                id="address"
                name="address"
                defaultValue={customer.address}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                No. HP
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phoneNumber || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tariff" className="text-right">
                Golongan
              </Label>
              <Select name="tariffId" defaultValue={customer.tariffId || undefined}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih golongan tarif" />
                </SelectTrigger>
                <SelectContent>
                  {tariffs.map((tariff) => (
                    <SelectItem key={tariff.id} value={tariff.id}>
                      {tariff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={customer.status}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">AKTIF</SelectItem>
                  <SelectItem value="INACTIVE">NON-AKTIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
