import { PrismaClient, Role, CustomerStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Create Admin User
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@airkita.com' },
    update: {
      password: adminPassword,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@airkita.com',
      name: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })
  console.log({ admin })

  // 2. Create Default Tariff (Rumah Tangga)
  const existingTariff = await prisma.tariff.findFirst({ where: { name: 'Rumah Tangga A' } })
  let tariff
  
  if (!existingTariff) {
      tariff = await prisma.tariff.create({
        data: {
          name: 'Rumah Tangga A',
          ratePerCubic: 3000,
          baseFee: 15000,
          description: 'Tarif untuk rumah tangga standar',
        },
      })
      console.log({ tariff })
  } else {
      tariff = existingTariff
      console.log('Tariff already exists:', tariff)
  }

  // 3. Create a Customer
  const existingCustomer = await prisma.customer.findUnique({ where: { meterNumber: '100001' } })
  let customer
  
  if (!existingCustomer) {
      customer = await prisma.customer.create({
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
  } else {
      customer = existingCustomer
      console.log('Customer already exists:', customer)
  }

  // 4. Create User account for the Customer
  const customerPassword = await hash('user123', 12)
  const existingCustomerUser = await prisma.user.findUnique({ where: { email: 'budi@gmail.com' } })
  
  if (!existingCustomerUser) {
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
  } else {
      console.log('Customer User already exists')
  }
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
