'use client'

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createReading } from "@/lib/actions/usage"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface UsageFormProps {
    customers: {
        id: string
        name: string
        meterNumber: string
        tariff: {
            name: string
            ratePerCubic: number | string
            baseFee: number | string
        }
    }[]
}

export function UsageForm({ customers }: UsageFormProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<UsageFormProps["customers"][number] | null>(null)

    // Default to current month/year
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    async function handleSubmit(formData: FormData) {
        if (!selectedCustomer) {
            toast.error("Pilih pelanggan terlebih dahulu")
            return
        }
        
        setLoading(true)
        formData.append('customerId', selectedCustomer.id)
        
        const result = await createReading(formData)
        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            setValue("")
            setSelectedCustomer(null)
            // Optional: reset form fields
        } else {
            toast.error(result.message)
        }
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Input Meteran Baru</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="flex flex-col space-y-2">
                        <Label>Pilih Pelanggan</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {value
                                        ? customers.find((customer) => customer.id === value)?.name
                                        : "Cari pelanggan..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Cari nama atau no. meter..." />
                                    <CommandList>
                                        <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            {customers.map((customer) => (
                                                <CommandItem
                                                    key={customer.id}
                                                    value={customer.name} // Search by name
                                                    onSelect={() => {
                                                        // We need to match the name back to ID because CommandItem value is lowercase
                                                        // Better approach: filter manually or ensure value is unique. 
                                                        // For now, let's assume names are unique enough or use ID in value hiddenly
                                                        setValue(customer.id)
                                                        setSelectedCustomer(customer)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            value === customer.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{customer.name}</span>
                                                        <span className="text-xs text-muted-foreground">{customer.meterNumber}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {selectedCustomer && (
                            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                Golongan: {selectedCustomer.tariff.name} <br/>
                                Tarif: Rp {Number(selectedCustomer.tariff.ratePerCubic).toLocaleString('id-ID')} /m3
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="month">Bulan</Label>
                            <Input 
                                id="month" 
                                name="month" 
                                type="number" 
                                min="1" 
                                max="12" 
                                defaultValue={currentMonth} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Tahun</Label>
                            <Input 
                                id="year" 
                                name="year" 
                                type="number" 
                                defaultValue={currentYear} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentReading">Meteran Akhir</Label>
                        <Input 
                            id="currentReading" 
                            name="currentReading" 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            required 
                        />
                    </div>
                    
                    <div className="space-y-2">
                         <Label htmlFor="readingDate">Tanggal Pencatatan</Label>
                         <Input
                            id="readingDate"
                            name="readingDate"
                            type="date"
                            defaultValue={format(now, "yyyy-MM-dd")}
                            required
                         />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Menyimpan..." : "Simpan & Buat Tagihan"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
