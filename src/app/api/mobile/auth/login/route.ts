import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { NextResponse } from "next/server"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 })
    }

    const { email, password } = validation.data
    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 401 })
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)
    if (!passwordsMatch) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // Return user info (excluding password)
    // In a real production app, you should issue a JWT token here.
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error("Mobile login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
