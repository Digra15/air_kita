'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Droplets, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import Image from "next/image"

export function CustomerNavbar({ 
  companyName = "Air Kita", 
  companyLogo
}: { 
  companyName?: string, 
  companyLogo?: string | null 
}) {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/customer/dashboard" className="flex items-center mr-6">
            <div className="relative w-8 h-8 mr-2 flex items-center justify-center bg-blue-600 rounded-lg shadow-md shadow-blue-200">
             {companyLogo ? (
               <Image src={companyLogo} alt="Logo" fill className="object-contain p-1" />
             ) : (
               <Droplets className="h-5 w-5 text-white" />
             )}
          </div>
          <span className="font-bold text-xl">{companyName}</span>
        </Link>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/customer/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
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
