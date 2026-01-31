'use server'

import { db } from "@/lib/db"
import { BillStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getBills() {
    try {
        const bills = await db.bill.findMany({
            include: {
                customer: {
                    select: {
                        name: true,
                        meterNumber: true,
                    }
                },
                reading: {
                    select: {
                        month: true,
                        year: true,
                        usageAmount: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return bills
    } catch (error) {
        console.error("Failed to fetch bills:", error)
        return []
    }
}

export async function getBillById(id: string) {
    try {
        const bill = await db.bill.findUnique({
            where: { id },
            include: {
                customer: {
                    include: {
                        tariff: true
                    }
                },
                reading: true
            }
        })
        return bill
    } catch (error) {
        console.error("Failed to fetch bill:", error)
        return null
    }
}

export async function markAsPaid(billId: string) {
    try {
        await db.bill.update({
            where: { id: billId },
            data: {
                status: BillStatus.PAID,
                paidAt: new Date()
            }
        })
        revalidatePath('/admin/billing')
        return { success: true, message: 'Tagihan berhasil ditandai LUNAS' }
    } catch (error) {
        console.error("Failed to update bill:", error)
        return { success: false, message: 'Gagal mengupdate status tagihan' }
    }
}
