import { getCustomerDashboardData } from "@/lib/actions/customer-portal"
import { CustomerDashboardClient } from "@/components/customer/dashboard-client"

export const dynamic = 'force-dynamic'

export default async function CustomerDashboard() {
    const data = await getCustomerDashboardData()

    if (!data) return null

    return <CustomerDashboardClient data={data} />
}
