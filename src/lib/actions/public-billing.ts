'use server'
import { db } from "@/lib/db"

export async function checkBillByMeterNumber(meterNumber: string) {
    try {
        const customer = await db.customer.findUnique({
            where: { meterNumber },
            include: {
                bills: {
                    where: { status: 'UNPAID' },
                    include: { reading: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!customer) {
            return { success: false, message: 'ID Pelanggan tidak ditemukan' }
        }

        return { success: true, customer, bills: customer.bills }
    } catch (error) {
        console.error("Error checking bill:", error)
        return { success: false, message: 'Terjadi kesalahan sistem' }
    }
}
