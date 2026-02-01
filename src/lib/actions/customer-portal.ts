'use server'
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

export async function getCustomerDashboardData() {
    try {
        const session = await auth()
        if (!session?.user?.email) return null

        // Find customer linked to user
        const customer = await db.customer.findFirst({
            where: { user: { email: session.user.email } },
            include: {
                tariff: true,
                bills: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { reading: true }
                },
                readings: {
                    orderBy: { recordedAt: 'desc' },
                    take: 12
                }
            }
        })

        const company = await db.systemSettings.findFirst()

        // Fetch all transactions for reports
        const allTransactions = await db.transaction.findMany({
            orderBy: { date: 'desc' }
        })

        const formattedTransactions = allTransactions.map(t => ({
            id: t.id,
            date: t.date.toISOString(),
            type: t.type,
            category: t.category,
            description: t.description,
            amount: Number(t.amount),
            referenceId: t.referenceId,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
        }))

        // Fetch usage data
        const readings = await db.meterReading.findMany({
            include: {
                customer: {
                    select: {
                        name: true,
                        meterNumber: true,
                        address: true
                    }
                }
            },
            orderBy: {
                year: 'desc'
            }
        })

        const formattedUsageData = readings.map(r => ({
            id: r.id,
            customer: r.customer,
            month: r.month,
            year: r.year,
            meterReading: Number(r.meterReading),
            usageAmount: Number(r.usageAmount),
            recordedAt: r.recordedAt.toISOString()
        })).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year
            return b.month - a.month
        })

        const reportsData = {
            transactions: formattedTransactions,
            usageData: formattedUsageData
        }

        if (!customer) {
            return {
                user: session.user,
                customer: null,
                unpaidBills: [],
                totalUnpaid: 0,
                readings: [],
                company,
                reportsData
            }
        }

        // Calculate stats
        const formattedBills = customer.bills.map(b => ({
            id: b.id,
            amount: Number(b.amount),
            status: b.status,
            createdAt: b.createdAt,
            reading: b.reading ? {
                month: b.reading.month,
                year: b.reading.year,
                meterReading: Number(b.reading.meterReading),
                usageAmount: Number(b.reading.usageAmount)
            } : undefined
        }))

        const unpaidBills = formattedBills.filter(b => b.status === 'UNPAID')
        const totalUnpaid = unpaidBills.reduce((acc, b) => acc + b.amount, 0)

        const formattedCustomer = {
            name: customer.name,
            tariff: {
                name: customer.tariff.name,
                ratePerCubic: Number(customer.tariff.ratePerCubic)
            },
            bills: formattedBills,
            readings: customer.readings.map(r => ({
                month: `${r.month}/${r.year}`,
                usage: Number(r.usageAmount)
            }))
        }

        return {
            user: session.user,
            customer: formattedCustomer,
            unpaidBills,
            totalUnpaid,
            readings: formattedCustomer.readings.slice().reverse(), // usage chart data
            company,
            reportsData
        }
    } catch (error) {
        console.error("Error fetching customer dashboard:", error)
        return null
    }
}

const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Email tidak valid"),
})

export async function updateProfile(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Anda harus login" }
        }

        const rawData = {
            name: formData.get("name"),
            email: formData.get("email"),
        }

        const validated = UpdateProfileSchema.safeParse(rawData)
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message }
        }

        const { name, email } = validated.data

        // Check if email is taken by another user
        if (email !== session.user.email) {
            const existing = await db.user.findUnique({ where: { email } })
            if (existing) {
                return { success: false, error: "Email sudah digunakan" }
            }
        }

        await db.user.update({
            where: { email: session.user.email },
            data: { name, email }
        })

        revalidatePath("/customer/dashboard")
        return { success: true, message: "Profil berhasil diperbarui" }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Gagal memperbarui profil" }
    }
}

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru tidak cocok",
    path: ["confirmPassword"],
})

export async function changePassword(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return { success: false, error: "Anda harus login" }
        }

        const rawData = {
            currentPassword: formData.get("currentPassword"),
            newPassword: formData.get("newPassword"),
            confirmPassword: formData.get("confirmPassword"),
        }

        const validated = ChangePasswordSchema.safeParse(rawData)
        if (!validated.success) {
            return { success: false, error: validated.error.issues[0].message }
        }

        const { currentPassword, newPassword } = validated.data

        const user = await db.user.findUnique({ where: { email: session.user.email } })
        if (!user || !user.password) {
            return { success: false, error: "User tidak ditemukan" }
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return { success: false, error: "Password saat ini salah" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await db.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword }
        })

        revalidatePath("/customer/dashboard")
        return { success: true, message: "Password berhasil diubah" }
    } catch (error) {
        console.error("Error changing password:", error)
        return { success: false, error: "Gagal mengubah password" }
    }
}
