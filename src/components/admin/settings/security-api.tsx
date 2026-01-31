"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Copy } from "lucide-react"
import { useState } from "react"

export function SecurityApi({ settings, updateSettings }: { settings?: any, updateSettings?: (key: string, value: any) => void }) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keamanan Sistem</CardTitle>
          <CardDescription>
            Konfigurasi keamanan login dan sesi pengguna.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Wajibkan 2FA untuk semua akun admin.
              </p>
            </div>
            <Switch 
              checked={settings?.enable2FA ?? false}
              onCheckedChange={(checked) => updateSettings?.("enable2FA", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Logout otomatis setelah {settings?.sessionTimeout || 30} menit tidak aktif.
              </p>
            </div>
            {/* Mocking session timeout toggle as just a boolean for now or logic to switch between 30 and never? 
                The prompt asked to activate functions. The schema has sessionTimeout Int.
                Let's assume the switch toggles between 30 and 0 (disabled) or just visual for now if UI is a Switch.
                But the UI has a Switch. Let's make it toggle between 30 and 120 (extended) or similar.
                Or just assume Switch 'on' means 30 mins, 'off' means no timeout (0).
            */}
            <Switch 
              checked={(settings?.sessionTimeout || 0) > 0}
              onCheckedChange={(checked) => updateSettings?.("sessionTimeout", checked ? 30 : 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Kelola kunci API untuk integrasi pihak ketiga.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Production API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type={showKey ? "text" : "password"} 
                  value="sk_prod_51MxkL2e92k10s92..." 
                  readOnly 
                  className="font-mono pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Jangan bagikan kunci ini kepada siapa pun.
            </p>
          </div>
          <Button variant="secondary" className="mt-2">Generate New Key</Button>
        </CardContent>
      </Card>
    </div>
  )
}
