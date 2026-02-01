"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportButtonProps {
  data: {
    id: string
    customerName: string
    meterNumber: string
    initialReading: number
    currentReading: number
    usageAmount: number
    billAmount: number
  }[]
  monthName: string
  year: number
  companyName: string
  companyAddress: string
}

export function ExportButton({ data, monthName, year, companyName, companyAddress }: ExportButtonProps) {
  const handleExport = async () => {
    // Dynamic import
    const jsPDF = (await import("jspdf")).default
    const autoTable = (await import("jspdf-autotable")).default

    // 1. Init PDF
    const doc = new jsPDF()

    // 2. Add Header Info
    const title = "DATA PEMAKAIAN AIR"
    const period = `PERIODE: ${monthName} ${year}`

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(title, 105, 15, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(companyName, 105, 22, { align: "center" })
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(companyAddress, 105, 27, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(0)
    doc.text(period, 14, 35)

    // 3. Prepare Data for Table
    const tableData = data.map((item, index) => [
      index + 1,
      item.customerName,
      item.meterNumber,
      item.initialReading.toLocaleString('id-ID'),
      item.currentReading.toLocaleString('id-ID'),
      `${item.usageAmount.toLocaleString('id-ID')} m³`,
      `Rp ${item.billAmount.toLocaleString('id-ID')}`
    ])

    // Calculate Totals
    const totalUsage = data.reduce((sum, item) => sum + item.usageAmount, 0)
    const totalBill = data.reduce((sum, item) => sum + item.billAmount, 0)

    // 4. Generate Table
    autoTable(doc, {
      startY: 40,
      head: [['No', 'Pelanggan', 'No. Meter', 'Awal', 'Akhir', 'Pemakaian', 'Total Pembayaran']],
      body: tableData,
      foot: [[
        '', 
        '', 
        '', 
        '', 
        'TOTAL', 
        `${totalUsage.toLocaleString('id-ID')} m³`, 
        `Rp ${totalBill.toLocaleString('id-ID')}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // Blue header
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
      },
    })

    // 5. Save PDF
    doc.save(`Data_Pemakaian_${monthName}_${year}.pdf`)
  }

  return (
    <Button 
      variant="outline" 
      className="text-slate-600 border-slate-200 hover:bg-slate-50"
      onClick={handleExport}
    >
      <Download className="mr-2 h-4 w-4" />
      Ekspor Data (PDF)
    </Button>
  )
}
