import { getCustomers, getTariffs } from "@/lib/actions/customer"
import { CustomerTable } from "@/components/admin/customers/customer-table"
import { AddCustomerDialog } from "@/components/admin/customers/add-customer-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CustomersPage() {
  const customers = await getCustomers()
  const tariffs = await getTariffs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Pelanggan</h1>
        <AddCustomerDialog tariffs={tariffs} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerTable data={customers} />
        </CardContent>
      </Card>
    </div>
  )
}
