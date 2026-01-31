'use client'

import { useActionState, useEffect, useState } from 'react'
import { authenticate } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)
  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState<string | null>(
    searchParams.get('registered') === 'true' ? 'Akun berhasil dibuat. Silakan login.' : null
  )

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      <form action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="nama@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            required
            minLength={6}
          />
        </div>
        <div className="flex items-center justify-between">
           {/* Add forgot password link here if needed */}
        </div>
        {errorMessage && (
          <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md border border-red-100">
            {errorMessage}
          </div>
        )}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
          {isPending ? 'Masuk...' : 'Masuk'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-600">Belum punya akun? </span>
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
          Daftar disini
        </Link>
      </div>
    </div>
  )
}
