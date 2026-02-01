"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Printer, Download, Droplets, TrendingUp, TrendingDown, BarChart3, BookOpen } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { UsageReport } from "./usage-report"
import { IncomeReport } from "./income-report"
import { ExpenseReport } from "./expense-report"
import { StatisticsView } from "./statistics-view"
import { AccountingView } from "./accounting-view"

interface ReportsPageClientProps {
  transactions: any[]
  usageData: any[]
  companyName: string
  companyAddress: string
}

export function ReportsPageClient({ transactions, usageData, companyName, companyAddress }: ReportsPageClientProps) {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "income"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-end gap-2 md:-mt-16 mb-8">
        <Button variant="outline" className="gap-2 w-full md:w-auto">
          <Printer className="h-4 w-4" />
          Cetak Laporan
        </Button>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Download className="h-4 w-4" />
          Export Data (Excel)
        </Button>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="usage" className="gap-2 data-[state=active]:text-blue-600 min-w-fit">
            <Droplets className="h-4 w-4" />
            Laporan Pemakaian
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2 data-[state=active]:text-blue-600 min-w-fit">
            <TrendingUp className="h-4 w-4" />
            Laporan Pemasukan
          </TabsTrigger>
          <TabsTrigger value="expense" className="gap-2 data-[state=active]:text-blue-600 min-w-fit">
            <TrendingDown className="h-4 w-4" />
            Laporan Pengeluaran
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2 data-[state=active]:text-blue-600 min-w-fit">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="accounting" className="gap-2 data-[state=active]:text-blue-600 min-w-fit">
            <BookOpen className="h-4 w-4" />
            Akuntansi
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="space-y-4">
          <UsageReport data={usageData} />
        </TabsContent>
        
        <TabsContent value="income" className="space-y-4">
          <IncomeReport data={transactions} />
        </TabsContent>
        
        <TabsContent value="expense" className="space-y-4">
           <ExpenseReport data={transactions} />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <StatisticsView data={transactions} />
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4">
          <AccountingView 
            data={transactions} 
            companyName={companyName}
            companyAddress={companyAddress}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
