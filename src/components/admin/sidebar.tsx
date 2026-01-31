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

interface Route {
  label: string
  icon: any
  href: string
  color: string
  roles?: string[]
}

const routes: Route[] = [
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
      <div className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar">
        <Link href="/admin/dashboard" className="flex items-center pl-3 mb-10">
          <div className="relative w-10 h-10 mr-3 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
             {companyLogo ? (
               <Image src={companyLogo} alt="Logo" fill className="object-contain p-1" />
             ) : (
               <Droplets className="h-6 w-6 text-white" />
             )}
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              {companyName}
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Admin Portal</p>
          </div>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            if (route.roles && userRole && !route.roles.includes(userRole as any)) {
              return null;
            }
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200",
                  pathname === route.href ? "text-blue-600 bg-blue-50 font-semibold shadow-sm shadow-blue-100" : "text-slate-500"
                )}
              >
                <div className={cn("flex items-center flex-1")}>
                  <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color, pathname === route.href ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} />
                  {route.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="px-3 py-2 border-t bg-slate-50/50">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200 mx-1 mb-2">
            <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 opacity-80" />
                <p className="text-xs font-semibold opacity-90">Keamanan Sistem</p>
            </div>
            <p className="text-[10px] opacity-75 leading-relaxed">
                Sistem terenkripsi dan aman. Jangan bagikan kredensial Anda.
            </p>
        </div>
        <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            onClick={() => signOut({ callbackUrl: '/login' })}
        >
            <LogOut className="h-5 w-5 mr-3" />
            Keluar
        </Button>
      </div>
    </div>
  )
}
