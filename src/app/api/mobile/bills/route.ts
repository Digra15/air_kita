import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    const status = searchParams.get("status") // UNPAID, PAID

    const whereClause: any = {}
    if (customerId) whereClause.customerId = customerId
    if (status) whereClause.status = status

    const bills = await db.bill.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            meterNumber: true,
            address: true,
            tariff: {
              select: {
                name: true,
                ratePerCubic: true
              }
            }
          }
        },
        reading: {
          select: {
            month: true,
            year: true,
            usageAmount: true,
            meterReading: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const formattedBills = bills.map(bill => ({
        id: bill.id,
        amount: bill.amount.toNumber(),
        status: bill.status,
        dueDate: bill.dueDate,
        paidAt: bill.paidAt,
        customerName: bill.customer.name,
        meterNumber: bill.customer.meterNumber,
        month: bill.reading.month,
        year: bill.reading.year,
        usage: bill.reading.usageAmount.toNumber(),
        currentReading: bill.reading.meterReading.toNumber()
    }))

    return NextResponse.json({ success: true, data: formattedBills })

  } catch (error) {
    console.error("Mobile bills fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
