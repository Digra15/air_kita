'use server'

import { db } from "@/lib/db"
import { TransactionType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getTransactions(type?: TransactionType) {
    try {
        const where = type ? { type } : {}
        const transactions = await db.transaction.findMany({
            where,
            orderBy: {
                date: 'desc'
            }
        })
        
        return transactions.map(t => ({
            ...t,
            amount: t.amount.toNumber()
        }))
    } catch (error) {
        console.error("Failed to fetch transactions:", error)
        return []
    }
}

export async function createTransaction(data: {
    type: TransactionType
    amount: number
    category: string
    description: string
    date?: Date
}) {
    try {
        await db.transaction.create({
            data: {
                type: data.type,
                amount: data.amount,
                category: data.category,
                description: data.description,
                date: data.date || new Date()
            }
        })
        revalidatePath('/admin/finance')
        return { success: true, message: 'Transaksi berhasil ditambahkan' }
    } catch (error) {
        console.error("Failed to create transaction:", error)
        return { success: false, message: 'Gagal menambahkan transaksi' }
    }
}

export async function updateTransaction(id: string, data: {
    type: TransactionType
    amount: number
    category: string
    description: string
    date?: Date
}) {
    try {
        await db.transaction.update({
            where: { id },
            data: {
                type: data.type,
                amount: data.amount,
                category: data.category,
                description: data.description,
                date: data.date || new Date()
            }
        })
        revalidatePath('/admin/finance')
        return { success: true, message: 'Transaksi berhasil diperbarui' }
    } catch (error) {
        console.error("Failed to update transaction:", error)
        return { success: false, message: 'Gagal memperbarui transaksi' }
    }
}

export async function deleteTransaction(id: string) {
    try {
        await db.transaction.delete({
            where: { id }
        })
        revalidatePath('/admin/finance')
        return { success: true, message: 'Transaksi berhasil dihapus' }
    } catch (error) {
        console.error("Failed to delete transaction:", error)
        return { success: false, message: 'Gagal menghapus transaksi' }
    }
}

export async function getFinancialSummary() {
    try {
        const transactions = await db.transaction.findMany()
        
        const summary = {
            capital: 0,
            income: 0,
            expense: 0,
            revenue: 0
        }

        transactions.forEach(t => {
            const amount = t.amount.toNumber()
            if (t.type === 'CAPITAL') summary.capital += amount
            if (t.type === 'OTHER_INCOME') summary.income += amount
            if (t.type === 'EXPENSE') summary.expense += amount
            if (t.type === 'REVENUE') summary.revenue += amount
        })

        // Total Income includes Revenue + Other Income
        const totalIncome = summary.income + summary.revenue
        
        // Current Cash = (Capital + Income + Revenue) - Expense
        const currentCash = (summary.capital + totalIncome) - summary.expense

        return {
            ...summary,
            totalIncome,
            currentCash
        }
    } catch (error) {
        console.error("Failed to get financial summary:", error)
        return {
            capital: 0,
            income: 0,
            expense: 0,
            revenue: 0,
            totalIncome: 0,
            currentCash: 0
        }
    }
}
