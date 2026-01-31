'use server'

import { db } from "@/lib/db"
import { BillStatus, PaymentMethod, TransactionType } from "@prisma/client"
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
                        usageAmount: true,
                        meterReading: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return bills.map(bill => ({
            ...bill,
            amount: bill.amount.toNumber(),
            reading: {
                ...bill.reading,
                usageAmount: bill.reading.usageAmount.toNumber(),
                meterReading: bill.reading.meterReading.toNumber()
            }
        }))
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
        if (!bill) return null
        return {
            ...bill,
            amount: bill.amount.toNumber(),
            customer: {
                ...bill.customer,
                tariff: {
                    ...bill.customer.tariff,
                    ratePerCubic: bill.customer.tariff.ratePerCubic.toNumber(),
                    baseFee: bill.customer.tariff.baseFee.toNumber()
                }
            },
            reading: {
                ...bill.reading,
                meterReading: bill.reading.meterReading.toNumber(),
                usageAmount: bill.reading.usageAmount.toNumber()
            }
        }
    } catch (error) {
        console.error("Failed to fetch bill:", error)
        return null
    }
}

export async function markAsPaid(billId: string, paymentMethod: string = "CASH") {
    try {
        const method = paymentMethod.toUpperCase() as PaymentMethod
        
        // Update bill and fetch customer info for description
        const updatedBill = await db.bill.update({
            where: { id: billId },
            data: {
                status: BillStatus.PAID,
                paidAt: new Date(),
                paymentMethod: method
            },
            include: {
                customer: true,
                reading: true
            }
        })

        // Create Revenue Transaction
        await db.transaction.create({
            data: {
                type: TransactionType.REVENUE,
                amount: updatedBill.amount,
                category: "TAGIHAN",
                description: `Pembayaran Tagihan ${updatedBill.customer.name} (${updatedBill.reading.month}/${updatedBill.reading.year})`,
                referenceId: billId,
                date: new Date()
            }
        })

        revalidatePath('/admin/billing')
        revalidatePath('/admin/finance')
        return { success: true, message: 'Tagihan berhasil ditandai LUNAS' }
    } catch (error) {
        console.error("Failed to update bill:", error)
        return { success: false, message: 'Gagal mengupdate status tagihan' }
    }
}

export async function markAsUnpaid(billId: string) {
    try {
        await db.bill.update({
            where: { id: billId },
            data: {
                status: BillStatus.UNPAID,
                paidAt: null,
                paymentMethod: null
            }
        })

        // Delete associated transaction
        await db.transaction.deleteMany({
            where: {
                referenceId: billId,
                type: TransactionType.REVENUE
            }
        })

        revalidatePath('/admin/billing')
        revalidatePath('/admin/finance')
        return { success: true, message: 'Status tagihan dikembalikan ke BELUM BAYAR' }
    } catch (error) {
        console.error("Failed to update bill:", error)
        return { success: false, message: 'Gagal mengupdate status tagihan' }
    }
}
