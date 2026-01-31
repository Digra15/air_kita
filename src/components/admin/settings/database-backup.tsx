"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Database, Download, Upload, Clock, RefreshCw, Loader2, CheckCircle, XCircle, FileJson, Calendar, HardDrive } from "lucide-react"
import { createBackup, restoreBackup, downloadBackup } from "@/lib/actions/backup"
import { testDatabaseConnection } from "@/lib/actions/database"
import { useState, useRef } from "react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

export function DatabaseBackup({ 
  settings, 
  updateSettings,
  dbInfo,
  backupHistory = []
}: { 
  settings?: any, 
  updateSettings?: (key: string, value: any) => void,
  dbInfo?: any,
  backupHistory?: any[]
}) {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<{latency?: number, error?: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTestConnection = async () => {
    setIsTesting(true)
    setConnectionStatus(null)
    try {
      const result = await testDatabaseConnection()
      if (result.success) {
        setConnectionStatus({ latency: result.latency })
        toast.success(result.message)
      } else {
        setConnectionStatus({ error: result.error })
        toast.error(result.error)
      }
    } catch (error) {
        setConnectionStatus({ error: "Gagal melakukan tes koneksi" })
    } finally {
      setIsTesting(false)
    }
  }

  const handleDownloadBackup = async (id: string, fileName: string) => {
    try {
        setIsDownloading(id)
        const result = await downloadBackup(id)
        
        if (result.success && result.data) {
            const blob = new Blob([result.data], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = result.fileName || fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("Backup berhasil diunduh")
        } else {
            toast.error(result.error || "Gagal mengunduh backup")
        }
    } catch (error) {
        toast.error("Terjadi kesalahan saat mengunduh")
    } finally {
        setIsDownloading(null)
    }
  }

  const handleBackup = async () => {
    try {
      setIsBackingUp(true)
      const result = await createBackup()
      
      if (result.success && result.data) {
        // Create blob and download
        const blob = new Blob([result.data], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.fileName || `backup-air-kita-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success("Backup berhasil diunduh")
        window.location.reload() // Reload to update history
      } else {
        toast.error(result.error || "Gagal membuat backup")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat backup")
      console.error(error)
    } finally {
      setIsBackingUp(false)
    }
  }
// ... rest of the component

  const handleRestoreClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsRestoring(true)
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        const jsonString = event.target?.result as string
        const result = await restoreBackup(jsonString)
        
        if (result.success) {
          toast.success(result.message)
          window.location.reload() // Reload to reflect changes
        } else {
          toast.error(result.error || "Gagal memulihkan database")
        }
        setIsRestoring(false)
      }

      reader.readAsText(file)
    } catch (error) {
      toast.error("Gagal membaca file backup")
      console.error(error)
      setIsRestoring(false)
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold">Infrastruktur Database</CardTitle>
            </div>
            <Badge variant="secondary" className={`${connectionStatus?.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} hover:bg-opacity-80`}>
              <span className={`mr-1 h-2 w-2 rounded-full ${connectionStatus?.error ? 'bg-red-600' : 'bg-green-600'}`}></span>
              {connectionStatus?.error ? 'ERROR' : 'TERKONEKSI'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">DB HOST</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <Database className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <Input 
                  defaultValue={dbInfo?.host || "localhost"} 
                  readOnly 
                  className="pl-9 bg-muted/50 font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">DATABASE NAME</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <Database className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <Input 
                  defaultValue={dbInfo?.database || "air_kita"} 
                  readOnly 
                  className="pl-9 bg-muted/50 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">PORT</Label>
                <Input 
                  defaultValue={dbInfo?.port || "5432"} 
                  readOnly 
                  className="bg-muted/50 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">POOL SIZE</Label>
                <Input 
                  defaultValue={dbInfo?.poolSize || "20"} 
                  readOnly 
                  className="bg-muted/50 font-bold"
                />
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className={`h-5 w-5 text-muted-foreground ${isTesting ? 'animate-spin' : ''}`} />
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Uji Koneksi</div>
                    <div className="text-xs text-muted-foreground uppercase">
                      {connectionStatus?.latency 
                        ? `Latensi: ${connectionStatus.latency}ms` 
                        : connectionStatus?.error 
                          ? 'Gagal terhubung' 
                          : 'Klik untuk cek'}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={isTesting}>
                  {isTesting ? 'Mengecek...' : 'Cek Sekarang'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold">Backup & Pemulihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={isBackingUp ? undefined : handleBackup}
                  className={`rounded-lg border bg-blue-50/50 p-6 flex flex-col items-center justify-center text-center space-y-3 hover:bg-blue-50 transition-colors cursor-pointer group ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isBackingUp ? (
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : (
                    <Download className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  )}
                  <div>
                    <div className="font-semibold text-blue-700">{isBackingUp ? 'Memproses...' : 'Backup Sekarang'}</div>
                    <div className="text-xs text-blue-600/70">SQL / JSON</div>
                  </div>
                </div>
                
                <div 
                  onClick={isRestoring ? undefined : handleRestoreClick}
                  className={`rounded-lg border bg-purple-50/50 p-6 flex flex-col items-center justify-center text-center space-y-3 hover:bg-purple-50 transition-colors cursor-pointer group ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={handleFileChange}
                  />
                  {isRestoring ? (
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                  )}
                  <div>
                    <div className="font-semibold text-purple-700">{isRestoring ? 'Memproses...' : 'Restore Data'}</div>
                    <div className="text-xs text-purple-600/70">Upload File JSON</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="auto-backup" className="font-medium cursor-pointer">Backup Otomatis Harian</Label>
                  </div>
                  <Switch 
                    id="auto-backup" 
                    checked={settings?.backupDaily ?? true}
                    onCheckedChange={(checked) => updateSettings?.("backupDaily", checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <Label className="font-medium">Simpan Riwayat (Retention)</Label>
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {settings?.retentionDays || 30} Hari
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-0 pt-6 px-6">
            <CardTitle className="text-base font-bold uppercase tracking-wide text-blue-950">
                Riwayat Pencadangan Data
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="mt-4">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[300px] pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama File Backup</TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tanggal & Waktu</TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ukuran</TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-right pr-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {backupHistory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Belum ada riwayat backup.
                                </TableCell>
                            </TableRow>
                        ) : (
                            backupHistory.map((backup) => (
                                <TableRow key={backup.id} className="hover:bg-muted/30 border-b last:border-0">
                                    <TableCell className="font-bold pl-6 py-4 text-gray-800">
                                        {backup.fileName}
                                    </TableCell>
                                    <TableCell className="text-gray-500 py-4 font-medium">
                                        {new Date(backup.createdAt).toLocaleString('id-ID', { 
                                            day: '2-digit', 
                                            month: 'short', 
                                            year: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-700 py-4">
                                        {backup.fileSize}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wide">
                                            <CheckCircle className="h-4 w-4" />
                                            {backup.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <button 
                                            className="text-blue-600 font-bold text-sm cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-end ml-auto"
                                            onClick={() => handleDownloadBackup(backup.id, backup.fileName)}
                                            disabled={isDownloading === backup.id}
                                        >
                                            {isDownloading === backup.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                            Download
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
