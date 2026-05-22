# Menjalankan QR/Chat/Scheduler/Queue/Frontend

Repo ini punya dua launcher:
- `start-qr-services.bat` (untuk Zhafir yang "kuno")
- `start-qr-services.ps1` (Semua dengan pilihan tertentu)

## Kebutuhan
- PHP + Composer (Laravel)
- Node.js + npm
- Path yang dipakai:
  - Backend: `D:\College\3rd Semester\SIA-UGN\SIA-GLOBAL`
  - Frontend: `D:\College\3rd Semester\SIA-UGN\FEmodulpresensi-usermanagemenSIA`
- Windows Terminal (`wt.exe`) untuk mode tab (opsional)

## Jalankan di jendela PowerShell (default)
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& "d:\Project\Coding\WEB\SIA GLOBAL NUSANTARA\SIA-GLOBAL\start-qr-services.ps1" -shell powershell
```
Ini akan membuka 5 jendela PowerShell:
- Laravel Backend (8000)
- Reverb WebSocket (9090)
- Scheduler
- Queue Worker
- Frontend (3000)
## Jalankan di jendela CMD
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& "d:\Project\Coding\WEB\SIA GLOBAL NUSANTARA\SIA-GLOBAL\start-qr-services.ps1" -shell cmd
```
Membuka 5 jendela CMD.

## Jalankan program nya mas Zhafir
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& "D:\College\3rd Semester\SIA-UGN\SIA-GLOBAL\start-qr-services.ps1" -shell zhafir
```

## Jalankan di Windows Terminal (tab dalam satu jendela)
Butuh Windows Terminal (`wt.exe`).
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& "d:\Project\Coding\WEB\SIA GLOBAL NUSANTARA\SIA-GLOBAL\start-qr-services.ps1" -shell wt
```
Ini akan membuka satu jendela Terminal dengan 5 tab bernama.

## Catatan
- Biarkan semua jendela/tab tetap terbuka agar layanan berjalan.
- Hentikan layanan dengan menutup jendela/tab atau tekan Ctrl+C di jendela/tab tersebut.
- Jika path berbeda di mesinmu, sesuaikan di `start-qr-services.ps1`.

## Menghentikan Semua Services (Stop)
Gunakan skrip stop untuk mematikan semua layanan dengan rapi.

```powershell
# Stop biasa
& "d:\Project\Coding\WEB\SIA GLOBAL NUSANTARA\SIA-GLOBAL\stop-qr-services.ps1"

# Paksa stop (jika ada proses yang membandel)
& "d:\Project\Coding\WEB\SIA GLOBAL NUSANTARA\SIA-GLOBAL\stop-qr-services.ps1" -Force
```

Skrip ini akan mencari proses dengan pola:
- `artisan serve`
- `artisan reverb:start`
- `artisan schedule:work`
- `artisan queue:work`
- `npm run dev` dan beberapa dev server umum
