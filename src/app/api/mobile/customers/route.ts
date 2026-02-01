import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query")

    const whereClause: any = {
      status: 'ACTIVE'
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { meterNumber: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ]
    }

    const customers = await db.customer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        meterNumber: true,
        address: true,
        tariff: {
          select: {
            name: true,
            ratePerCubic: true
          }
        }
      },
      take: 50 // Limit results
    })

    return NextResponse.json({ success: true, data: customers })

  } catch (error) {
    console.error("Mobile customers fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
