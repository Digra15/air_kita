'use server'

import { db } from "@/lib/db"

export async function getDashboardStats() {
    try {
        const [
            totalRevenue,
            totalUsage,
            customerCount,
            recentSales,
            monthlyRevenue
        ] = await Promise.all([
            // Total Revenue (All time paid bills)
            db.bill.aggregate({
                where: { status: 'PAID' },
                _sum: { amount: true }
            }),
            // Total Usage (All time)
            db.meterReading.aggregate({
                _sum: { usageAmount: true }
            }),
            // Active Customers
            db.customer.count({
                where: { status: 'ACTIVE' }
            }),
            // Recent Paid Bills
            db.bill.findMany({
                where: { status: 'PAID' },
                orderBy: { paidAt: 'desc' },
                take: 5,
                include: {
                    customer: true
                }
            }),
            // Monthly Revenue (Last 6 months) - Grouping logic needed
            // Since Prisma grouping by date part is tricky, we'll fetch last 6 months bills and aggregate in JS
            db.bill.findMany({
                where: { 
                    status: 'PAID',
                    paidAt: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                },
                select: {
                    amount: true,
                    paidAt: true
                }
            })
        ])

        // Process monthly revenue
        const monthlyStats = new Map<string, number>()
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }) // e.g. "Jan 2026"
            monthlyStats.set(key, 0)
        }

        monthlyRevenue.forEach(bill => {
            if (bill.paidAt) {
                const key = bill.paidAt.toLocaleString('default', { month: 'short', year: 'numeric' })
                if (monthlyStats.has(key)) {
                    monthlyStats.set(key, monthlyStats.get(key)! + Number(bill.amount))
                }
            }
        })

        const graphData = Array.from(monthlyStats.entries()).map(([name, total]) => ({
            name,
            total
        }))

        return {
            totalRevenue: Number(totalRevenue._sum.amount || 0),
            totalUsage: Number(totalUsage._sum.usageAmount || 0),
            customerCount,
            recentSales,
            graphData
        }

    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        return {
            totalRevenue: 0,
            totalUsage: 0,
            customerCount: 0,
            recentSales: [],
            graphData: []
        }
    }
}
