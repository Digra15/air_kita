import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// API GET: Ambil Meteran Terakhir (Untuk Meter Awal)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ success: false, error: "Missing customerId" }, { status: 400 });
  }

  try {
    const lastReading = await db.meterReading.findFirst({
        where: { customerId },
        orderBy: { recordedAt: 'desc' }
    });

    return NextResponse.json({
        success: true,
        data: {
            lastReading: lastReading ? Number(lastReading.meterReading) : 0
        }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

// API POST: Simpan Meteran Baru
export async function POST(req: Request) {
  console.log("MOBILE METER API: Request received");
  
  try {
    let body;
    try {
        const text = await req.text();
        body = JSON.parse(text);
    } catch (e) {
        return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { customerId, currentReading, month, year, initialReading, recordedAt } = body

    if (!customerId || currentReading === undefined || !month || !year) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: { tariff: true }
    })

    if (!customer) {
        return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 })
    }

    // Gunakan initialReading dari kiriman HP jika ada, kalau tidak cari sendiri
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

    const existingReading = await db.meterReading.findFirst({
        where: { customerId, month, year }
    })

    if (existingReading) {
        return NextResponse.json({ success: false, error: "Data meteran untuk periode ini sudah ada" }, { status: 400 })
    }

    const usageAmount = current - previousReading
    let billAmount = customer.tariff.baseFee.toNumber()
    billAmount += usageAmount * customer.tariff.ratePerCubic.toNumber()

    // Gunakan tanggal pencatatan dari HP atau default sekarang
    const recordDate = recordedAt ? new Date(recordedAt) : new Date();

    const result = await db.$transaction(async (tx) => {
        const newReading = await tx.meterReading.create({
            data: {
                customerId,
                month,
                year,
                meterReading: current,
                usageAmount,
                recordedAt: recordDate
            }
        })

        const newBill = await tx.bill.create({
            data: {
                customer: { connect: { id: customerId } },
                reading: { connect: { id: newReading.id } },
                amount: billAmount,
                status: 'UNPAID',
                dueDate: new Date(year, month + 1, 20) // Jatuh tempo tanggal 20 bulan depan
            }
        })

        return { newReading, newBill }
    })

    return NextResponse.json({ success: true, data: result })

  } catch (error: any) {
    console.error("MOBILE METER API: Critical Error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}