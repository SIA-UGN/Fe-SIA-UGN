# Panduan Hosting Frontend Next.js (cPanel)

Panduan ini khusus untuk deployment frontend Next.js (`FEmodulpresensi-usermanagemenSIA`) ke cPanel. Backend Laravel Anda sudah di-hosting, jadi fokusnya adalah bagaimana men-deploy aplikasi Next.js dan menghubungkannya ke backend.

> Catatan: Fitur cPanel berbeda-beda. Jika cPanel Anda mendukung Node.js lewat "Application Manager" (Passenger), gunakan Opsi A. Jika tidak, pertimbangkan Opsi B (static export) atau host frontend di layanan lain (mis. Vercel), sementara backend tetap di cPanel.

## 1) Persiapan
- Pastikan domain/subdomain untuk frontend sudah dibuat (mis. `app.domainmu.com`).
- Pastikan SSL aktif (AutoSSL/Let’s Encrypt) agar URL menggunakan `https`.
- Tentukan URL backend Laravel yang sudah online (mis. `https://api.domainmu.com`).

## 2) Deploy Frontend Next.js
Pilih salah satu:

### Opsi A: Node.js App via cPanel Application Manager (Passenger)
1. Buka cPanel -> "Setup Node.js App" atau "Application Manager".
2. Upload project frontend ke folder, misalnya: `~/nodeapps/FEmodulpresensi-usermanagemenSIA`.
3. Buat aplikasi Node baru:
   - Pilih versi Node (disarankan 18+).
   - Atur "Application Root" ke folder project di atas.
   
   Form isian cPanel (lengkap sesuai gambar):
   - Node.js version: pilih `18.x` atau `22.x` (sesuaikan dukungan host). Contoh: `22.18.0`.
   - Application mode: `Production`.
   - Application root: path absolut home Anda. Contoh:
     - `/home/USERNAME/nodeapps/FEmodulpresensi-usermanagemenSIA`
     - Jika ingin di bawah webroot: `/home/USERNAME/public_html/app`
   - Application URL: pilih domain/subdomain tujuan, mis. `app.domainmu.com` atau `trisuladana.com` (sesuai dropdown cPanel).
   - Application startup file/command: isi startup file dengan `app.js` (lihat file yang ditambahkan), atau set command ke `npm start` jika UI mengizinkan.
   - Passenger log file: isi path log, contoh: `/home/USERNAME/logs/passenger.log`.
4. Install dependencies (via UI cPanel atau SSH):
   - SSH ke folder app: `npm ci` (atau `npm install` jika `ci` tidak tersedia).
5. Build aplikasi:
   - Jalankan: `npm run build`.
6. Pastikan script start di `package.json`:
   ```json
   {
     "scripts": {
       "start": "next start -p 3000",
       "build": "next build"
     }
   }
   ```
   - Di Application Manager, set "Startup file" ke `app.js` (atau "Startup command" ke `npm start` jika tidak butuh file).
7. Routing domain/subdomain:
   - Map subdomain (mis. `app.domainmu.com`) ke aplikasi Node tersebut.
   - Jika perlu, gunakan aturan Proxy/Rewrite di `.htaccess` agar trafik mengarah ke port app.
8. Environment variables (di UI Node cPanel):
   - `NEXT_PUBLIC_API_BASE_URL=https://api.domainmu.com` (alamat backend Anda).
   - Broadcast:
     - cPanel shared biasanya tidak mendukung server websocket custom (Reverb). Untuk produksi, gunakan Pusher:
       - `NEXT_PUBLIC_BROADCAST_PROVIDER=pusher`
       - Set `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, dll.

   Contoh konfigurasi lengkap (ganti `USERNAME` dan domain):
   - Node.js version: `22.18.0`
   - Application mode: `Production`
   - Application root: `/home/USERNAME/Fe_Sia` (atau `/home/USERNAME/nodeapps/FEmodulpresensi-usermanagemenSIA`)
   - Application URL: `app.domainmu.com`
   - Application startup file/command: `npm start`
   - Passenger log file: `/home/USERNAME/logs/passenger.log`

    Pengisian ENV di DomaiNesia/cPanel:
    - Buka halaman aplikasi Node -> scroll ke bagian Environment Variables.
    - Tambahkan key-value berikut minimal:
       - `NEXT_PUBLIC_API_BASE_URL` = `https://api.domainmu.com`
       - Jika pakai Pusher:
          - `NEXT_PUBLIC_BROADCAST_PROVIDER` = `pusher`
          - `NEXT_PUBLIC_PUSHER_KEY` = `...`
          - `NEXT_PUBLIC_PUSHER_CLUSTER` = `ap1`
          - (opsional) `NEXT_PUBLIC_PUSHER_HOST` = `ws.pusherapp.com`, `NEXT_PUBLIC_PUSHER_PORT` = `443`, `NEXT_PUBLIC_PUSHER_TLS` = `true`
    - Klik Save lalu Restart app.

    Alternatif `.env.local`:
    - Kamu juga bisa upload file `.env.local` ke root project frontend di server (path yang sama dengan Application Root).
    - Nilai dalam `.env.local` akan dibaca saat build (`npm run build`) dan pada runtime untuk variabel `NEXT_PUBLIC_*`.
    - Contoh isi produksi sudah ada di bagian "Contoh `.env.local` (Produksi)".

   Catatan DomaiNesia:
   - Pada beberapa paket DomaiNesia, field "Application startup file" wajib diisi. Gunakan `app.js` (sudah ada di project root) yang akan mengeksekusi `npm start`.
   - Setelah mengubah startup file/command, klik Save lalu Restart.

### Opsi B: Static Export (hanya jika kompatibel)
> App Router + fitur dinamis (chat realtime, server actions, middleware) bisa membatasi export statis. Pakai opsi ini jika halaman bisa diexport penuh.
1. Build lokal:
   ```bash
   npm install
   npm run build
   npm run export
   ```
   - Folder `out/` akan dihasilkan.
2. Upload isi `out/` ke webroot (`public_html/` atau root subdomain).
3. Set environment sebelum build (karena akan tertanam di file statis):
   - `NEXT_PUBLIC_API_BASE_URL=https://api.domainmu.com`.
   - Fitur broadcast realtime umumnya tidak berjalan di export statis.

## 3) Menghubungkan Frontend ke Backend
- Set `NEXT_PUBLIC_API_BASE_URL` ke URL publik backend (mis. `https://api.domainmu.com`).
- Pastikan CORS di backend (Laravel) mengizinkan domain frontend Anda.
- Untuk realtime/broadcast:
  - Gunakan Pusher (hosted). Set variable di frontend dan backend sesuai kredensial.

## 4) DNS dan SSL
- Buat subdomain untuk frontend di cPanel -> Domains -> Subdomains (mis. `app.domainmu.com`).
- Aktifkan SSL (AutoSSL/Let’s Encrypt) untuk subdomain.
- Pastikan semua URL menggunakan `https`.

## 5) Checklist Frontend
- [ ] Node app di cPanel (Opsi A) atau upload `out/` (Opsi B)
- [ ] Environment variabel di-set (`NEXT_PUBLIC_API_BASE_URL`, Pusher jika dipakai)
- [ ] Domain/subdomain aktif dengan SSL
- [ ] Frontend bisa memanggil API backend (uji dengan halaman login/dll.)

## 6) Contoh `.env.local` (Produksi)
```
NEXT_PUBLIC_API_BASE_URL=https://api.domainmu.com
NEXT_PUBLIC_BROADCAST_PROVIDER=pusher
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
NEXT_PUBLIC_PUSHER_HOST=ws.pusherapp.com
NEXT_PUBLIC_PUSHER_PORT=443
NEXT_PUBLIC_PUSHER_TLS=true
```

## 7) Troubleshooting
- Frontend tidak bisa memanggil backend: cek `NEXT_PUBLIC_API_BASE_URL`, CORS di backend, dan SSL.
- Error saat start di cPanel: pastikan Node versi sesuai, dependencies ter-install, dan `npm run build` sukses.
- Realtime/broadcast gagal: gunakan Pusher; shared hosting biasanya tidak mengizinkan websocket server custom.

---
Jika ingin, saya bisa bantu menambahkan aturan `.htaccess` untuk proxy/rewrite subdomain Anda, atau menyesuaikan konfigurasi sesuai cPanel yang Anda pakai.