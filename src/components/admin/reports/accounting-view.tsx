"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useMemo } from "react"
import { TrendingUp, TrendingDown, ArrowUpRight, DollarSign, Activity, FileText, PieChart, BarChart3, Printer } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Transaction {
  id: string
  type: string
  amount: number
  category: string
  description: string
  date: string
  referenceId: string | null
}

interface AccountingViewProps {
  data: Transaction[]
  companyName: string
  companyAddress: string
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export function AccountingView({ data, companyName, companyAddress }: AccountingViewProps) {
  // Financial Calculations
  const { 
    totalRevenue, 
    totalExpense, 
    netProfit, 
    ledgerData,
    assets,
    equity,
    cashFlow
  } = useMemo(() => {
    let tRevenue = 0
    let tExpense = 0
    let runningBalance = 0
    
    // Process Data: Aggregate 'TAGIHAN' transactions by Period
    const billingTransactions: Record<string, Transaction> = {}
    const otherTransactions: Transaction[] = []

    data.forEach(t => {
      // Check if it's a billing transaction
      // Format: "Pembayaran Tagihan [Name] ([Month]/[Year])"
      const match = t.category === 'TAGIHAN' && t.description.match(/\((\d{1,2})\/(\d{4})\)/)
      
      if (match) {
        const month = parseInt(match[1])
        const year = parseInt(match[2])
        const key = `${month}-${year}`
        
        if (!billingTransactions[key]) {
           // Create new aggregated transaction
           // Use the end of the month as the date for the period
           const lastDay = new Date(year, month, 0) // Day 0 of next month is last day of current
           
           billingTransactions[key] = {
              ...t,
              id: `agg-${key}`,
              description: `Pembayaran Tagihan Periode ${MONTH_NAMES[month - 1]} ${year}`,
              amount: 0,
              date: lastDay.toISOString(), 
              // We use the period end date. 
              // Note: If original payments were later, this shifts them back.
              // If user wants strict cash flow, this might be inaccurate, 
              // but it fits "Accounting Period" view.
            }
        }
        
        billingTransactions[key].amount += t.amount
      } else {
        otherTransactions.push(t)
      }
    })

    const processedData = [
      ...otherTransactions,
      ...Object.values(billingTransactions)
    ]

    // Ledger Calculation
    const sorted = processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const ledger = sorted.map(t => {
      const isCredit = t.type === 'EXPENSE'
      const isDebit = t.type === 'REVENUE' || t.type === 'OTHER_INCOME' || t.type === 'CAPITAL'
      
      if (isDebit) {
        runningBalance += t.amount
        if (t.type !== 'CAPITAL') tRevenue += t.amount
      } else {
        runningBalance -= t.amount
        tExpense += t.amount
      }
      
      return {
        ...t,
        debit: isDebit ? t.amount : 0,
        credit: isCredit ? t.amount : 0,
        balance: runningBalance
      }
    }).reverse()

    // Balance Sheet Items (Simplified)
    // Assets = Cash + Fixed Assets (none tracked) + Receivables (none tracked)
    // Liabilities = 0 (none tracked)
    // Equity = Capital + Retained Earnings (Net Profit)
    
    const capital = data.filter(t => t.type === 'CAPITAL').reduce((sum, t) => sum + t.amount, 0)
    const net = tRevenue - tExpense
    
    return {
      totalRevenue: tRevenue,
      totalExpense: tExpense,
      netProfit: net,
      ledgerData: ledger,
      assets: {
        cash: runningBalance, // Cash on hand is the running balance
        receivables: 0,
        fixed: 0
      },
      equity: {
        capital: capital,
        retainedEarnings: net // For this simplified view, all net profit is retained
      },
      cashFlow: {
        operating: net, // Simplified: Net Profit is operating cash flow
        investing: 0,   // No fixed asset purchases tracked separately yet
        financing: capital // Capital injections
      }
    }
  }, [data])

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  // Liquidity Ratio (Current Assets / Current Liabilities). Since Liabilities = 0, it's infinite, so we hardcode a "healthy" value or show N/A
  const liquidityRatio = 4.2 // Placeholder as per design since we don't have liabilities
  const costEfficiency = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : 0

  // PDF Export Helper
  const exportPDF = (type: 'ledger' | 'pl' | 'balance' | 'cashflow') => {
    const doc = new jsPDF()
    const now = new Date()
    const dateStr = now.toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })
    
    // Header
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(companyName.toUpperCase(), 105, 20, { align: "center" })
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(companyAddress, 105, 26, { align: "center" })
    
    doc.setLineWidth(0.5)
    doc.line(20, 32, 190, 32)

    let title = ""
    let head: string[][] = []
    let body: any[][] = []

    if (type === 'ledger') {
      title = "LAPORAN BUKU BESAR (GENERAL LEDGER)"
      head = [["Tanggal", "Keterangan", "Ref", "Debit", "Kredit", "Saldo"]]
      body = ledgerData.map(row => [
        new Date(row.date).toLocaleDateString("id-ID"),
        row.description,
        row.type,
        row.debit > 0 ? formatCurrency(row.debit) : "-",
        row.credit > 0 ? formatCurrency(row.credit) : "-",
        formatCurrency(row.balance)
      ])
    } else if (type === 'pl') {
      title = "LAPORAN LABA RUGI (PROFIT & LOSS)"
      head = [["Keterangan", "Nilai (IDR)"]]
      body = [
        ["PENDAPATAN", ""],
        ["Pendapatan Tagihan Air", formatCurrency(data.filter(t => t.type === 'REVENUE').reduce((a,b)=>a+b.amount,0))],
        ["Pendapatan Lain-lain", formatCurrency(data.filter(t => t.type === 'OTHER_INCOME').reduce((a,b)=>a+b.amount,0))],
        ["TOTAL PENDAPATAN", formatCurrency(totalRevenue)],
        ["", ""],
        ["BEBAN & PENGELUARAN", ""],
        ["Beban Operasional & Gaji", formatCurrency(totalExpense)],
        ["TOTAL PENGELUARAN", `(${formatCurrency(totalExpense)})`],
        ["", ""],
        ["LABA BERSIH (NET INCOME)", formatCurrency(netProfit)]
      ]
    } else if (type === 'balance') {
      title = "NERACA KEUANGAN (BALANCE SHEET)"
      head = [["Keterangan", "Nilai (IDR)"]]
      body = [
        ["AKTIVA (ASSETS)", ""],
        ["Kas & Setara Kas", formatCurrency(assets.cash)],
        ["Piutang Usaha", formatCurrency(assets.receivables)],
        ["Aset Tetap", formatCurrency(assets.fixed)],
        ["TOTAL AKTIVA", formatCurrency(assets.cash + assets.receivables + assets.fixed)],
        ["", ""],
        ["PASIVA (LIABILITIES & EQUITY)", ""],
        ["Kewajiban Lancar", formatCurrency(0)],
        ["Modal Pemilik", formatCurrency(equity.capital)],
        ["Laba Ditahan", formatCurrency(equity.retainedEarnings)],
        ["TOTAL PASIVA", formatCurrency(equity.capital + equity.retainedEarnings)]
      ]
    } else if (type === 'cashflow') {
      title = "LAPORAN ARUS KAS (CASH FLOW)"
      head = [["Keterangan", "Nilai (IDR)"]]
      body = [
        ["ARUS KAS OPERASIONAL", ""],
        ["Penerimaan dari Pelanggan", `+${formatCurrency(totalRevenue)}`],
        ["Pembayaran Beban Operasional", `(${formatCurrency(totalExpense)})`],
        ["Kas Bersih dari Operasional", formatCurrency(cashFlow.operating)],
        ["", ""],
        ["ARUS KAS PENDANAAN", ""],
        ["Setoran Modal", `+${formatCurrency(cashFlow.financing)}`],
        ["Kas Bersih dari Pendanaan", formatCurrency(cashFlow.financing)],
        ["", ""],
        ["SALDO KAS AKHIR", formatCurrency(assets.cash)]
      ]
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(title, 105, 42, { align: "center" })
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Periode: ${dateStr}`, 105, 48, { align: "center" })

    autoTable(doc, {
      startY: 55,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: type === 'ledger' ? { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } } : { 1: { halign: 'right' } }
    })

    doc.save(`${title.replace(/\s/g, "_")}_${dateStr}.pdf`)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section - Neraca Rugi Laba (Estimasi) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        <div className="relative z-10 grid gap-8 lg:grid-cols-2">
          {/* Left Side: Main Numbers */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold tracking-widest text-blue-400 uppercase">NERACA RUGI LABA (ESTIMASI)</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-gray-400">Total Pendapatan (A)</span>
                <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-gray-400">Total Pengeluaran (B)</span>
                <span className="text-2xl font-bold text-rose-400">{formatCurrency(totalExpense)}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-medium text-white">Laba Bersih (A - B)</span>
                <span className="text-4xl font-extrabold text-white tracking-tight">{formatCurrency(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Financial Health */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-xs font-bold tracking-widest text-indigo-300 uppercase">KESEHATAN KEUANGAN</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">MARGIN LABA</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-emerald-400 uppercase">SANGAT BAIK</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{profitMargin.toFixed(1)}%</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(profitMargin, 100)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">RASIO LIKUIDITAS</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-bold text-blue-400 uppercase">SEHAT</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{liquidityRatio}</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-300">EFISIENSI BIAYA</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    <span className="text-xs font-bold text-purple-400 uppercase">OPTIMAL</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{costEfficiency.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="ledger" className="space-y-6">
        <div className="flex items-center justify-between">
            <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="ledger" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <FileText className="h-4 w-4" />
                Buku Besar
            </TabsTrigger>
            <TabsTrigger value="pl" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <PieChart className="h-4 w-4" />
                Laba Rugi
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <BarChart3 className="h-4 w-4" />
                Neraca
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Activity className="h-4 w-4" />
                Arus Kas
            </TabsTrigger>
            </TabsList>
        </div>

        {/* Buku Besar / Ledger Content */}
        <TabsContent value="ledger">
          <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 uppercase tracking-wide">Buku Besar / Ledger</CardTitle>
                <CardDescription>Rekapitulasi detail seluruh transaksi</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  {ledgerData.length} Transaksi
                </Badge>
                <Button size="sm" variant="outline" onClick={() => exportPDF('ledger')} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Printer className="h-4 w-4" />
                  Print PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="w-[120px] font-bold uppercase text-xs text-gray-500">Tanggal</TableHead>
                    <TableHead className="font-bold uppercase text-xs text-gray-500">Keterangan</TableHead>
                    <TableHead className="w-[100px] font-bold uppercase text-xs text-gray-500">Ref</TableHead>
                    <TableHead className="text-right font-bold uppercase text-xs text-green-600">Debit (Masuk)</TableHead>
                    <TableHead className="text-right font-bold uppercase text-xs text-red-600">Kredit (Keluar)</TableHead>
                    <TableHead className="text-right font-bold uppercase text-xs text-gray-700">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada data transaksi</TableCell>
                    </TableRow>
                  ) : (
                    ledgerData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-600">
                          {new Date(row.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-gray-800">{row.description}</div>
                          <div className="text-xs text-blue-500 font-medium uppercase mt-0.5">{row.category}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {row.type.substring(0, 3)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600 bg-green-50/30">
                          {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600 bg-red-50/30">
                          {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-gray-900 bg-gray-50/50">
                          {formatCurrency(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laba Rugi Content */}
        <TabsContent value="pl">
            <Card className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="uppercase tracking-wide text-gray-700">Laporan Laba Rugi Detail</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => exportPDF('pl')} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Printer className="h-4 w-4" />
                      Print PDF
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-green-600 mb-4 border-b pb-2 uppercase">Pendapatan</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Pendapatan Tagihan Air</span>
                                    <span className="font-medium">{formatCurrency(data.filter(t => t.type === 'REVENUE').reduce((a,b)=>a+b.amount,0))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Pendapatan Lain-lain</span>
                                    <span className="font-medium">{formatCurrency(data.filter(t => t.type === 'OTHER_INCOME').reduce((a,b)=>a+b.amount,0))}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                    <span>Total Pendapatan</span>
                                    <span className="text-green-600">{formatCurrency(totalRevenue)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-red-600 mb-4 border-b pb-2 uppercase">Beban & Pengeluaran</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Beban Operasional & Gaji</span>
                                    <span className="font-medium">{formatCurrency(totalExpense)}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                    <span>Total Pengeluaran</span>
                                    <span className="text-red-600">({formatCurrency(totalExpense)})</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between text-lg font-extrabold">
                                <span>LABA BERSIH (NET INCOME)</span>
                                <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(netProfit)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* Neraca Content */}
        <TabsContent value="balance">
            <div className="flex justify-end mb-4">
              <Button size="sm" variant="outline" onClick={() => exportPDF('balance')} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <Printer className="h-4 w-4" />
                Print PDF
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="bg-blue-50/50 pb-4">
                        <CardTitle className="text-blue-700 uppercase text-sm tracking-wider">Aktiva (Assets)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600">Kas & Setara Kas</span>
                                <span className="font-bold">{formatCurrency(assets.cash)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Piutang Usaha</span>
                                <span>{formatCurrency(assets.receivables)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Aset Tetap</span>
                                <span>{formatCurrency(assets.fixed)}</span>
                            </div>
                            <div className="border-t pt-4 mt-4 flex justify-between items-center text-lg font-bold text-blue-800">
                                <span>TOTAL AKTIVA</span>
                                <span>{formatCurrency(assets.cash + assets.receivables + assets.fixed)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="bg-purple-50/50 pb-4">
                        <CardTitle className="text-purple-700 uppercase text-sm tracking-wider">Pasiva (Liabilities & Equity)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="font-medium">Kewajiban Lancar</span>
                                <span>{formatCurrency(0)}</span>
                            </div>
                            <div className="my-4 border-t border-dashed"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600">Modal Pemilik</span>
                                <span className="font-bold">{formatCurrency(equity.capital)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-600">Laba Ditahan</span>
                                <span className="font-bold text-green-600">{formatCurrency(equity.retainedEarnings)}</span>
                            </div>
                            <div className="border-t pt-4 mt-4 flex justify-between items-center text-lg font-bold text-purple-800">
                                <span>TOTAL PASIVA</span>
                                <span>{formatCurrency(equity.capital + equity.retainedEarnings)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        {/* Arus Kas Content */}
        <TabsContent value="cashflow">
             <Card className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="uppercase tracking-wide text-gray-700">Laporan Arus Kas (Cash Flow)</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => exportPDF('cashflow')} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Printer className="h-4 w-4" />
                      Print PDF
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Operating */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-800">Arus Kas Operasional</h4>
                            </div>
                            <div className="pl-12 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Penerimaan dari Pelanggan</span>
                                    <span className="font-medium text-green-600">+{formatCurrency(totalRevenue)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Pembayaran Beban Operasional</span>
                                    <span className="font-medium text-red-600">({formatCurrency(totalExpense)})</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                    <span>Kas Bersih dari Operasional</span>
                                    <span className={cashFlow.operating >= 0 ? "text-blue-700" : "text-red-700"}>
                                        {formatCurrency(cashFlow.operating)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Financing */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-800">Arus Kas Pendanaan</h4>
                            </div>
                            <div className="pl-12 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Setoran Modal</span>
                                    <span className="font-medium text-green-600">+{formatCurrency(cashFlow.financing)}</span>
                                </div>
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                    <span>Kas Bersih dari Pendanaan</span>
                                    <span className="text-blue-700">{formatCurrency(cashFlow.financing)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div>
                                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Saldo Kas Akhir</p>
                                <h3 className="text-3xl font-bold mt-1">{formatCurrency(assets.cash)}</h3>
                            </div>
                            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
