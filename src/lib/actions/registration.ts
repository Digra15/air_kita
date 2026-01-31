'use server'

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { z } from "zod"
import { redirect } from "next/navigation"

const RegisterSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

export async function register(prevState: string | undefined, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validatedData = RegisterSchema.safeParse(rawData)

    if (!validatedData.success) {
      return validatedData.error.issues[0].message
    }

    const { name, email, password } = validatedData.data

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return "Email sudah terdaftar. Silakan login."
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.CUSTOMER,
      },
    })

  } catch (error) {
    console.error("Registration error:", error)
    return "Terjadi kesalahan saat mendaftar. Silakan coba lagi."
  }
  
  redirect('/login?registered=true')
}
