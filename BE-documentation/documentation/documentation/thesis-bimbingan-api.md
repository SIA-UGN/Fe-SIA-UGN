# API Bimbingan Tugas Akhir (Thesis Guidance)

Dokumentasi lengkap endpoint API modul **Bimbingan Tugas Akhir** pada Sistem Informasi Akademik UGN.

---

## Daftar Isi

- [Autentikasi](#autentikasi)
- [Role & Akses](#role--akses)
- [Tabel Terkait](#tabel-terkait)
- [Alur Kerja Sistem](#alur-kerja-sistem)
- [Notifikasi Otomatis](#notifikasi-otomatis)
- [Aturan Kuota Pembimbing](#aturan-kuota-pembimbing)
- [Mahasiswa — Pengajuan TA](#mahasiswa--pengajuan-ta)
- [Mahasiswa — Topik TA dari Dosen](#mahasiswa--topik-ta-dari-dosen)
- [Mahasiswa — Monitoring Bimbingan](#mahasiswa--monitoring-bimbingan)
- [Dosen — Manajemen Topik TA](#dosen--manajemen-topik-ta)
- [Dosen — Validasi & Approval Pengajuan](#dosen--validasi--approval-pengajuan)
- [Dosen — Monitoring Bimbingan](#dosen--monitoring-bimbingan)
- [Admin & Manager — Dashboard & Manajemen](#admin--manager--dashboard--manajemen)
- [Enum Values](#enum-values)
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

| Fitur                              | mahasiswa | dosen | admin | manager |
|------------------------------------|:---------:|:-----:|:-----:|:-------:|
| Buat pengajuan TA mandiri          | ✅        | ❌    | ❌    | ❌      |
| Hapus pengajuan TA (sementara)     | ✅        | ❌    | ❌    | ❌      |
| Pilih topik TA dari dosen          | ✅        | ❌    | ❌    | ❌      |
| Ajukan permintaan pembimbing       | ✅        | ❌    | ❌    | ❌      |
| Lihat status pengajuan & bimbingan | ✅        | ❌    | ❌    | ❌      |
| Buat & kelola topik TA             | ❌        | ✅    | ❌    | ❌      |
| Kelola kategori thesis             | ❌        | ✅    | ❌    | ❌      |
| Approve / reject permintaan        | ❌        | ✅    | ❌    | ❌      |
| Atur jadwal & catatan konsultasi   | ❌        | ✅    | ❌    | ❌      |
| Lihat semua data bimbingan         | ❌        | ❌    | ✅    | ✅      |
| Dashboard rekapitulasi             | ❌        | ❌    | ✅    | ✅      |

---

## Tabel Terkait

```
thesis_categories
    id_thesis_category  (PK)
    name                varchar(255)
    description         text (nullable)
    created_at, updated_at

thesis_topics
    id_thesis_topic  (PK)
    id_lecturer      (FK → users_si.id_user_si)
    id_program       (FK → programs.id_program)
    id_thesis_category (FK → thesis_categories.id_thesis_category, nullable)
    topic            varchar(255)
    title_ind        varchar(255)
    title_eng        varchar(255)
    status           enum: draft | available | taken | archived
    description      longtext
    quota            integer (default: 1)
    created_at, updated_at

student_thesis
    id_student_thesis  (PK)
    id_student         (FK → users_si.id_user_si)
    id_program         (FK → programs.id_program)
    id_thesis_topic    (FK → thesis_topics.id_thesis_topic, nullable)
    topic              varchar(255, nullable)
    title_ind          varchar(255)
    title_eng          varchar(255)
    status             enum: proposing | on_progress | revision | finished
    description        longtext
    attachment_proposal varchar(255, nullable) — path di storage/public
    created_at, updated_at

thesis_lecturer
    id_thesis_lecturer  (PK)
    id_student_thesis   (FK → student_thesis.id_student_thesis)
    id_lecturer         (FK → users_si.id_user_si)
    status              enum: pending | accepted | rejected
    student_note        text (nullable)
    rejection_note      text (nullable)
    created_at, updated_at

thesis_supervisors
    id_supervisor       (PK)
    id_student_thesis   (FK → student_thesis.id_student_thesis)
    id_lecturer         (FK → users_si.id_user_si)
    created_at, updated_at

consultations
    id_consultation     (PK)
    id_supervisor       (FK → thesis_supervisors.id_supervisor)
    consultation_date   date
    start_time          time (nullable) — waktu mulai konsultasi
    end_time            time (nullable) — waktu selesai konsultasi
    location            varchar(255, nullable) — lokasi konsultasi
    subject             varchar(255)
    student_notes       text (nullable)
    lecturer_notes      text (nullable)
    attachment          varchar(255, nullable) — path di storage/public
    next_task           text (nullable) — tugas selanjutnya
    progress            tinyint unsigned (default: 0) — progress konsultasi (0-100)
    status              enum: on_going | finished
    created_at, updated_at

notifications
    ...
    id_thesis_lecturer  (nullable, FK → thesis_lecturer.id_thesis_lecturer)
    ...
```

---

## Alur Kerja Sistem

### Jalur 1 — Pengajuan Mandiri

```
Mahasiswa buat TA (POST /student/thesis)
    → Pilih dosen (GET /student/thesis/lecturers)
    → Ajukan ke dosen (POST /student/thesis/{id}/request-lecturer)         maks 4 permintaan aktif
        → thesis_lecturer: status = pending
    → Dosen approve (PATCH /lecturer/thesis/requests/{id}/approve)         maks 2 dosen accept
        → thesis_lecturer: status = accepted
        → thesis_supervisors: record baru dibuat otomatis
        → student_thesis: status = on_progress
```

### Jalur 2 — Pilih Topik Dosen

```
Dosen buat topik (POST /lecturer/thesis/topics)
    → Dosen publikasikan (PATCH /lecturer/thesis/topics/{id}/publish)
        → thesis_topics: status = available
    → Mahasiswa lihat & pilih (POST /student/thesis/topics/{topicId}/select)
        → student_thesis: dibuat otomatis dari data topik
        → thesis_lecturer: status = pending (ke dosen pemilik topik)       ← dihitung sbg 1 dari 4
    → Dosen approve (PATCH /lecturer/thesis/requests/{id}/approve)         maks 2 dosen accept
        → thesis_lecturer: status = accepted
        → thesis_supervisors: record baru dibuat otomatis
        → student_thesis: status = on_progress
        → thesis_topics: status = taken (jika quota habis)
```

### Jalur 3 — Monitoring Konsultasi

```
Dosen lihat mahasiswa bimbingan (GET /lecturer/thesis/supervisees)
    → Dosen input konsultasi (POST /lecturer/thesis/consultations)
        → consultations: record baru (status default: on_going)
        → Notifikasi otomatis dikirim ke mahasiswa
    → Mahasiswa lihat riwayat (GET /student/thesis/consultations)
```

> ⚠️ Dosen yang mengatur jadwal dan menambahkan catatan konsultasi. Status konsultasi hanya `on_going` atau `finished`.

---

## Notifikasi Otomatis

Sistem mengirimkan notifikasi secara otomatis pada event berikut:

| Event                            | Penerima  | Tipe Push | Tabel notifications            |
|----------------------------------|-----------|-----------|-------------------------------|
| Mahasiswa ajukan permintaan      | Dosen     | ✅        | `id_thesis_lecturer` diisi    |
| Mahasiswa pilih topik dosen      | Dosen     | ✅        | `id_thesis_lecturer` diisi    |
| Dosen approve permintaan         | Mahasiswa | ✅        | `id_thesis_lecturer` diisi    |
| Dosen reject permintaan          | Mahasiswa | ✅        | `id_thesis_lecturer` diisi    |
| Dosen input konsultasi           | Mahasiswa | ✅        | `id_notification` saja        |

Notifikasi bimbingan dapat diambil melalui `GET /api/notifications` dengan field `id_thesis_lecturer` terisi.

---

## Aturan Kuota Pembimbing

Sistem menerapkan dua batasan kuota yang saling berkaitan:

### Kuota Pengajuan Permintaan (Sisi Mahasiswa)

| Aturan | Nilai |
|--------|-------|
| Maks permintaan aktif per TA | **4 dosen** |
| Yang dihitung sebagai "aktif" | Status `pending` atau `accepted` |
| Yang **tidak** dihitung | Status `rejected` |

Mahasiswa yang mendapat penolakan (`rejected`) dari seorang dosen **bebas mengajukan ke dosen lain** selama total request aktif belum mencapai 4. Request via `selectTopic` (pilih topik dosen) dihitung sebagai **1 dari 4** kuota tersebut.

**Contoh skenario valid:**

```
Request ke Dosen A → accepted   (aktif: 1)
Request ke Dosen B → rejected   (aktif: 1, rejected tidak dihitung)
Request ke Dosen C → pending    (aktif: 2)
Request ke Dosen D → pending    (aktif: 3)
Request ke Dosen E → pending    (aktif: 4)
Request ke Dosen F → ❌ 422     (aktif sudah 4, tidak bisa tambah lagi)
```

### Kuota Persetujuan (Sisi Dosen)

| Aturan | Nilai |
|--------|-------|
| Maks dosen yang dapat menyetujui | **2 dosen** |
| Sumber kebenaran | Tabel `thesis_supervisors` |
| Perilaku saat kuota penuh | Request `pending` lain tetap ada, dosen tidak bisa approve |

Ketika sudah ada 2 dosen yang menyetujui, sisa request `pending` dari dosen lain **tidak otomatis ditolak** — statusnya tetap `pending`. Namun jika dosen tersebut mencoba menyetujui, sistem akan mengembalikan error `422`.

```
Dosen A approve → thesis_supervisors count: 1  ✅
Dosen B approve → thesis_supervisors count: 2  ✅
Dosen C approve → ❌ 422 "Mahasiswa sudah memiliki 2 dosen pembimbing"
Dosen C reject  → ✅ Boleh (reject tidak bergantung kuota)
```

---

## Mahasiswa — Pengajuan TA

Base URL: `/api/student/thesis`

---

### `GET /api/student/thesis`

Mengambil data tugas akhir mahasiswa yang sedang login.

**Akses:** `mahasiswa`

**Response `200 OK` (belum ada TA):**

```json
{
  "status": "success",
  "message": "Mahasiswa belum memiliki pengajuan TA.",
  "data": null
}
```

**Response `200 OK` (sudah ada TA):**

```json
{
  "status": "success",
  "message": "Data tugas akhir berhasil diambil.",
  "data": {
    "id_student_thesis": 1,
    "id_student": 10,
    "id_program": 2,
    "id_thesis_topic": null,
    "topic": "Kecerdasan Buatan",
    "title_ind": "Implementasi Machine Learning untuk Prediksi Nilai Mahasiswa",
    "title_eng": "Machine Learning Implementation for Student Grade Prediction",
    "status": "on_progress",
    "description": "Penelitian ini bertujuan...",
    "attachment_proposal": "thesis/proposals/abc123.pdf",
    "created_at": "2026-03-11T10:00:00.000000Z",
    "updated_at": "2026-03-11T12:00:00.000000Z",
    "program": { "id_program": 2, "name": "Teknik Informatika" },
    "thesis_topic": null,
    "thesis_lecturers": [
      {
        "id_thesis_lecturer": 1,
        "id_lecturer": 5,
        "status": "accepted",
        "student_note": "Saya tertarik dengan topik ini.",
        "rejection_note": null,
        "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
      }
    ],
    "supervisors": [
      {
        "id_supervisor": 1,
        "id_lecturer": 5,
        "created_at": "2026-03-11T12:00:00.000000Z",
        "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" },
        "consultations": []
      }
    ]
  }
}
```

---

### `POST /api/student/thesis`

Membuat pengajuan tugas akhir mandiri (judul & proposal diinput sendiri).

**Akses:** `mahasiswa`

> ⚠️ Mahasiswa hanya boleh memiliki **satu** pengajuan TA aktif. Jika sudah ada, response `422`.

**Body (`multipart/form-data`):**

| Field                | Tipe   | Required | Keterangan                                                |
|----------------------|--------|:--------:|-----------------------------------------------------------|
| title_ind            | string | ✅       | Judul dalam Bahasa Indonesia (maks 255 karakter)          |
| title_eng            | string | ✅       | Judul dalam Bahasa Inggris (maks 255 karakter)            |
| topic                | string | ❌       | Bidang/topik penelitian                                   |
| description          | string | ✅       | Ringkasan / deskripsi proposal                            |
| attachment_proposal  | file   | ❌       | Berkas proposal (PDF/DOC/DOCX, maks 10 MB)                |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Pengajuan tugas akhir berhasil dibuat.",
  "data": {
    "id_student_thesis": 3,
    "id_student": 10,
    "id_program": 2,
    "id_thesis_topic": null,
    "topic": "Kecerdasan Buatan",
    "title_ind": "Implementasi Machine Learning...",
    "title_eng": "Machine Learning Implementation...",
    "status": "proposing",
    "description": "Penelitian ini bertujuan...",
    "attachment_proposal": "thesis/proposals/xyz789.pdf",
    "created_at": "2026-03-11T10:00:00.000000Z",
    "updated_at": "2026-03-11T10:00:00.000000Z"
  }
}
```

**Response `422 Unprocessable Entity` (sudah punya TA):**

```json
{
  "status": "error",
  "message": "Anda sudah memiliki pengajuan tugas akhir."
}
```

---

### `PUT /api/student/thesis/{id}`

Memperbarui pengajuan tugas akhir. Hanya bisa dilakukan selama status masih `proposing`.

**Akses:** `mahasiswa`

**Path Params:**

| Param | Tipe    | Keterangan                  |
|-------|---------|-----------------------------|
| id    | integer | ID student_thesis           |

**Body (`multipart/form-data`):** Sama seperti POST, semua field bersifat opsional. File baru akan menggantikan file lama.

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Pengajuan tugas akhir berhasil diperbarui.",
  "data": { ... }
}
```

**Response `422 Unprocessable Entity`:**

```json
{
  "status": "error",
  "message": "Hanya pengajuan berstatus proposing yang dapat diubah."
}
```

---

### `DELETE /api/student/thesis/{id}`

Menghapus data tugas akhir mahasiswa (fitur sementara).

**Akses:** `mahasiswa`

> ⚠️ Endpoint ini bersifat sementara dan tidak melakukan validasi status. Semua data terkait (thesis_lecturers, supervisors, consultations) yang terikat melalui cascade akan ikut terhapus.

**Path Params:**

| Param | Tipe    | Keterangan         |
|-------|---------|---------------------|
| id    | integer | ID student_thesis  |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Data tugas akhir berhasil dihapus."
}
```

---

### `GET /api/student/thesis/lecturers`

Mengambil daftar seluruh dosen aktif yang dapat dijadikan pembimbing.

**Akses:** `mahasiswa`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar dosen berhasil diambil.",
  "data": [
    {
      "id_user_si": 5,
      "name": "Dr. Budi Santoso",
      "username": "budi.santoso",
      "email": "budi@ugn.ac.id",
      "id_program": 2,
      "staff_profile": {
        "id_user_si": 5,
        "full_name": "Dr. Budi Santoso, M.Kom.",
        "employee_id_number": "197501012005011001",
        "position": "Lektor Kepala"
      }
    }
  ]
}
```

---

### `POST /api/student/thesis/{id}/request-lecturer`

Mengirimkan permintaan bimbingan ke dosen.

**Akses:** `mahasiswa`

**Aturan Kuota:**
- Mahasiswa dapat mengajukan ke **maksimal 4 dosen** (dihitung dari request berstatus `pending` atau `accepted`)
- Request yang berstatus `rejected` tidak dihitung — mahasiswa bebas ajukan ke dosen lain sebagai pengganti
- Jika memilih topik dosen via `selectTopic`, request ke dosen pemilik topik dihitung sebagai 1 dari 4

**Path Params:**

| Param | Tipe    | Keterangan         |
|-------|---------|--------------------|
| id    | integer | ID student_thesis  |

**Body (`application/json`):**

| Field        | Tipe    | Required | Keterangan                                               |
|--------------|---------|:--------:|----------------------------------------------------------|
| id_lecturer  | integer | ✅       | ID dosen yang dituju (must be role = dosen)              |
| student_note | string  | ❌       | Pesan/catatan dari mahasiswa (maks 1000 karakter)        |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Permintaan pembimbing berhasil dikirim.",
  "data": {
    "id_thesis_lecturer": 4,
    "id_student_thesis": 3,
    "id_lecturer": 5,
    "status": "pending",
    "student_note": "Saya tertarik dengan topik AI yang Bapak kuasai.",
    "rejection_note": null,
    "created_at": "2026-03-11T10:05:00.000000Z",
    "updated_at": "2026-03-11T10:05:00.000000Z",
    "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
  }
}
```

**Response `422` (duplikasi permintaan ke dosen yang sama):**

```json
{
  "status": "error",
  "message": "Anda sudah memiliki permintaan aktif ke dosen ini."
}
```

**Response `422` (kuota 4 permintaan aktif sudah penuh):**

```json
{
  "status": "error",
  "message": "Anda hanya dapat mengajukan permintaan ke maksimal 4 dosen pembimbing."
}
```

> 💡 Sistem otomatis mengirim notifikasi + push notification ke dosen tujuan.

---

### `GET /api/student/thesis/requests`

Mengambil riwayat seluruh permintaan pembimbing yang pernah dikirim.

**Akses:** `mahasiswa`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Riwayat permintaan pembimbing berhasil diambil.",
  "data": [
    {
      "id_thesis_lecturer": 4,
      "id_student_thesis": 3,
      "id_lecturer": 5,
      "status": "accepted",
      "student_note": "...",
      "rejection_note": null,
      "created_at": "2026-03-11T10:05:00.000000Z",
      "updated_at": "2026-03-11T12:00:00.000000Z",
      "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso", "email": "budi@ugn.ac.id" }
    }
  ]
}
```

---

## Mahasiswa — Topik TA dari Dosen

---

### `GET /api/student/thesis/topics`

Mengambil daftar topik TA yang dipublikasikan dosen (status `available`).

**Akses:** `mahasiswa`

**Query Params (opsional):**

| Param      | Tipe    | Default | Keterangan                                   |
|------------|---------|---------|----------------------------------------------|
| my_program | boolean | `true`  | `true` = hanya topik dari program studi sendiri; `false` = semua program |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar topik TA tersedia berhasil diambil.",
  "data": [
    {
      "id_thesis_topic": 2,
      "id_lecturer": 5,
      "id_program": 2,
      "topic": "Kecerdasan Buatan",
      "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
      "title_eng": "Recommendation System Based on Collaborative Filtering",
      "status": "available",
      "description": "Penelitian terkait sistem rekomendasi menggunakan ...",
      "quota": 2,
      "created_at": "2026-03-10T08:00:00.000000Z",
      "updated_at": "2026-03-10T08:00:00.000000Z",
      "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" },
      "program": { "id_program": 2, "name": "Teknik Informatika" }
    }
  ]
}
```

---

### `GET /api/student/thesis/topics/{id}`

Mengambil detail satu topik TA yang tersedia.

**Akses:** `mahasiswa`

**Path Params:**

| Param | Tipe    | Keterangan       |
|-------|---------|------------------|
| id    | integer | ID thesis_topic  |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Detail topik TA berhasil diambil.",
  "data": {
    "id_thesis_topic": 2,
    "topic": "Kecerdasan Buatan",
    "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
    "title_eng": "Recommendation System Based on Collaborative Filtering",
    "status": "available",
    "description": "Penelitian terkait ...",
    "quota": 2,
    "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" },
    "program": { "id_program": 2, "name": "Teknik Informatika" }
  }
}
```

> Jika topik tidak berstatus `available`, response `404 Not Found`.

---

### `POST /api/student/thesis/topics/{topicId}/select`

Memilih topik TA dari dosen. Sistem otomatis membuat `student_thesis` dan mengirim permintaan bimbingan ke dosen pemilik topik.

**Akses:** `mahasiswa`

> ⚠️ Mahasiswa yang sudah memiliki TA aktif tidak dapat memilih topik lagi.

> 💡 Permintaan yang dibuat otomatis ke dosen pemilik topik dihitung sebagai **1 dari 4** kuota pengajuan permintaan.

**Path Params:**

| Param   | Tipe    | Keterangan       |
|---------|---------|------------------|
| topicId | integer | ID thesis_topic  |

**Body (`multipart/form-data`):**

| Field                | Tipe   | Required | Keterangan                                   |
|----------------------|--------|:--------:|----------------------------------------------|
| student_note         | string | ❌       | Pesan ke dosen (maks 1000 karakter)          |
| attachment_proposal  | file   | ❌       | Berkas proposal awal (PDF/DOC/DOCX, maks 10 MB) |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Topik TA berhasil dipilih. Permintaan bimbingan telah dikirim ke dosen.",
  "data": {
    "id_student_thesis": 4,
    "id_student": 10,
    "id_program": 2,
    "id_thesis_topic": 2,
    "topic": "Kecerdasan Buatan",
    "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
    "title_eng": "Recommendation System Based on Collaborative Filtering",
    "status": "proposing",
    "description": "...",
    "attachment_proposal": null,
    "thesis_topic": {
      "id_thesis_topic": 2,
      "topic": "Kecerdasan Buatan",
      "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
      "title_eng": "Recommendation System Based on Collaborative Filtering"
    },
    "thesis_lecturers": [
      {
        "id_thesis_lecturer": 5,
        "id_lecturer": 5,
        "status": "pending",
        "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
      }
    ]
  }
}
```

> 💡 Sistem otomatis mengirim notifikasi + push notification ke dosen pemilik topik.

---

## Mahasiswa — Monitoring Bimbingan

---

### `GET /api/student/thesis/supervisors`

Mengambil daftar dosen pembimbing yang sudah disetujui beserta seluruh catatan konsultasi.

**Akses:** `mahasiswa`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar dosen pembimbing berhasil diambil.",
  "data": [
    {
      "id_supervisor": 1,
      "id_student_thesis": 3,
      "id_lecturer": 5,
      "created_at": "2026-03-11T12:00:00.000000Z",
      "lecturer": {
        "id_user_si": 5,
        "name": "Dr. Budi Santoso",
        "username": "budi.santoso",
        "email": "budi@ugn.ac.id"
      },
      "consultations": [
        {
          "id_consultation": 1,
          "consultation_date": "2026-03-15",
          "subject": "Pembahasan BAB 1",
          "student_notes": "Perlu revisi latar belakang",
          "lecturer_notes": "Bagian latar belakang perlu diperdalam",
          "attachment": null,
          "status": "finished"
        }
      ]
    }
  ]
}
```

---

### `GET /api/student/thesis/consultations`

Mengambil seluruh riwayat konsultasi bimbingan mahasiswa (dari semua pembimbing).

**Akses:** `mahasiswa`

**Query Params (opsional):**

| Param  | Tipe   | Keterangan                                               |
|--------|--------|----------------------------------------------------------|
| status | string | Filter status: `on_going`, `finished`                    |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Riwayat konsultasi berhasil diambil.",
  "data": [
    {
      "id_consultation": 1,
      "id_supervisor": 1,
      "consultation_date": "2026-03-15",
      "start_time": "09:00",
      "end_time": "10:00",
      "location": "Ruang Dosen Lt. 3",
      "subject": "Pembahasan BAB 1",
      "student_notes": "Perlu revisi latar belakang",
      "lecturer_notes": "Bagian latar belakang perlu diperdalam",
      "attachment": null,
      "next_task": "Revisi BAB 1 dan lanjutkan BAB 2",
      "progress": 75,
      "status": "finished",
      "created_at": "2026-03-14T09:00:00.000000Z",
      "updated_at": "2026-03-15T15:00:00.000000Z",
      "supervisor": {
        "id_supervisor": 1,
        "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
      }
    }
  ]
}
```

---

## Mahasiswa — Kategori Thesis

---

### `GET /api/student/thesis/categories`

Mengambil daftar semua kategori thesis yang tersedia.

**Akses:** `mahasiswa`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar kategori thesis berhasil diambil.",
  "data": [
    {
      "id_thesis_category": 1,
      "name": "Kecerdasan Buatan",
      "description": "Penelitian di bidang AI, machine learning, deep learning, NLP, dan computer vision.",
      "created_at": "2026-03-13T10:00:00.000000Z",
      "updated_at": "2026-03-13T10:00:00.000000Z"
    }
  ]
}
```

---

## Dosen — Manajemen Topik TA

Base URL: `/api/lecturer/thesis/topics`

---

### `GET /api/lecturer/thesis/topics`

Mengambil seluruh topik TA milik dosen yang sedang login.

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar topik TA berhasil diambil.",
  "data": [
    {
      "id_thesis_topic": 2,
      "id_lecturer": 5,
      "id_program": 2,
      "topic": "Kecerdasan Buatan",
      "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
      "title_eng": "Recommendation System Based on Collaborative Filtering",
      "status": "available",
      "description": "...",
      "quota": 2,
      "created_at": "2026-03-10T08:00:00.000000Z",
      "updated_at": "2026-03-10T09:00:00.000000Z",
      "program": { "id_program": 2, "name": "Teknik Informatika" }
    }
  ]
}
```

---

### `POST /api/lecturer/thesis/topics`

Membuat topik TA baru (status awal: `draft`).

**Akses:** `dosen`

**Body (`application/json`):**

| Field       | Tipe    | Required | Keterangan                                   |
|-------------|---------|:--------:|----------------------------------------------|
| topic       | string  | ✅       | Bidang/area penelitian (maks 255 karakter)   |
| title_ind   | string  | ✅       | Judul dalam Bahasa Indonesia (maks 255)      |
| title_eng   | string  | ✅       | Judul dalam Bahasa Inggris (maks 255)        |
| description | string  | ✅       | Deskripsi lengkap topik penelitian           |
| quota       | integer | ❌       | Jumlah mahasiswa yang dapat memilih (default: 1) |
| id_program  | integer | ✅       | ID program studi target                      |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Topik TA berhasil dibuat.",
  "data": {
    "id_thesis_topic": 3,
    "id_lecturer": 5,
    "id_program": 2,
    "topic": "Keamanan Siber",
    "title_ind": "Deteksi Intrusi Berbasis Deep Learning",
    "title_eng": "Intrusion Detection Based on Deep Learning",
    "status": "draft",
    "description": "...",
    "quota": 1,
    "created_at": "2026-03-11T09:00:00.000000Z",
    "updated_at": "2026-03-11T09:00:00.000000Z",
    "program": { "id_program": 2, "name": "Teknik Informatika" }
  }
}
```

---

### `GET /api/lecturer/thesis/topics/{id}`

Mengambil detail satu topik TA beserta daftar mahasiswa yang sudah memilihnya.

**Akses:** `dosen` (hanya topik milik sendiri)

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Detail topik TA berhasil diambil.",
  "data": {
    "id_thesis_topic": 3,
    "topic": "Keamanan Siber",
    "title_ind": "Deteksi Intrusi Berbasis Deep Learning",
    "status": "available",
    "quota": 2,
    "program": { "id_program": 2, "name": "Teknik Informatika" },
    "student_theses": [
      {
        "id_student_thesis": 5,
        "status": "on_progress",
        "student": { "id_user_si": 12, "name": "Ahmad Fauzi" }
      }
    ]
  }
}
```

---

### `PUT /api/lecturer/thesis/topics/{id}`

Memperbarui topik TA. Hanya bisa dilakukan selama status masih `draft`.

**Akses:** `dosen` (hanya topik milik sendiri)

**Body (`application/json`):** Sama seperti POST, semua field bersifat opsional.

**Response `200 OK`:** Format sama dengan detail topik.

**Response `422`:**

```json
{
  "status": "error",
  "message": "Topik yang sudah dipublikasikan tidak dapat diubah."
}
```

---

### `DELETE /api/lecturer/thesis/topics/{id}`

Menghapus topik TA. Hanya bisa dilakukan selama status masih `draft`.

**Akses:** `dosen` (hanya topik milik sendiri)

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Topik TA berhasil dihapus."
}
```

**Response `422`:**

```json
{
  "status": "error",
  "message": "Topik yang sudah dipublikasikan tidak dapat dihapus."
}
```

---

### `PATCH /api/lecturer/thesis/topics/{id}/publish`

Mempublikasikan topik TA agar dapat dilihat dan dipilih mahasiswa (`draft` → `available`).

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Topik TA berhasil dipublikasikan.",
  "data": {
    "id_thesis_topic": 3,
    "status": "available",
    ...
  }
}
```

**Response `422` (bukan status draft):**

```json
{
  "status": "error",
  "message": "Hanya topik berstatus draft yang dapat dipublikasikan."
}
```

---

### `PATCH /api/lecturer/thesis/topics/{id}/archive`

Mengarsipkan topik TA sehingga tidak lagi tampil ke mahasiswa (`available`/`taken` → `archived`).

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Topik TA berhasil diarsipkan.",
  "data": {
    "id_thesis_topic": 3,
    "status": "archived",
    ...
  }
}
```

---

## Dosen — Validasi & Approval Pengajuan

Base URL: `/api/lecturer/thesis/requests`

---

### `GET /api/lecturer/thesis/requests`

Mengambil seluruh permintaan bimbingan yang masuk ke dosen.

**Akses:** `dosen`

**Query Params (opsional):**

| Param  | Tipe   | Keterangan                                          |
|--------|--------|-----------------------------------------------------|
| status | string | Filter: `pending`, `accepted`, `rejected`           |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar permintaan bimbingan berhasil diambil.",
  "data": [
    {
      "id_thesis_lecturer": 4,
      "id_student_thesis": 3,
      "id_lecturer": 5,
      "status": "pending",
      "student_note": "Saya tertarik dengan topik AI.",
      "rejection_note": null,
      "created_at": "2026-03-11T10:05:00.000000Z",
      "updated_at": "2026-03-11T10:05:00.000000Z",
      "student_thesis": {
        "id_student_thesis": 3,
        "title_ind": "Implementasi Machine Learning...",
        "title_eng": "Machine Learning Implementation...",
        "status": "proposing",
        "attachment_proposal": "thesis/proposals/xyz789.pdf",
        "student": {
          "id_user_si": 10,
          "name": "Ahmad Fauzi",
          "username": "ahmad.fauzi",
          "email": "ahmad@mhs.ugn.ac.id"
        },
        "program": { "id_program": 2, "name": "Teknik Informatika" },
        "thesis_topic": null
      }
    }
  ]
}
```

---

### `GET /api/lecturer/thesis/requests/{id}`

Mengambil detail satu permintaan bimbingan.

**Akses:** `dosen` (hanya request yang ditujukan ke dosen ini)

**Response `200 OK`:** Format sama dengan item di daftar requests.

---

### `PATCH /api/lecturer/thesis/requests/{id}/approve`

Menyetujui permintaan bimbingan dari mahasiswa.

**Akses:** `dosen`

**Aturan Kuota:**
- Setiap mahasiswa hanya dapat memiliki **maksimal 2 dosen pembimbing** yang menyetujui
- Jika kuota 2 sudah terpenuhi, request yang masih `pending` dari dosen lain tetap ada namun tidak dapat disetujui — dosen yang mencoba approve akan mendapat error `422`

> Endpoint ini secara otomatis:
> 1. Update `thesis_lecturer.status` → `accepted`
> 2. Insert record baru ke `thesis_supervisors`
> 3. Update `student_thesis.status` → `on_progress`
> 4. Cek quota topik — update status topik ke `taken` jika sudah penuh
> 5. Kirim notifikasi + push notification ke mahasiswa

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Permintaan bimbingan berhasil disetujui. Mahasiswa telah ditambahkan ke daftar bimbingan.",
  "data": {
    "id_thesis_lecturer": 4,
    "status": "accepted",
    "student_thesis": {
      "id_student_thesis": 3,
      "status": "on_progress",
      "student": { "id_user_si": 10, "name": "Ahmad Fauzi" },
      "supervisors": [
        {
          "id_supervisor": 2,
          "id_lecturer": 5,
          "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
        }
      ]
    }
  }
}
```

**Response `422` (bukan status pending):**

```json
{
  "status": "error",
  "message": "Hanya permintaan berstatus pending yang dapat disetujui."
}
```

**Response `422` (kuota 2 pembimbing sudah penuh):**

```json
{
  "status": "error",
  "message": "Mahasiswa ini sudah memiliki 2 dosen pembimbing yang menyetujui. Tidak dapat menambah pembimbing baru."
}
```

---

### `PATCH /api/lecturer/thesis/requests/{id}/reject`

Menolak permintaan bimbingan dari mahasiswa.

**Akses:** `dosen`

> Endpoint ini secara otomatis mengirim notifikasi + push notification ke mahasiswa.

**Body (`application/json`):**

| Field          | Tipe   | Required | Keterangan                                   |
|----------------|--------|:--------:|----------------------------------------------|
| rejection_note | string | ✅       | Alasan penolakan (maks 1000 karakter)        |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Permintaan bimbingan berhasil ditolak.",
  "data": {
    "id_thesis_lecturer": 4,
    "status": "rejected",
    "rejection_note": "Kuota bimbingan saya sudah penuh untuk tahun ini.",
    "updated_at": "2026-03-11T11:00:00.000000Z"
  }
}
```

---

## Dosen — Monitoring Bimbingan

---

### `GET /api/lecturer/thesis/supervisees`

Mengambil seluruh mahasiswa yang sedang dibimbing dosen beserta riwayat konsultasinya.

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar mahasiswa bimbingan berhasil diambil.",
  "data": [
    {
      "id_supervisor": 1,
      "id_student_thesis": 3,
      "id_lecturer": 5,
      "created_at": "2026-03-11T12:00:00.000000Z",
      "student_thesis": {
        "id_student_thesis": 3,
        "title_ind": "Implementasi Machine Learning...",
        "status": "on_progress",
        "student": {
          "id_user_si": 10,
          "name": "Ahmad Fauzi",
          "username": "ahmad.fauzi",
          "email": "ahmad@mhs.ugn.ac.id"
        },
        "program": { "id_program": 2, "name": "Teknik Informatika" }
      },
      "consultations": [
        {
          "id_consultation": 1,
          "consultation_date": "2026-03-15",
          "subject": "Pembahasan BAB 1",
          "status": "finished"
        }
      ]
    }
  ]
}
```

---

### `GET /api/lecturer/thesis/consultations`

Mengambil seluruh catatan konsultasi dari semua mahasiswa bimbingan.

**Akses:** `dosen`

**Query Params (opsional):**

| Param        | Tipe    | Keterangan                                               |
|--------------|---------|----------------------------------------------------------|
| status       | string  | Filter status: `on_going`, `finished`                    |
| id_supervisor | integer | Filter berdasarkan ID supervisor (satu mahasiswa)        |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar konsultasi berhasil diambil.",
  "data": [
    {
      "id_consultation": 1,
      "id_supervisor": 1,
      "consultation_date": "2026-03-15",
      "subject": "Pembahasan BAB 1",
      "student_notes": "Perlu revisi latar belakang",
      "lecturer_notes": "Bagian latar belakang perlu diperdalam",
      "attachment": null,
      "status": "finished",
      "supervisor": {
        "student_thesis": {
          "student": { "id_user_si": 10, "name": "Ahmad Fauzi" },
          "program": { "id_program": 2, "name": "Teknik Informatika" }
        }
      }
    }
  ]
}
```

---

### `POST /api/lecturer/thesis/consultations`

Menambahkan catatan/agenda konsultasi bimbingan baru.

**Akses:** `dosen`

> ⚠️ `id_supervisor` harus merupakan record supervisi yang dimiliki dosen yang sedang login.

> 💡 Sistem otomatis mengirim notifikasi + push ke mahasiswa setelah konsultasi dibuat.

**Body (`multipart/form-data`):**

| Field              | Tipe    | Required | Keterangan                                               |
|--------------------|---------|:--------:|----------------------------------------------------------|
| id_supervisor      | integer | ✅       | ID record thesis_supervisors (relasi dosen-mahasiswa)    |
| consultation_date  | date    | ✅       | Tanggal konsultasi (format: `YYYY-MM-DD`)                |
| start_time         | time    | ❌       | Waktu mulai konsultasi (format: `HH:mm`)                 |
| end_time           | time    | ❌       | Waktu selesai konsultasi (format: `HH:mm`)               |
| location           | string  | ❌       | Lokasi konsultasi (maks 255 karakter)                    |
| subject            | string  | ✅       | Topik/agenda konsultasi (maks 255 karakter)              |
| student_notes      | string  | ❌       | Catatan dari sisi mahasiswa                              |
| lecturer_notes     | string  | ❌       | Catatan dari dosen pembimbing                            |
| attachment         | file    | ❌       | Lampiran (PDF/DOC/DOCX/JPG/PNG, maks 10 MB)             |
| next_task          | string  | ❌       | Tugas selanjutnya untuk mahasiswa                        |
| progress           | integer | ❌       | Progress konsultasi (0-100, default: 0)                  |
| status             | string  | ❌       | Status konsultasi (default: `on_going`)                  |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Catatan konsultasi berhasil ditambahkan.",
  "data": {
    "id_consultation": 2,
    "id_supervisor": 1,
    "consultation_date": "2026-03-20",
    "start_time": "10:00",
    "end_time": "11:00",
    "location": "Ruang Dosen Lt. 3",
    "subject": "Review BAB 2 - Tinjauan Pustaka",
    "student_notes": null,
    "lecturer_notes": "Tambahkan referensi jurnal terbaru",
    "attachment": null,
    "next_task": "Cari minimal 5 jurnal internasional terbaru",
    "progress": 0,
    "status": "on_going",
    "created_at": "2026-03-14T09:00:00.000000Z",
    "updated_at": "2026-03-14T09:00:00.000000Z",
    "supervisor": {
      "student_thesis": {
        "student": { "id_user_si": 10, "name": "Ahmad Fauzi" }
      }
    }
  }
}
```

---

### `GET /api/lecturer/thesis/consultations/{id}`

Mengambil detail satu catatan konsultasi.

**Akses:** `dosen` (hanya konsultasi dari mahasiswa bimbingannya)

**Response `200 OK`:** Format sama dengan item di daftar konsultasi.

---

### `PUT /api/lecturer/thesis/consultations/{id}`

Memperbarui catatan konsultasi.

**Akses:** `dosen`

**Body (`multipart/form-data`):** Sama seperti POST, semua field bersifat opsional. File baru menggantikan file lama.

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Catatan konsultasi berhasil diperbarui.",
  "data": { ... }
}
```

---

## Dosen — Manajemen Kategori Thesis

---

### `GET /api/lecturer/thesis/categories`

Mengambil daftar semua kategori thesis.

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar kategori thesis berhasil diambil.",
  "data": [
    {
      "id_thesis_category": 1,
      "name": "Kecerdasan Buatan",
      "description": "Penelitian di bidang AI, machine learning, deep learning, NLP, dan computer vision.",
      "created_at": "2026-03-13T10:00:00.000000Z",
      "updated_at": "2026-03-13T10:00:00.000000Z"
    }
  ]
}
```

---

### `POST /api/lecturer/thesis/categories`

Menambahkan kategori thesis baru.

**Akses:** `dosen`

**Body (`application/json`):**

| Field       | Tipe   | Required | Keterangan                                   |
|-------------|--------|:--------:|----------------------------------------------|
| name        | string | ✅       | Nama kategori (maks 255 karakter, unik)      |
| description | string | ❌       | Deskripsi kategori                           |

**Response `201 Created`:**

```json
{
  "status": "success",
  "message": "Kategori thesis berhasil ditambahkan.",
  "data": {
    "id_thesis_category": 9,
    "name": "Cloud Computing",
    "description": "Penelitian di bidang cloud computing dan distributed systems.",
    "created_at": "2026-03-13T10:00:00.000000Z",
    "updated_at": "2026-03-13T10:00:00.000000Z"
  }
}
```

---

### `GET /api/lecturer/thesis/categories/{id}`

Mengambil detail kategori thesis beserta daftar topik yang menggunakannya.

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Detail kategori thesis berhasil diambil.",
  "data": {
    "id_thesis_category": 1,
    "name": "Kecerdasan Buatan",
    "description": "...",
    "thesis_topics": [
      {
        "id_thesis_topic": 2,
        "topic": "Machine Learning",
        "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
        "status": "available"
      }
    ]
  }
}
```

---

### `PUT /api/lecturer/thesis/categories/{id}`

Memperbarui kategori thesis.

**Akses:** `dosen`

**Body (`application/json`):** Sama seperti POST, semua field bersifat opsional.

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Kategori thesis berhasil diperbarui.",
  "data": { ... }
}
```

---

### `DELETE /api/lecturer/thesis/categories/{id}`

Menghapus kategori thesis. Hanya bisa dihapus jika tidak ada topik yang menggunakannya.

**Akses:** `dosen`

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Kategori thesis berhasil dihapus."
}
```

**Response `422` (masih digunakan):**

```json
{
  "status": "error",
  "message": "Kategori tidak dapat dihapus karena masih digunakan oleh topik TA."
}
```

---

## Admin & Manager — Dashboard & Manajemen

Base URL: `/api/admin/thesis`

**Akses:** `admin`, `manager`

---

### `GET /api/admin/thesis/dashboard`

Mengambil rekapitulasi statistik modul bimbingan TA.

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Rekapitulasi dashboard bimbingan TA berhasil diambil.",
  "data": {
    "thesis_by_status": {
      "proposing": 15,
      "on_progress": 42,
      "revision": 8,
      "finished": 30
    },
    "total_thesis": 95,
    "topics_by_status": {
      "draft": 5,
      "available": 20,
      "taken": 10,
      "archived": 3
    },
    "total_topics": 38,
    "total_supervisors": 55,
    "consultations_by_status": {
      "pending": 12,
      "on_going": 5,
      "finished": 180,
      "rejected": 3
    },
    "total_consultations": 200
  }
}
```

---

### `GET /api/admin/thesis/students`

Mengambil daftar seluruh pengajuan TA dengan filter dan pagination.

**Query Params (opsional):**

| Param    | Tipe    | Keterangan                                               |
|----------|---------|----------------------------------------------------------|
| status   | string  | Filter status: `proposing`, `on_progress`, `revision`, `finished` |
| id_program | integer | Filter berdasarkan program studi                       |
| search   | string  | Cari berdasarkan judul atau nama mahasiswa               |
| per_page | integer | Jumlah item per halaman (default: 15)                    |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar pengajuan TA mahasiswa berhasil diambil.",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id_student_thesis": 3,
        "title_ind": "Implementasi Machine Learning...",
        "title_eng": "Machine Learning Implementation...",
        "status": "on_progress",
        "created_at": "2026-03-11T10:00:00.000000Z",
        "student": {
          "id_user_si": 10,
          "name": "Ahmad Fauzi",
          "username": "ahmad.fauzi",
          "email": "ahmad@mhs.ugn.ac.id"
        },
        "program": { "id_program": 2, "name": "Teknik Informatika" },
        "thesis_topic": null,
        "supervisors": [
          {
            "id_supervisor": 1,
            "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
          }
        ]
      }
    ],
    "per_page": 15,
    "total": 95,
    "last_page": 7
  }
}
```

---

### `GET /api/admin/thesis/students/{id}`

Mengambil detail lengkap satu pengajuan TA beserta seluruh riwayat bimbingan.

**Path Params:**

| Param | Tipe    | Keterangan           |
|-------|---------|----------------------|
| id    | integer | ID student_thesis    |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Detail pengajuan TA berhasil diambil.",
  "data": {
    "id_student_thesis": 3,
    "title_ind": "Implementasi Machine Learning...",
    "title_eng": "Machine Learning Implementation...",
    "status": "on_progress",
    "description": "...",
    "attachment_proposal": "thesis/proposals/xyz789.pdf",
    "student": { "id_user_si": 10, "name": "Ahmad Fauzi", "email": "..." },
    "program": { "id_program": 2, "name": "Teknik Informatika" },
    "thesis_topic": null,
    "thesis_lecturers": [
      {
        "id_thesis_lecturer": 4,
        "status": "accepted",
        "student_note": "...",
        "rejection_note": null,
        "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" }
      }
    ],
    "supervisors": [
      {
        "id_supervisor": 1,
        "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" },
        "consultations": [
          {
            "id_consultation": 1,
            "consultation_date": "2026-03-15",
            "subject": "Pembahasan BAB 1",
            "status": "finished",
            "lecturer_notes": "..."
          }
        ]
      }
    ]
  }
}
```

---

### `GET /api/admin/thesis/supervisors`

Mengambil daftar seluruh pasangan dosen pembimbing dan mahasiswa bimbingan.

**Query Params (opsional):**

| Param       | Tipe    | Keterangan                        |
|-------------|---------|-----------------------------------|
| id_lecturer | integer | Filter berdasarkan ID dosen       |
| id_program  | integer | Filter berdasarkan program studi  |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar pembimbing berhasil diambil.",
  "data": [
    {
      "id_supervisor": 1,
      "id_student_thesis": 3,
      "id_lecturer": 5,
      "created_at": "2026-03-11T12:00:00.000000Z",
      "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso", "username": "budi.santoso" },
      "student_thesis": {
        "student": { "id_user_si": 10, "name": "Ahmad Fauzi", "username": "ahmad.fauzi" },
        "program": { "id_program": 2, "name": "Teknik Informatika" }
      }
    }
  ]
}
```

---

### `GET /api/admin/thesis/consultations`

Mengambil seluruh catatan konsultasi bimbingan dengan pagination.

**Query Params (opsional):**

| Param        | Tipe    | Keterangan                                               |
|--------------|---------|----------------------------------------------------------|
| status       | string  | Filter status: `pending`, `on_going`, `finished`, `rejected` |
| id_supervisor | integer | Filter berdasarkan ID supervisor                        |
| per_page     | integer | Jumlah item per halaman (default: 15)                    |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar konsultasi berhasil diambil.",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id_consultation": 1,
        "consultation_date": "2026-03-15",
        "subject": "Pembahasan BAB 1",
        "status": "finished",
        "supervisor": {
          "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" },
          "student_thesis": {
            "student": { "id_user_si": 10, "name": "Ahmad Fauzi" },
            "program": { "id_program": 2, "name": "Teknik Informatika" }
          }
        }
      }
    ],
    "per_page": 15,
    "total": 200
  }
}
```

---

### `GET /api/admin/thesis/topics`

Mengambil daftar seluruh topik TA dari semua dosen.

**Query Params (opsional):**

| Param       | Tipe    | Keterangan                                          |
|-------------|---------|-----------------------------------------------------|
| status      | string  | Filter: `draft`, `available`, `taken`, `archived`   |
| id_lecturer | integer | Filter berdasarkan ID dosen                         |
| id_program  | integer | Filter berdasarkan program studi                    |

**Response `200 OK`:**

```json
{
  "status": "success",
  "message": "Daftar topik TA berhasil diambil.",
  "data": [
    {
      "id_thesis_topic": 2,
      "topic": "Kecerdasan Buatan",
      "title_ind": "Sistem Rekomendasi Berbasis Collaborative Filtering",
      "title_eng": "Recommendation System Based on Collaborative Filtering",
      "status": "available",
      "quota": 2,
      "created_at": "2026-03-10T08:00:00.000000Z",
      "lecturer": { "id_user_si": 5, "name": "Dr. Budi Santoso" },
      "program": { "id_program": 2, "name": "Teknik Informatika" }
    }
  ]
}
```

---

## Enum Values

### `student_thesis.status`

| Value       | Keterangan                                            |
|-------------|-------------------------------------------------------|
| `proposing` | Mahasiswa sudah membuat pengajuan, menunggu dosen     |
| `on_progress` | Setidaknya satu dosen sudah menyetujui bimbingan   |
| `revision`  | TA sedang dalam proses revisi                         |
| `finished`  | TA selesai / lulus                                    |

### `thesis_topics.status`

| Value      | Keterangan                                             |
|------------|--------------------------------------------------------|
| `draft`    | Topik masih dalam penyusunan, belum terlihat mahasiswa |
| `available`| Topik sudah dipublikasikan & bisa dipilih mahasiswa    |
| `taken`    | Quota sudah habis, tidak dapat dipilih lagi            |
| `archived` | Topik diarsipkan oleh dosen                            |

### `thesis_lecturer.status`

| Value      | Keterangan                              |
|------------|-----------------------------------------|
| `pending`  | Permintaan dikirim, menunggu respons    |
| `accepted` | Dosen menyetujui bimbingan              |
| `rejected` | Dosen menolak bimbingan                 |

### `consultations.status`

| Value      | Keterangan                              |
|------------|----------------------------------------|
| `on_going` | Konsultasi sedang berlangsung / dijadwalkan |
| `finished` | Konsultasi selesai                       |

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
  "message": "Unauthorized."
}
```

### `404 Not Found`

```json
{
  "message": "No query results for model [App\\Models\\StudentThesis]."
}
```

### `422 Unprocessable Entity` (validasi gagal)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title_ind": ["The title ind field is required."],
    "id_lecturer": ["The selected id lecturer is invalid."]
  }
}
```

### `422 Unprocessable Entity` (business rule)

```json
{
  "status": "error",
  "message": "Anda sudah memiliki pengajuan tugas akhir."
}
```

---

## Ringkasan Endpoint

### Mahasiswa (`role:mahasiswa`) — Base URL `/api/student/thesis`

| Method | Endpoint                              | Keterangan                          |
|--------|---------------------------------------|-------------------------------------|
| GET    | `/`                                   | Lihat data TA sendiri               |
| POST   | `/`                                   | Buat pengajuan TA mandiri           |
| PUT    | `/{id}`                               | Update pengajuan TA                 |
| DELETE | `/{id}`                               | Hapus pengajuan TA (sementara)      |
| GET    | `/lecturers`                          | Daftar dosen yang bisa dipilih      |
| POST   | `/{id}/request-lecturer`              | Ajukan permintaan ke dosen          |
| GET    | `/requests`                           | Riwayat permintaan pembimbing       |
| GET    | `/topics`                             | Daftar topik TA dari dosen          |
| GET    | `/topics/{id}`                        | Detail topik TA                     |
| POST   | `/topics/{topicId}/select`            | Pilih topik TA dosen                |
| GET    | `/categories`                         | Daftar kategori thesis              |
| GET    | `/supervisors`                        | Daftar pembimbing disetujui         |
| GET    | `/consultations`                      | Riwayat konsultasi bimbingan        |

### Dosen (`role:dosen`) — Base URL `/api/lecturer/thesis`

| Method | Endpoint                              | Keterangan                          |
|--------|---------------------------------------|-------------------------------------|
| GET    | `/topics`                             | Daftar topik TA milik sendiri       |
| POST   | `/topics`                             | Buat topik TA baru                  |
| GET    | `/topics/{id}`                        | Detail topik TA                     |
| PUT    | `/topics/{id}`                        | Update topik TA (hanya draft)       |
| DELETE | `/topics/{id}`                        | Hapus topik TA (hanya draft)        |
| PATCH  | `/topics/{id}/publish`                | Publikasikan topik TA               |
| PATCH  | `/topics/{id}/archive`                | Arsipkan topik TA                   |
| GET    | `/requests`                           | Daftar permintaan bimbingan masuk   |
| GET    | `/requests/{id}`                      | Detail permintaan bimbingan         |
| PATCH  | `/requests/{id}/approve`              | Setujui permintaan bimbingan        |
| PATCH  | `/requests/{id}/reject`               | Tolak permintaan bimbingan          |
| GET    | `/supervisees`                        | Daftar mahasiswa bimbingan          |
| GET    | `/consultations`                      | Semua catatan konsultasi            |
| POST   | `/consultations`                      | Input catatan konsultasi baru       |
| GET    | `/consultations/{id}`                 | Detail konsultasi                   |
| PUT    | `/consultations/{id}`                 | Update catatan konsultasi           |
| GET    | `/categories`                         | Daftar kategori thesis              |
| POST   | `/categories`                         | Buat kategori thesis baru           |
| GET    | `/categories/{id}`                    | Detail kategori thesis              |
| PUT    | `/categories/{id}`                    | Update kategori thesis              |
| DELETE | `/categories/{id}`                    | Hapus kategori thesis               |

### Admin & Manager (`role:admin|manager`) — Base URL `/api/admin/thesis`

| Method | Endpoint          | Keterangan                                    |
|--------|-------------------|-----------------------------------------------|
| GET    | `/dashboard`      | Rekapitulasi statistik bimbingan TA           |
| GET    | `/students`       | Daftar pengajuan TA (filter + pagination)     |
| GET    | `/students/{id}`  | Detail pengajuan TA + riwayat bimbingan       |
| GET    | `/supervisors`    | Daftar pasangan dosen-mahasiswa bimbingan     |
| GET    | `/consultations`  | Semua catatan konsultasi (filter + pagination)|
| GET    | `/topics`         | Semua topik TA dari seluruh dosen             |
