import { getFinancialSummary, getTransactions } from "@/lib/actions/finance"
import { FinancePageClient } from "@/components/admin/finance/finance-page-client"

export default async function FinancePage() {
    const summary = await getFinancialSummary()
    const transactions = await getTransactions()

    // Transform Decimal to number (already done in action, but ensuring type safety)
    const formattedTransactions = transactions.map(t => ({
        ...t,
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    }))

    return (
        <div className="space-y-6">
            <FinancePageClient 
                initialSummary={summary} 
                initialTransactions={formattedTransactions} 
            />
        </div>
    )
}
