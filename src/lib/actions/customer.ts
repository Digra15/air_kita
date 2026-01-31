'use server'

import { db } from "@/lib/db"
import { CustomerStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
  try {
    const customers = await db.customer.findMany({
      include: {
        tariff: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return customers
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return []
  }
}

export async function createCustomer(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const meterNumber = formData.get('meterNumber') as string
    const phone = formData.get('phone') as string
    const tariffId = formData.get('tariffId') as string
    
    // Create customer
    await db.customer.create({
      data: {
        name,
        address,
        meterNumber,
        phoneNumber: phone,
        tariffId,
        status: CustomerStatus.ACTIVE
      }
    })
    
    revalidatePath('/admin/customers')
    return { success: true, message: 'Pelanggan berhasil ditambahkan' }
  } catch (error) {
    console.error("Failed to create customer:", error)
    return { success: false, message: 'Gagal menambahkan pelanggan' }
  }
}

export async function updateCustomer(id: string, formData: FormData) {
    try {
      const name = formData.get('name') as string
      const address = formData.get('address') as string
      const phone = formData.get('phone') as string
      const status = formData.get('status') as CustomerStatus
      
      await db.customer.update({
        where: { id },
        data: {
          name,
          address,
          phoneNumber: phone,
          status
        }
      })
      
      revalidatePath('/admin/customers')
      return { success: true, message: 'Data pelanggan berhasil diperbarui' }
    } catch (error) {
      console.error("Failed to update customer:", error)
      return { success: false, message: 'Gagal memperbarui data pelanggan' }
    }
  }

export async function deleteCustomer(id: string) {
    try {
        await db.customer.delete({ where: { id } })
        revalidatePath('/admin/customers')
        return { success: true, message: 'Pelanggan berhasil dihapus' }
    } catch (error) {
        console.error("Failed to delete customer:", error)
        return { success: false, message: 'Gagal menghapus pelanggan' }
    }
}

export async function getTariffs() {
    try {
        const tariffs = await db.tariff.findMany()
        return tariffs
    } catch {
        return []
    }
}
