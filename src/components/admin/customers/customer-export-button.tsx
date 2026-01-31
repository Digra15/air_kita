"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface CustomerExportButtonProps {
  data: {
    id: string
    meterNumber: string
    name: string
    address: string
    tariff?: { id: string; name: string } | null
    status: "ACTIVE" | "INACTIVE"
    phoneNumber?: string | null
  }[]
  companyName: string
  companyAddress: string
}

export function CustomerExportButton({ data, companyName, companyAddress }: CustomerExportButtonProps) {
  const handleExport = () => {
    // 1. Init PDF
    const doc = new jsPDF()

    // 2. Header Info
    // Title
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("DATA PELANGGAN", 105, 15, { align: "center" })

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

    // 3. Prepare Data for Table
    const tableData = data.map((customer, index) => {
        const status = customer.status === 'ACTIVE' ? 'AKTIF' : 'NON-AKTIF'
        
        return [
            index + 1,
            customer.name,
            customer.address,
            customer.meterNumber,
            customer.tariff?.name || '-',
            status
        ]
    })

    // 4. Generate Table
    autoTable(doc, {
      startY: 35,
      head: [['No', 'Nama Pelanggan', 'Alamat', 'No. Meter', 'Golongan', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
          fillColor: [41, 128, 185], // Blue color
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
      },
      styles: {
          fontSize: 9,
          cellPadding: 3,
      },
      columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' }
      },
      didDrawPage: (data) => {
          // Footer
          const pageCount = doc.getNumberOfPages()
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(
              `Halaman ${pageCount}`, 
              doc.internal.pageSize.width - 20, 
              doc.internal.pageSize.height - 10, 
              { align: "right" }
          )
          
          const today = new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
          })
          doc.text(
              `Dicetak pada: ${today}`, 
              20, 
              doc.internal.pageSize.height - 10
          )
      }
    })

    // 5. Save
    doc.save("Data_Pelanggan.pdf")
  }

  return (
    <Button 
      variant="outline" 
      className="text-blue-600 border-blue-200 hover:bg-blue-50"
      onClick={handleExport}
      title="Ekspor Data PDF"
    >
      <FileText className="h-4 w-4 mr-2" />
      Ekspor PDF
    </Button>
  )
}
