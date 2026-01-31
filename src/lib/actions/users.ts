"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/auth"

const CreateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
})

export async function createUser(prevState: any, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    }

    const validatedData = CreateUserSchema.safeParse(rawData)

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0].message,
      }
    }

    const { name, email, password, role } = validatedData.data

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "Email sudah terdaftar",
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User berhasil dibuat" }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Gagal membuat user" }
  }
}

export async function updateUserRole(userId: string, roleStr: string) {
  try {
    console.log("updateUserRole called with:", { userId, roleStr })
    
    const session = await auth()

    // Validate role manually to ensure it matches Prisma Enum
    const validRoles = Object.values(Role) as string[]
    if (!validRoles.includes(roleStr)) {
        console.error("Validation failed. Received:", roleStr, "Expected one of:", validRoles)
        return { success: false, error: `Role tidak valid: ${roleStr}` }
    }

    const newRole = roleStr as Role
    
    if (!session?.user) {
      return { success: false, error: "Anda harus login untuk melakukan tindakan ini" }
    }

    const currentUserRole = session.user.role as Role

    // Only SUPER_ADMIN and ADMIN can update roles
    if (currentUserRole !== Role.SUPER_ADMIN && currentUserRole !== Role.ADMIN) {
        return { success: false, error: "Anda tidak memiliki izin untuk mengubah role" }
    }

    // Get the target user to check their current role
    const targetUser = await db.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })

    if (!targetUser) {
        return { success: false, error: "User tidak ditemukan" }
    }

    // Rules for ADMIN:
    // 1. ADMIN cannot change role of a SUPER_ADMIN
    // 2. ADMIN cannot assign SUPER_ADMIN role
    if (currentUserRole === Role.ADMIN) {
        if (targetUser.role === Role.SUPER_ADMIN) {
            return { success: false, error: "Admin tidak dapat mengubah role Super Admin" }
        }
        if (newRole === Role.SUPER_ADMIN) {
            return { success: false, error: "Admin tidak dapat menjadikan user sebagai Super Admin" }
        }
    }

    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "Role user berhasil diperbarui" }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, error: `Gagal memperbarui role user: ${(error as Error).message}` }
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User berhasil dihapus" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Gagal menghapus user" }
  }
}

export async function getUsers() {
    try {
        const users = await db.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                customer: {
                    select: {
                        meterNumber: true
                    }
                }
            }
        })
        return { success: true, data: users }
    } catch (error) {
        console.error("Error fetching users:", error)
        return { success: false, error: "Gagal mengambil data user" }
    }
}
