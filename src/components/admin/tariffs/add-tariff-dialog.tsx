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
import { Textarea } from "@/components/ui/textarea"
import { createTariff } from "@/lib/actions/tariff"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddTariffDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createTariff(formData)
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
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Tambah Tarif
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Golongan Tarif</DialogTitle>
          <DialogDescription>
            Atur tarif per m3 dan biaya beban untuk golongan baru.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Golongan
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Rumah Tangga A"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ratePerCubic" className="text-right">
                Tarif / m3 (Rp)
              </Label>
              <Input
                id="ratePerCubic"
                name="ratePerCubic"
                type="number"
                placeholder="Ex: 2000"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="baseFee" className="text-right">
                Biaya Beban (Rp)
              </Label>
              <Input
                id="baseFee"
                name="baseFee"
                type="number"
                placeholder="Ex: 15000"
                className="col-span-3"
                defaultValue="0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Keterangan
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-3"
              />
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
