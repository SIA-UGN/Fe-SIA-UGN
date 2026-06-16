# API Persuratan (Correspondence)

Dokumentasi lengkap endpoint API modul **Persuratan** pada Sistem Informasi Akademik UGN.

---

## Daftar Isi

- [Autentikasi](#autentikasi)
- [Role & Akses](#role--akses)
- [Tabel Terkait](#tabel-terkait)
- [Notifikasi Otomatis](#notifikasi-otomatis)
- [Kategori Persuratan](#kategori-persuratan)
- [Penerima Surat (Recipient)](#penerima-surat-recipient)
- [Surat (Correspondence)](#surat-correspondence)
- [Error Responses](#error-responses)

---

## Autentikasi

Semua endpoint di bawah memerlukan header:

```
Authorization: Bearer {token}
```

Token diperoleh dari endpoint `POST /api/auth/login`.

---

## Role & Akses

| Role        | Kirim Surat | Lihat Surat Sendiri | Lihat Semua Surat | Balas / Ubah Status | Kelola Kategori & Penerima |
|-------------|:-----------:|:-------------------:|:-----------------:|:-------------------:|:--------------------------:|
| mahasiswa   | ✅          | ✅                  | ❌                | ❌                  | ❌                         |
| dosen       | ✅          | ✅                  | ❌                | ❌                  | ❌                         |
| manager     | ✅          | ✅                  | ✅                | ✅                  | ✅                         |
| admin       | ✅          | ✅                  | ✅                | ✅                  | ✅                         |

---

## Tabel Terkait

```
correspondence_categories
    id_category  (PK)
    name
    slug         (unique)
    description  (nullable)
    created_at, updated_at

correspondence_recipient
    id_recipient (PK)
    name
    slug         (unique)
    description  (nullable)
    created_at, updated_at

correspondences
    id_correspondence (PK)
    id_user           (FK → users_si.id_user_si)
    id_category       (FK → correspondence_categories.id_category)
    id_recipient      (FK → correspondence_recipient.id_recipient)
    title
    correspondence_body (longtext)
    status            enum: submitted | process | resolved | rejected
    attachment        (nullable, path di storage/public)
    response_text     (nullable, longtext)
    responded_at      (nullable, timestamp)
    created_at, updated_at

notifications
    ...
    id_correspondence (nullable, FK → correspondences.id_correspondence)
    ...
```

---

## Notifikasi Otomatis

Setiap kali admin/manager **membalas surat** (`PATCH /respond`) atau **mengubah status** (`PATCH /status`), sistem secara otomatis:

1. Membuat record baru di tabel `notifications` dengan `id_correspondence` yang sesuai.
2. Me-broadcast event **`NewNotification`** melalui WebSocket (Laravel Reverb) ke pengirim surat yang sedang online.
3. Mengirimkan **push notification** (Expo) ke perangkat pengirim surat yang sedang offline.

### Format Notifikasi Correspondence

Notifikasi tipe `correspondence` akan muncul di endpoint `GET /api/notifications` dengan struktur:

```json
{
  "id_notification": 42,
  "type": "correspondence",
  "title": "Update Status Surat: Permohonan Cuti Akademik",
  "message": "Status surat Anda sekarang: Sedang Diproses. Pengelola telah memberikan respons.",
  "sender": "System",
  "sent_at": "2026-03-03T10:00:00+07:00",
  "read_at": null,
  "is_read": false,
  "metadata": {
    "id_correspondence": 7,
    "title": "Permohonan Cuti Akademik",
    "status": "process",
    "responded_at": "2026-03-03T10:00:00+07:00",
    "category": "Akademik",
    "recipient": "Akademik"
  }
}
```

Filter notifikasi berdasarkan tipe:
```
GET /api/notifications?type=correspondence
```

---

## Kategori Persuratan

Base URL: `/api/correspondence/categories`

---

### `GET /api/correspondence/categories`

Mengambil seluruh daftar kategori persuratan.

**Akses:** Semua role (auth required)

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar kategori persuratan berhasil diambil.",
  "data": [
    {
      "id_category": 1,
      "name": "Akademik",
      "slug": "akademik",
      "description": "Surat menyurat terkait kegiatan akademik.",
      "created_at": "2026-03-03T07:00:00.000000Z",
      "updated_at": "2026-03-03T07:00:00.000000Z"
    }
  ]
}
```

---

### `GET /api/correspondence/categories/{id}`

Mengambil detail satu kategori.

**Akses:** Semua role

**Path Params:**

| Param | Tipe    | Keterangan      |
|-------|---------|-----------------|
| id    | integer | ID kategori     |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Detail kategori berhasil diambil.",
  "data": {
    "id_category": 1,
    "name": "Akademik",
    "slug": "akademik",
    "description": "Surat menyurat terkait kegiatan akademik.",
    "created_at": "2026-03-03T07:00:00.000000Z",
    "updated_at": "2026-03-03T07:00:00.000000Z"
  }
}
```

---

### `POST /api/correspondence/categories`

Membuat kategori baru.

**Akses:** `admin`, `manager`

**Body (`application/json`):**

| Field       | Tipe   | Required | Keterangan                            |
|-------------|--------|:--------:|---------------------------------------|
| name        | string | ✅       | Nama kategori, unik                   |
| slug        | string | ✅       | Slug URL-safe (hanya huruf, angka, `-`, `_`), unik |
| description | string | ❌       | Deskripsi singkat (maks 500 karakter) |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Kategori berhasil dibuat.",
  "data": {
    "id_category": 6,
    "name": "Hukum",
    "slug": "hukum",
    "description": null,
    "created_at": "2026-03-03T08:00:00.000000Z",
    "updated_at": "2026-03-03T08:00:00.000000Z"
  }
}
```

---

### `PATCH /api/correspondence/categories/{id}`

Memperbarui data kategori.

**Akses:** `admin`, `manager`

**Body (`application/json`):** Sama seperti POST, semua field bersifat opsional (`sometimes`).

**Response `200 OK`:** Sama dengan format detail kategori.

---

### `DELETE /api/correspondence/categories/{id}`

Menghapus kategori.

**Akses:** `admin`, `manager`

> ⚠️ Kategori yang masih memiliki surat terkait **tidak dapat** dihapus.

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Kategori berhasil dihapus."
}
```

**Response `409 Conflict`:**

```json
{
  "status": "error",
  "message": "Kategori tidak dapat dihapus karena masih memiliki surat terkait."
}
```

---

## Penerima Surat (Recipient)

Base URL: `/api/correspondence/recipients`

Struktur endpoint dan response identik dengan **Kategori Persuratan**, hanya beda nama field:

| Field        | Tipe   | Required | Keterangan                   |
|--------------|--------|:--------:|------------------------------|
| name         | string | ✅       | Nama penerima, unik           |
| slug         | string | ✅       | Slug URL-safe, unik           |
| description  | string | ❌       | Deskripsi (maks 500 karakter) |

**Endpoint:**

| Method | URL                                  | Akses          |
|--------|--------------------------------------|----------------|
| GET    | `/api/correspondence/recipients`     | Semua role     |
| GET    | `/api/correspondence/recipients/{id}`| Semua role     |
| POST   | `/api/correspondence/recipients`     | admin, manager |
| PATCH  | `/api/correspondence/recipients/{id}`| admin, manager |
| DELETE | `/api/correspondence/recipients/{id}`| admin, manager |

---

## Surat (Correspondence)

Base URL: `/api/correspondence`

---

### `GET /api/correspondence`

Mengambil daftar surat.

- **Mahasiswa / Dosen:** Hanya surat milik sendiri.
- **Admin / Manager:** Seluruh surat dengan dukungan filter.

**Akses:** Semua role

**Query Params (opsional):**

| Param        | Tipe    | Keterangan                                    |
|--------------|---------|-----------------------------------------------|
| status       | string  | `submitted` / `process` / `resolved` / `rejected` |
| id_category  | integer | Filter berdasarkan ID kategori                |
| id_recipient | integer | Filter berdasarkan ID penerima                |
| search       | string  | Cari berdasarkan judul atau isi surat         |

**Contoh request:**

```
GET /api/correspondence?status=submitted&id_category=1
```

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar persuratan berhasil diambil.",
  "data": [
    {
      "id_correspondence": 1,
      "id_user": 12,
      "sender_name": "Budi Santoso",
      "sender_email": "budi@ugn.ac.id",
      "category": {
        "id_category": 1,
        "name": "Akademik",
        "slug": "akademik"
      },
      "recipient": {
        "id_recipient": 1,
        "name": "Akademik",
        "slug": "akademik"
      },
      "title": "Permohonan Cuti Akademik",
      "correspondence_body": "Dengan hormat, saya bermaksud mengajukan...",
      "status": "submitted",
      "attachment_url": "https://domain.com/storage/correspondences/attachments/1234_12.pdf",
      "response_text": null,
      "responded_at": null,
      "created_at": "2026-03-03T08:00:00.000000Z",
      "updated_at": "2026-03-03T08:00:00.000000Z"
    }
  ]
}
```

---

### `GET /api/correspondence/{id}`

Mengambil detail satu surat.

**Akses:**
- Mahasiswa/Dosen: hanya surat milik sendiri.
- Admin/Manager: semua surat.

**Path Params:**

| Param | Tipe    | Keterangan  |
|-------|---------|-------------|
| id    | integer | ID surat    |

**Response `200 OK`:** Format sama seperti item dalam daftar surat.

**Response `403 Forbidden`:**

```json
{
  "status": "error",
  "message": "Anda tidak memiliki akses ke surat ini."
}
```

---

### `POST /api/correspondence`

Mengirim surat baru.

**Akses:** Semua role

**Body (`multipart/form-data`):**

| Field               | Tipe   | Required | Keterangan                                       |
|---------------------|--------|:--------:|--------------------------------------------------|
| id_category         | integer| ✅       | ID kategori (harus ada di tabel)                 |
| id_recipient        | integer| ✅       | ID penerima (harus ada di tabel)                 |
| title               | string | ✅       | Judul surat (maks 255 karakter)                  |
| correspondence_body | string | ✅       | Isi surat lengkap                                |
| attachment          | file   | ❌       | Lampiran: `pdf`, `doc`, `docx`, `jpg`, `jpeg`, `png` (maks 5 MB) |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Surat berhasil dikirim.",
  "data": {
    "id_correspondence": 5,
    "id_user": 12,
    "sender_name": "Budi Santoso",
    "sender_email": "budi@ugn.ac.id",
    "category": { "id_category": 1, "name": "Akademik", "slug": "akademik" },
    "recipient": { "id_recipient": 1, "name": "Akademik", "slug": "akademik" },
    "title": "Permohonan Cuti Akademik",
    "correspondence_body": "Dengan hormat...",
    "status": "submitted",
    "attachment_url": "https://domain.com/storage/correspondences/attachments/1709456789_12.pdf",
    "response_text": null,
    "responded_at": null,
    "created_at": "2026-03-03T09:00:00.000000Z",
    "updated_at": "2026-03-03T09:00:00.000000Z"
  }
}
```

---

### `PATCH /api/correspondence/{id}`

Mengedit surat milik sendiri.

> ⚠️ Hanya surat dengan status `submitted` yang dapat diedit.

**Akses:** Pemilik surat

**Body (`multipart/form-data`):** Sama seperti POST, semua field opsional.

**Response `200 OK`:** Format sama dengan detail surat.

**Response `422 Unprocessable Entity`:**

```json
{
  "status": "error",
  "message": "Surat yang sudah diproses tidak dapat diubah."
}
```

---

### `DELETE /api/correspondence/{id}`

Menghapus surat.

> ⚠️ Mahasiswa/Dosen hanya bisa menghapus surat sendiri dengan status `submitted`. Admin/Manager dapat menghapus surat apapun.

**Akses:** Pemilik (status submitted) atau admin/manager

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Surat berhasil dihapus."
}
```

---

### `DELETE /api/correspondence/{id}/attachment`

Menghapus lampiran dari surat milik sendiri.

> ⚠️ Hanya surat dengan status `submitted` yang lampiran-nya bisa dihapus.

**Akses:** Pemilik surat

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Lampiran berhasil dihapus."
}
```

**Response `404 Not Found`:**

```json
{
  "status": "error",
  "message": "Surat ini tidak memiliki lampiran."
}
```

---

### `PATCH /api/correspondence/{id}/respond`

Admin/Manager membalas surat sekaligus mengubah status. Notifikasi otomatis dikirim ke pengirim surat.

**Akses:** `admin`, `manager`

**Body (`application/json`):**

| Field         | Tipe   | Required | Keterangan                                          |
|---------------|--------|:--------:|-----------------------------------------------------|
| status        | string | ✅       | Status baru: `process` / `resolved` / `rejected`   |
| response_text | string | ✅       | Teks balasan/respons dari admin                     |

**Contoh Request:**

```json
{
  "status": "resolved",
  "response_text": "Permohonan Anda telah kami setujui. Silakan datang ke bagian akademik untuk mengambil surat keterangan."
}
```

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Respons berhasil dikirim dan notifikasi telah diteruskan kepada pengirim.",
  "data": {
    "id_correspondence": 5,
    "id_user": 12,
    "sender_name": "Budi Santoso",
    "sender_email": "budi@ugn.ac.id",
    "category": { "id_category": 1, "name": "Akademik", "slug": "akademik" },
    "recipient": { "id_recipient": 1, "name": "Akademik", "slug": "akademik" },
    "title": "Permohonan Cuti Akademik",
    "correspondence_body": "Dengan hormat...",
    "status": "resolved",
    "attachment_url": null,
    "response_text": "Permohonan Anda telah kami setujui...",
    "responded_at": "2026-03-03T10:00:00.000000Z",
    "created_at": "2026-03-03T09:00:00.000000Z",
    "updated_at": "2026-03-03T10:00:00.000000Z"
  }
}
```

---

### `PATCH /api/correspondence/{id}/status`

Mengubah status surat tanpa teks balasan. Notifikasi otomatis dikirim ke pengirim surat.

**Akses:** `admin`, `manager`

**Body (`application/json`):**

| Field  | Tipe   | Required | Keterangan                                                         |
|--------|--------|:--------:|--------------------------------------------------------------------|
| status | string | ✅       | `submitted` / `process` / `resolved` / `rejected`                 |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Status surat berhasil diperbarui.",
  "data": {
    "id_correspondence": 5,
    "old_status": "submitted",
    "new_status": "process"
  }
}
```

---

## Error Responses

### `401 Unauthorized`

```json
{
  "message": "Unauthenticated."
}
```

### `403 Forbidden`

```json
{
  "status": "error",
  "message": "Anda tidak memiliki izin untuk mengubah surat ini."
}
```

### `404 Not Found`

```json
{
  "message": "No query results for model [App\\Models\\Correspondence]."
}
```

### `422 Unprocessable Entity`

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "id_category": ["The id category field is required."],
    "title": ["The title field is required."]
  }
}
```

### `409 Conflict`

```json
{
  "status": "error",
  "message": "Kategori tidak dapat dihapus karena masih memiliki surat terkait."
}
```

### `500 Internal Server Error`

```json
{
  "status": "error",
  "message": "Terjadi kesalahan saat menyimpan surat."
}
```

---

## Ringkasan Semua Endpoint

| Method | Endpoint                                    | Akses                  | Keterangan                              |
|--------|---------------------------------------------|------------------------|-----------------------------------------|
| GET    | `/api/correspondence/categories`            | Semua                  | Daftar kategori                         |
| GET    | `/api/correspondence/categories/{id}`       | Semua                  | Detail kategori                         |
| POST   | `/api/correspondence/categories`            | admin, manager         | Buat kategori                           |
| PATCH  | `/api/correspondence/categories/{id}`       | admin, manager         | Update kategori                         |
| DELETE | `/api/correspondence/categories/{id}`       | admin, manager         | Hapus kategori                          |
| GET    | `/api/correspondence/recipients`            | Semua                  | Daftar penerima                         |
| GET    | `/api/correspondence/recipients/{id}`       | Semua                  | Detail penerima                         |
| POST   | `/api/correspondence/recipients`            | admin, manager         | Buat penerima                           |
| PATCH  | `/api/correspondence/recipients/{id}`       | admin, manager         | Update penerima                         |
| DELETE | `/api/correspondence/recipients/{id}`       | admin, manager         | Hapus penerima                          |
| GET    | `/api/correspondence`                       | Semua                  | Daftar surat                            |
| POST   | `/api/correspondence`                       | Semua                  | Kirim surat baru                        |
| GET    | `/api/correspondence/{id}`                  | Semua                  | Detail surat                            |
| PATCH  | `/api/correspondence/{id}`                  | Pemilik surat          | Edit surat (hanya status submitted)     |
| DELETE | `/api/correspondence/{id}`                  | Pemilik / admin / mgr  | Hapus surat                             |
| DELETE | `/api/correspondence/{id}/attachment`       | Pemilik surat          | Hapus lampiran                          |
| PATCH  | `/api/correspondence/{id}/respond`          | admin, manager         | Balas surat + ubah status + notifikasi  |
| PATCH  | `/api/correspondence/{id}/status`           | admin, manager         | Ubah status + notifikasi                |
