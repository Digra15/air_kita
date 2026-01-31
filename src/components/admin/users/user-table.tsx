"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash, UserCog } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { deleteUser, updateUserRole } from "@/lib/actions/users"
import { Role } from "@prisma/client"
import { toast } from "sonner"
import { useState } from "react"

interface UserTableProps {
  data: {
    id: string
    name: string | null
    email: string
    role: Role
    createdAt: Date
    customer?: {
        meterNumber: string
    } | null
  }[]
}

export function UserTable({ data }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<UserTableProps['data'][0] | null>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | "">("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete(id: string) {
      if(confirm('Apakah Anda yakin ingin menghapus user ini?')) {
          const result = await deleteUser(id)
          if (result.success) {
            toast.success(result.message)
          } else {
            toast.error(result.error)
          }
      }
  }

  function openRoleDialog(user: UserTableProps['data'][0]) {
      setEditingUser(user)
      setSelectedRole(user.role)
      setIsRoleDialogOpen(true)
  }

  async function handleRoleSave() {
      if (!editingUser || !selectedRole) return

      setIsLoading(true)
      const result = await updateUserRole(editingUser.id, selectedRole as Role)
      setIsLoading(false)
      
      if (result.success) {
        toast.success(result.message)
        setIsRoleDialogOpen(false)
        setEditingUser(null)
      } else {
        toast.error(result.error)
      }
  }

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'default'
      case 'ADMIN': return 'secondary'
      case 'METER_READER': return 'outline'
      case 'TREASURER': return 'destructive'
      default: return 'outline'
    }
  }

  const roleLabels: Record<Role, string> = {
      SUPER_ADMIN: "Super Admin",
      ADMIN: "Admin",
      METER_READER: "Input Meter",
      TREASURER: "Bendahara",
      CUSTOMER: "Customer"
  }

  return (
    <>
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ubah Role User</DialogTitle>
            <DialogDescription>
              Pilih role baru untuk user {editingUser?.name || editingUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val as Role)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="METER_READER">Input Meter</SelectItem>
                  <SelectItem value="TREASURER">Bendahara</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Batal</Button>
            <Button onClick={handleRoleSave} disabled={isLoading}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Belum ada data user.
                </TableCell>
              </TableRow>
            ) : (
              data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                      {user.name || '-'}
                      {user.customer && (
                          <div className="text-xs text-muted-foreground">
                              Meter: {user.customer.meterNumber}
                          </div>
                      )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeColor(user.role)}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        
                        <DropdownMenuItem onSelect={(e) => {
                            e.preventDefault()
                            openRoleDialog(user)
                        }}>
                          <UserCog className="mr-2 h-4 w-4" /> Ubah Role
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onSelect={(e) => {
                             e.preventDefault()
                             handleDelete(user.id)
                        }}>
                          <Trash className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
