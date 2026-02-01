"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { BackupStatus } from "@prisma/client"
import fs from "fs/promises"
import path from "path"

export async function generateBackup() {
  try {
    const [
      systemSettings,
      users,
      tariffs,
      customers,
      meterReadings,
      bills,
      transactions
    ] = await Promise.all([
      db.systemSettings.findFirst(),
      db.user.findMany(),
      db.tariff.findMany(),
      db.customer.findMany(),
      db.meterReading.findMany(),
      db.bill.findMany(),
      db.transaction.findMany(),
    ])

    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        systemSettings: systemSettings ? [systemSettings] : [],
        users,
        tariffs,
        customers,
        meterReadings,
        bills,
        transactions
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2)
    const fileSize = `${(Buffer.byteLength(jsonString) / 1024).toFixed(2)} KB`
    const fileName = `backup-air-kita-${new Date().toISOString().replace(/[:.]/g, '-')}.json`

    // Save file to local storage (backups directory)
    const backupDir = path.join(process.cwd(), "backups")
    try {
      await fs.access(backupDir)
    } catch {
      await fs.mkdir(backupDir, { recursive: true })
    }
    
    await fs.writeFile(path.join(backupDir, fileName), jsonString)

    // Save backup history
    await db.backupHistory.create({
      data: {
        fileName,
        fileSize,
        status: BackupStatus.SUCCESS,
      }
    })

    return { success: true, data: jsonString, fileName }
  } catch (error) {
    console.error("Backup generation error:", error)
    // Try to record failure if DB is accessible
    try {
        await db.backupHistory.create({
            data: {
              fileName: `backup-failed-${new Date().toISOString()}`,
              fileSize: "0 KB",
              status: BackupStatus.FAILED,
            }
        })
    } catch(e) { /* ignore */ }
    
    return { success: false, error: "Failed to create backup" }
  }
}

export async function createBackup() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return { success: false, error: "Unauthorized" }
    }

    const result = await generateBackup()
    
    if (result.success) {
      revalidatePath("/admin/settings")
    }
    
    return result
  } catch (error) {
    console.error("Backup error:", error)
    return { success: false, error: "Failed to create backup" }
  }
}

export async function downloadBackup(id: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return { success: false, error: "Unauthorized" }
    }

    const backup = await db.backupHistory.findUnique({
      where: { id }
    })

    if (!backup) {
      return { success: false, error: "Backup not found" }
    }

    const backupDir = path.join(process.cwd(), "backups")
    const filePath = path.join(backupDir, backup.fileName)
    
    try {
      const content = await fs.readFile(filePath, "utf-8")
      return { success: true, data: content, fileName: backup.fileName }
    } catch (error) {
      console.error("File read error:", error)
      return { success: false, error: "Backup file not found on server" }
    }
  } catch (error) {
    console.error("Download backup error:", error)
    return { success: false, error: "Failed to download backup" }
  }
}

export async function getBackupHistory() {
  try {
    const history = await db.backupHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10 // Last 10 backups
    })
    return { success: true, data: history }
  } catch (error) {
    console.error("Error fetching backup history:", error)
    return { success: false, error: "Failed to fetch backup history" }
  }
}

export async function restoreBackup(jsonString: string) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN)) {
      return { success: false, error: "Unauthorized" }
    }

    const backup = JSON.parse(jsonString)
    
    if (!backup.data) {
      return { success: false, error: "Invalid backup format" }
    }

    const {
      systemSettings,
      users,
      tariffs,
      customers,
      meterReadings,
      bills,
      transactions
    } = backup.data

    // 1. System Settings
    if (systemSettings?.length > 0) {
      const setting = systemSettings[0]
      await db.systemSettings.upsert({
        where: { id: setting.id },
        update: { ...setting, updatedAt: new Date() },
        create: { ...setting, updatedAt: new Date() }
      })
    }

    // 2. Tariffs
    if (tariffs?.length > 0) {
      for (const item of tariffs) {
        await db.tariff.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }

    // 3. Users
    if (users?.length > 0) {
      for (const item of users) {
        await db.user.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }

    // 4. Customers
    if (customers?.length > 0) {
      for (const item of customers) {
        // Ensure dependencies exist (User, Tariff)
        // If user or tariff missing in DB, this might fail if foreign key constraint enforces it.
        // Assuming backup is consistent and we restored Users and Tariffs first.
        
        // Handle optional relations (userId can be null)
        // We need to make sure we don't try to connect to non-existent user if user was deleted in DB but exists in backup (we just restored it).
        
        await db.customer.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }

    // 5. Meter Readings
    if (meterReadings?.length > 0) {
      for (const item of meterReadings) {
        await db.meterReading.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }

    // 6. Bills
    if (bills?.length > 0) {
      for (const item of bills) {
        await db.bill.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }

    // 7. Transactions
    if (transactions?.length > 0) {
      for (const item of transactions) {
        await db.transaction.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }

    revalidatePath("/")
    return { success: true, message: "Database restored successfully" }
  } catch (error) {
    console.error("Restore error:", error)
    return { success: false, error: `Restore failed: ${(error as Error).message}` }
  }
}
