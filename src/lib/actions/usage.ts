'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { BillStatus } from "@prisma/client"

export async function getCustomersForSelect() {
    try {
        return await db.customer.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                meterNumber: true,
                tariff: {
                    select: {
                        name: true,
                        ratePerCubic: true,
                        baseFee: true
                    }
                }
            }
        })
    } catch {
        return []
    }
}

export async function getRecentReadings() {
    try {
        return await db.meterReading.findMany({
            take: 10,
            orderBy: { recordedAt: 'desc' },
            include: {
                customer: true,
                bill: true
            }
        })
    } catch {
        return []
    }
}

export async function createReading(formData: FormData) {
    try {
        const customerId = formData.get('customerId') as string
        const month = parseInt(formData.get('month') as string)
        const year = parseInt(formData.get('year') as string)
        const currentReading = parseFloat(formData.get('currentReading') as string)
        const readingDate = new Date(formData.get('readingDate') as string)

        // 1. Get Customer & Previous Reading
        const customer = await db.customer.findUnique({
            where: { id: customerId },
            include: { tariff: true }
        })

        if (!customer) throw new Error('Pelanggan tidak ditemukan')

        // Find previous reading (last month or latest)
        const lastReading = await db.meterReading.findFirst({
            where: { 
                customerId,
                OR: [
                    { year: year, month: month - 1 }, // Previous month same year
                    { year: year - 1, month: 12 }     // Dec prev year if Jan
                ]
             },
            orderBy: { recordedAt: 'desc' }
        })
        
        // If no previous reading, assume 0 or handle logic (e.g. initial meter)
        const previousReading = lastReading ? Number(lastReading.meterReading) : 0
        
        if (currentReading < previousReading) {
            return { success: false, message: 'Meteran akhir tidak boleh lebih kecil dari meteran awal' }
        }

        const usageAmount = currentReading - previousReading
        
        // 2. Calculate Bill Amount
        const rate = Number(customer.tariff.ratePerCubic)
        const baseFee = Number(customer.tariff.baseFee)
        const billAmount = (usageAmount * rate) + baseFee

        // 3. Create Reading & Bill Transaction
        await db.$transaction(async (tx) => {
            const reading = await tx.meterReading.create({
                data: {
                    customerId,
                    month,
                    year,
                    recordedAt: readingDate,
                    meterReading: currentReading,
                    usageAmount
                }
            })

            // Generate Due Date (e.g., 20th of next month)
            const dueDate = new Date(year, month, 20) // month is 1-based index in UI, but Date uses 0-11. 
            // Wait, if input month is 10 (Oct), dueDate should be Oct 20 or Nov 20? 
            // Usually bill is for previous usage. Let's assume dueDate is 20th of THIS input month.

            await tx.bill.create({
                data: {
                    customerId,
                    readingId: reading.id,
                    amount: billAmount,
                    dueDate: dueDate,
                    status: BillStatus.UNPAID
                }
            })
        })

        revalidatePath('/admin/usage')
        revalidatePath('/admin/billing')
        return { success: true, message: 'Pencatatan berhasil & Tagihan dibuat' }

    } catch (error) {
        console.error("Failed to create reading:", error)
        // Check for unique constraint violation
        if (typeof error === 'object' && error && 'code' in error && (error as { code: string }).code === 'P2002') {
             return { success: false, message: 'Data meteran untuk periode ini sudah ada.' }
        }
        return { success: false, message: 'Gagal menyimpan data' }
    }
}
