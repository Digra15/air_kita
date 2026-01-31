import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Search, LogIn } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            <Droplets className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Air Kita</h1>
          <p className="text-lg text-slate-600">
            Sistem Informasi Pembayaran & Manajemen Air Bersih
          </p>
        </div>

        <div className="grid gap-4 mt-8">
          <Link href="/cek-tagihan" className="block group">
            <Card className="border-blue-100 group-hover:shadow-md transition-shadow transition-colors group-hover:border-blue-200">
              <CardHeader className="flex flex-row items-center gap-4 pb-6 pt-6">
                <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-lg">Cek Tagihan</CardTitle>
                  <CardDescription>Lihat tagihan air bulan ini tanpa login</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/login" className="block group">
            <Card className="border-slate-100 group-hover:shadow-md transition-shadow transition-colors group-hover:border-slate-200">
              <CardHeader className="flex flex-row items-center gap-4 pb-6 pt-6">
                <div className="bg-slate-100 p-3 rounded-full group-hover:bg-slate-200 transition-colors">
                  <LogIn className="h-6 w-6 text-slate-600" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-lg">Masuk / Login</CardTitle>
                  <CardDescription>Akses dashboard pelanggan atau admin</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="pt-8 text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Air Kita. All rights reserved.
        </div>
      </div>
    </div>
  )
}
