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
import { createCustomer } from "@/lib/actions/customer"
import { Plus } from "lucide-react"
import { toast } from "sonner"

// Mock tariffs for now since we haven't seeded DB
const MOCK_TARIFFS = [
    { id: '1', name: 'Rumah Tangga A' },
    { id: '2', name: 'Rumah Tangga B' },
    { id: '3', name: 'Bisnis Kecil' },
]

export function AddCustomerDialog({ tariffs }: { tariffs: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createCustomer(formData)
    setLoading(false)
    
    if (result.success) {
      setOpen(false)
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const tariffOptions = tariffs.length > 0 ? tariffs : MOCK_TARIFFS

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pelanggan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          <DialogDescription>
            Masukkan data pelanggan baru di sini. Klik simpan setelah selesai.
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
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Alamat
              </Label>
              <Input
                id="address"
                name="address"
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
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tariff" className="text-right">
                Golongan
              </Label>
              <Select name="tariffId" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih golongan tarif" />
                </SelectTrigger>
                <SelectContent>
                  {tariffOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
