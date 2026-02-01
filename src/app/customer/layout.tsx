import { CustomerNavbar } from "@/components/customer/navbar"
import { getSystemSettings } from "@/lib/data/settings"

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSystemSettings()
  const companyName = settings?.companyName || "Air Kita"
  const companyLogo = settings?.companyLogo

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar companyName={companyName} companyLogo={companyLogo} />
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}
