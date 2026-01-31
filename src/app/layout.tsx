import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { getSystemSettings } from "@/lib/data/settings"
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings()
  return {
    title: settings?.companyName || "Air Kita",
    description: "Sistem Pembayaran Air Modern",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
