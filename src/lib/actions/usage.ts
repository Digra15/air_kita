'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { BillStatus } from "@prisma/client"

export async function getCustomersForSelect() {
    try {
        const customers = await db.customer.findMany({
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
        return customers.map(c => ({
            ...c,
            tariff: {
                ...c.tariff,
                ratePerCubic: c.tariff.ratePerCubic.toNumber(),
                baseFee: c.tariff.baseFee.toNumber()
            }
        }))
    } catch {
        return []
    }
}

export async function getRecentReadings() {
    try {
        const readings = await db.meterReading.findMany({
            take: 10,
            orderBy: { recordedAt: 'desc' },
            include: {
                customer: true,
                bill: true
            }
        })
        return readings.map(r => ({
            ...r,
            meterReading: r.meterReading.toNumber(),
            usageAmount: r.usageAmount.toNumber(),
            bill: r.bill ? {
                ...r.bill,
                amount: r.bill.amount.toNumber()
            } : null
        }))
    } catch {
        return []
    }
}

export async function getReadings(month: number, year: number, search?: string) {
    try {
        const whereClause: any = {
            month,
            year,
        }

        if (search) {
            whereClause.customer = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { meterNumber: { contains: search, mode: 'insensitive' } }
                ]
            }
        }

        const readings = await db.meterReading.findMany({
            where: whereClause,
            orderBy: { recordedAt: 'desc' },
            include: {
                customer: true,
                bill: true
            }
        })

        return readings.map(r => ({
            id: r.id,
            customerId: r.customerId,
            customerName: r.customer.name,
            meterNumber: r.customer.meterNumber,
            currentReading: r.meterReading.toNumber(),
            usageAmount: r.usageAmount.toNumber(),
            initialReading: r.meterReading.toNumber() - r.usageAmount.toNumber(),
            recordedAt: r.recordedAt,
            billAmount: r.bill?.amount ? r.bill.amount.toNumber() : 0
        }))
    } catch {
        return []
    }
}

export async function getUsageStats(month: number, year: number) {
    try {
        const totalCustomers = await db.customer.count({
            where: { status: 'ACTIVE' }
        })

        const recordedCount = await db.meterReading.count({
            where: { month, year }
        })

        const percentage = totalCustomers > 0 ? Math.round((recordedCount / totalCustomers) * 100) : 0
        const remaining = Math.max(0, totalCustomers - recordedCount)

        return {
            totalCustomers,
            recordedCount,
            percentage,
            remaining
        }
    } catch {
        return {
            totalCustomers: 0,
            recordedCount: 0,
            percentage: 0,
            remaining: 0
        }
    }
}

export async function getPreviousReading(customerId: string, month: number, year: number) {
    try {
        // Calculate previous month
        let prevMonth = month - 1
        let prevYear = year
        
        if (prevMonth === 0) {
            prevMonth = 12
            prevYear = year - 1
        }

        const reading = await db.meterReading.findFirst({
            where: {
                customerId,
                month: prevMonth,
                year: prevYear
            },
            select: {
                meterReading: true
            }
        })

        return reading ? reading.meterReading.toNumber() : null
    } catch {
        return null
    }
}

export async function createReading(formData: FormData) {
    try {
        const customerId = formData.get('customerId') as string
        const month = parseInt(formData.get('month') as string)
        const year = parseInt(formData.get('year') as string)
        const currentReading = parseFloat(formData.get('currentReading') as string)
        const initialReadingInput = formData.get('initialReading') as string
        const readingDate = new Date(formData.get('readingDate') as string)

        // 1. Get Customer & Previous Reading
        const customer = await db.customer.findUnique({
            where: { id: customerId },
            include: { tariff: true }
        })

        if (!customer) throw new Error('Pelanggan tidak ditemukan')

        let previousReading = 0

        // Check if initial reading is provided manually
        if (initialReadingInput && initialReadingInput.trim() !== '') {
            previousReading = parseFloat(initialReadingInput)
        } else {
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
            
            // If no previous reading, assume 0
            previousReading = lastReading ? Number(lastReading.meterReading) : 0
        }
        
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

export async function deleteReading(id: string) {
    try {
        // Delete reading (cascade should handle bill deletion if configured, 
        // but let's be safe and delete bill first or rely on cascade)
        // Schema: Bill has readingId unique. 
        // Deleting reading might fail if bill exists unless onDelete: Cascade is set.
        // Let's check schema first. Assuming Cascade or manual delete.
        
        // Manual cleanup approach for safety
        await db.$transaction(async (tx) => {
            const bill = await tx.bill.findFirst({ where: { readingId: id } })
            if (bill) {
                if (bill.status === BillStatus.PAID) {
                    throw new Error("Tagihan sudah dibayar, tidak bisa dihapus")
                }
                await tx.bill.delete({ where: { id: bill.id } })
            }
            await tx.meterReading.delete({ where: { id } })
        })

        revalidatePath('/admin/usage')
        revalidatePath('/admin/billing')
        return { success: true, message: 'Riwayat pencatatan berhasil dihapus' }
    } catch (error: any) {
        console.error("Failed to delete reading:", error)
        return { success: false, message: error.message || 'Gagal menghapus data' }
    }
}