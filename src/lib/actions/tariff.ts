'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getTariffs() {
  try {
    const tariffs = await db.tariff.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
            select: { customers: true }
        }
      }
    })
    return tariffs
  } catch (error) {
    console.error("Failed to fetch tariffs:", error)
    return []
  }
}

export async function createTariff(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const ratePerCubic = parseFloat(formData.get('ratePerCubic') as string)
    const baseFee = parseFloat(formData.get('baseFee') as string)
    const description = formData.get('description') as string
    
    await db.tariff.create({
      data: {
        name,
        ratePerCubic,
        baseFee,
        description
      }
    })
    
    revalidatePath('/admin/tariffs')
    return { success: true, message: 'Tarif berhasil ditambahkan' }
  } catch (error) {
    console.error("Failed to create tariff:", error)
    return { success: false, message: 'Gagal menambahkan tarif' }
  }
}

export async function updateTariff(id: string, formData: FormData) {
    try {
      const name = formData.get('name') as string
      const ratePerCubic = parseFloat(formData.get('ratePerCubic') as string)
      const baseFee = parseFloat(formData.get('baseFee') as string)
      const description = formData.get('description') as string
      
      await db.tariff.update({
        where: { id },
        data: {
          name,
          ratePerCubic,
          baseFee,
          description
        }
      })
      
      revalidatePath('/admin/tariffs')
      return { success: true, message: 'Tarif berhasil diperbarui' }
    } catch (error) {
      console.error("Failed to update tariff:", error)
      return { success: false, message: 'Gagal memperbarui tarif' }
    }
  }

export async function deleteTariff(id: string) {
    try {
        // Check if tariff is used
        const tariff = await db.tariff.findUnique({
            where: { id },
            include: { _count: { select: { customers: true } } }
        })

        if (tariff && tariff._count.customers > 0) {
            return { success: false, message: 'Gagal: Tarif sedang digunakan oleh pelanggan' }
        }

        await db.tariff.delete({ where: { id } })
        revalidatePath('/admin/tariffs')
        return { success: true, message: 'Tarif berhasil dihapus' }
    } catch (error) {
        console.error("Failed to delete tariff:", error)
        return { success: false, message: 'Gagal menghapus tarif' }
    }
}
