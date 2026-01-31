'use server'

import { db } from "@/lib/db"

export async function getDashboardStats() {
    try {
        const [
            totalRevenue,
            totalUsage,
            customerCount,
            recentSales,
            monthlyRevenue,
            unpaidBillsCount,
            monthlyUsage
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
            }),
            // Unpaid Bills (Pending Issues)
            db.bill.count({
                where: {
                    status: {
                        in: ['UNPAID', 'OVERDUE']
                    }
                }
            }),
            // Monthly Usage (Last 6 months)
            db.meterReading.findMany({
                where: {
                    recordedAt: {
                        gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                },
                select: {
                    usageAmount: true,
                    recordedAt: true
                }
            })
        ])

        // Process monthly revenue
        const monthlyStats = new Map<string, number>()
        const usageStats = new Map<string, number>()
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }) // e.g. "Jan 2026"
            monthlyStats.set(key, 0)
            usageStats.set(key, 0)
        }

        monthlyRevenue.forEach(bill => {
            if (bill.paidAt) {
                const key = bill.paidAt.toLocaleString('default', { month: 'short', year: 'numeric' })
                if (monthlyStats.has(key)) {
                    monthlyStats.set(key, monthlyStats.get(key)! + Number(bill.amount))
                }
            }
        })

        // Process monthly usage
        monthlyUsage.forEach(reading => {
            const key = reading.recordedAt.toLocaleString('default', { month: 'short', year: 'numeric' })
            if (usageStats.has(key)) {
                usageStats.set(key, usageStats.get(key)! + Number(reading.usageAmount))
            }
        })

        const graphData = Array.from(monthlyStats.entries()).map(([name, total]) => ({
            name,
            total
        }))

        const usageGraphData = Array.from(usageStats.entries()).map(([name, total]) => ({
            name,
            total
        }))

        return {
            totalRevenue: Number(totalRevenue._sum.amount || 0),
            totalUsage: Number(totalUsage._sum.usageAmount || 0),
            customerCount,
            recentSales,
            graphData,
            usageGraphData,
            unpaidBillsCount
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        throw error
    }
}

