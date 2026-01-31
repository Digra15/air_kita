import { SettingsPageClient } from "@/components/admin/settings/settings-page-client"
import { getSystemSettings } from "@/lib/data/settings"
import { getUsers } from "@/lib/actions/users"
import { getDatabaseInfo } from "@/lib/actions/database"
import { getBackupHistory } from "@/lib/actions/backup"

export default async function SettingsPage() {
  const settings = await getSystemSettings()
  const result = await getUsers()
  const users = result.success ? result.data : []
  
  const dbInfoResult = await getDatabaseInfo()
  const dbInfo = dbInfoResult.success ? dbInfoResult.data : null

  const historyResult = await getBackupHistory()
  const backupHistory = historyResult.success ? historyResult.data : []

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
          <p className="text-muted-foreground">
            Konfigurasi identitas perusahaan, keamanan data, dan infrastruktur database.
          </p>
        </div>
      </div>

      <SettingsPageClient 
        initialSettings={settings} 
        users={users} 
        dbInfo={dbInfo} 
        backupHistory={backupHistory}
      />
    </div>
  )
}
