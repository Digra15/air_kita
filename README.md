# Air Kita - Sistem Informasi Pembayaran Air

Aplikasi manajemen utilitas air berbasis web yang dibangun dengan Next.js 16, Prisma ORM, dan Vercel Postgres.

## Fitur Utama

- **Admin Dashboard**: Manajemen pelanggan, tarif, pencatatan meteran, dan tagihan.
- **Customer Portal**: Cek tagihan dan riwayat pemakaian air.
- **Billing System**: Otomatisasi perhitungan tagihan berdasarkan tarif progresif.
- **Responsive Design**: Tampilan modern dan responsif untuk desktop dan mobile.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase/Vercel Postgres)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI
- **Auth**: NextAuth.js (v5 Beta)

## Persiapan Lokal (Local Setup)

1. **Clone Repository**
   ```bash
   git clone https://github.com/Digra15/air_kita.git
   cd air_kita
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Salin `.env.example` ke `.env` (atau buat file `.env` baru) dan isi variabel berikut:

   ```env
   # Database Connection (Supabase Transaction Mode - Port 6543 atau Session Mode - Port 5432)
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   
   # Direct Connection (Supabase Session Mode - Port 5432) - Untuk Migrasi
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   
   # NextAuth Configuration
   AUTH_SECRET="your-secret-key-min-32-chars" # Generate dengan `openssl rand -base64 32`
   AUTH_URL="http://localhost:3000" # Ubah ke domain produksi saat deploy
   ```

4. **Setup Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push Schema ke Database
   npx prisma db push
   
   # (Opsional) Seed Data Awal
   npx prisma db seed
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

## Deployment (Vercel)

1. Push kode ke GitHub.
2. Import project di Vercel.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (Set ke domain Vercel Anda, misal: `https://air-kita.vercel.app`)
4. Klik **Deploy**.

## Struktur Folder

- `src/app`: Halaman dan routing (Next.js App Router).
- `src/components`: Komponen UI reusable.
- `src/lib`: Utility functions dan server actions.
- `prisma`: Schema database dan seed script.

## Lisensi

Private - Air Kita Project
