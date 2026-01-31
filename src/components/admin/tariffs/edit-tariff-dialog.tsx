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
import { updateTariff } from "@/lib/actions/tariff"
import { Edit } from "lucide-react"
import { toast } from "sonner"

interface EditTariffDialogProps {
  tariff: {
    id: string
    name: string
    description?: string | null
    ratePerCubic: number | string
    baseFee: number | string
  }
}

export function EditTariffDialog({ tariff }: EditTariffDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateTariff(tariff.id, formData)
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
          <DialogTitle>Edit Golongan Tarif</DialogTitle>
          <DialogDescription>
            Ubah tarif per m3 dan biaya beban untuk golongan ini.
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
                defaultValue={tariff.name}
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
                defaultValue={tariff.ratePerCubic}
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
                defaultValue={tariff.baseFee}
                className="col-span-3"
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
                defaultValue={tariff.description || ''}
                className="col-span-3"
              />
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
