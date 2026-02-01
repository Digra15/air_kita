"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useRef, useState } from "react"
import { uploadCompanyLogo } from "@/lib/actions/settings"
import { toast } from "sonner"
import Image from "next/image"

export function ProfileSettings({ settings, updateSettings }: { settings?: any, updateSettings?: (key: string, value: any) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 2MB")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const result = await uploadCompanyLogo(formData)
    
    if (result.success && result.url) {
      updateSettings?.("companyLogo", result.url)
      toast.success("Logo berhasil diperbarui")
    } else {
      toast.error(result.error || "Gagal mengupload logo")
    }
    
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Perusahaan</CardTitle>
        <CardDescription>
          Informasi dasar tentang identitas perusahaan air minum.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload Section */}
        <div className="flex items-center gap-6 pb-6 border-b">
          <div className="relative w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
            {settings?.companyLogo ? (
              <Image 
                src={settings.companyLogo} 
                alt="Logo Perusahaan" 
                fill 
                className="object-cover"
              />
            ) : (
              <span className="text-xs text-slate-500 text-center px-2">Tidak ada logo</span>
            )}
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Logo Aplikasi</h3>
            <p className="text-sm text-slate-500">
              Format JPG, PNG. Maksimal 2MB. Disarankan rasio 1:1.
            </p>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Mengupload..." : "Ganti Logo"}
              </Button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nama Perusahaan</Label>
            <Input 
              id="company-name" 
              value={settings?.companyName || ""} 
              onChange={(e) => updateSettings?.("companyName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Kontak</Label>
            <Input 
              id="email" 
              type="email" 
              value={settings?.companyEmail || ""} 
              onChange={(e) => updateSettings?.("companyEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input 
              id="phone" 
              value={settings?.companyPhone || ""} 
              onChange={(e) => updateSettings?.("companyPhone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={settings?.companyWebsite || ""} 
              onChange={(e) => updateSettings?.("companyWebsite", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Alamat Kantor</Label>
          <Textarea 
            id="address" 
            value={settings?.companyAddress || ""} 
            onChange={(e) => updateSettings?.("companyAddress", e.target.value)}
            rows={3}
          />
        </div>

        <div className="pt-6 border-t space-y-4">
            <h3 className="font-medium text-lg">Pengaturan Teks Halaman Depan</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Judul Utama (Hero Title)</Label>
                <Input 
                  id="heroTitle" 
                  value={settings?.heroTitle || ""} 
                  onChange={(e) => updateSettings?.("heroTitle", e.target.value)}
                  placeholder="Kelola Tagihan Air Anda dengan Mudah & Cepat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroDescription">Deskripsi Utama</Label>
                <Textarea 
                  id="heroDescription" 
                  value={settings?.heroDescription || ""} 
                  onChange={(e) => updateSettings?.("heroDescription", e.target.value)}
                  placeholder="Pantau penggunaan air, cek tagihan bulanan..."
                  rows={2}
                />
              </div>
            </div>
        </div>

        <div className="pt-6 border-t space-y-4">
            <h3 className="font-medium text-lg">Pengaturan Teks Halaman Login</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="loginTitle">Judul Halaman Login</Label>
                <Input 
                  id="loginTitle" 
                  value={settings?.loginTitle || ""} 
                  onChange={(e) => updateSettings?.("loginTitle", e.target.value)}
                  placeholder="Layanan Air Bersih Digital Terpercaya"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginDescription">Deskripsi Halaman Login</Label>
                <Textarea 
                  id="loginDescription" 
                  value={settings?.loginDescription || ""} 
                  onChange={(e) => updateSettings?.("loginDescription", e.target.value)}
                  placeholder="Kelola pembayaran air Anda dengan mudah..."
                  rows={2}
                />
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
