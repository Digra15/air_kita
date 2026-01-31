"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  date: string
}

interface StatisticsViewProps {
  data: Transaction[]
}

export function StatisticsView({ data }: StatisticsViewProps) {
  const { chartData, totalIncome, totalExpense, netProfit } = useMemo(() => {
    const months: Record<string, { name: string, income: number, expense: number, date: Date }> = {}
    let tIncome = 0
    let tExpense = 0

    data.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleDateString("id-ID", { month: 'short', year: 'numeric' })

      if (!months[monthKey]) {
        months[monthKey] = { name: monthName, income: 0, expense: 0, date }
      }

      if (t.type === 'EXPENSE') {
        months[monthKey].expense += t.amount
        tExpense += t.amount
      } else if (t.type === 'REVENUE' || t.type === 'OTHER_INCOME') {
        months[monthKey].income += t.amount
        tIncome += t.amount
      }
    })

    const sortedData = Object.entries(months)
      .sort(([keyA], [keyB]) => {
        const [yearA, monthA] = keyA.split('-').map(Number)
        const [yearB, monthB] = keyB.split('-').map(Number)
        return (yearA - yearB) || (monthA - monthB)
      })
      .map(([, value]) => value)

    return {
      chartData: sortedData,
      totalIncome: tIncome,
      totalExpense: tExpense,
      netProfit: tIncome - tExpense
    }
  }, [data])

  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Pemasukan</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-blue-600 animate-in zoom-in duration-500 delay-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-blue-600/80 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Akumulasi semua periode
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Total Pengeluaran</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-red-600 animate-in zoom-in duration-500 delay-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</div>
            <p className="text-xs text-red-600/80 mt-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              Termasuk operasional & gaji
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Net Profit</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600 animate-in zoom-in duration-500 delay-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(netProfit)}</div>
            <p className="text-xs text-green-600/80 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Margin: {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4 shadow-md border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">Analisis Keuangan</CardTitle>
            <CardDescription>Grafik tren pemasukan vs pengeluaran per bulan</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                  formatter={(value: number | undefined) => [formatCurrency(value || 0), '']}
                  labelStyle={{ color: '#666', marginBottom: '0.5rem' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Pemasukan" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Pengeluaran" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Performance List */}
        <Card className="col-span-3 shadow-md border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">Performa Bulanan</CardTitle>
            <CardDescription>Ringkasan profitabilitas per periode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {chartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data transaksi untuk ditampilkan.
                </div>
              ) : (
                [...chartData].reverse().map((item, index) => {
                  const net = item.income - item.expense
                  const isPositive = net >= 0
                  const percentOfMax = Math.min(100, Math.max(10, (item.income / (Math.max(...chartData.map(d => d.income)) || 1)) * 100))
                  
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                        </div>
                        <div className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(net)}
                        </div>
                      </div>
                      
                      {/* Mini Progress Bar Visualization */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
                          <span>In: {formatCurrency(item.income)}</span>
                          <span>Out: {formatCurrency(item.expense)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(item.income / (item.income + item.expense || 1)) * 100}%` }}
                          />
                          <div 
                            className="h-full bg-red-400 rounded-r-full" 
                            style={{ width: `${(item.expense / (item.income + item.expense || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
