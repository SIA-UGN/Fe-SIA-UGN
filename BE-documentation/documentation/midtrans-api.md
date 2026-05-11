# Dokumentasi Integrasi Midtrans — SIA-UGN

Dokumentasi ini menjelaskan integrasi payment gateway **Midtrans** ke modul pembayaran UKT di SIA-UGN. Sistem menggunakan **Core API** sebagai metode utama dan **Snap API** sebagai fallback otomatis.

---

## Daftar Isi

1. [Setup Midtrans](#1-setup-midtrans)
2. [Midtrans Tuition](#2-midtrans-tuition)
3. [Ringkasan API](#3-ringkasan-api)

---

## 1. Setup Midtrans

### 1.1 Environment Variables

Tambahkan konfigurasi berikut di file `.env`:

```env
# === Midtrans Configuration ===
MIDTRANS_MERCHANT_ID=G123456789
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
MIDTRANS_ENABLED_BANKS=bca,bni,bri
MIDTRANS_VA_EXPIRY_HOURS=168
MIDTRANS_VA_CUSTOM_PREFIX=
```

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `MIDTRANS_MERCHANT_ID` | Merchant ID dari dashboard Midtrans | — |
| `MIDTRANS_SERVER_KEY` | Server Key untuk autentikasi API (Basic Auth) | — |
| `MIDTRANS_CLIENT_KEY` | Client Key untuk Snap.js di frontend | — |
| `MIDTRANS_IS_PRODUCTION` | `true` = production, `false` = sandbox | `false` |
| `MIDTRANS_IS_SANITIZED` | Sanitize input parameter | `true` |
| `MIDTRANS_IS_3DS` | Aktifkan 3D Secure (credit card only) | `true` |
| `MIDTRANS_ENABLED_BANKS` | Bank VA yang diaktifkan (comma-separated) | `bca,bni,bri` |
| `MIDTRANS_VA_EXPIRY_HOURS` | Durasi VA aktif dalam jam | `168` (7 hari) |
| `MIDTRANS_VA_CUSTOM_PREFIX` | Prefix custom untuk VA number (kosong = random) | — |

### 1.2 Mendapatkan API Keys

1. Buka [Midtrans Dashboard](https://dashboard.midtrans.com) (sandbox: [Sandbox Dashboard](https://dashboard.sandbox.midtrans.com))
2. Login atau register akun merchant
3. Pergi ke **Settings → Access Keys**
4. Salin **Server Key** dan **Client Key**
5. Catat **Merchant ID** dari halaman dashboard

### 1.3 Konfigurasi Webhook (Payment Notification URL)

1. Di Midtrans Dashboard, buka **Settings → Configuration**
2. Di bagian **Payment Notification URL**, masukkan:
   ```
   https://your-domain.com/api/midtrans/webhook
   ```
3. Pastikan URL bisa diakses publik (tidak dilindungi auth)
4. Midtrans akan mengirim HTTP POST ke URL ini setiap kali status transaksi berubah

### 1.4 Sandbox vs Production

| Aspek | Sandbox | Production |
|-------|---------|------------|
| Base URL | `api.sandbox.midtrans.com` | `api.midtrans.com` |
| Snap URL | `app.sandbox.midtrans.com` | `app.midtrans.com` |
| Key Prefix | `SB-Mid-server-xxx` | `Mid-server-xxx` |
| Uang asli? | ❌ Tidak | ✅ Ya |
| Simulator | ✅ Tersedia | ❌ Tidak |

### 1.5 File Konfigurasi Laravel

File: `config/midtrans.php`

```php
return [
    'merchant_id'  => env('MIDTRANS_MERCHANT_ID'),
    'server_key'   => env('MIDTRANS_SERVER_KEY'),
    'client_key'   => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'base_url'     => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com',
    'snap_url'     => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/v1'
        : 'https://app.sandbox.midtrans.com/snap/v1',
    'enabled_banks' => explode(',', env('MIDTRANS_ENABLED_BANKS', 'bca,bni,bri')),
    'va_expiry_duration' => (int) env('MIDTRANS_VA_EXPIRY_HOURS', 168),
    'va_custom_prefix' => env('MIDTRANS_VA_CUSTOM_PREFIX', ''),
];
```

### 1.6 Arsitektur Service

```
┌─────────────────────────────────────────────────────────┐
│                    TuitionController                     │
│           (checkout, checkPaymentStatus)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    TuitionService                        │
│  (processCheckout, processMidtransNotification,          │
│   checkMidtransStatus)                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   MidtransService                        │
│  (createVirtualAccount, createSnapTransaction,           │
│   handleNotification, verifySignature,                   │
│   getTransactionStatus, cancelTransaction)               │
└─────────────────────┬───────────────────────────────────┘
                      │
              ┌───────┴───────┐
              ▼               ▼
    ┌──────────────┐  ┌──────────────┐
    │  Core API    │  │  Snap API    │
    │ (Primary)    │  │ (Fallback)   │
    │ POST /charge │  │ POST /snap   │
    └──────────────┘  └──────────────┘
```

---

## 2. Midtrans Tuition

### 2.1 Flow Pembayaran UKT via Midtrans

```
Mahasiswa (FE)                    Backend (SIA-UGN)                 Midtrans API
     │                                    │                               │
     │  POST /student/tuition/{id}/       │                               │
     │  checkout {bank: "bca"}            │                               │
     │ ──────────────────────────────────►│                               │
     │                                    │  POST /v2/charge (Core API)   │
     │                                    │ ─────────────────────────────►│
     │                                    │                               │
     │                            ┌───────┤  Core API Berhasil?           │
     │                            │  YA   │◄─────────────────────────────│
     │                            │       │  VA Number + Transaction ID   │
     │                            ▼       │                               │
     │                     Simpan ke DB   │                               │
     │◄──────────────────────────────────│                               │
     │  {va_number, bank, expiry}         │                               │
     │                                    │                               │
     │                            ┌───────┤  Core API GAGAL?              │
     │                            │ TIDAK │                               │
     │                            ▼       │  POST /snap/v1/transactions   │
     │                                    │ ─────────────────────────────►│
     │                                    │◄─────────────────────────────│
     │                                    │  snap_token + redirect_url    │
     │                     Simpan ke DB   │                               │
     │◄──────────────────────────────────│                               │
     │  {snap_token, redirect_url}        │                               │
     │                                    │                               │
     ├── Mahasiswa bayar via ATM / ───────┤                               │
     │   m-banking / internet banking     │                               │
     │                                    │                               │
     │                                    │  POST /api/midtrans/webhook   │
     │                                    │◄─────────────────────────────│
     │                                    │  {transaction_status:          │
     │                                    │   "settlement"}               │
     │                                    │                               │
     │                                    │  Verifikasi signature         │
     │                                    │  Update status → verified     │
     │                                    │  Tagihan → paid               │
     │                                    │                               │
     │  Push Notification                 │                               │
     │  "Pembayaran Berhasil ✅"          │                               │
     │◄──────────────────────────────────│                               │
```

### 2.2 API Endpoints

---

#### 2.2.1 Checkout — Buat Transaksi VA

Membuat transaksi pembayaran VA via Midtrans. Sistem otomatis mencoba Core API terlebih dahulu, jika gagal akan fallback ke Snap API.

```
POST /api/student/tuition/{id}/checkout
```

**Auth:** Bearer Token (role: mahasiswa)

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | integer | ID tagihan UKT (`id_tuition_fee`) |

**Request Body (JSON):**

```json
{
    "bank": "bca"
}
```

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `bank` | string | ✅ | Kode bank: `bca`, `bni`, `bri` |

**Response — Core API Berhasil (201):**

```json
{
    "status": "success",
    "message": "Transaksi pembayaran berhasil dibuat. Silakan lakukan pembayaran.",
    "data": {
        "id_tuition_payment": 1,
        "id_tuition_fee": 5,
        "amount": 5000000.00,
        "payment_method": "virtual_account",
        "method": "core_api",
        "midtrans_order_id": "UKT-5-1714800000",
        "midtrans_va_bank": "bca",
        "va_number": "12345678901234",
        "verification_status": "pending",
        "expiry_time": "2026-05-11T22:00:00+07:00",
        "created_at": "2026-05-04T22:00:00+07:00"
    }
}
```

**Response — Snap Fallback (201):**

```json
{
    "status": "success",
    "message": "Transaksi pembayaran berhasil dibuat. Silakan lakukan pembayaran.",
    "data": {
        "id_tuition_payment": 1,
        "id_tuition_fee": 5,
        "amount": 5000000.00,
        "payment_method": "virtual_account",
        "method": "snap",
        "midtrans_order_id": "UKT-5-1714800000",
        "midtrans_va_bank": "bca",
        "snap_token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
        "redirect_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/66e4fa55...",
        "verification_status": "pending",
        "expiry_time": "2026-05-11T22:00:00+07:00",
        "created_at": "2026-05-04T22:00:00+07:00"
    }
}
```

**Error Responses:**

| Code | Kondisi |
|------|---------|
| 422 | Tagihan sudah lunas / dibatalkan / bank tidak valid |
| 404 | Tagihan tidak ditemukan |
| 500 | Midtrans Core API dan Snap API gagal |

**Catatan untuk Frontend:**
- Jika `method` = `core_api`: tampilkan `va_number` langsung ke mahasiswa untuk dibayar via ATM/m-banking
- Jika `method` = `snap`: gunakan `snap_token` dengan Snap.js atau arahkan ke `redirect_url`
- Jika checkout dipanggil ulang dan VA masih aktif, response akan mengembalikan data VA yang sudah ada (HTTP 200)

---

#### 2.2.2 Cek Status Pembayaran

Cek status pembayaran real-time dari Midtrans.

```
GET /api/student/tuition/{id}/payment-status
```

**Auth:** Bearer Token (role: mahasiswa)

**Path Parameters:**

| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `id` | integer | ID tagihan UKT (`id_tuition_fee`) |

**Response (200):**

```json
{
    "status": "success",
    "message": "Status pembayaran berhasil diambil.",
    "data": {
        "id_tuition_payment": 1,
        "id_tuition_fee": 5,
        "verification_status": "pending",
        "payment_method": "virtual_account",
        "midtrans_order_id": "UKT-5-1714800000",
        "midtrans_va_number": "12345678901234",
        "midtrans_va_bank": "bca",
        "midtrans_expiry_time": "2026-05-11T22:00:00+07:00",
        "midtrans_status": {
            "status": "success",
            "transaction_status": "pending",
            "data": {
                "transaction_id": "xxx-xxx-xxx",
                "order_id": "UKT-5-1714800000",
                "gross_amount": "5000000.00",
                "transaction_status": "pending",
                "fraud_status": "accept",
                "payment_type": "bank_transfer",
                "va_numbers": [
                    {"bank": "bca", "va_number": "12345678901234"}
                ]
            }
        }
    }
}
```

---

#### 2.2.3 Webhook Midtrans (Notification Handler)

Endpoint publik untuk menerima notifikasi otomatis dari Midtrans setiap kali status transaksi berubah.

```
POST /api/midtrans/webhook
```

**Auth:** Tidak ada (publik). Keamanan dijamin oleh verifikasi **signature key**.

**Request Body (dari Midtrans):**

```json
{
    "transaction_time": "2026-05-04 22:00:00",
    "transaction_status": "settlement",
    "transaction_id": "xxx-xxx-xxx",
    "status_message": "midtrans payment notification",
    "status_code": "200",
    "signature_key": "sha512_hash_string",
    "payment_type": "bank_transfer",
    "order_id": "UKT-5-1714800000",
    "merchant_id": "G123456789",
    "gross_amount": "5000000.00",
    "fraud_status": "accept",
    "currency": "IDR"
}
```

**Verifikasi Signature:**

```
SHA512(order_id + status_code + gross_amount + server_key)
```

**Response (200):**

```json
{
    "status": "success",
    "message": "Payment settled dan diverifikasi"
}
```

**Transaction Status yang Diproses:**

| Status | Aksi |
|--------|------|
| `settlement` | ✅ Pembayaran lunas → `verification_status` = `verified`, tagihan = `paid` |
| `pending` | ⏳ Menunggu pembayaran (status awal) |
| `capture` | ✅ (Credit card only) Jika `fraud_status` = `accept` → verified |
| `deny` | ❌ Transaksi ditolak → `verification_status` = `rejected` |
| `expire` | ⏰ VA kedaluwarsa → payment record dihapus, tagihan kembali `unpaid` |
| `cancel` | ❌ Transaksi dibatalkan → `verification_status` = `rejected` |

### 2.3 Core API vs Snap API

| Aspek | Core API | Snap API |
|-------|----------|----------|
| Endpoint | `POST /v2/charge` | `POST /snap/v1/transactions` |
| Response | VA number langsung | Snap token + redirect URL |
| Kontrol UI | Penuh (custom UI) | Redirect ke halaman Midtrans |
| Kapan digunakan | **Primary** — selalu dicoba pertama | **Fallback** — jika Core API gagal |
| Kelebihan | VA number langsung, no redirect | Selalu berhasil, semua bank |
| Kekurangan | Butuh channel bank aktif | User harus redirect / pakai Snap.js |

**Fallback Logic:**

```
1. Coba Core API bank transfer
   ├─ Berhasil → Return VA number
   └─ Gagal (channel tidak aktif, error, dll)
       ├─ Coba Snap API
       │   ├─ Berhasil → Return snap token + redirect URL
       │   └─ Gagal → Throw exception (500)
```

### 2.4 Custom VA Number

Jika `MIDTRANS_VA_CUSTOM_PREFIX` diisi (contoh: `7788`), maka VA number akan berformat:

```
{prefix}{NIM_mahasiswa}
Contoh: 77882024001
```

**Syarat:**
- Fitur custom VA harus diaktifkan di dashboard Midtrans
- Hanya tersedia untuk bank BCA, BNI, BRI
- Jika prefix kosong, Midtrans akan generate VA number secara random

### 2.5 Handling di Frontend

#### Jika method = `core_api`

Tampilkan informasi VA langsung ke mahasiswa:

```
╔══════════════════════════════════════╗
║  Pembayaran UKT Semester Genap 2026 ║
║                                      ║
║  Bank: BCA                           ║
║  No. Virtual Account: 12345678901234 ║
║  Jumlah: Rp 5.000.000               ║
║  Berlaku sampai: 11 Mei 2026 22:00  ║
║                                      ║
║  Cara Bayar:                         ║
║  1. Buka ATM/m-banking BCA           ║
║  2. Pilih menu Transfer              ║
║  3. Pilih ke BCA Virtual Account     ║
║  4. Masukkan nomor VA di atas        ║
║  5. Konfirmasi pembayaran            ║
╚══════════════════════════════════════╝
```

#### Jika method = `snap`

Gunakan Snap.js atau redirect:

**Opsi A — Snap.js (Popup):**
```html
<script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="SB-Mid-client-xxx"></script>
<script>
    snap.pay('SNAP_TOKEN_DARI_RESPONSE', {
        onSuccess: function(result) { /* handle success */ },
        onPending: function(result) { /* handle pending */ },
        onError: function(result) { /* handle error */ },
        onClose: function() { /* handle popup closed */ }
    });
</script>
```

**Opsi B — Redirect:**
```javascript
window.location.href = response.data.redirect_url;
```

### 2.6 Webhook — Notifikasi Otomatis

Setelah mahasiswa membayar via ATM/m-banking, Midtrans akan mengirim notifikasi ke endpoint webhook. Flow:

1. **Midtrans** mengirim HTTP POST ke `/api/midtrans/webhook`
2. **Backend** memverifikasi signature (SHA-512)
3. **Backend** update status pembayaran berdasarkan `transaction_status`
4. Jika `settlement`:
   - `tuition_payment.verification_status` → `verified`
   - `tuition_fee.status` → `paid`
   - Kirim push notification ke mahasiswa
5. Jika `expire`:
   - Hapus record payment (agar bisa checkout ulang)
   - `tuition_fee.status` → `unpaid`

---

## 3. Ringkasan API

### 3.1 Tabel Endpoint

| # | Method | Endpoint | Auth | Deskripsi |
|---|--------|----------|------|-----------|
| 1 | `POST` | `/api/student/tuition/{id}/checkout` | ✅ mahasiswa | Buat transaksi VA Midtrans |
| 2 | `GET` | `/api/student/tuition/{id}/payment-status` | ✅ mahasiswa | Cek status pembayaran real-time |
| 3 | `POST` | `/api/midtrans/webhook` | ❌ publik | Webhook notifikasi dari Midtrans |

### 3.2 Status Code

| Code | Deskripsi |
|------|-----------|
| 200 | Request berhasil (get data / webhook processed) |
| 201 | Transaksi baru berhasil dibuat |
| 400 | Webhook payload invalid / signature salah |
| 404 | Tagihan / pembayaran tidak ditemukan |
| 422 | Validasi gagal (tagihan sudah lunas, bank tidak valid, dll) |
| 500 | Server error (Midtrans API gagal) |

### 3.3 Database Schema — Kolom Midtrans di `tuition_payments`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `midtrans_transaction_id` | varchar(100) | Transaction ID dari Midtrans |
| `midtrans_order_id` | varchar(100) | Order ID unik (format: `UKT-{fee_id}-{timestamp}`) |
| `midtrans_payment_type` | varchar(50) | Tipe pembayaran (bank_transfer) |
| `midtrans_va_number` | varchar(50) | Nomor Virtual Account |
| `midtrans_va_bank` | varchar(20) | Kode bank VA (bca, bni, bri) |
| `midtrans_snap_token` | varchar(255) | Snap token (jika fallback ke Snap) |
| `midtrans_snap_url` | varchar(500) | Snap redirect URL |
| `midtrans_expiry_time` | timestamp | Waktu kedaluwarsa VA |
| `midtrans_response` | json | Raw JSON response dari Midtrans |

### 3.4 File-File Terkait

| File | Deskripsi |
|------|-----------|
| `config/midtrans.php` | Konfigurasi Midtrans |
| `app/Services/MidtransService.php` | Service utama komunikasi ke Midtrans API |
| `app/Services/TuitionService.php` | Orchestrator — checkout, webhook processing |
| `app/Http/Controllers/TuitionController.php` | Controller endpoint mahasiswa |
| `app/Http/Controllers/MidtransWebhookController.php` | Controller webhook Midtrans |
| `app/Models/TuitionPayment.php` | Model pembayaran |
| `routes/api.php` | Routing API |

### 3.5 Testing dengan Sandbox

1. Pastikan `MIDTRANS_IS_PRODUCTION=false`
2. Gunakan [Midtrans Sandbox Simulator](https://simulator.sandbox.midtrans.com/) untuk test pembayaran
3. Untuk test webhook, gunakan tool seperti [ngrok](https://ngrok.com/) atau [Expose](https://expose.dev/) agar localhost bisa diakses dari luar
4. VA Number dari sandbox bisa dibayar melalui simulator Midtrans
