import { Sidebar } from "@/components/admin/sidebar"
import { Navbar } from "@/components/admin/navbar"
import { getSystemSettings } from "@/lib/data/settings"
import { auth } from "@/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSystemSettings()
  const companyName = settings?.companyName || "Air Kita"
  const companyLogo = settings?.companyLogo
  const session = await auth()
  const userRole = session?.user?.role

  return (
    <div className="h-full relative bg-slate-50">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-white border-r print:hidden">
        <Sidebar companyName={companyName} companyLogo={companyLogo} userRole={userRole} />
      </div>
      <main className="md:pl-72 min-h-screen print:pl-0">
        <div className="print:hidden">
            <Navbar companyName={companyName} companyLogo={companyLogo} userRole={userRole} />
        </div>
        <div className="p-4 md:p-8 print:p-0">
            {children}
        </div>
      </main>
    </div>
  )
}
