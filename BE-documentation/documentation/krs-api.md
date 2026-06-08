# KRS (Kartu Rencana Studi) Dokumentasi API

## Daftar Isi

- [Alur Kerja (Flow)](#alur-kerja-flow)
- [Arsitektur Controller & Service](#arsitektur-controller--service)
- [Skema Tabel Database](#skema-tabel-database)
- [Model Relationship](#model-relationship)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [API Manager Sesi KRS](#api-manager--sesi-krs)
- [API Manager Kelas Sesi KRS](#api-manager--kelas-sesi-krs)
- [API Manager Kuota KRS](#api-manager--kuota-krs)
- [API Manager Review KRS](#api-manager--review-krs)
- [API Manager Review KRS per Mahasiswa](#api-manager--review-krs-per-mahasiswa)
- [API Mahasiswa Pengajuan KRS](#api-mahasiswa--pengajuan-krs)

---

## Alur Kerja (Flow)

```
Manager                               Mahasiswa
   |                                      |
   |  1. Tetapkan kuota SKS               |
   |  (POST /api/manager/krs-quotas)      |
   |                                      |
   |  2. Buka sesi KRS                    |
   |  (POST /api/manager/krs-sessions)    |
   |     [opsional: sertakan kelas]       |
   |                                      |
   |  3. Daftarkan kelas ke sesi          |
   |  (POST /api/manager/krs-sessions     |
   |        /{id}/classes)                |
   |     [bisa kapan saja selama open]    |
   |                                      |
   |      [Sesi OPEN + kelas tersedia]    |
   |                                      |  4. Lihat kelas tersedia
   |                                      |  (GET /api/student/krs/available-classes)
   |                                      |     [hanya kelas dari whitelist sesi]
   |                                      |
   |                                      |  5. Ajukan KRS per kelas
   |                                      |  (POST /api/student/krs)
   |                                      |     [ulangi untuk setiap kelas]
   |                                      |
   |  6. Tutup sesi KRS                   |
   |  (PATCH /api/manager/krs-sessions    |
   |        /{id}/close)                  |
   |                                      |
   |         [Sesi CLOSED]                |
   |                                      |
   |  7. Review semua KRS                 |
   |  (GET /api/manager/krs)              |
   |                                      |
   |  8. Approve atau Reject              |
   |  (PATCH /api/manager/krs/{id}/approve)
   |  (PATCH /api/manager/krs/{id}/reject)|
   +--------------------------------------+
```

### Aturan Umum

| Aturan                        | Keterangan                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Sesi KRS                      | Harus ada sesi dengan status `open` agar mahasiswa dapat mendaftar                                                          |
| Satu sesi per periode         | Setiap periode akademik hanya boleh memiliki **satu sesi `open`** sekaligus                                                 |
| Sesi tidak dapat dibuka ulang | Setelah ditutup (`closed`), sesi tidak dapat dibuka kembali                                                                 |
| Whitelist kelas               | Mahasiswa hanya dapat memilih kelas yang **sudah didaftarkan** manager ke sesi. Kelas di luar whitelist tidak dapat diambil |
| Kelas sesuai periode          | Kelas yang didaftarkan ke sesi harus berasal dari **periode akademik yang sama** dengan sesi                                |
| Kuota SKS                     | Harus ditetapkan **sebelum** mahasiswa mendaftar; mahasiswa tidak bisa mendaftar jika belum ada kuota                       |
| Duplikasi mata kuliah         | Mahasiswa tidak bisa mendaftar dua kelas yang memiliki **mata kuliah (subject) yang sama** dalam satu sesi                  |
| Ganti kelas (pending)         | Jika mahasiswa memilih kelas lain untuk mata kuliah yang sudah `pending`, KRS lama **diganti** (bukan buat baru)            |
| Ganti kelas (approved)        | Jika mata kuliah sudah `approved`, tidak bisa diganti — harus hubungi manager                                               |
| Pembatalan KRS                | Hanya bisa dilakukan saat status `pending` **dan** sesi masih `open`                                                        |
| Hapus kelas dari sesi         | Tidak dapat dihapus jika ada mahasiswa yang sudah mengajukan KRS (`pending`/`approved`) untuk kelas tersebut                |

---

## Arsitektur Controller & Service

KRS API telah direfaktor dari satu monolitik `KrsController` menjadi controller terpisah per domain dengan service layer untuk shared business logic.

### Controllers

| Controller                    | Lokasi                  | Tanggung Jawab                          |
| ----------------------------- | ----------------------- | --------------------------------------- |
| `ManagerKrsQuotaController`   | `app/Http/Controllers/` | Endpoint kuota SKS manager              |
| `ManagerKrsSessionController` | `app/Http/Controllers/` | Endpoint sesi & whitelist kelas manager |
| `ManagerKrsReviewController`  | `app/Http/Controllers/` | Endpoint review & approval manager      |
| `StudentKrsController`        | `app/Http/Controllers/` | Endpoint pengajuan KRS mahasiswa        |

### Services

| Service                | Lokasi          | Tanggung Jawab                                                      |
| ---------------------- | --------------- | ------------------------------------------------------------------- |
| `KrsQuotaService`      | `app/Services/` | Set/update quota, validasi max_sks vs approved_sks, kalkulasi SKS   |
| `KrsSessionService`    | `app/Services/` | Open/close session, validasi single open session, sinkron whitelist |
| `KrsSubmissionService` | `app/Services/` | Submit/ganti kelas, cek whitelist, cek duplicate subject, cek quota |
| `KrsReviewService`     | `app/Services/` | Approve/reject dengan quota re-check                                |
| `KrsReadService`       | `app/Services/` | Semua query read-heavy (list manager, list student, summary stats)  |
| `KrsPdfService`        | `app/Services/` | Build data + render dokumen PDF KRS approved                        |

### Dependency Graph

```
ManagerKrsQuotaController  --> KrsQuotaService, KrsReadService
ManagerKrsSessionController --> KrsSessionService
ManagerKrsReviewController  --> KrsReviewService, KrsReadService
StudentKrsController        --> KrsSubmissionService, KrsReadService, KrsPdfService

KrsSubmissionService --> KrsQuotaService
KrsReviewService     --> KrsQuotaService
KrsReadService       --> KrsQuotaService
```

---

## Skema Tabel Database

### Tabel `krs_sessions`

Menyimpan sesi pendaftaran KRS yang dibuka oleh manager.

| Kolom                | Tipe                    | Nullable | Default             | Keterangan                                  |
| -------------------- | ----------------------- | -------- | ------------------- | ------------------------------------------- |
| `id_krs_session`     | `bigint unsigned`       | No       |                     | Primary key (auto increment)                |
| `id_academic_period` | `bigint unsigned`       | No       |                     | FK -> `academic_periods.id_academic_period` |
| `status`             | `enum('open','closed')` | No       | `open`              | Status sesi                                 |
| `notes`              | `text`                  | Yes      | NULL                | Catatan dari manager                        |
| `opened_by`          | `bigint unsigned`       | No       |                     | FK -> `users_si.id_user_si` (yang membuka)  |
| `opened_at`          | `timestamp`             | No       | `CURRENT_TIMESTAMP` | Waktu sesi dibuka                           |
| `closed_by`          | `bigint unsigned`       | Yes      | NULL                | FK -> `users_si.id_user_si` (yang menutup)  |
| `closed_at`          | `timestamp`             | Yes      | NULL                | Waktu sesi ditutup                          |
| `created_at`         | `timestamp`             | Yes      | NULL                | Laravel timestamp                           |
| `updated_at`         | `timestamp`             | Yes      | NULL                | Laravel timestamp                           |

**Index:** `krs_sessions_period_status_idx` pada `(id_academic_period, status)`

---

### Tabel `krs_session_classes`

Menyimpan whitelist kelas yang tersedia pada sebuah sesi KRS. Mahasiswa hanya dapat memilih kelas yang terdaftar di sini.

| Kolom                  | Tipe              | Nullable | Keterangan                                                     |
| ---------------------- | ----------------- | -------- | -------------------------------------------------------------- |
| `id_krs_session_class` | `bigint unsigned` | No       | Primary key (auto increment)                                   |
| `id_krs_session`       | `bigint unsigned` | No       | FK -> `krs_sessions.id_krs_session` (cascade)                  |
| `id_subject`           | `bigint unsigned` | No       | FK -> `subjects.id_subject` (cascade) denormalisasi dari kelas |
| `id_class`             | `bigint unsigned` | No       | FK -> `classes.id_class` (cascade)                             |
| `created_at`           | `timestamp`       | Yes      | NULL                                                           |
| `updated_at`           | `timestamp`       | Yes      | NULL                                                           |

**Unique constraint:** `krs_session_class_unique` pada `(id_krs_session, id_class)` satu kelas hanya bisa didaftarkan sekali per sesi

**Index:** `krs_session_subject_idx` pada `(id_krs_session, id_subject)` untuk filter berdasarkan mata kuliah

---

### Tabel `krs_quotas`

Menyimpan kuota maksimal SKS per mahasiswa per periode akademik, yang ditetapkan oleh manager/admin.

| Kolom                | Tipe               | Nullable | Default | Keterangan                                    |
| -------------------- | ------------------ | -------- | ------- | --------------------------------------------- |
| `id_krs_quota`       | `bigint unsigned`  | No       |         | Primary key (auto increment)                  |
| `id_user_si`         | `bigint unsigned`  | No       |         | FK -> `users_si.id_user_si` (mahasiswa)       |
| `id_academic_period` | `bigint unsigned`  | No       |         | FK -> `academic_periods.id_academic_period`   |
| `max_sks`            | `tinyint unsigned` | No       | `24`    | Maksimal SKS yang bisa diambil                |
| `notes`              | `text`             | Yes      | NULL    | Catatan dari manager                          |
| `set_by`             | `bigint unsigned`  | Yes      | NULL    | FK -> `users_si.id_user_si` (yang menetapkan) |
| `created_at`         | `timestamp`        | Yes      | NULL    | Laravel timestamp                             |
| `updated_at`         | `timestamp`        | Yes      | NULL    | Laravel timestamp                             |

**Unique constraint:** `(id_user_si, id_academic_period)` satu kuota per mahasiswa per periode

---

### Tabel `krs`

Menyimpan setiap entri pengajuan KRS mahasiswa (satu baris = satu kelas yang diajukan).

| Kolom                | Tipe                                    | Nullable | Default   | Keterangan                                                          |
| -------------------- | --------------------------------------- | -------- | --------- | ------------------------------------------------------------------- |
| `id_krs`             | `bigint unsigned`                       | No       |           | Primary key (auto increment)                                        |
| `id_krs_session`     | `bigint unsigned`                       | No       |           | FK -> `krs_sessions.id_krs_session` (cascade delete)                |
| `id_user_si`         | `bigint unsigned`                       | No       |           | FK -> `users_si.id_user_si` (mahasiswa)                             |
| `id_academic_period` | `bigint unsigned`                       | No       |           | FK -> `academic_periods.id_academic_period` (denormalisasi)         |
| `id_class`           | `bigint unsigned`                       | No       |           | FK -> `classes.id_class` (kelas yang dipilih)                       |
| `id_subject`         | `bigint unsigned`                       | No       |           | FK -> `subjects.id_subject` denormalisasi untuk kalkulasi SKS cepat |
| `status`             | `enum('pending','approved','rejected')` | No       | `pending` | Status pengajuan                                                    |
| `processed_by`       | `bigint unsigned`                       | Yes      | NULL      | FK -> `users_si.id_user_si` (manager yang proses)                   |
| `processed_at`       | `timestamp`                             | Yes      | NULL      | Waktu diproses oleh manager                                         |
| `rejection_reason`   | `text`                                  | Yes      | NULL      | Alasan penolakan (jika status = `rejected`)                         |
| `created_at`         | `timestamp`                             | Yes      | NULL      | Laravel timestamp                                                   |
| `updated_at`         | `timestamp`                             | Yes      | NULL      | Laravel timestamp                                                   |

**Unique constraint:** `krs_student_class_session_unique` pada `(id_user_si, id_class, id_krs_session)`

**Index:**

- `krs_session_student_idx` pada `(id_krs_session, id_user_si)`
- `krs_student_period_idx` pada `(id_user_si, id_academic_period)`
- `krs_class_status_idx` pada `(id_class, status)`
- `krs_subject_status_idx` pada `(id_subject, status)` untuk kalkulasi SKS per periode

> **Catatan desain:** `id_subject` sengaja disimpan di tabel `krs` (denormalisasi dari `classes`) agar kalkulasi total SKS dapat dilakukan dengan join langsung `krs -> subjects` tanpa melewati `classes`.

---

## Model Relationship

```
AcademicPeriod
    +- hasMany --> KrsSession
    +- hasMany --> KrsQuota
    +- hasMany --> Krs

KrsSession
    +- belongsTo --> AcademicPeriod
    +- belongsTo --> User_si (opener)
    +- belongsTo --> User_si (closer)
    +- hasMany   --> KrsSessionClass (sessionClasses)
    +- hasMany   --> Krs (krsEntries)

KrsSessionClass
    +- belongsTo --> KrsSession
    +- belongsTo --> Subject
    +- belongsTo --> Classes (krsClass)

KrsQuota
    +- belongsTo --> User_si (student)
    +- belongsTo --> AcademicPeriod
    +- belongsTo --> User_si (setter)

Krs
    +- belongsTo --> KrsSession
    +- belongsTo --> User_si (student)
    +- belongsTo --> AcademicPeriod
    +- belongsTo --> Classes (krsClass)
    +- belongsTo --> Subject
    +- belongsTo --> User_si (processor)

Classes
    +- hasMany --> KrsSessionClass
    +- hasMany --> Krs
```

---

## Ringkasan Endpoint

### Manager / Admin (`role:admin|manager`) — `ManagerKrsSessionController`

| Method   | Endpoint                                            | Deskripsi                              |
| -------- | --------------------------------------------------- | -------------------------------------- |
| `GET`    | `/api/manager/krs-sessions`                         | Daftar semua sesi KRS                  |
| `POST`   | `/api/manager/krs-sessions`                         | Buka sesi KRS baru (opsional: + kelas) |
| `GET`    | `/api/manager/krs-sessions/{id}`                    | Detail sesi KRS + statistik            |
| `PATCH`  | `/api/manager/krs-sessions/{id}/close`              | Tutup sesi KRS                         |
| `GET`    | `/api/manager/krs-sessions/{id}/classes`            | Daftar kelas dalam whitelist sesi      |
| `POST`   | `/api/manager/krs-sessions/{id}/classes`            | Tambah kelas ke whitelist sesi         |
| `DELETE` | `/api/manager/krs-sessions/{id}/classes/{class_id}` | Hapus kelas dari whitelist sesi        |

### Manager / Admin (`role:admin|manager`) — `ManagerKrsQuotaController`

| Method   | Endpoint                       | Deskripsi                     |
| -------- | ------------------------------ | ----------------------------- |
| `GET`    | `/api/manager/krs-quotas`      | Daftar kuota SKS mahasiswa    |
| `POST`   | `/api/manager/krs-quotas`      | Tetapkan kuota SKS (upsert)   |
| `GET`    | `/api/manager/krs-quotas/{id}` | Detail kuota + penggunaan SKS |
| `PATCH`  | `/api/manager/krs-quotas/{id}` | Update kuota SKS              |
| `DELETE` | `/api/manager/krs-quotas/{id}` | Hapus kuota SKS               |

### Manager / Admin (`role:admin|manager`) — `ManagerKrsReviewController`

| Method  | Endpoint                                | Deskripsi                             |
| ------- | --------------------------------------- | ------------------------------------- |
| `GET`   | `/api/manager/krs`                      | Daftar semua pengajuan KRS            |
| `GET`   | `/api/manager/krs/students`             | Daftar mahasiswa + flag action_needed |
| `GET`   | `/api/manager/krs/students/{studentId}` | Detail KRS satu mahasiswa             |
| `PATCH` | `/api/manager/krs/{id}/approve`         | Setujui pengajuan KRS (+ cek kuota)   |
| `PATCH` | `/api/manager/krs/{id}/reject`          | Tolak pengajuan KRS                   |

### Mahasiswa (`role:mahasiswa`) — `StudentKrsController`

| Method   | Endpoint                                 | Deskripsi                                          |
| -------- | ---------------------------------------- | -------------------------------------------------- |
| `GET`    | `/api/student/krs/sessions`              | Daftar sesi KRS yang sedang open                   |
| `GET`    | `/api/student/krs/sessions/{id}`         | Detail sesi open + daftar kelas/subject            |
| `GET`    | `/api/student/krs/sessions/{id}/classes` | Daftar semua kelas dalam sesi open (mirip manager) |
| `GET`    | `/api/student/krs/approved/metadata`     | Metadata JSON preview KRS approved                 |
| `GET`    | `/api/student/krs/approved/pdf`          | Unduh PDF KRS approved (mobile-friendly)           |
| `GET`    | `/api/student/krs/quota`                 | Kuota SKS + status sesi aktif                      |
| `GET`    | `/api/student/krs/available-classes`     | Kelas tersedia (dari whitelist sesi aktif)         |
| `GET`    | `/api/student/krs`                       | Daftar KRS milik sendiri                           |
| `POST`   | `/api/student/krs`                       | Ajukan KRS (pilih kelas dari whitelist)            |
| `DELETE` | `/api/student/krs/{id}`                  | Batalkan pengajuan                                 |

---

## API Manager Sesi KRS

> **Controller:** `ManagerKrsSessionController` | **Service:** `KrsSessionService`

### GET `/api/manager/krs-sessions`

Menampilkan daftar semua sesi KRS beserta jumlah kelas yang terdaftar di setiap sesi.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Parameter            | Tipe      | Keterangan                            |
| -------------------- | --------- | ------------------------------------- |
| `status`             | `string`  | Filter: `open` atau `closed`          |
| `id_academic_period` | `integer` | Filter berdasarkan periode akademik   |
| `per_page`           | `integer` | Jumlah item per halaman (default: 15) |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar sesi KRS berhasil diambil.",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id_krs_session": 1,
                "id_academic_period": 3,
                "status": "open",
                "notes": "Pendaftaran KRS Semester Genap 2025/2026",
                "opened_by": 5,
                "opened_at": "2026-03-05T08:00:00.000000Z",
                "closed_by": null,
                "closed_at": null,
                "session_classes_count": 12,
                "academic_period": {
                    "id_academic_period": 3,
                    "name": "Genap 2025/2026",
                    "is_active": true
                },
                "opener": { "id_user_si": 5, "name": "Budi Santoso" },
                "closer": null
            }
        ],
        "total": 1,
        "per_page": 15
    }
}
```

> `session_classes_count` = jumlah kelas yang sudah didaftarkan pada whitelist sesi tersebut.

---

### POST `/api/manager/krs-sessions`

Membuka sesi KRS baru. Setiap periode hanya boleh memiliki **satu sesi terbuka** sekaligus.

**Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json`

**Request Body:**

```json
{
    "id_academic_period": 3,
    "notes": "Pendaftaran KRS Semester Genap 2025/2026. Batas waktu 5 hari.",
    "classes": [{ "id_class": 7 }, { "id_class": 8 }, { "id_class": 9 }]
}
```

| Field                | Tipe      | Wajib | Keterangan                                                   |
| -------------------- | --------- | ----- | ------------------------------------------------------------ |
| `id_academic_period` | `integer` | Ya    | ID periode akademik                                          |
| `notes`              | `string`  | Tidak | Catatan/instruksi untuk mahasiswa (maks 1000 karakter)       |
| `classes`            | `array`   | Tidak | Daftar kelas yang langsung didaftarkan ke whitelist sesi ini |
| `classes.*.id_class` | `integer` |       | ID kelas (harus milik periode akademik yang sama)            |

**Response `201`:**

```json
{
    "status": "success",
    "message": "Sesi KRS berhasil dibuka. 3 kelas telah didaftarkan ke sesi ini.",
    "data": {
        "id_krs_session": 1,
        "id_academic_period": 3,
        "status": "open",
        "session_classes_count": 3,
        "academic_period": {
            "id_academic_period": 3,
            "name": "Genap 2025/2026"
        },
        "opener": { "id_user_si": 5, "name": "Budi Santoso" }
    }
}
```

**Response `422` Sudah ada sesi terbuka:**

```json
{
    "status": "error",
    "message": "Sudah ada sesi KRS yang sedang terbuka untuk periode akademik ini. Tutup sesi tersebut terlebih dahulu."
}
```

---

### GET `/api/manager/krs-sessions/{id}`

Menampilkan detail sesi KRS beserta statistik jumlah kelas dan pengajuan KRS.

**Response `200`:**

```json
{
    "status": "success",
    "message": "Detail sesi KRS berhasil diambil.",
    "data": {
        "id_krs_session": 1,
        "status": "open",
        "academic_period": {
            "id_academic_period": 3,
            "name": "Genap 2025/2026",
            "is_active": true
        },
        "opener": { "id_user_si": 5, "name": "Budi Santoso" },
        "closer": null,
        "stats": {
            "total_classes": 12,
            "total": 45,
            "pending": 30,
            "approved": 12,
            "rejected": 3
        }
    }
}
```

---

### PATCH `/api/manager/krs-sessions/{id}/close`

Menutup sesi KRS. Mahasiswa tidak dapat lagi mendaftar setelah ini. **Tidak dapat dibuka kembali.**

**Response `200`:**

```json
{
    "status": "success",
    "message": "Sesi KRS berhasil ditutup.",
    "data": {
        "id_krs_session": 1,
        "status": "closed",
        "closed_by": 5,
        "closed_at": "2026-03-10T17:00:00.000000Z",
        "pending_krs_count": 8
    }
}
```

> `pending_krs_count` = jumlah pengajuan KRS yang **belum diproses** saat sesi ditutup.

---

## API Manager Kelas Sesi KRS

> **Controller:** `ManagerKrsSessionController` | **Service:** `KrsSessionService`

### GET `/api/manager/krs-sessions/{id}/classes`

Menampilkan daftar kelas yang terdaftar dalam whitelist sesi KRS.

**Query Parameters:**

| Parameter    | Tipe      | Keterangan                                  |
| ------------ | --------- | ------------------------------------------- |
| `id_subject` | `integer` | Filter berdasarkan mata kuliah              |
| `search`     | `string`  | Cari berdasarkan nama atau kode mata kuliah |
| `per_page`   | `integer` | Jumlah per halaman (default: 20)            |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar kelas sesi KRS berhasil diambil.",
    "data": {
        "session": {
            "id_krs_session": 1,
            "status": "open",
            "id_academic_period": 3
        },
        "classes": {
            "current_page": 1,
            "data": [
                {
                    "id_krs_session_class": 1,
                    "id_subject": 3,
                    "id_class": 7,
                    "subject": {
                        "id_subject": 3,
                        "name_subject": "Pemrograman Web",
                        "code_subject": "IF301",
                        "sks": 3
                    },
                    "krs_class": {
                        "id_class": 7,
                        "code_class": "IF301-A",
                        "day_of_week": "Senin",
                        "start_time": "08:00:00",
                        "end_time": "10:30:00",
                        "member_class": 30,
                        "lecturers": [{ "id_user_si": 8, "name": "Dr. Rahman" }]
                    }
                }
            ],
            "total": 12,
            "per_page": 20
        }
    }
}
```

---

### POST `/api/manager/krs-sessions/{id}/classes`

Menambahkan satu atau beberapa kelas ke whitelist sesi KRS. Hanya bisa dilakukan selama sesi masih `open`.

**Request Body:**

```json
{ "classes": [{ "id_class": 10 }, { "id_class": 11 }] }
```

**Response `201`:**

```json
{
    "status": "success",
    "message": "2 kelas berhasil ditambahkan ke sesi KRS.",
    "data": { "added": 2, "skipped": 0, "total_classes": 14 }
}
```

> - `added` = jumlah kelas yang berhasil ditambahkan
> - `skipped` = jumlah kelas yang dilewati karena sudah terdaftar
> - `total_classes` = total kelas dalam whitelist sesi setelah operasi ini

---

### DELETE `/api/manager/krs-sessions/{id}/classes/{class_id}`

Menghapus sebuah kelas dari whitelist sesi KRS. Diblokir jika ada mahasiswa yang sudah mengajukan KRS (`pending` atau `approved`) untuk kelas ini.

**Response `200`:**

```json
{ "status": "success", "message": "Kelas berhasil dihapus dari sesi KRS." }
```

**Response `422`:**

```json
{
    "status": "error",
    "message": "Kelas tidak dapat dihapus dari sesi karena sudah ada mahasiswa yang mengajukan KRS untuk kelas ini."
}
```

---

## API Manager Kuota KRS

> **Controller:** `ManagerKrsQuotaController` | **Service:** `KrsQuotaService`

### GET `/api/manager/krs-quotas`

Menampilkan daftar kuota SKS per mahasiswa.

**Query Parameters:**

| Parameter            | Tipe      | Keterangan                               |
| -------------------- | --------- | ---------------------------------------- |
| `id_academic_period` | `integer` | Filter berdasarkan periode akademik      |
| `search`             | `string`  | Cari berdasarkan nama/username mahasiswa |
| `per_page`           | `integer` | Jumlah per halaman (default: 15)         |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar kuota KRS berhasil diambil.",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id_krs_quota": 7,
                "id_user_si": 12,
                "id_academic_period": 3,
                "max_sks": 22,
                "notes": null,
                "student": {
                    "id_user_si": 12,
                    "name": "Andi Wijaya",
                    "username": "22001234"
                },
                "academic_period": {
                    "id_academic_period": 3,
                    "name": "Genap 2025/2026"
                },
                "setter": { "id_user_si": 5, "name": "Budi Santoso" }
            }
        ],
        "total": 80,
        "per_page": 15
    }
}
```

---

### POST `/api/manager/krs-quotas`

Menetapkan atau memperbarui kuota SKS mahasiswa (**upsert** jika sudah ada untuk periode yang sama).

**Request Body:**

```json
{
    "id_user_si": 12,
    "id_academic_period": 3,
    "max_sks": 22,
    "notes": "Mahasiswa berprestasi, kuota ditambah."
}
```

| Field                | Tipe      | Wajib | Keterangan                                     |
| -------------------- | --------- | ----- | ---------------------------------------------- |
| `id_user_si`         | `integer` | Ya    | ID mahasiswa (harus memiliki role `mahasiswa`) |
| `id_academic_period` | `integer` | Ya    | ID periode akademik                            |
| `max_sks`            | `integer` | Ya    | Maksimal SKS (1–60)                            |
| `notes`              | `string`  | Tidak | Catatan (maks 500 karakter)                    |

**Response `201` (kuota baru) / `200` (kuota diperbarui):**

```json
{
    "status": "success",
    "message": "Kuota KRS mahasiswa berhasil ditetapkan.",
    "data": {
        "id_krs_quota": 7,
        "max_sks": 22,
        "student": { "id_user_si": 12, "name": "Andi Wijaya" }
    }
}
```

---

### GET `/api/manager/krs-quotas/{id}`

Menampilkan detail kuota beserta kalkulasi penggunaan SKS mahasiswa.

**Response `200`:**

```json
{
    "status": "success",
    "message": "Detail kuota KRS berhasil diambil.",
    "data": {
        "id_krs_quota": 7,
        "max_sks": 22,
        "sks_used": 18,
        "sks_approved": 12,
        "sks_remaining": 4,
        "student": {
            "id_user_si": 12,
            "name": "Andi Wijaya",
            "username": "22001234"
        }
    }
}
```

> - `sks_used` = total SKS dari KRS berstatus **pending + approved**
> - `sks_approved` = total SKS dari KRS berstatus **approved** saja
> - `sks_remaining` = `max_sks - sks_used`

---

### PATCH `/api/manager/krs-quotas/{id}`

Memperbarui kuota SKS. Pengurangan `max_sks` diblokir jika nilainya lebih kecil dari SKS yang sudah disetujui.

**Request Body:**

```json
{ "max_sks": 20, "notes": "Revisi kuota setelah evaluasi." }
```

**Response `422` Kuota terlalu kecil:**

```json
{
    "status": "error",
    "message": "Kuota SKS tidak dapat dikurangi di bawah jumlah SKS yang sudah disetujui (12 SKS)."
}
```

---

### DELETE `/api/manager/krs-quotas/{id}`

Menghapus kuota SKS. Diblokir jika mahasiswa sudah memiliki KRS yang disetujui pada periode tersebut.

**Response `422`:**

```json
{
    "status": "error",
    "message": "Kuota KRS tidak dapat dihapus karena terdapat pengajuan KRS yang sudah disetujui."
}
```

---

## API Manager Review KRS

> **Controller:** `ManagerKrsReviewController` | **Services:** `KrsReviewService`, `KrsReadService`

### GET `/api/manager/krs`

> **Tip:** Gunakan endpoint `/students` untuk tampilan per-mahasiswa, dan `/students/{id}` untuk detail KRS satu mahasiswa. Endpoint `/` ini cocok untuk filter lintas-mahasiswa (misalnya semua KRS pending dari satu sesi).

**Query Parameters:**

| Parameter            | Tipe      | Keterangan                                |
| -------------------- | --------- | ----------------------------------------- |
| `status`             | `string`  | Filter: `pending`, `approved`, `rejected` |
| `id_krs_session`     | `integer` | Filter berdasarkan sesi KRS               |
| `id_academic_period` | `integer` | Filter berdasarkan periode akademik       |
| `id_subject`         | `integer` | Filter berdasarkan mata kuliah            |
| `search`             | `string`  | Cari berdasarkan nama/username mahasiswa  |
| `per_page`           | `integer` | Jumlah per halaman (default: 15)          |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar pengajuan KRS berhasil diambil.",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id_krs": 1,
                "id_krs_session": 1,
                "id_user_si": 12,
                "id_class": 7,
                "id_subject": 3,
                "status": "pending",
                "student": {
                    "id_user_si": 12,
                    "name": "Andi Wijaya",
                    "username": "22001234"
                },
                "subject": {
                    "id_subject": 3,
                    "name_subject": "Pemrograman Web",
                    "code_subject": "IF301",
                    "sks": 3
                },
                "krs_class": { "id_class": 7, "code_class": "IF301-A" },
                "processor": null
            }
        ],
        "total": 45,
        "per_page": 15
    }
}
```

---

## API Manager Review KRS per Mahasiswa

> **Controller:** `ManagerKrsReviewController` | **Service:** `KrsReadService`

### GET `/api/manager/krs/students`

Menampilkan daftar mahasiswa yang memiliki pengajuan KRS, dikelompokkan per individu.

**Query Parameters:**

| Parameter            | Tipe      | Keterangan                                                |
| -------------------- | --------- | --------------------------------------------------------- |
| `id_academic_period` | `integer` | Filter periode (default: periode aktif)                   |
| `id_krs_session`     | `integer` | Filter berdasarkan sesi KRS                               |
| `action_needed`      | `boolean` | Jika `true`, hanya tampilkan mahasiswa dengan KRS pending |
| `search`             | `string`  | Cari berdasarkan nama atau username mahasiswa             |
| `per_page`           | `integer` | Jumlah per halaman (default: 20)                          |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar mahasiswa KRS berhasil diambil.",
    "data": {
        "current_page": 1,
        "data": [
            {
                "student": {
                    "id_user_si": 12,
                    "name": "Andi Wijaya",
                    "username": "22001234"
                },
                "total_krs": 5,
                "pending_count": 2,
                "approved_count": 3,
                "rejected_count": 0,
                "action_needed": true
            }
        ],
        "total": 38,
        "per_page": 20,
        "last_page": 2
    }
}
```

---

### GET `/api/manager/krs/students/{studentId}`

Menampilkan seluruh pengajuan KRS milik satu mahasiswa beserta kuota SKS dan ringkasan status.

**Query Parameters:**

| Parameter            | Tipe      | Keterangan                        |
| -------------------- | --------- | --------------------------------- |
| `id_academic_period` | `integer` | Override periode (default: aktif) |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Data KRS mahasiswa berhasil diambil.",
    "data": {
        "student": {
            "id_user_si": 12,
            "name": "Andi Wijaya",
            "username": "22001234"
        },
        "quota": { "max_sks": 22, "notes": null },
        "summary": {
            "pending": { "count": 2, "total_sks": 6 },
            "approved": { "count": 3, "total_sks": 9 }
        },
        "sks_used": 15,
        "sks_approved": 9,
        "krs": [
            {
                "id_krs": 5,
                "status": "pending",
                "subject": {
                    "id_subject": 5,
                    "name_subject": "Basis Data",
                    "code_subject": "IF201",
                    "sks": 3
                },
                "krs_class": {
                    "id_class": 9,
                    "code_class": "IF201-B",
                    "lecturers": [{ "id_user_si": 9, "name": "Prof. Sari" }]
                },
                "processor": null
            }
        ]
    }
}
```

---

### PATCH `/api/manager/krs/{id}/approve`

Menyetujui satu entri KRS yang berstatus `pending`. Sistem **memverifikasi kuota SKS** secara otomatis sebelum approve.

**Request Body:** (kosong)

**Response `200`:**

```json
{
    "status": "success",
    "message": "KRS mahasiswa berhasil disetujui.",
    "data": {
        "id_krs": 1,
        "status": "approved",
        "processed_by": 5,
        "processed_at": "2026-03-11T09:00:00.000000Z",
        "processor": { "id_user_si": 5, "name": "Budi Santoso" }
    }
}
```

**Response `422` Persetujuan akan melebihi kuota:**

```json
{
    "status": "error",
    "message": "Persetujuan ini akan melebihi kuota SKS mahasiswa. Kuota: 22 SKS | Sudah disetujui: 21 SKS | SKS mata kuliah ini: 3 SKS."
}
```

---

### PATCH `/api/manager/krs/{id}/reject`

Menolak satu entri KRS yang berstatus `pending`. Wajib menyertakan alasan penolakan.

**Request Body:**

```json
{
    "rejection_reason": "Beban SKS terlalu tinggi, silakan konsultasi dengan pembimbing akademik."
}
```

| Field              | Tipe     | Wajib | Keterangan                         |
| ------------------ | -------- | ----- | ---------------------------------- |
| `rejection_reason` | `string` | Ya    | Alasan penolakan (10–500 karakter) |

**Response `200`:**

```json
{
    "status": "success",
    "message": "KRS mahasiswa berhasil ditolak.",
    "data": {
        "id_krs": 2,
        "status": "rejected",
        "rejection_reason": "Beban SKS terlalu tinggi..."
    }
}
```

---

## API Mahasiswa Pengajuan KRS

> **Controller:** `StudentKrsController` | **Services:** `KrsSubmissionService`, `KrsReadService`

### GET `/api/student/krs/sessions`

Menampilkan daftar sesi KRS yang sedang `open` beserta jumlah kelas pada setiap sesi.

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar sesi KRS yang sedang open berhasil diambil.",
    "data": [
        {
            "id_krs_session": 1,
            "id_academic_period": 3,
            "status": "open",
            "notes": "Pendaftaran KRS Semester Genap 2025/2026",
            "opened_at": "2026-03-05T08:00:00.000000Z",
            "session_classes_count": 12,
            "academic_period": {
                "id_academic_period": 3,
                "name": "Genap 2025/2026",
                "is_active": true
            }
        }
    ]
}
```

---

### GET `/api/student/krs/sessions/{id}`

Menampilkan detail satu sesi KRS `open` beserta kelas yang dapat dipilih mahasiswa, dikelompokkan berdasarkan mata kuliah.

**Query Parameters:**

| Parameter    | Tipe      | Keterangan                                  |
| ------------ | --------- | ------------------------------------------- |
| `id_subject` | `integer` | Filter hanya menampilkan satu mata kuliah   |
| `search`     | `string`  | Cari berdasarkan nama atau kode mata kuliah |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Detail sesi KRS berhasil diambil.",
    "data": {
        "session": {
            "id_krs_session": 1,
            "status": "open",
            "opened_at": "2026-03-05T08:00:00.000000Z",
            "notes": "...",
            "id_academic_period": 3,
            "total_classes": 12
        },
        "subjects": [
            {
                "id_subject": 3,
                "name_subject": "Pemrograman Web",
                "code_subject": "IF301",
                "sks": 3,
                "classes": [
                    { "id_class": 7, "code_class": "IF301-A" },
                    { "id_class": 8, "code_class": "IF301-B" }
                ]
            }
        ]
    }
}
```

---

### GET `/api/student/krs/sessions/{id}/classes`

Menampilkan semua kelas whitelist dalam sesi KRS yang `open` untuk mahasiswa, dengan format serupa endpoint manager.

**Query Parameters:**

| Parameter    | Tipe      | Keterangan                                  |
| ------------ | --------- | ------------------------------------------- |
| `id_subject` | `integer` | Filter berdasarkan mata kuliah              |
| `search`     | `string`  | Cari berdasarkan nama atau kode mata kuliah |
| `per_page`   | `integer` | Jumlah per halaman (default: 20)            |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar kelas sesi KRS berhasil diambil.",
    "data": {
        "session": {
            "id_krs_session": 1,
            "status": "open",
            "id_academic_period": 3
        },
        "classes": {
            "current_page": 1,
            "data": [
                {
                    "id_krs_session_class": 1,
                    "id_subject": 3,
                    "id_class": 7,
                    "subject": {
                        "id_subject": 3,
                        "name_subject": "Pemrograman Web",
                        "code_subject": "IF301",
                        "sks": 3
                    },
                    "krs_class": {
                        "id_class": 7,
                        "code_class": "IF301-A",
                        "day_of_week": "Senin",
                        "start_time": "08:00:00",
                        "end_time": "10:30:00",
                        "member_class": 30,
                        "lecturers": [{ "id_user_si": 8, "name": "Dr. Rahman" }]
                    }
                }
            ],
            "total": 12,
            "per_page": 20
        }
    }
}
```

---

### GET `/api/student/krs/approved/pdf`

Mengunduh dokumen PDF berisi daftar KRS mahasiswa yang telah **approved** oleh manager.

Endpoint ini cocok untuk frontend React Native karena mendukung `inline` (preview) maupun `attachment` (download file).

**Query Parameters:**

| Parameter            | Tipe      | Wajib | Keterangan                           |
| -------------------- | --------- | ----- | ------------------------------------ |
| `id_academic_period` | `integer` | Tidak | Filter periode akademik              |
| `id_krs_session`     | `integer` | Tidak | Filter sesi KRS tertentu             |
| `disposition`        | `string`  | Tidak | `inline` (default) atau `attachment` |

**Contoh request:**

```http
GET /api/student/krs/approved/pdf?id_academic_period=3&disposition=inline
Authorization: Bearer {token}
```

**Response `200`:**

- Content-Type: `application/pdf`
- Content-Disposition: `inline; filename="KRS_APPROVED_{nim}_{periode}.pdf"` atau `attachment; ...`

**Response `404`:**

```json
{
    "status": "error",
    "message": "Belum ada KRS berstatus approved untuk filter yang dipilih."
}
```

---

### GET `/api/student/krs/approved/metadata`

Menampilkan metadata JSON untuk preview daftar KRS approved sebelum user menekan tombol unduh PDF.

Endpoint ini direkomendasikan untuk alur React Native:

1. Hit endpoint metadata untuk render list dan summary.
2. Gunakan `links.pdf_inline` untuk preview PDF.
3. Gunakan `links.pdf_attachment` untuk download file.

**Query Parameters:**

| Parameter            | Tipe      | Wajib | Keterangan               |
| -------------------- | --------- | ----- | ------------------------ |
| `id_academic_period` | `integer` | Tidak | Filter periode akademik  |
| `id_krs_session`     | `integer` | Tidak | Filter sesi KRS tertentu |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Metadata KRS approved berhasil diambil.",
    "data": {
        "student_info": {
            "id_user_si": 12,
            "nim": "22001234",
            "name": "Andi Wijaya",
            "program": "INFORMATIKA"
        },
        "period_info": {
            "id_academic_period": 3,
            "name": "Genap 2025/2026"
        },
        "summary": {
            "total_subjects": 5,
            "total_classes": 5,
            "total_sks": 15
        },
        "filename": "KRS_APPROVED_22001234_Genap_2025_2026.pdf",
        "items": [
            {
                "id_krs": 20,
                "id_krs_session": 1,
                "subject": {
                    "id_subject": 3,
                    "code_subject": "IF301",
                    "name_subject": "Pemrograman Web",
                    "sks": 3
                },
                "class": {
                    "id_class": 7,
                    "code_class": "IF301-A",
                    "day_of_week": "Senin",
                    "start_time": "08:00:00",
                    "end_time": "10:30:00",
                    "member_class": 30,
                    "lecturers": [
                        {
                            "id_user_si": 8,
                            "name": "Dr. Rahman"
                        }
                    ]
                },
                "approved_by": {
                    "id_user_si": 5,
                    "name": "Budi Santoso"
                },
                "approved_at": "2026-03-14T10:00:00.000000Z"
            }
        ],
        "links": {
            "pdf_inline": "https://your-domain/api/student/krs/approved/pdf?id_academic_period=3&disposition=inline",
            "pdf_attachment": "https://your-domain/api/student/krs/approved/pdf?id_academic_period=3&disposition=attachment"
        }
    }
}
```

**Response `404`:**

```json
{
    "status": "error",
    "message": "Belum ada KRS berstatus approved untuk filter yang dipilih."
}
```

---

### GET `/api/student/krs/quota`

Menampilkan kuota SKS milik mahasiswa yang login beserta info sesi KRS yang sedang aktif.

**Response `200`:**

```json
{
    "status": "success",
    "message": "Kuota KRS berhasil diambil.",
    "data": {
        "id_krs_quota": 7,
        "academic_period": {
            "id_academic_period": 3,
            "name": "Genap 2025/2026",
            "start_date": "2026-02-01",
            "end_date": "2026-06-30"
        },
        "max_sks": 22,
        "sks_used": 9,
        "sks_approved": 6,
        "sks_remaining": 13,
        "notes": null,
        "active_session": {
            "id_krs_session": 1,
            "status": "open",
            "opened_at": "2026-03-05T08:00:00.000000Z",
            "notes": "Pendaftaran KRS Semester Genap 2025/2026...",
            "session_classes_count": 12
        }
    }
}
```

> `active_session` bernilai `null` jika tidak ada sesi terbuka pada periode aktif.

---

### GET `/api/student/krs/available-classes`

Menampilkan kelas yang tersedia untuk diambil dalam sesi KRS terbuka. **Hanya kelas yang sudah didaftarkan manager ke whitelist** yang ditampilkan. Kelas yang sudah diajukan (pending/approved) tidak dimunculkan.

> **Tidak ada paginasi.** Semua kelas yang tersedia dikembalikan sekaligus, dikelompokkan berdasarkan mata kuliah.

**Query Parameters:**

| Parameter    | Tipe      | Keterangan                                  |
| ------------ | --------- | ------------------------------------------- |
| `id_subject` | `integer` | Filter hanya menampilkan satu mata kuliah   |
| `search`     | `string`  | Cari berdasarkan nama atau kode mata kuliah |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar kelas tersedia berhasil diambil.",
    "data": {
        "session": {
            "id_krs_session": 1,
            "status": "open",
            "opened_at": "2026-03-05T08:00:00.000000Z",
            "notes": "..."
        },
        "subjects": [
            {
                "id_subject": 3,
                "name_subject": "Pemrograman Web",
                "code_subject": "IF301",
                "sks": 3,
                "classes": [
                    {
                        "id_class": 7,
                        "code_class": "IF301-A",
                        "day_of_week": "Senin",
                        "start_time": "08:00:00",
                        "end_time": "10:30:00",
                        "member_class": 30,
                        "lecturers": [{ "id_user_si": 8, "name": "Dr. Rahman" }]
                    },
                    {
                        "id_class": 8,
                        "code_class": "IF301-B",
                        "day_of_week": "Rabu",
                        "start_time": "10:00:00",
                        "end_time": "12:30:00",
                        "member_class": 30,
                        "lecturers": [{ "id_user_si": 9, "name": "Prof. Sari" }]
                    }
                ]
            }
        ]
    }
}
```

---

### GET `/api/student/krs`

Menampilkan semua KRS milik mahasiswa yang login beserta ringkasan per status.

**Query Parameters:**

| Parameter            | Tipe      | Keterangan                                |
| -------------------- | --------- | ----------------------------------------- |
| `id_academic_period` | `integer` | Override periode (default: periode aktif) |

**Response `200`:**

```json
{
    "status": "success",
    "message": "Daftar KRS berhasil diambil.",
    "data": {
        "academic_period": {
            "id_academic_period": 3,
            "name": "Genap 2025/2026"
        },
        "summary": {
            "pending": { "count": 2, "total_sks": 6 },
            "approved": { "count": 3, "total_sks": 9 },
            "rejected": { "count": 1, "total_sks": 3 }
        },
        "krs": [
            {
                "id_krs": 1,
                "status": "approved",
                "subject": {
                    "id_subject": 3,
                    "name_subject": "Pemrograman Web",
                    "code_subject": "IF301",
                    "sks": 3
                },
                "krs_class": {
                    "id_class": 7,
                    "code_class": "IF301-A",
                    "lecturers": [{ "id_user_si": 8, "name": "Dr. Rahman" }]
                },
                "processor": { "id_user_si": 5, "name": "Budi Santoso" }
            }
        ]
    }
}
```

---

### POST `/api/student/krs`

Mengajukan KRS untuk satu kelas. Panggil endpoint ini sekali untuk setiap kelas yang ingin diambil.

**Prasyarat yang divalidasi (berurutan):**

1. Jika `id_krs_session` dikirim: sesi tersebut harus `open`
2. Jika `id_krs_session` tidak dikirim: sistem memakai sesi `open` pada periode aktif
3. Kelas yang dipilih terdaftar dalam **whitelist sesi KRS**
4. Kuota SKS sudah ditetapkan oleh manager
5. Belum ada KRS `approved` untuk **mata kuliah yang sama** di sesi ini
    - Jika ada KRS `pending` untuk mata kuliah yang sama → **ganti kelas** (update, bukan insert)
    - Jika ada KRS `approved` untuk mata kuliah yang sama → **tolak** (hubungi manager)
6. Total SKS (pending + approved) tidak akan melebihi kuota setelah penambahan

**Request Body:**

```json
{ "id_class": 7, "id_krs_session": 1 }
```

> `id_krs_session` bersifat opsional. Jika tidak dikirim, sistem akan mencari sesi open di periode aktif seperti perilaku sebelumnya.

**Response `201` KRS baru diajukan:**

```json
{
    "status": "success",
    "message": "KRS berhasil diajukan dan menunggu persetujuan manager.",
    "data": { "id_krs": 5, "status": "pending", "id_class": 7, "id_subject": 3 }
}
```

**Response `200` Kelas KRS berhasil diganti:**

```json
{
    "status": "success",
    "message": "Kelas KRS berhasil diganti.",
    "data": { "id_krs": 5, "id_class": 8, "status": "pending" }
}
```

**Contoh response error `422`:**

```json
{
    "status": "error",
    "message": "Sesi pendaftaran KRS tidak sedang terbuka. Silakan tunggu manager membuka sesi."
}
```

```json
{
    "status": "error",
    "message": "Kelas yang dipilih tidak tersedia pada sesi KRS ini."
}
```

```json
{
    "status": "error",
    "message": "Penambahan mata kuliah ini (3 SKS) akan melebihi kuota KRS Anda. Kuota: 22 SKS | Terpakai: 21 SKS | Tersisa: 1 SKS."
}
```

---

### DELETE `/api/student/krs/{id}`

Membatalkan pengajuan KRS. Hanya bisa dilakukan jika status masih `pending` **dan** sesi KRS masih `open`.

**Response `200`:**

```json
{ "status": "success", "message": "Pengajuan KRS berhasil dibatalkan." }
```

**Response `422` KRS sudah diproses:**

```json
{
    "status": "error",
    "message": "KRS yang sudah diproses (disetujui atau ditolak) tidak dapat dibatalkan."
}
```

**Response `422` Sesi sudah ditutup:**

```json
{
    "status": "error",
    "message": "Pengajuan KRS tidak dapat dibatalkan karena sesi KRS sudah ditutup."
}
```
