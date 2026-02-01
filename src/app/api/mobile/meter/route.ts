import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerId, currentReading, month, year, initialReading } = body

    if (!customerId || currentReading === undefined || !month || !year) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Reuse logic from createReading (simplified for API)
    // 1. Get Customer
    const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: { tariff: true }
    })

    if (!customer) {
        return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 })
    }

    let previousReading = 0

    if (initialReading !== undefined && initialReading !== null) {
        previousReading = parseFloat(initialReading)
    } else {
        const lastReading = await db.meterReading.findFirst({
            where: { 
                customerId,
                OR: [
                    { year: year, month: month - 1 },
                    { year: year - 1, month: 12 }
                ]
            },
            orderBy: { recordedAt: 'desc' }
        })
        previousReading = lastReading ? Number(lastReading.meterReading) : 0
    }
    
    const current = parseFloat(currentReading)
    if (current < previousReading) {
        return NextResponse.json({ success: false, error: "Meteran akhir tidak boleh lebih kecil dari meteran awal" }, { status: 400 })
    }

    const usageAmount = current - previousReading
    
    // Calculate Bill
    let billAmount = customer.tariff.baseFee.toNumber()
    billAmount += usageAmount * customer.tariff.ratePerCubic.toNumber()

    // Create Transaction (Prisma Transaction)
    const result = await db.$transaction(async (tx) => {
        // Create Meter Reading
        const newReading = await tx.meterReading.create({
            data: {
                customerId,
                month,
                year,
                meterReading: current,
                usageAmount,
                recordedAt: new Date()
            }
        })

        // Create Bill
        const newBill = await tx.bill.create({
            data: {
                customerId,
                meterReadingId: newReading.id,
                amount: billAmount,
                status: 'UNPAID',
                dueDate: new Date(year, month, 20) // Due date 20th of next month roughly
            }
        })

        return { newReading, newBill }
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error) {
    console.error("Mobile meter submit error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
