
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Search, LogIn, ShieldCheck, Clock, CreditCard, ArrowRight } from "lucide-react"
import { getSystemSettings } from "@/lib/data/settings"
import Image from "next/image"

export default async function Home() {
  const settings = await getSystemSettings()
  const companyName = settings?.companyName || "Air Kita"
  const companyLogo = settings?.companyLogo
  const heroTitle = settings?.heroTitle || "Kelola Tagihan Air Anda dengan Mudah & Cepat"
  const heroDescription = settings?.heroDescription || `Pantau penggunaan air, cek tagihan bulanan, dan lakukan pembayaran dengan mudah melalui platform digital ${companyName}.`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
               {companyLogo ? (
                 <Image src={companyLogo} alt="Logo" fill className="object-contain" />
               ) : (
                 <div className="bg-blue-600 p-2 rounded-lg w-full h-full flex items-center justify-center">
                   <Droplets className="h-6 w-6 text-white" />
                 </div>
               )}
            </div>
            <span className="font-bold text-xl text-slate-900">{companyName}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Masuk</Button>
            </Link>
            <Link href="/cek-tagihan">
              <Button className="bg-blue-600 hover:bg-blue-700">Cek Tagihan</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10" />
          
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistem Pembayaran Air Modern
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
              {heroTitle}
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              {heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link href="/cek-tagihan">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all">
                  <Search className="mr-2 h-5 w-5" />
                  Cek Tagihan Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                  <LogIn className="mr-2 h-5 w-5" />
                  Masuk ke Akun
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Kenapa Memilih Tirta Asri?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Kami berkomitmen memberikan pelayanan terbaik untuk kebutuhan air bersih Anda dengan teknologi terkini.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg shadow-slate-200/50 bg-slate-50/50 hover:bg-white transition-colors duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <CardTitle>Cek Real-time</CardTitle>
                  <CardDescription>
                    Lihat tagihan dan riwayat pemakaian air Anda kapan saja secara real-time tanpa perlu antri.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-lg shadow-slate-200/50 bg-slate-50/50 hover:bg-white transition-colors duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>Data Aman</CardTitle>
                  <CardDescription>
                    Sistem keamanan terenkripsi menjamin kerahasiaan data pribadi dan transaksi pembayaran Anda.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-lg shadow-slate-200/50 bg-slate-50/50 hover:bg-white transition-colors duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <CardTitle>Transparan</CardTitle>
                  <CardDescription>
                    Rincian biaya yang jelas dan transparan. Tidak ada biaya tersembunyi dalam tagihan Anda.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl font-bold mb-6">Siap untuk Memulai?</h2>
                <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-lg">
                    Bergabunglah dengan ribuan pelanggan yang telah merasakan kemudahan layanan Tirta Asri.
                </p>
                <Link href="/login">
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 font-semibold">
                        Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                 {companyLogo ? (
                   <Image src={companyLogo} alt="Logo" fill className="object-contain" />
                 ) : (
                   <div className="bg-blue-600 p-1.5 rounded-lg w-full h-full flex items-center justify-center">
                     <Droplets className="h-5 w-5 text-white" />
                   </div>
                 )}
              </div>
              <span className="font-bold text-lg text-slate-900">{companyName}</span>
            </div>
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Arunika. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
