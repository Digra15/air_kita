'use client'

import { useActionState } from 'react'
import { register } from '@/lib/actions/registration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function RegisterForm() {
  const [errorMessage, dispatch, isPending] = useActionState(register, undefined)

  return (
    <div className="space-y-6">
      <form action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="Nama Lengkap Anda"
            required
          />
        </div>
        
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
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Ulangi password"
            required
            minLength={6}
          />
        </div>

        {errorMessage && (
          <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md border border-red-100">
            {errorMessage}
          </div>
        )}
        
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
          {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-600">Sudah punya akun? </span>
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
          Masuk disini
        </Link>
      </div>
    </div>
  )
}
