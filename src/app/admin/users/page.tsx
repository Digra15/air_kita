import { getUsers } from "@/lib/actions/users"
import { UserTable } from "@/components/admin/users/user-table"
import { AddUserDialog } from "@/components/admin/users/add-user-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UsersPage() {
  const result = await getUsers()
  const users = (result.success && result.data) ? result.data : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
        <AddUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable data={users} />
        </CardContent>
      </Card>
    </div>
  )
}
