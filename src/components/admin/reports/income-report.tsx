"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Wallet, Banknote, TrendingUp, Search, RefreshCcw, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  description: string
  date: string
  referenceId: string | null
}

interface IncomeReportProps {
  data: Transaction[]
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export function IncomeReport({ data }: IncomeReportProps) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState("")

  // Get unique years from data
  const availableYears = useMemo(() => {
    const years = new Set(data.map(d => new Date(d.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [data])

  // Process and Flatten Data for "Journal" View
  const journalData = useMemo(() => {
    // 1. Filter by Year
    const filteredByYear = selectedYear === "all" 
      ? data 
      : data.filter(t => new Date(t.date).getFullYear().toString() === selectedYear)

    const incomeOnly = filteredByYear.filter(t => t.type === 'REVENUE' || t.type === 'OTHER_INCOME')

    // 2. Group REVENUE by Month
    const revenueGroups: Record<string, {
      month: number,
      year: number,
      amount: number,
      count: number,
      lastDate: Date
    }> = {}

    // 3. Keep OTHER_INCOME mostly as is, but maybe we want to group by Category per Month?
    // Let's stick to listing them individually as they are likely distinct events, 
    // BUT user said "pemasukan pembayaran tidak di hitung individu tapi pemabyaran per periode"
    // which implies aggregation. However, grouping "Denda" vs "Hibah" into one row loses meaning.
    // I will group OTHER_INCOME by Category + Month to be safe and consistent with "per periode".
    const otherGroups: Record<string, {
      month: number,
      year: number,
      category: string,
      amount: number,
      count: number,
      lastDate: Date,
      descriptions: Set<string>
    }> = {}

    incomeOnly.forEach(t => {
      let date = new Date(t.date)
      let month = date.getMonth()
      let year = date.getFullYear()

      // For REVENUE (Tagihan), try to parse period from description to group by Billing Period
      if (t.type === 'REVENUE') {
         const match = t.description.match(/\((\d{1,2})\/(\d{4})\)/)
         if (match) {
             month = parseInt(match[1]) - 1 // Convert 1-based to 0-based
             year = parseInt(match[2])
         }
      }

      const periodKey = `${year}-${month}`

      if (t.type === 'REVENUE') {
        if (!revenueGroups[periodKey]) {
          revenueGroups[periodKey] = {
            month,
            year,
            amount: 0,
            count: 0,
            lastDate: date
          }
        }
        revenueGroups[periodKey].amount += t.amount
        revenueGroups[periodKey].count += 1
        // Keep the latest payment date for the group
        if (date > revenueGroups[periodKey].lastDate) {
          revenueGroups[periodKey].lastDate = date
        }
      } else {
        // Group Other Income by Category per Month
        const catKey = `${periodKey}-${t.category}`
        if (!otherGroups[catKey]) {
            otherGroups[catKey] = {
                month,
                year,
                category: t.category,
                amount: 0,
                count: 0,
                lastDate: date,
                descriptions: new Set()
            }
        }
        otherGroups[catKey].amount += t.amount
        otherGroups[catKey].count += 1
        otherGroups[catKey].descriptions.add(t.description)
        if (date > otherGroups[catKey].lastDate) {
            otherGroups[catKey].lastDate = date
        }
      }
    })

    // 4. Create Flat List
    const flatList: {
        id: string
        date: Date
        description: string
        category: string
        status: string
        amount: number
        type: string
    }[] = []

    // Add Revenue Rows
    Object.values(revenueGroups).forEach(group => {
      flatList.push({
        id: `rev-${group.year}-${group.month}`,
        date: group.lastDate, // Use last date of the month/group
        description: `Pembayaran Tagihan Periode ${MONTHS[group.month]} ${group.year}`,
        category: "TAGIHAN",
        status: "SELESAI",
        amount: group.amount,
        type: 'REVENUE'
      })
    })

    // Add Other Income Rows
    Object.values(otherGroups).forEach(group => {
      // If single description, use it. If multiple, summarize.
      const descList = Array.from(group.descriptions)
      let desc = descList[0]
      if (group.count > 1) {
          desc = `${group.category} (${group.count} Transaksi)`
      }

      flatList.push({
        id: `other-${group.year}-${group.month}-${group.category}`,
        date: group.lastDate,
        description: desc,
        category: group.category,
        status: "SELESAI",
        amount: group.amount,
        type: 'OTHER_INCOME'
      })
    })

    // 5. Sort by Date Descending
    return flatList.sort((a, b) => b.date.getTime() - a.date.getTime())

  }, [data, selectedYear])

  // Search Filter
  const filteredJournal = useMemo(() => {
      if (!searchTerm) return journalData
      return journalData.filter(item => 
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [journalData, searchTerm])

  // Calculate Global Stats (based on filtered view - or raw data? Usually raw data for the selected year)
  const stats = useMemo(() => {
    const filteredByYear = selectedYear === "all" 
      ? data 
      : data.filter(t => new Date(t.date).getFullYear().toString() === selectedYear)
      
    const revenue = filteredByYear.filter(t => t.type === 'REVENUE').reduce((sum, t) => sum + t.amount, 0)
    const other = filteredByYear.filter(t => t.type === 'OTHER_INCOME').reduce((sum, t) => sum + t.amount, 0)

    return {
      totalRevenue: revenue,
      totalOtherIncome: other,
      totalIncome: revenue + other
    }
  }, [data, selectedYear])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm group hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan Tagihan</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
               <Wallet className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari pembayaran tagihan air
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm group hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan Non-Tagihan</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Banknote className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalOtherIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari denda, pemasangan baru, dll
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white border-none shadow-md group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalIncome)}</div>
            <p className="text-xs text-slate-400 mt-1">
              {selectedYear === "all" ? "Semua periode" : `Tahun ${selectedYear}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Journal Table */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-white border-b px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="uppercase tracking-wide text-sm font-bold text-gray-800">Detail Jurnal Pemasukan</CardTitle>
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
                  <SelectTrigger className="w-[100px] bg-white border-gray-200">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="border-gray-200">
                    <Filter className="h-4 w-4 text-gray-500" />
                </Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Deskripsi</TableHead>
                <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider text-gray-500">Kategori</TableHead>
                <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">Jumlah (IDR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJournal.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    Tidak ada data transaksi yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredJournal.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-sm font-medium text-gray-500">
                      {row.date.toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-gray-900">
                      {row.description}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {row.category}
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wide">
                         {row.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
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
