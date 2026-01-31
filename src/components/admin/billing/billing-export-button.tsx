"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { PaymentMethod } from "@prisma/client"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface BillingExportButtonProps {
  data: {
    id: string
    customer: {
        name: string
        meterNumber: string
    }
    reading: {
        month: number
        year: number
        usageAmount: number | string
        meterReading: number | string
    }
    dueDate: string
    amount: number | string
    status: "PAID" | "UNPAID" | "OVERDUE"
    paidAt: string | null
    paymentMethod: PaymentMethod | null
  }[]
  companyName: string
  companyAddress: string
  selectedMonth: string
  selectedYear: string
}

export function BillingExportButton({ data, companyName, companyAddress, selectedMonth, selectedYear }: BillingExportButtonProps) {
  const handleExport = () => {
    // 1. Init PDF
    const doc = new jsPDF()

    // 2. Prepare Header Info
    const now = new Date()
    
    let periodText = "SEMUA PERIODE"
    if (selectedMonth !== "all") {
        const monthIndex = parseInt(selectedMonth) - 1
        const year = selectedYear !== "all" ? parseInt(selectedYear) : now.getFullYear()
        
        const date = new Date()
        date.setMonth(monthIndex)
        date.setFullYear(year)
        
        periodText = format(date, "MMMM yyyy", { locale: id })
    } else if (selectedYear !== "all") {
        periodText = `TAHUN ${selectedYear}`
    }

    // Title
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("LAPORAN TAGIHAN AIR", 105, 15, { align: "center" })

    // Company Info
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(companyName, 105, 22, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100)
    doc.text(companyAddress, 105, 27, { align: "center" })
    
    // Reset Text Color
    doc.setTextColor(0)
    
    // Period
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Periode: ${periodText}`, 105, 35, { align: "center" })

    // 3. Prepare Data for Table
    const tableData = data.map((item, index) => {
        const status = item.status === 'PAID' ? 'LUNAS' : item.status === 'OVERDUE' ? 'TELAT' : 'BELUM'
        
        // Calculate Meter Readings
        const finalReading = Number(item.reading.meterReading)
        const usage = Number(item.reading.usageAmount)
        const initialReading = finalReading - usage

        return [
            index + 1,
            item.customer.name,
            initialReading.toLocaleString('id-ID'),
            finalReading.toLocaleString('id-ID'),
            `${usage.toLocaleString('id-ID')} m³`,
            `Rp ${Number(item.amount).toLocaleString('id-ID')}`,
            status
        ]
    })

    // Calculate Totals
    const totalUsage = data.reduce((sum, item) => sum + Number(item.reading.usageAmount), 0)
    const totalBill = data.reduce((sum, item) => sum + Number(item.amount), 0)

    // 4. Generate Table
    autoTable(doc, {
      startY: 40,
      head: [['No', 'Nama Pelanggan', 'Meter Awal', 'Meter Akhir', 'Pemakaian', 'Total Pembayaran Per Periode', 'Status']],
      body: tableData,
      foot: [[
        '', 
        '', 
        '', 
        'TOTAL', 
        `${totalUsage.toLocaleString('id-ID')} m³`, 
        `Rp ${totalBill.toLocaleString('id-ID')}`,
        ''
      ]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // Blue header
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'center' },
      },
    })

    // 5. Save PDF
    const filename = selectedMonth !== "all" 
        ? `Laporan_Tagihan_${periodText.replace(/ /g, "_")}.pdf`
        : `Laporan_Tagihan_Semua_Periode_${format(now, "yyyyMMdd")}.pdf`
        
    doc.save(filename)
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="text-slate-600 border-slate-200 hover:bg-slate-50"
      onClick={handleExport}
    >
      <Download className="mr-2 h-4 w-4" />
      Ekspor Data PDF
    </Button>
  )
}
