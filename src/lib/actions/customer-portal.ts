'use server'
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function getCustomerDashboardData() {
    try {
        const session = await auth()
        if (!session?.user?.email) return null

        // Find customer linked to user
        const customer = await db.customer.findFirst({
            where: { user: { email: session.user.email } },
            include: {
                tariff: true,
                bills: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { reading: true }
                },
                readings: {
                    orderBy: { recordedAt: 'desc' },
                    take: 12
                }
            }
        })

        if (!customer) return null

        // Calculate stats
        const unpaidBills = customer.bills.filter(b => b.status === 'UNPAID')
        const totalUnpaid = unpaidBills.reduce((acc, b) => acc + Number(b.amount), 0)

        return {
            customer,
            unpaidBills,
            totalUnpaid,
            readings: customer.readings.reverse().map(r => ({
                month: `${r.month}/${r.year}`,
                usage: Number(r.usageAmount)
            }))
        }
    } catch (error) {
        console.error("Error fetching customer dashboard:", error)
        return null
    }
}
