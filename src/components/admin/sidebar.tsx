'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Droplets,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { Role } from '@prisma/client'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    color: 'text-sky-500',
  },
  // {
  //   label: 'Manajemen User',
  //   icon: Shield,
  //   href: '/admin/users',
  //   color: 'text-red-500',
  //   roles: ['SUPER_ADMIN', 'ADMIN']
  // },
  {
    label: 'Administrasi',
    icon: Users,
    href: '/admin/customers',
    color: 'text-blue-500',
  },
  {
    label: 'Pemakaian',
    icon: Droplets,
    href: '/admin/usage',
    color: 'text-blue-500',
  },
  {
    label: 'Tagihan',
    icon: FileText,
    href: '/admin/billing',
    color: 'text-pink-700',
  },
  {
    label: 'Keuangan',
    icon: DollarSign,
    href: '/admin/finance',
    color: 'text-emerald-500',
  },
  {
    label: 'Laporan',
    icon: BarChart3,
    href: '/admin/reports',
    color: 'text-indigo-500',
  },
  {
    label: 'Pengaturan',
    icon: Settings,
    href: '/admin/settings',
    color: 'text-gray-500',
  },
]

import Image from 'next/image'

export function Sidebar({ 
  companyName = "Air Kita", 
  companyLogo,
  userRole 
}: { 
  companyName?: string, 
  companyLogo?: string | null,
  userRole?: string
}) {
  const pathname = usePathname()
  
  // Debug log to check role visibility
  console.log('Sidebar userRole:', userRole)

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white text-slate-800 border-r print:hidden">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin/dashboard" className="flex items-center pl-3 mb-10">
          <div className="relative w-10 h-10 mr-3 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
             {companyLogo ? (
               <Image src={companyLogo} alt="Logo" fill className="object-contain p-1" />
             ) : (
               <Droplets className="h-6 w-6 text-white" />
             )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">
                {companyName}
            </h1>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">Enterprise</span>
          </div>
        </Link>
        <div className="space-y-1">
          {routes.filter(route => !route.roles || (userRole && route.roles.includes(userRole))).map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                pathname === route.href 
                    ? "text-white bg-blue-600 shadow-md shadow-blue-200" 
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-white" : route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t">
         <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
            onClick={() => signOut({ callbackUrl: '/login' })}
         >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
         </Button>
      </div>
    </div>
  )
}
