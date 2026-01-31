import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "SUPER_ADMIN" | "ADMIN" | "METER_READER" | "TREASURER" | "CUSTOMER"
    } & DefaultSession["user"]
  }

  interface User {
    role: "SUPER_ADMIN" | "ADMIN" | "METER_READER" | "TREASURER" | "CUSTOMER"
  }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "SUPER_ADMIN" | "ADMIN" | "METER_READER" | "TREASURER" | "CUSTOMER"
        id: string
    }
}
