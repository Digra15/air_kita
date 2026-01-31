'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function getSystemSettings() {
  try {
    const settings = await db.systemSettings.findFirst()
    return settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

export async function getAdminUsers() {
  try {
    const users = await db.user.findMany({
      where: { 
        role: 'ADMIN' 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // Don't select password
      },
      orderBy: { createdAt: 'desc' }
    })
    return users
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return []
  }
}

export async function updateSystemSettings(data: any) {
  try {
    const settings = await db.systemSettings.findFirst()
    
    if (!settings) {
      await db.systemSettings.create({
        data: { ...data }
      })
    } else {
      await db.systemSettings.update({
        where: { id: settings.id },
        data: { ...data }
      })
    }
    
    revalidatePath("/admin/settings")
    revalidatePath("/admin", "layout") // To update sidebar globally
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function uploadCompanyLogo(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const extension = file.name.split('.').pop()
    const filename = `logo-${uuidv4()}.${extension}`
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignore if exists
    }

    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Update database
    const logoUrl = `/uploads/${filename}`
    
    const settings = await db.systemSettings.findFirst()
    if (settings) {
      await db.systemSettings.update({
        where: { id: settings.id },
        data: { companyLogo: logoUrl }
      })
    } else {
      await db.systemSettings.create({
        data: { companyLogo: logoUrl }
      })
    }

    revalidatePath("/admin/settings")
    revalidatePath("/admin", "layout")
    revalidatePath("/")
    
    return { success: true, url: logoUrl }
  } catch (error) {
    console.error("Error uploading logo:", error)
    return { success: false, error: "Failed to upload logo" }
  }
}
