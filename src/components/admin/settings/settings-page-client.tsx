"use client"

import { useState, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Building2, Database, Key, Loader2, Shield } from "lucide-react"
import { ProfileSettings } from "./profile-settings"
import { DatabaseBackup } from "./database-backup"
import { SecurityApi } from "./security-api"
import { updateSystemSettings } from "@/lib/actions/settings"
import { UserTable } from "@/components/admin/users/user-table"
import { AddUserDialog } from "@/components/admin/users/add-user-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function SettingsPageClient({ 
  initialSettings, 
  users = [],
  dbInfo,
  backupHistory = []
}: { 
  initialSettings: any, 
  users?: any[],
  dbInfo?: any,
  backupHistory?: any[]
}) {
  const [settings, setSettings] = useState(initialSettings || {})
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSystemSettings(settings)
      if (result.success) {
        alert("Pengaturan berhasil disimpan!")
      } else {
        alert("Gagal menyimpan pengaturan.")
      }
    })
  }

  const updateSettings = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end -mt-16 mb-8">
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={handleSave} 
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Semua
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-4 w-4" />
            Profil Perusahaan
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2">
            <Shield className="h-4 w-4" />
            Manajemen Akses
          </TabsTrigger>
          <TabsTrigger value="database" className="gap-2">
            <Database className="h-4 w-4" />
            Database & Backup
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Key className="h-4 w-4" />
            Keamanan & API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings settings={settings} updateSettings={updateSettings} />
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Manajemen User & Akses</CardTitle>
                <CardDescription>
                  Kelola pengguna yang memiliki akses ke sistem dan tetapkan role mereka.
                </CardDescription>
              </div>
              <AddUserDialog />
            </CardHeader>
            <CardContent>
              <UserTable data={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <DatabaseBackup 
            settings={settings} 
            updateSettings={updateSettings} 
            dbInfo={dbInfo} 
            backupHistory={backupHistory}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityApi settings={settings} updateSettings={updateSettings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
