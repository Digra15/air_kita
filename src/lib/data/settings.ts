import { db } from "@/lib/db"
import { cache } from "react"

export const getSystemSettings = cache(async function() {
  try {
    let settings = await db.systemSettings.findFirst()
    
    if (!settings) {
      settings = await db.systemSettings.create({
        data: {} // Uses defaults
      })
    }
    
    // Convert Date objects to strings for serialization
    return {
        ...settings,
        updatedAt: settings.updatedAt.toISOString()
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
})
