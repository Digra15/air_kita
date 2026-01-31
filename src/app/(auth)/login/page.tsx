
import { Suspense } from 'react'
import LoginForm from '@/components/auth/login-form'
import { Droplets } from 'lucide-react'
import Link from 'next/link'
import { getSystemSettings } from "@/lib/data/settings"
import Image from "next/image"

export default async function LoginPage() {
  const settings = await getSystemSettings()
  const companyName = settings?.companyName || "Air Kita"
  const companyLogo = settings?.companyLogo
  const loginTitle = settings?.loginTitle || "Layanan Air Bersih Digital Terpercaya"
  const loginDescription = settings?.loginDescription || "Kelola pembayaran air Anda dengan mudah, cepat, dan aman melalui platform digital kami."

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-blue-600 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-400/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="relative w-10 h-10">
             {companyLogo ? (
               <Image src={companyLogo} alt="Logo" fill className="object-contain" />
             ) : (
               <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm w-full h-full flex items-center justify-center">
                 <Droplets className="h-6 w-6" />
               </div>
             )}
          </div>
          <span className="font-bold text-xl tracking-tight">{companyName}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold mb-4">{loginTitle}</h2>
          <p className="text-blue-100 text-lg">
            {loginDescription}
          </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
                <p className="text-slate-500 mt-2">
                    Masukkan detail akun Anda untuk masuk ke dashboard.
                </p>
            </div>
            
            <div className="mt-8">
              <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-slate-100 rounded-lg"></div>}>
                <LoginForm />
              </Suspense>
            </div>
            
            <p className="text-center text-sm text-slate-500 mt-6">
                <Link href="/" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2 hover:underline">
                    &larr; Kembali ke Beranda
                </Link>
            </p>
        </div>
      </div>
    </div>
  )
}
