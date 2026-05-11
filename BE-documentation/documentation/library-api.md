# Dokumentasi API Perpustakaan - SIA UGN

## Daftar Isi

- [Informasi Umum](#informasi-umum)
- [Autentikasi](#autentikasi)
- [A. Endpoint User (Semua Role)](#a-endpoint-user-semua-role)
  - [A1. Katalog Buku](#a1-katalog-buku)
  - [A2. Kategori Buku](#a2-kategori-buku)
  - [A3. Pemesanan Buku](#a3-pemesanan-buku)
  - [A4. Aktivitas Perpustakaan](#a4-aktivitas-perpustakaan)
  - [A5. Usulan Buku](#a5-usulan-buku)
- [B. Endpoint Admin & Manager](#b-endpoint-admin--manager)
  - [B1. Dashboard](#b1-dashboard)
  - [B2. Manajemen Kategori Buku](#b2-manajemen-kategori-buku)
  - [B3. Manajemen Buku](#b3-manajemen-buku)
  - [B4. Manajemen Pesanan / Peminjaman](#b4-manajemen-pesanan--peminjaman)
  - [B5. Manajemen Usulan Buku](#b5-manajemen-usulan-buku)
- [C. Notifikasi](#c-notifikasi)
- [D. Status & Alur](#d-status--alur)

---

## Informasi Umum

| Item | Detail |
|------|--------|
| Base URL | `/api` |
| Format Response | JSON |
| Autentikasi | Bearer Token (Sanctum) |
| Content-Type | `application/json` |

### Format Response Standar

```json
{
    "status": "success | error",
    "message": "Pesan deskriptif",
    "data": "... | []",
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 72
    }
}
```

### HTTP Status Codes

| Code | Deskripsi |
|------|-----------|
| 200 | OK - Request berhasil |
| 201 | Created - Data berhasil dibuat |
| 403 | Forbidden - Tidak memiliki akses |
| 404 | Not Found - Data tidak ditemukan |
| 409 | Conflict - Data memiliki relasi yang belum dihapus |
| 422 | Unprocessable Entity - Validasi gagal / Business logic error |
| 500 | Internal Server Error - Error internal |

---

## Autentikasi

Semua endpoint membutuhkan autentikasi via Sanctum. Sertakan header:

```
Authorization: Bearer {token}
```

---

## A. Endpoint User (Semua Role)

Endpoint ini dapat diakses oleh semua user yang sudah login (mahasiswa, dosen, admin, manager).

---

### A1. Katalog Buku

#### `GET /api/library/books` — Daftar Buku

Mengambil daftar buku perpustakaan (hanya buku aktif) dengan pencarian dan filter.

**Query Parameters:**

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `search` | string | No | Cari berdasarkan judul, penulis, atau ISBN |
| `id_book_category` | integer | No | Filter berdasarkan ID kategori buku |
| `per_page` | integer | No | Jumlah data per halaman (default: 15) |
| `page` | integer | No | Nomor halaman |

**Response 200:**

```json
{
    "status": "success",
    "message": "Daftar buku berhasil diambil.",
    "data": [
        {
            "id_book": 1,
            "title": "Pemrograman Web dengan Laravel",
            "author": "John Doe",
            "publisher": "Penerbit ABC",
            "year": 2024,
            "isbn": "978-602-1234-56-7",
            "category": {
                "id_book_category": 1,
                "name": "Informatika",
                "slug": "informatika"
            },
            "total_stock": 5,
            "available_stock": 3,
            "is_available": true,
            "status": "active",
            "created_at": "2026-03-31T00:00:00.000000Z",
            "updated_at": "2026-03-31T00:00:00.000000Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 1
    }
}
```

---

#### `GET /api/library/books/{id}` — Detail Buku

**Response 200:**

```json
{
    "status": "success",
    "message": "Detail buku berhasil diambil.",
    "data": {
        "id_book": 1,
        "title": "Pemrograman Web dengan Laravel",
        "author": "John Doe",
        "publisher": "Penerbit ABC",
        "year": 2024,
        "isbn": "978-602-1234-56-7",
        "category": {
            "id_book_category": 1,
            "name": "Informatika",
            "slug": "informatika"
        },
        "total_stock": 5,
        "available_stock": 3,
        "is_available": true,
        "status": "active",
        "created_at": "2026-03-31T00:00:00.000000Z",
        "updated_at": "2026-03-31T00:00:00.000000Z"
    }
}
```

---

### A2. Kategori Buku

#### `GET /api/library/categories` — Daftar Kategori Buku

**Response 200:**

```json
{
    "status": "success",
    "message": "Daftar kategori buku berhasil diambil.",
    "data": [
        {
            "id_book_category": 1,
            "name": "Informatika",
            "slug": "informatika",
            "description": "Buku-buku terkait ilmu komputer, pemrograman, dan teknologi informasi",
            "created_at": "2026-03-31T00:00:00.000000Z",
            "updated_at": "2026-03-31T00:00:00.000000Z"
        }
    ]
}
```

---

### A3. Pemesanan Buku

#### `POST /api/library/books/{id}/order` — Pesan Buku

Memesan buku dari perpustakaan. Buku harus aktif dan stok harus tersedia. User tidak boleh memiliki pesanan aktif (status: ordered/borrowed) untuk buku yang sama.

**Request Body:** _(tidak perlu body)_

**Response 201:**

```json
{
    "status": "success",
    "message": "Buku berhasil dipesan.",
    "data": {
        "id_book_order": 1,
        "id_user": 5,
        "user_name": "John Student",
        "book": {
            "id_book": 1,
            "title": "Pemrograman Web dengan Laravel",
            "author": "John Doe",
            "category": "Informatika"
        },
        "status": "ordered",
        "ordered_at": "2026-03-31T05:30:00.000000Z",
        "borrowed_at": null,
        "returned_at": null,
        "borrow_duration_days": null,
        "borrow_duration": null,
        "admin_note": null,
        "created_at": "2026-03-31T05:30:00.000000Z",
        "updated_at": "2026-03-31T05:30:00.000000Z"
    }
}
```

**Response 422 (Stok habis):**

```json
{
    "status": "error",
    "message": "Stok buku habis. Tidak dapat memesan."
}
```

**Response 422 (Pesanan aktif sudah ada):**

```json
{
    "status": "error",
    "message": "Anda sudah memiliki pesanan aktif untuk buku ini."
}
```

---

### A4. Aktivitas Perpustakaan

#### `GET /api/library/activities` — Riwayat Aktivitas

Mengambil riwayat peminjaman user yang sedang login.

**Query Parameters:**

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `status` | string | No | Filter: `ordered`, `borrowed`, `returned`, `cancelled` |

**Response 200:**

```json
{
    "status": "success",
    "message": "Riwayat aktivitas perpustakaan berhasil diambil.",
    "data": [
        {
            "id_book_order": 1,
            "id_user": 5,
            "user_name": "John Student",
            "book": {
                "id_book": 1,
                "title": "Pemrograman Web dengan Laravel",
                "author": "John Doe",
                "category": "Informatika"
            },
            "status": "borrowed",
            "ordered_at": "2026-03-20T00:00:00.000000Z",
            "borrowed_at": "2026-03-21T10:00:00.000000Z",
            "returned_at": null,
            "borrow_duration_days": 10,
            "borrow_duration": "1 week 3 days",
            "admin_note": null,
            "created_at": "2026-03-20T00:00:00.000000Z",
            "updated_at": "2026-03-21T10:00:00.000000Z"
        }
    ]
}
```

> **Catatan:** `borrow_duration_days` dan `borrow_duration` menunjukkan berapa lama user sudah meminjam buku tersebut. Jika buku sudah dikembalikan, durasi dihitung dari `borrowed_at` sampai `returned_at`. Jika masih dipinjam, durasi dihitung dari `borrowed_at` sampai sekarang.

---

#### `GET /api/library/activities/{id}` — Detail Aktivitas

**Response 200:** Sama seperti item di array `data` pada `GET /api/library/activities`.

**Response 403 (Bukan milik user):**

```json
{
    "status": "error",
    "message": "Anda tidak memiliki akses ke aktivitas ini."
}
```

---

#### `PATCH /api/library/activities/{id}/cancel` — Batalkan Pesanan

Membatalkan pesanan buku. Hanya bisa dilakukan jika status masih `ordered`.

**Request Body:** _(tidak perlu body)_

**Response 200:**

```json
{
    "status": "success",
    "message": "Pesanan berhasil dibatalkan.",
    "data": {
        "id_book_order": 1,
        "status": "cancelled",
        "..."
    }
}
```

**Response 422 (Sudah diproses):**

```json
{
    "status": "error",
    "message": "Pesanan ini tidak dapat dibatalkan karena sudah diproses."
}
```

---

### A5. Usulan Buku

#### `GET /api/library/suggestions` — Daftar Usulan Buku User

**Query Parameters:**

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `status` | string | No | Filter: `pending`, `approved`, `rejected` |

**Response 200:**

```json
{
    "status": "success",
    "message": "Daftar usulan buku berhasil diambil.",
    "data": [
        {
            "id_book_suggestion": 1,
            "id_user": 5,
            "user_name": "John Student",
            "title": "Machine Learning dengan Python",
            "author": "Jane Author",
            "reason": "Dibutuhkan sebagai referensi mata kuliah AI",
            "status": "approved",
            "admin_response": "Buku akan diadakan pada periode berikutnya",
            "responded_at": "2026-03-30T12:00:00.000000Z",
            "created_at": "2026-03-28T00:00:00.000000Z",
            "updated_at": "2026-03-30T12:00:00.000000Z"
        }
    ]
}
```

---

#### `POST /api/library/suggestions` — Kirim Usulan Buku

**Request Body:**

```json
{
    "title": "Machine Learning dengan Python",
    "author": "Jane Author",
    "reason": "Dibutuhkan sebagai referensi mata kuliah AI"
}
```

| Field | Tipe | Required | Max Length | Deskripsi |
|-------|------|----------|------------|-----------|
| `title` | string | Yes | 255 | Judul buku yang diusulkan |
| `author` | string | Yes | 255 | Nama penulis |
| `reason` | string | Yes | 1000 | Alasan mengusulkan buku |

**Response 201:**

```json
{
    "status": "success",
    "message": "Usulan buku berhasil dikirim.",
    "data": {
        "id_book_suggestion": 1,
        "title": "Machine Learning dengan Python",
        "author": "Jane Author",
        "reason": "Dibutuhkan sebagai referensi mata kuliah AI",
        "status": "pending",
        "admin_response": null,
        "responded_at": null,
        "created_at": "2026-03-31T05:30:00.000000Z",
        "updated_at": "2026-03-31T05:30:00.000000Z"
    }
}
```

---

## B. Endpoint Admin & Manager

Endpoint ini hanya dapat diakses oleh user dengan role `admin` atau `manager`.

---

### B1. Dashboard

#### `GET /api/admin/library/dashboard` — Dashboard Statistik

**Response 200:**

```json
{
    "status": "success",
    "message": "Dashboard perpustakaan berhasil diambil.",
    "data": {
        "total_books": 150,
        "active_books": 145,
        "total_orders": 320,
        "active_orders": 25,
        "pending_orders": 10,
        "borrowed_orders": 15,
        "total_suggestions": 40,
        "pending_suggestions": 5
    }
}
```

---

### B2. Manajemen Kategori Buku

#### `GET /api/admin/library/categories` — Daftar Kategori

Response menyertakan `books_count` (jumlah buku per kategori).

**Response 200:**

```json
{
    "status": "success",
    "message": "Daftar kategori buku berhasil diambil.",
    "data": [
        {
            "id_book_category": 1,
            "name": "Informatika",
            "slug": "informatika",
            "description": "Buku-buku terkait ilmu komputer",
            "books_count": 45,
            "created_at": "2026-03-31T00:00:00.000000Z",
            "updated_at": "2026-03-31T00:00:00.000000Z"
        }
    ]
}
```

---

#### `POST /api/admin/library/categories` — Tambah Kategori

**Request Body:**

```json
{
    "name": "Ekonomi",
    "slug": "ekonomi",
    "description": "Buku-buku terkait ilmu ekonomi"
}
```

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `name` | string | Yes | Nama kategori (unique) |
| `slug` | string | Yes | Slug URL-friendly (unique, alpha_dash) |
| `description` | string | No | Deskripsi kategori (max 500) |

**Response 201:** Data kategori yang dibuat.

---

#### `PUT /api/admin/library/categories/{id}` — Update Kategori

**Request Body:** Sama seperti POST (semua field optional).

**Response 200:** Data kategori yang diperbarui.

---

#### `DELETE /api/admin/library/categories/{id}` — Hapus Kategori

**Response 200:**

```json
{
    "status": "success",
    "message": "Kategori buku berhasil dihapus."
}
```

**Response 409 (Masih memiliki buku):**

```json
{
    "status": "error",
    "message": "Kategori tidak dapat dihapus karena masih memiliki buku terkait."
}
```

---

### B3. Manajemen Buku

#### `GET /api/admin/library/books` — Daftar Semua Buku

Query parameters sama seperti `GET /api/library/books`, ditambah filter `status` (`active` / `inactive`).

---

#### `POST /api/admin/library/books` — Tambah Buku Baru

**Request Body:**

```json
{
    "title": "Pemrograman Web dengan Laravel",
    "author": "John Doe",
    "publisher": "Penerbit ABC",
    "year": 2024,
    "isbn": "978-602-1234-56-7",
    "id_book_category": 1,
    "total_stock": 5
}
```

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `title` | string | Yes | Judul buku |
| `author` | string | Yes | Nama penulis |
| `publisher` | string | No | Nama penerbit |
| `year` | integer | No | Tahun terbit (1900 - tahun depan) |
| `isbn` | string | No | Nomor ISBN |
| `id_book_category` | integer | Yes | ID kategori buku |
| `total_stock` | integer | Yes | Jumlah stok total |

> **Catatan:** `available_stock` otomatis diisi sama dengan `total_stock` saat pembuatan.

**Response 201:** Data buku yang dibuat.

---

#### `GET /api/admin/library/books/{id}` — Detail Buku

Menyertakan statistik peminjaman.

**Response 200:**

```json
{
    "status": "success",
    "data": {
        "id_book": 1,
        "title": "...",
        "...": "...",
        "order_statistics": {
            "total_orders": 15,
            "active_orders": 3,
            "completed_orders": 12
        }
    }
}
```

---

#### `PUT /api/admin/library/books/{id}` — Update Buku

**Request Body:** Sama seperti POST (semua field optional). Jika `total_stock` berubah, `available_stock` otomatis disesuaikan berdasarkan selisih.

**Response 200:** Data buku yang diperbarui.

---

#### `PATCH /api/admin/library/books/{id}/toggle-status` — Toggle Status Buku

Mengubah status antara `active` dan `inactive`.

**Request Body:** _(tidak perlu body)_

**Response 200:**

```json
{
    "status": "success",
    "message": "Status buku berhasil diperbarui.",
    "data": {
        "id_book": 1,
        "title": "Pemrograman Web dengan Laravel",
        "new_status": "inactive"
    }
}
```

---

### B4. Manajemen Pesanan / Peminjaman

#### `GET /api/admin/library/orders` — Daftar Semua Pesanan

**Query Parameters:**

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `status` | string | No | Filter: `ordered`, `borrowed`, `returned`, `cancelled` |
| `search` | string | No | Cari berdasarkan nama user atau judul buku |
| `per_page` | integer | No | Jumlah data per halaman (default: 15) |
| `page` | integer | No | Nomor halaman |

**Response 200:**

```json
{
    "status": "success",
    "message": "Daftar pesanan berhasil diambil.",
    "data": [
        {
            "id_book_order": 1,
            "id_user": 5,
            "user_name": "John Student",
            "user_email": "john@example.com",
            "book": {
                "id_book": 1,
                "title": "Pemrograman Web dengan Laravel",
                "author": "John Doe",
                "category": "Informatika"
            },
            "status": "borrowed",
            "ordered_at": "2026-03-20T00:00:00.000000Z",
            "borrowed_at": "2026-03-21T10:00:00.000000Z",
            "returned_at": null,
            "borrow_duration_days": 10,
            "borrow_duration": "1 week 3 days",
            "admin_note": null,
            "created_at": "2026-03-20T00:00:00.000000Z",
            "updated_at": "2026-03-21T10:00:00.000000Z"
        }
    ],
    "meta": { "..." }
}
```

---

#### `GET /api/admin/library/orders/{id}` — Detail Pesanan

**Response 200:** Sama seperti item di array pada endpoint daftar pesanan.

---

#### `PATCH /api/admin/library/orders/{id}/confirm-borrow` — Konfirmasi Peminjaman

Mengubah status pesanan dari `ordered` → `borrowed`. Mengirim notifikasi ke peminjam.

**Request Body:**

```json
{
    "admin_note": "Silakan ambil di perpustakaan"
}
```

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `admin_note` | string | No | Catatan admin (max 500) |

**Response 200:** Data pesanan yang diperbarui (status: borrowed).

**Response 422:**

```json
{
    "status": "error",
    "message": "Pesanan ini tidak dapat dikonfirmasi karena statusnya bukan \"ordered\"."
}
```

---

#### `PATCH /api/admin/library/orders/{id}/confirm-return` — Konfirmasi Pengembalian

Mengubah status pesanan dari `borrowed` → `returned`. Stok buku otomatis bertambah. Mengirim notifikasi ke peminjam.

**Request Body:**

```json
{
    "admin_note": "Buku telah diterima dalam kondisi baik"
}
```

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `admin_note` | string | No | Catatan admin (max 500) |

**Response 200:** Data pesanan yang diperbarui (status: returned).

**Response 422:**

```json
{
    "status": "error",
    "message": "Pesanan ini tidak dapat dikembalikan karena statusnya bukan \"borrowed\"."
}
```

---

### B5. Manajemen Usulan Buku

#### `GET /api/admin/library/suggestions` — Daftar Semua Usulan

**Query Parameters:**

| Parameter | Tipe | Required | Deskripsi |
|-----------|------|----------|-----------|
| `status` | string | No | Filter: `pending`, `approved`, `rejected` |
| `search` | string | No | Cari berdasarkan judul, penulis, atau nama pengusul |

**Response 200:**

```json
{
    "status": "success",
    "message": "Daftar usulan buku berhasil diambil.",
    "data": [
        {
            "id_book_suggestion": 1,
            "id_user": 5,
            "user_name": "John Student",
            "user_email": "john@example.com",
            "title": "Machine Learning dengan Python",
            "author": "Jane Author",
            "reason": "Dibutuhkan sebagai referensi mata kuliah AI",
            "status": "pending",
            "admin_response": null,
            "responded_at": null,
            "created_at": "2026-03-28T00:00:00.000000Z",
            "updated_at": "2026-03-28T00:00:00.000000Z"
        }
    ]
}
```

---

#### `GET /api/admin/library/suggestions/{id}` — Detail Usulan

**Response 200:** Sama seperti item pada daftar usulan.

---

#### `PATCH /api/admin/library/suggestions/{id}/respond` — Respon Usulan

Merespon usulan buku (approve/reject). Mengirim notifikasi ke pengusul.

**Request Body:**

```json
{
    "status": "approved",
    "admin_response": "Buku akan diadakan pada periode berikutnya"
}
```

| Field | Tipe | Required | Deskripsi |
|-------|------|----------|-----------|
| `status` | string | Yes | `approved` atau `rejected` |
| `admin_response` | string | Yes | Respon/komentar admin (max 1000) |

**Response 200:** Data usulan yang diperbarui.

**Response 422 (Sudah direspon):**

```json
{
    "status": "error",
    "message": "Usulan ini sudah direspons sebelumnya."
}
```

---

## C. Notifikasi

Sistem perpustakaan mengirim notifikasi melalui **WebSocket** (untuk user yang online) dan **Push Notification** (untuk user yang offline).

Notifikasi dikirim pada event berikut:

| Event | Type | Penerima |
|-------|------|----------|
| Peminjaman dikonfirmasi | `library_order` | Peminjam |
| Pengembalian dikonfirmasi | `library_order` | Peminjam |
| Usulan buku disetujui | `library_suggestion` | Pengusul |
| Usulan buku ditolak | `library_suggestion` | Pengusul |

### Format Payload Notifikasi

```json
{
    "id_notification": 1,
    "type": "library_order",
    "title": "Peminjaman Dikonfirmasi",
    "message": "Peminjaman buku \"Laravel\" telah dikonfirmasi. Silakan ambil buku di perpustakaan.",
    "sender": "System",
    "sent_at": "2026-03-31T05:30:00.000000Z",
    "read_at": null,
    "is_read": false,
    "metadata": {
        "id_book_order": 1,
        "id_book": 1,
        "book_title": "Laravel",
        "status": "borrowed",
        "type": "library_order",
        "screen": "LibraryActivity"
    }
}
```

---

## D. Status & Alur

### Alur Status Pemesanan Buku (`book_orders`)

```
┌──────────┐     Admin konfirmasi     ┌──────────┐     Admin konfirmasi     ┌──────────┐
│ ordered  │ ────────────────────────► │ borrowed │ ────────────────────────► │ returned │
└──────────┘                          └──────────┘                          └──────────┘
      │
      │  User membatalkan
      ▼
┌───────────┐
│ cancelled │
└───────────┘
```

- **ordered**: Buku telah dipesan, menunggu konfirmasi admin. Stok sudah dikurangi.
- **borrowed**: Admin telah mengkonfirmasi. Buku sudah dipinjam.
- **returned**: Admin telah mengkonfirmasi pengembalian. Stok sudah ditambah kembali.
- **cancelled**: User membatalkan pesanan. Stok sudah ditambah kembali.

### Alur Status Usulan Buku (`book_suggestions`)

```
┌─────────┐     Admin menyetujui     ┌──────────┐
│ pending │ ────────────────────────► │ approved │
└─────────┘                          └──────────┘
      │
      │  Admin menolak
      ▼
┌──────────┐
│ rejected │
└──────────┘
```

- **pending**: Usulan baru, menunggu respon admin.
- **approved**: Admin menyetujui usulan.
- **rejected**: Admin menolak usulan.

---

## Daftar Endpoint Ringkasan

| No | Method | Endpoint | Role | Deskripsi |
|----|--------|----------|------|-----------|
| 1 | GET | `/api/library/books` | All Auth | Daftar buku + search + filter |
| 2 | GET | `/api/library/books/{id}` | All Auth | Detail buku |
| 3 | POST | `/api/library/books/{id}/order` | All Auth | Pesan buku |
| 4 | GET | `/api/library/categories` | All Auth | Daftar kategori buku |
| 5 | GET | `/api/library/activities` | All Auth | Riwayat peminjaman user |
| 6 | GET | `/api/library/activities/{id}` | All Auth | Detail aktivitas |
| 7 | PATCH | `/api/library/activities/{id}/cancel` | All Auth | Batalkan pesanan |
| 8 | GET | `/api/library/suggestions` | All Auth | Daftar usulan buku user |
| 9 | POST | `/api/library/suggestions` | All Auth | Kirim usulan buku |
| 10 | GET | `/api/admin/library/dashboard` | Admin/Manager | Dashboard statistik |
| 11 | GET | `/api/admin/library/categories` | Admin/Manager | Daftar kategori |
| 12 | POST | `/api/admin/library/categories` | Admin/Manager | Tambah kategori |
| 13 | PUT | `/api/admin/library/categories/{id}` | Admin/Manager | Update kategori |
| 14 | DELETE | `/api/admin/library/categories/{id}` | Admin/Manager | Hapus kategori |
| 15 | GET | `/api/admin/library/books` | Admin/Manager | Daftar semua buku |
| 16 | POST | `/api/admin/library/books` | Admin/Manager | Tambah buku |
| 17 | GET | `/api/admin/library/books/{id}` | Admin/Manager | Detail buku + stats |
| 18 | PUT | `/api/admin/library/books/{id}` | Admin/Manager | Update buku |
| 19 | PATCH | `/api/admin/library/books/{id}/toggle-status` | Admin/Manager | Toggle aktif/nonaktif |
| 20 | GET | `/api/admin/library/orders` | Admin/Manager | Daftar semua pesanan |
| 21 | GET | `/api/admin/library/orders/{id}` | Admin/Manager | Detail pesanan |
| 22 | PATCH | `/api/admin/library/orders/{id}/confirm-borrow` | Admin/Manager | Konfirmasi peminjaman |
| 23 | PATCH | `/api/admin/library/orders/{id}/confirm-return` | Admin/Manager | Konfirmasi pengembalian |
| 24 | GET | `/api/admin/library/suggestions` | Admin/Manager | Daftar semua usulan |
| 25 | GET | `/api/admin/library/suggestions/{id}` | Admin/Manager | Detail usulan |
| 26 | PATCH | `/api/admin/library/suggestions/{id}/respond` | Admin/Manager | Respon usulan |
