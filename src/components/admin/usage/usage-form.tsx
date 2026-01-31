'use client'

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Droplets, Calendar, Save, History, Calculator } from "lucide-react"
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
import { createReading, getPreviousReading } from "@/lib/actions/usage"
import { toast } from "sonner"
import { format } from "date-fns"

interface UsageFormProps {
    customers?: {
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function UsageForm({ customers }: UsageFormProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<UsageFormProps["customers"][number] | null>(null)

    // Default to current month/year
    const now = new Date()
    const currentMonth = String(now.getMonth() + 1)
    const currentYear = String(now.getFullYear())

    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [initialReading, setInitialReading] = useState("")

    useEffect(() => {
        async function fetchPreviousReading() {
            if (selectedCustomer && selectedMonth && selectedYear) {
                const prevReading = await getPreviousReading(
                    selectedCustomer.id, 
                    parseInt(selectedMonth), 
                    parseInt(selectedYear)
                )
                
                if (prevReading !== null) {
                    setInitialReading(prevReading.toString())
                    toast.info(`Meter awal otomatis terisi: ${prevReading}`)
                } else {
                    setInitialReading("")
                }
            }
        }

        fetchPreviousReading()
    }, [selectedCustomer, selectedMonth, selectedYear])

    const safeCustomers = customers || []

    const months = [
        { value: "1", label: "Januari" },
        { value: "2", label: "Februari" },
        { value: "3", label: "Maret" },
        { value: "4", label: "April" },
        { value: "5", label: "Mei" },
        { value: "6", label: "Juni" },
        { value: "7", label: "Juli" },
        { value: "8", label: "Agustus" },
        { value: "9", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" },
    ]

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
        <div className="w-full bg-white">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm text-white shadow-inner">
                    <Droplets className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Input Meter Baru</h2>
                    <p className="text-blue-100 text-sm">Catat penggunaan air pelanggan bulan ini</p>
                </div>
            </div>

            <div className="p-6">
                <form action={handleSubmit} className="space-y-6">
                    {/* Customer Selection Section */}
                    <div className="space-y-3">
                        <Label className="text-slate-600 font-semibold text-sm">Pilih Pelanggan</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between h-12 border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all rounded-xl text-base font-normal text-slate-700"
                                >
                                    {value
                                        ? safeCustomers.find((customer) => customer.id === value)?.name
                                        : "Cari nama atau no. meter..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Ketik untuk mencari..." className="h-11" />
                                    <CommandList>
                                        <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                                        <CommandGroup>
                                            {safeCustomers.map((customer) => (
                                                <CommandItem
                                                    key={customer.id}
                                                    value={customer.name}
                                                    onSelect={() => {
                                                        setValue(customer.id)
                                                        setSelectedCustomer(customer)
                                                        setOpen(false)
                                                    }}
                                                    className="py-3 px-4 cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-3 h-4 w-4 text-blue-600",
                                                            value === customer.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium text-slate-900">{customer.name}</span>
                                                        <span className="text-xs text-slate-500 font-mono bg-slate-100 w-fit px-1.5 rounded">{customer.meterNumber}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        
                        {selectedCustomer && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">DETAIL GOLONGAN</p>
                                    <p className="font-bold text-blue-900 text-lg">{selectedCustomer.tariff.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">TARIF PER M³</p>
                                    <p className="font-bold text-blue-900 text-lg">
                                        Rp {Number(selectedCustomer.tariff.ratePerCubic).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-slate-100 w-full my-6" />

                    {/* Period Section */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="month" className="text-slate-600 font-semibold text-sm">Bulan</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Select name="month" value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="pl-9 h-11 border-slate-200 bg-slate-50 rounded-xl focus:ring-blue-200 hover:bg-white hover:border-blue-300 transition-all">
                                        <SelectValue placeholder="Pilih Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-slate-600 font-semibold text-sm">Tahun</Label>
                            <Input 
                                id="year" 
                                name="year" 
                                type="number" 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                required 
                                className="h-11 border-slate-200 bg-slate-50 rounded-xl focus:ring-blue-200 hover:bg-white hover:border-blue-300 transition-all text-center font-medium"
                            />
                        </div>
                    </div>

                    {/* Reading Input Section */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="initialReading" className="text-slate-600 font-semibold text-sm flex items-center gap-2">
                                    <History className="h-3.5 w-3.5" /> Meter Awal
                                </Label>
                                <Input 
                                    id="initialReading" 
                                    name="initialReading" 
                                    type="number" 
                                    step="0.01" 
                                    value={initialReading}
                                    onChange={(e) => setInitialReading(e.target.value)}
                                    placeholder="0.00" 
                                    className="h-11 bg-white border-slate-200 rounded-xl focus:ring-blue-200 transition-all font-mono"
                                />
                                <p className="text-[10px] text-slate-400 font-medium">*Otomatis jika kosong</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currentReading" className="text-blue-600 font-bold text-sm flex items-center gap-2">
                                    <Calculator className="h-3.5 w-3.5" /> Meter Akhir
                                </Label>
                                <Input 
                                    id="currentReading" 
                                    name="currentReading" 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00" 
                                    required 
                                    className="h-11 bg-white border-blue-200 ring-2 ring-blue-50 rounded-xl focus:ring-blue-200 transition-all font-mono text-lg font-bold text-slate-900"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-slate-200/60">
                             <Label htmlFor="readingDate" className="text-slate-600 font-semibold text-sm">Tanggal Pencatatan</Label>
                             <Input
                                id="readingDate"
                                name="readingDate"
                                type="date"
                                defaultValue={format(now, "yyyy-MM-dd")}
                                required
                                className="h-11 bg-white border-slate-200 rounded-xl focus:ring-blue-200 transition-all"
                             />
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-[0.99] mt-4" 
                        disabled={loading}
                    >
                        {loading ? (
                            "Menyimpan..."
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save className="h-5 w-5" />
                                Simpan Data & Tagihan
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
