'use server'
import { db } from "@/lib/db"

export async function checkBill(query: string) {
    try {
        // Search by Meter Number OR Name (case-insensitive)
        const customers = await db.customer.findMany({
            where: {
                OR: [
                    { meterNumber: query },
                    { name: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: {
                bills: {
                    where: { status: 'UNPAID' },
                    include: { reading: true },
                    orderBy: { createdAt: 'desc' }
                }
            },
            take: 5 // Limit results to avoid overload if name is too generic
        })

        if (!customers || customers.length === 0) {
            return { success: false, message: 'Data pelanggan tidak ditemukan' }
        }

        // If multiple results (e.g. searching by name), we might need to handle it.
        // For now, let's map all results.
        
        const results = customers.map(customer => ({
            customer: {
                id: customer.id,
                name: customer.name,
                meterNumber: customer.meterNumber,
                address: customer.address
            },
            bills: customer.bills.map(bill => ({
                ...bill,
                amount: bill.amount.toNumber(),
                reading: {
                    ...bill.reading,
                    meterReading: bill.reading.meterReading.toNumber(),
                    usageAmount: bill.reading.usageAmount.toNumber()
                }
            }))
        }))

        return { success: true, results }
    } catch (error) {
        console.error("Error checking bill:", error)
        return { success: false, message: 'Terjadi kesalahan sistem' }
    }
}
