'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

export function UsageFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [month, setMonth] = useState(searchParams.get("month") || currentMonth.toString())
  const [year, setYear] = useState(searchParams.get("year") || currentYear.toString())

  // Generate year options (current year down to 2020)
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  
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

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (month) params.set("month", month)
    if (year) params.set("year", year)
    
    router.push(`/admin/usage?${params.toString()}`)
  }

  // Allow pressing Enter in search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilter()
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Cari Nama Pelanggan atau ID Meter..." 
          className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[140px] bg-white border-slate-200">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px] bg-white border-slate-200">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={handleFilter}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Terapkan Filter</span>
        </Button>
      </div>
    </div>
  )
}
