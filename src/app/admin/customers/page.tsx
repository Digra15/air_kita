import { getCustomers, getTariffs as getTariffOptions } from "@/lib/actions/customer"
import { getTariffs as getTariffList } from "@/lib/actions/tariff"
import { getSystemSettings } from "@/lib/data/settings"
import { CustomerTable } from "@/components/admin/customers/customer-table"
import { AddCustomerDialog } from "@/components/admin/customers/add-customer-dialog"
import { CustomerExportButton } from "@/components/admin/customers/customer-export-button"
import { TariffTable } from "@/components/admin/tariffs/tariff-table"
import { AddTariffDialog } from "@/components/admin/tariffs/add-tariff-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RotateCw, Plus } from "lucide-react"

export default async function CustomersPage() {
  const customers = await getCustomers()
  const tariffOptions = await getTariffOptions()
  const tariffList = await getTariffList()
  const settings = await getSystemSettings()

  // Format tariffs for the table
  const formattedTariffs = tariffList.map(t => ({
      ...t,
      ratePerCubic: Number(t.ratePerCubic),
      baseFee: Number(t.baseFee)
  }))

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Administrasi Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola basis data pelanggan dan informasi meteran.</p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl print:hidden">
          <TabsTrigger 
            value="customers" 
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <div className="flex items-center gap-2">
                <span className="h-4 w-4 flex items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-600 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                Data Pelanggan
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="tariffs"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            <div className="flex items-center gap-2">
                <span className="h-4 w-4 flex items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-600 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </span>
                Golongan Tarif
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <div className="hidden print:block text-center mb-8">
            <h1 className="text-xl font-bold uppercase mb-2">DATA PELANGGAN {settings?.companyName || "AIR KITA"}</h1>
            <p className="text-sm text-slate-600">{settings?.companyAddress || "Alamat Belum Diatur"}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm print:hidden">
            <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Cari nama atau No. Meter..." 
                        className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                    />
                </div>
                <Button variant="outline" size="icon" className="shrink-0 text-slate-500">
                    <RotateCw className="h-4 w-4" />
                </Button>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end print:hidden">
                <CustomerExportButton 
                  data={customers} 
                  companyName={settings?.companyName || "Air Kita"}
                  companyAddress={settings?.companyAddress || "Alamat Perusahaan"}
                />
                <AddCustomerDialog tariffs={tariffOptions} />
            </div>
          </div>

          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <CustomerTable data={customers} tariffs={tariffOptions} />
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between text-sm text-slate-500 px-2 print:hidden">
            <div>Menampilkan {customers.length} dari {customers.length} pelanggan</div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Sebelumnya</Button>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Berikutnya</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tariffs" className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
             <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Cari golongan tarif..." 
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                />
            </div>
            <AddTariffDialog />
          </div>

          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <TariffTable data={formattedTariffs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
