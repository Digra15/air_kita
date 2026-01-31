"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Droplets, Users, TrendingUp, Filter, RefreshCcw, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface UsageRecord {
  id: string
  customer: {
    name: string
    meterNumber: string
    address: string
  }
  month: number
  year: number
  meterReading: number
  usageAmount: number
  recordedAt: string
}

interface UsageReportProps {
  data: UsageRecord[]
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export function UsageReport({ data }: UsageReportProps) {
  // Default to current month and year
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [searchTerm, setSearchTerm] = useState("")

  // Get unique years from data
  const availableYears = useMemo(() => {
    const years = new Set(data.map(d => d.year))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [data])

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchMonth = selectedMonth === "all" || record.month.toString() === selectedMonth
      const matchYear = selectedYear === "all" || record.year.toString() === selectedYear
      const matchSearch = 
        record.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.customer.meterNumber.includes(searchTerm) ||
        record.customer.address.toLowerCase().includes(searchTerm.toLowerCase())

      return matchMonth && matchYear && matchSearch
    })
  }, [data, selectedMonth, selectedYear, searchTerm])

  // Statistics
  const stats = useMemo(() => {
    const totalUsage = filteredData.reduce((sum, r) => sum + r.usageAmount, 0)
    const uniqueCustomers = new Set(filteredData.map(r => r.customer.meterNumber)).size
    const avgUsage = uniqueCustomers > 0 ? totalUsage / uniqueCustomers : 0
    
    // Global stats (all time)
    const allTimeUsage = data.reduce((sum, r) => sum + r.usageAmount, 0)

    return {
      totalUsage,
      uniqueCustomers,
      avgUsage,
      allTimeUsage
    }
  }, [filteredData, data])

  const handleReset = () => {
    setSelectedMonth((new Date().getMonth() + 1).toString())
    setSelectedYear(new Date().getFullYear().toString())
    setSearchTerm("")
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Pemakaian
            </CardTitle>
            <Droplets className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage} m³</div>
            <p className="text-xs text-blue-100 mt-1">
              {selectedMonth === "all" ? "Semua Periode" : `Periode ${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pelanggan
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pelanggan aktif periode ini
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata Pemakaian
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.avgUsage.toFixed(1)} m³</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per pelanggan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Semua Periode
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.allTimeUsage} m³</div>
            <p className="text-xs text-slate-300 mt-1">
              Akumulasi keseluruhan data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Detail Laporan Pemakaian</CardTitle>
              <CardDescription>
                Monitoring penggunaan air pelanggan per periode
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pelanggan..."
                  className="pl-8 w-full sm:w-[200px] bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] bg-white">
                  <SelectValue placeholder="Tahun" />
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
              <Button variant="outline" size="icon" onClick={handleReset} title="Reset Filter">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-blue-50/50">
              <TableRow>
                <TableHead className="w-[180px] font-semibold text-blue-900">Periode</TableHead>
                <TableHead className="font-semibold text-blue-900">Pelanggan</TableHead>
                <TableHead className="text-right font-semibold text-blue-900">Meteran Awal</TableHead>
                <TableHead className="text-right font-semibold text-blue-900">Meteran Akhir</TableHead>
                <TableHead className="text-right font-semibold text-blue-900">Pemakaian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Tidak ada data pemakaian yang sesuai filter
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((record) => {
                    const initialReading = record.meterReading - record.usageAmount
                    return (
                        <TableRow key={record.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell>
                            <div className="font-medium text-gray-900">
                            {MONTHS[record.month - 1]} {record.year}
                            </div>
                            <div className="text-xs text-muted-foreground">
                            {new Date(record.recordedAt).toLocaleDateString("id-ID")}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-bold text-gray-800">{record.customer.name}</div>
                            <div className="text-xs text-blue-600 font-medium">{record.customer.meterNumber}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {record.customer.address}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-gray-600">
                            {initialReading}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-gray-900">
                            {record.meterReading}
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge 
                                variant="outline" 
                                className={`
                                    font-bold 
                                    ${record.usageAmount > 30 ? "bg-red-50 text-red-700 border-red-200" : 
                                      record.usageAmount > 20 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                                      "bg-green-50 text-green-700 border-green-200"}
                                `}
                            >
                            {record.usageAmount} m³
                            </Badge>
                        </TableCell>
                        </TableRow>
                    )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
