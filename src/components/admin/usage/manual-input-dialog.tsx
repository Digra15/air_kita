'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UsageForm } from "./usage-form"
import { Droplets } from "lucide-react"

interface ManualInputDialogProps {
  customers: any[]
}

export function ManualInputDialog({ customers }: ManualInputDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold">
            <Droplets className="mr-2 h-4 w-4" />
            Buka Form Input
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Input Pencatatan Meter</DialogTitle>
          <DialogDescription>
            Form untuk memasukkan data meteran air pelanggan secara manual.
          </DialogDescription>
        </DialogHeader>
        <UsageForm customers={customers} />
      </DialogContent>
    </Dialog>
  )
}
