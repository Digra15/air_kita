'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Droplets, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function CustomerNavbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/customer/dashboard" className="flex items-center mr-6">
          <Droplets className="h-6 w-6 text-blue-600 mr-2" />
          <span className="font-bold text-xl">Air Kita</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/customer/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/customer/bills"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Tagihan Saya
          </Link>
          <Link
            href="/customer/profile"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Profil
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  )
}
