import { generateBackup } from "@/lib/actions/backup"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // 1. Verify Authorization
    // Vercel Cron automatically sends a header `Authorization: Bearer <CRON_SECRET>`
    // You should define CRON_SECRET in your .env variables
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    // Allow if CRON_SECRET is set and matches, or if in development (optional, for testing)
    // Note: In production, ALWAYS set CRON_SECRET to prevent unauthorized access
    const isAuthorized = 
        (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
        process.env.NODE_ENV === "development" // Allow manual testing in dev

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 2. Check System Settings if Backup is Enabled
    const settings = await db.systemSettings.findFirst()
    
    if (!settings?.backupDaily) {
      return NextResponse.json({ 
        success: false, 
        message: "Automatic daily backup is disabled in settings" 
      })
    }

    // 3. Generate Backup
    const result = await generateBackup()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Backup created successfully", 
        data: result 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Cron backup error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error" 
    }, { status: 500 })
  }
}
