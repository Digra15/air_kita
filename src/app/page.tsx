
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Search, LogIn, ShieldCheck, Clock, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react"
import { getSystemSettings } from "@/lib/data/settings"
import Image from "next/image"

export default async function Home() {
  const settings = await getSystemSettings()
  const companyName = settings?.companyName || "Air Kita"
  const companyLogo = settings?.companyLogo
  const heroTitle = settings?.heroTitle || "Kelola Tagihan Air Anda dengan Mudah & Cepat"
  const heroDescription = settings?.heroDescription || `Pantau penggunaan air, cek tagihan bulanan, dan lakukan pembayaran dengan mudah melalui platform digital ${companyName}.`

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center text-white overflow-hidden">
               {companyLogo ? (
                 <Image src={companyLogo} alt="Logo" fill className="object-contain p-1.5" />
               ) : (
                 <Droplets className="h-6 w-6 md:h-7 md:w-7" />
               )}
            </div>
            <span className="font-bold text-xl md:text-2xl text-slate-900 tracking-tight">{companyName}</span>
          </div>
          <div className="flex gap-3 md:gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50">Masuk</Button>
            </Link>
            <Link href="/cek-tagihan">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all rounded-full px-6">
                Cek Tagihan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 -z-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-white -z-10" />
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -z-10" />
          
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              Sistem Pembayaran Air Modern Terpercaya
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-5xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">Solusi Pintar</span> untuk<br className="hidden md:block" /> Kebutuhan Air Bersih Anda
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              {heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Link href="/cek-tagihan" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-1">
                  <Search className="mr-2 h-5 w-5" />
                  Cek Tagihan Sekarang
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg rounded-full border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all">
                  <LogIn className="mr-2 h-5 w-5" />
                  Masuk ke Akun
                </Button>
              </Link>
            </div>

            {/* Stats / Trust Indicators */}
            <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 delay-300 border-t border-slate-100 pt-8">
                <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
                    <div className="text-sm text-slate-500 font-medium">Layanan Online</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
                    <div className="text-sm text-slate-500 font-medium">Akurasi Data</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-1">Aman</div>
                    <div className="text-sm text-slate-500 font-medium">Enkripsi Data</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 mb-1">Cepat</div>
                    <div className="text-sm text-slate-500 font-medium">Proses Instan</div>
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-slate-50 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Kenapa Memilih {companyName}?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Kami berkomitmen memberikan pelayanan terbaik dengan teknologi terkini untuk kemudahan Anda.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <Card className="group border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-200/20 bg-white hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="h-2 w-full bg-blue-500 group-hover:h-3 transition-all duration-300" />
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Clock className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Cek Real-time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Cek penggunaan air dan tagihan Anda kapan saja dan di mana saja secara real-time tanpa harus datang ke kantor.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="group border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-200/20 bg-white hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="h-2 w-full bg-indigo-500 group-hover:h-3 transition-all duration-300" />
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Pembayaran Mudah</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Mendukung berbagai metode pembayaran digital yang aman dan terverifikasi otomatis oleh sistem.
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="group border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-200/20 bg-white hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="h-2 w-full bg-emerald-500 group-hover:h-3 transition-all duration-300" />
                <CardHeader className="pb-2">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Data Transparan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    Riwayat penggunaan dan pembayaran tersimpan dengan aman dan dapat diakses kapan saja untuk transparansi.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600 -z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay -z-10" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Siap Mengelola Tagihan Air Anda?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pelanggan lain yang telah beralih ke layanan digital kami.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20 border-0">
                Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {companyLogo ? (
                     <Image src={companyLogo} alt="Logo" width={24} height={24} className="object-contain" />
                  ) : (
                    <Droplets className="h-6 w-6" />
                  )}
                </div>
                <span className="font-bold text-xl text-white">{companyName}</span>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed">
                Platform digital modern untuk pengelolaan layanan air bersih yang efisien, transparan, dan mudah diakses oleh seluruh pelanggan.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6">Tautan Cepat</h3>
              <ul className="space-y-4">
                <li><Link href="/cek-tagihan" className="hover:text-blue-400 transition-colors">Cek Tagihan</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Masuk</Link></li>
                <li><Link href="/register" className="hover:text-blue-400 transition-colors">Daftar Akun</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-6">Hubungi Kami</h3>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1">📍</span>
                  <span>Jalan Raya No. 123, Kota Air, Indonesia</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>📞</span>
                  <span>(021) 1234-5678</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>✉️</span>
                  <span>cs@{companyName.toLowerCase().replace(/\s/g, '')}.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Arunika. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>
    </div>
  )
}