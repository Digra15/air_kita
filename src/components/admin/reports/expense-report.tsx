"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { TrendingDown, Calendar, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  description: string
  date: string
  referenceId: string | null
}

interface ExpenseReportProps {
  data: Transaction[]
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

// Helper to infer PIC based on category
const getPIC = (category: string): string => {
  const cat = category.toUpperCase()
  if (cat.includes("GAJI") || cat.includes("HR") || cat.includes("SALARY")) return "HRD"
  if (cat.includes("MAINTENANCE") || cat.includes("PIPA") || cat.includes("PERBAIKAN")) return "LOGISTIK"
  if (cat.includes("OPERASIONAL") || cat.includes("LISTRIK") || cat.includes("POMPA")) return "FINANCE"
  if (cat.includes("MARKETING") || cat.includes("PROMOSI")) return "MARKETING"
  return "ADMIN"
}

export function ExpenseReport({ data }: ExpenseReportProps) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState("")

  // Get unique years
  const availableYears = useMemo(() => {
    const years = new Set(data.map(d => new Date(d.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [data])

  // Filter Data
  const filteredData = useMemo(() => {
    return data
      .filter(t => t.type === 'EXPENSE')
      .filter(t => {
        const matchYear = selectedYear === "all" || new Date(t.date).getFullYear().toString() === selectedYear
        const matchSearch = !searchTerm || 
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase())
        return matchYear && matchSearch
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [data, selectedYear, searchTerm])

  // Calculate Stats for Specific Cards
  const stats = useMemo(() => {
    const expenseOnly = selectedYear === "all" 
      ? data.filter(t => t.type === 'EXPENSE')
      : data.filter(t => t.type === 'EXPENSE' && new Date(t.date).getFullYear().toString() === selectedYear)

    // 1. GAJI & HR
    const salary = expenseOnly
      .filter(t => {
        const c = t.category.toUpperCase()
        return c.includes("GAJI") || c.includes("HR") || c.includes("SALARY")
      })
      .reduce((sum, t) => sum + t.amount, 0)

    // 2. OPERASIONAL & LISTRIK
    const operational = expenseOnly
      .filter(t => {
        const c = t.category.toUpperCase()
        return c.includes("OPERASIONAL") || c.includes("LISTRIK") || c.includes("POMPA") || c.includes("KANTOR")
      })
      .reduce((sum, t) => sum + t.amount, 0)

    // 3. MAINTENANCE PIPA
    const maintenance = expenseOnly
      .filter(t => {
        const c = t.category.toUpperCase()
        return c.includes("MAINTENANCE") || c.includes("PIPA") || c.includes("PERBAIKAN") || c.includes("MATERIAL") || c.includes("JASA")
      })
      .reduce((sum, t) => sum + t.amount, 0)

    return { salary, operational, maintenance }
  }, [data, selectedYear])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Gaji & HR */}
        <Card className="bg-white shadow-sm border-none ring-1 ring-gray-100">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center mb-2">
               <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">GAJI & HR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.salary)}</div>
            <p className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wide">
              15 KARYAWAN
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Operasional & Listrik */}
        <Card className="bg-white shadow-sm border-none ring-1 ring-gray-100">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center mb-2">
               <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">OPERASIONAL & LISTRIK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.operational)}</div>
            <p className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wide">
              POMPA & KANTOR
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Maintenance Pipa */}
        <Card className="bg-white shadow-sm border-none ring-1 ring-gray-100">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
               <TrendingDown className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">MAINTENANCE PIPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.maintenance)}</div>
            <p className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wide">
              MATERIAL & JASA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Journal Table */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-white border-b px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="uppercase tracking-wide text-sm font-bold text-gray-800">DETAIL JURNAL PENGELUARAN</CardTitle>
            </div>
             <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari transaksi..."
                    className="pl-8 w-[200px] lg:w-[300px] bg-gray-50 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[130px] bg-white border-gray-200">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <SelectValue placeholder="Pilih Periode" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-gray-500">TANGGAL</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">KETERANGAN</TableHead>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-gray-500">KATEGORI</TableHead>
                <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-gray-500">PIC</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">BIAYA (IDR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    Tidak ada data pengeluaran yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-sm font-medium text-blue-600/80">
                      {new Date(row.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-gray-900">
                      {row.description}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {row.category}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                       {getPIC(row.category)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(row.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
