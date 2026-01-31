import { PrismaClient, Role, CustomerStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Admin User
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@airkita.com' },
    update: {},
    create: {
      email: 'admin@airkita.com',
      name: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log({ admin })

  // 2. Create Default Tariff (Rumah Tangga)
  const tariff = await prisma.tariff.create({
    data: {
      name: 'Rumah Tangga A',
      ratePerCubic: 3000,
      baseFee: 15000,
      description: 'Tarif untuk rumah tangga standar',
    },
  })
  console.log({ tariff })

  // 3. Create a Customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Budi Santoso',
      meterNumber: '100001',
      address: 'Jl. Merdeka No. 45',
      phoneNumber: '081234567890',
      status: CustomerStatus.ACTIVE,
      tariffId: tariff.id,
    },
  })
  console.log({ customer })

  // 4. Create User account for the Customer
  const customerPassword = await hash('user123', 12)
  const customerUser = await prisma.user.create({
    data: {
      email: 'budi@gmail.com',
      name: 'Budi Santoso',
      password: customerPassword,
      role: Role.CUSTOMER,
      customer: {
        connect: {
          id: customer.id
        }
      }
    }
  })
  console.log({ customerUser })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
