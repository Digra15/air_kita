"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Role } from "@prisma/client"

export async function getDatabaseInfo() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return { success: false, error: "Unauthorized" }
    }

    const dbUrl = process.env.DATABASE_URL || ""
    let host = "Unknown"
    let database = "Unknown"
    let port = "5432"
    let user = "Unknown"

    if (dbUrl) {
      try {
        // Handle postgres:// or postgresql://
        const url = new URL(dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://") ? dbUrl : `postgresql://${dbUrl}`)
        host = url.hostname
        database = url.pathname.replace(/^\//, '')
        port = url.port || "5432"
        user = url.username
      } catch (e) {
        console.error("Error parsing DATABASE_URL:", e)
      }
    }

    return {
      success: true,
      data: {
        host,
        database,
        port,
        user,
        poolSize: 20 // Default for Vercel/Neon usually, hard to get exact from pool object in server action without direct access
      }
    }
  } catch (error) {
    console.error("Error getting DB info:", error)
    return { success: false, error: "Failed to get database info" }
  }
}

export async function testDatabaseConnection() {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return { success: false, error: "Unauthorized" }
    }

    const start = performance.now()
    await db.$queryRaw`SELECT 1`
    const end = performance.now()
    const latency = Math.round(end - start)

    return {
      success: true,
      latency,
      message: "Koneksi stabil"
    }
  } catch (error) {
    console.error("Connection test failed:", error)
    return { success: false, error: "Koneksi gagal" }
  }
}
