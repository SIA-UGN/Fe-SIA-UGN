# Dokumentasi API Gaji Dosen

Dokumen ini khusus untuk modul C.4 (Slip Gaji Dosen) dan integrasinya dengan data rekap presensi.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Aturan Umum](#aturan-umum)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [Alur Manager Payroll](#alur-manager-payroll)
- [Skema Tabel dan Relasi](#skema-tabel-dan-relasi)
- [API Generate Slip Gaji](#api-generate-slip-gaji)
- [API Dashboard Payroll Dosen](#api-dashboard-payroll-dosen)
- [API Daftar Slip Gaji](#api-daftar-slip-gaji)
- [API Download Slip Gaji PDF](#api-download-slip-gaji-pdf)
- [API Manager Payroll](#api-manager-payroll)
- [Integrasi Dengan Modul Presensi](#integrasi-dengan-modul-presensi)
- [Format Response](#format-response)

---

## Gambaran Umum

Modul gaji dosen digunakan untuk:

- generate slip gaji bulanan,
- menyusun komponen gaji berdasarkan periode,
- menampilkan daftar histori slip gaji dosen,
- menghitung potongan presensi melalui endpoint integrasi C.1.

### Environment

| Variabel   | Keterangan           | Contoh                      |
| ---------- | -------------------- | --------------------------- |
| `base_url` | Base URL API         | `http://127.0.0.1:8000/api` |
| `token`    | Bearer token Sanctum | `abc123...`                 |

### Autentikasi

Seluruh endpoint di dokumen ini memerlukan header:

```http
Authorization: Bearer {{token}}
Accept: application/json
```

---

## Aturan Umum

| Aturan          | Keterangan                                                                           |
| --------------- | ------------------------------------------------------------------------------------ |
| Role access     | Endpoint dosen diakses role `dosen`; endpoint manager diakses role `admin`/`manager` |
| Prasyarat rekap | Rekap presensi periode terkait harus tersedia sebelum generate payroll               |
| Validasi input  | Input tidak valid mengembalikan `422`                                                |
| Unauthenticated | Request tanpa token mengembalikan `401`                                              |

---

## Ringkasan Endpoint

| Method  | Endpoint                                                                                       | Deskripsi                                                |
| ------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `GET`   | `/lecturer/payroll/overview?bulan={bulan}&tahun={tahun}`                                       | Dashboard bulanan dosen (presensi + slip final/estimasi) |
| `POST`  | `/lecturer/payroll/generate`                                                                   | Generate slip gaji dosen bulanan                         |
| `GET`   | `/lecturer/payroll?tahun={tahun}`                                                              | Ambil daftar slip gaji dosen                             |
| `GET`   | `/lecturer/payroll/{id}/pdf`                                                                   | Download slip gaji dalam format PDF                      |
| `GET`   | `/manager/payroll/lecturers`                                                                   | Daftar dosen untuk modul payroll manager                 |
| `GET`   | `/manager/payroll/lecturers/{lecturerId}`                                                      | Detail identitas dosen                                   |
| `GET`   | `/manager/payroll/lecturers/{lecturerId}/attendance/subjects?bulan=&tahun=`                    | Ringkasan hadir dosen per mata kuliah                    |
| `GET`   | `/manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}`                        | Detail hadir dosen per pertemuan                         |
| `PATCH` | `/manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}/schedules/{scheduleId}` | Koreksi kehadiran manual oleh manager                    |
| `GET`   | `/manager/payroll/lecturers/{lecturerId}/slip?bulan=&tahun=`                                   | Lihat slip dosen per periode (final/estimasi)            |
| `GET`   | `/manager/payroll/lecturers/{lecturerId}/slips?tahun=`                                         | Daftar slip gaji dosen                                   |
| `GET`   | `/manager/payroll/lecturers/{lecturerId}/slips/{id}/pdf`                                       | Download PDF slip gaji dosen                             |

---

## Alur Manager Payroll

Flow manager yang didukung pada modul gaji dosen:

1. Manager mengambil daftar dosen (`GET /manager/payroll/lecturers`).
2. Manager membuka identitas dosen (`GET /manager/payroll/lecturers/{lecturerId}`).
3. Manager melihat ringkasan hadir per mata kuliah, misalnya `8/10` pertemuan (`GET /manager/payroll/lecturers/{lecturerId}/attendance/subjects?bulan=3&tahun=2026`).
4. Manager membuka detail kehadiran per pertemuan (`GET /manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}`).
5. Manager mengoreksi status kehadiran per schedule/pertemuan (misalnya pertemuan ke-3 dari `alpha` menjadi `hadir`) lewat endpoint `PATCH`.
6. Manager melihat daftar slip dan mengunduh PDF slip dosen.

---

## Skema Tabel dan Relasi

### Tabel `gajis`

Menyimpan header slip gaji dosen per bulan dan tahun.

| Kolom              | Tipe                | Nullable | Default | Keterangan                                       |
| ------------------ | ------------------- | -------- | ------- | ------------------------------------------------ |
| `id`               | `bigint unsigned`   | No       |         | Primary key (auto increment)                     |
| `id_user_si`       | `bigint unsigned`   | No       |         | FK -> `users_si.id_user_si`                      |
| `bulan`            | `tinyint unsigned`  | No       |         | Bulan payroll (`1-12`)                           |
| `tahun`            | `smallint unsigned` | No       |         | Tahun payroll                                    |
| `total_pendapatan` | `decimal(12,2)`     | No       | `0.00`  | Total seluruh komponen pendapatan                |
| `total_potongan`   | `decimal(12,2)`     | No       | `0.00`  | Total seluruh komponen potongan                  |
| `gaji_bersih`      | `decimal(12,2)`     | No       | `0.00`  | Nilai akhir gaji setelah potongan                |
| `created_at`       | `timestamp`         | Yes      | NULL    | Laravel timestamp                                |
| `updated_at`       | `timestamp`         | Yes      | NULL    | Laravel timestamp                                |

**Constraint & Index:**

- Unique: `gaji_dosen_bulan_tahun_unique` pada `(id_user_si, bulan, tahun)`
- Index: `(id_user_si, tahun)` untuk query histori slip per dosen per tahun

---

### Tabel `gaji_komponens`

Menyimpan detail komponen slip gaji (pendapatan dan potongan).

| Kolom            | Tipe              | Nullable | Default | Keterangan                                              |
| ---------------- | ----------------- | -------- | ------- | ------------------------------------------------------- |
| `id`             | `bigint unsigned` | No       |         | Primary key (auto increment)                            |
| `id_gaji`        | `bigint unsigned` | No       |         | FK -> `gajis.id`                                        |
| `nama_komponen`  | `varchar(100)`    | No       |         | Nama komponen, contoh: `Gaji Pokok`, `Potongan Alpha`  |
| `tipe`           | `enum`            | No       |         | Nilai: `pendapatan` atau `potongan`                     |
| `nominal`        | `decimal(12,2)`   | No       | `0.00`  | Nilai komponen                                          |
| `created_at`     | `timestamp`       | Yes      | NULL    | Laravel timestamp                                       |
| `updated_at`     | `timestamp`       | Yes      | NULL    | Laravel timestamp                                       |

**Constraint & Index:**

- FK `id_gaji` ke `gajis.id` dengan `onDelete('cascade')`
- Index `id_gaji` untuk percepat load komponen dari satu slip

---

### Ringkasan Relasi

| Sumber           | Tipe Relasi | Tujuan       | Keterangan |
| ---------------- | ----------- | ------------ | ---------- |
| `users_si`       | `1 : N`     | `gajis`      | Satu dosen memiliki banyak slip gaji lintas periode |
| `gajis`          | `1 : N`     | `gaji_komponens` | Satu slip gaji memiliki banyak komponen |
| `gaji_komponens` | `N : 1`     | `gajis`      | Setiap komponen wajib terikat ke satu slip |

### Relasi Logis Dengan Modul Presensi

Walau tidak dibatasi FK langsung di database, data payroll memiliki relasi logis ke rekap presensi melalui kombinasi:

- `id_user_si` (dosen)
- `bulan`
- `tahun`

Kombinasi tersebut dipakai saat proses generate slip untuk menarik potongan dari modul presensi.

---

## API Dashboard Payroll Dosen

### GET `/lecturer/payroll/overview`

Mengambil dashboard payroll bulanan untuk dosen login dalam satu response:

- ringkasan presensi bulan terpilih (termasuk total pertemuan),
- breakdown presensi per mata kuliah,
- slip gaji final jika sudah tersedia,
- slip gaji estimasi bila periode saat ini belum final.

**Akses**

- Role: `dosen`
- Header wajib: `Authorization: Bearer {{token}}`

**Query Parameters**

| Parameter | Tipe    | Wajib | Keterangan                              |
| --------- | ------- | ----- | --------------------------------------- |
| `bulan`   | integer | Tidak | Bulan dashboard. Default bulan saat ini |
| `tahun`   | integer | Tidak | Tahun dashboard. Default tahun saat ini |

**Contoh Request**

`GET /api/lecturer/payroll/overview?bulan=4&tahun=2026`

**Contoh cURL**

```bash
curl --location --request GET '{{base_url}}/lecturer/payroll/overview?bulan=4&tahun=2026' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json'
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Dashboard payroll dosen bulan 4/2026 berhasil diambil.",
    "data": {
        "lecturer": {
            "id_user_si": 12,
            "name": "Budi Santoso",
            "email": "budi@kampus.ac.id",
            "username": "budi",
            "is_active": true,
            "employee_id_number": "DOS-00012",
            "position": "Dosen Tetap",
            "program_name": "Teknik Informatika",
            "profile_image": null
        },
        "periode": {
            "bulan": 4,
            "tahun": 2026,
            "bulan_nama": "April",
            "periode_label": "April 2026"
        },
        "attendance_overview": {
            "summary": {
                "total_hadir": 18,
                "total_izin": 1,
                "total_sakit": 0,
                "total_alpha": 2,
                "total_hari_kerja": 21,
                "persentase_hadir": 85.71
            },
            "subjects": [
                {
                    "id_class": 10,
                    "id_subject": 5,
                    "code_class": "A",
                    "code_subject": "BD101",
                    "name_subject": "Basis Data",
                    "sks": 3,
                    "total_hadir": 8,
                    "total_izin": 0,
                    "total_sakit": 0,
                    "total_alpha": 1,
                    "total_pertemuan": 9,
                    "ringkasan_hadir": "8/9"
                }
            ]
        },
        "slip_gaji": {
            "is_estimation": true,
            "dosen": {
                "id_user_si": 12,
                "nama": "Budi Santoso",
                "email": "budi@kampus.ac.id",
                "nip": "DOS-00012",
                "jabatan": "Dosen Tetap",
                "program_name": "Teknik Informatika"
            },
            "periode": {
                "bulan": 4,
                "tahun": 2026,
                "bulan_nama": "April",
                "periode_label": "April 2026"
            },
            "rekap_presensi": {
                "total_hadir": 18,
                "total_izin": 1,
                "total_sakit": 0,
                "total_alpha": 2,
                "total_hari_kerja": 21,
                "persentase_hadir": 85.71
            },
            "komponen_gaji": {
                "pendapatan": [
                    {
                        "nama": "Gaji Pokok",
                        "nominal": 5000000
                    },
                    {
                        "nama": "Tunjangan",
                        "nominal": 2000000
                    }
                ],
                "potongan": [
                    {
                        "nama": "Potongan Alpha",
                        "nominal": 200000
                    }
                ],
                "summary": {
                    "total_pendapatan": 7000000,
                    "total_potongan": 200000,
                    "gaji_bersih": 6800000
                }
            },
            "metadata": {
                "generated_at": "2026-04-13T08:00:00.000000Z",
                "is_final": false,
                "can_edit": true
            }
        }
    }
}
```

**Response 422 (Periode masa depan)**

```json
{
    "status": "failed",
    "message": "Dashboard payroll belum tersedia untuk periode yang akan datang.",
    "data": {
        "bulan_diminta": 12,
        "tahun_diminta": 2026,
        "bulan_sekarang": 4,
        "tahun_sekarang": 2026
    }
}
```

**Response 404 (Slip final belum tersedia untuk bulan lampau)**

```json
{
    "status": "error",
    "message": "Slip gaji final untuk periode ini belum tersedia."
}
```

**Penjelasan penting**

- `attendance_overview.summary.total_hari_kerja` berasal dari jumlah schedule/pertemuan dosen pada bulan dan tahun yang dipilih.
- `slip_gaji.is_estimation = false` jika slip final sudah ada di database.
- `slip_gaji.is_estimation = true` jika periode adalah bulan berjalan dan slip final belum tersedia.
- Endpoint ini dirancang untuk frontend agar cukup satu request untuk widget presensi + payroll.

## API Generate Slip Gaji

### POST `/lecturer/payroll/generate`

Menghasilkan slip gaji untuk bulan dan tahun tertentu.

**Akses**

- Role: `dosen`
- Header wajib: `Authorization: Bearer {{token}}`
- Format request: `application/json`

**Prasyarat**

- Rekap presensi untuk bulan dan tahun yang diminta sudah tersedia.
- Endpoint ini akan memanggil data potongan dari modul presensi sebelum menyimpan slip gaji.

**Headers**

```http
Authorization: Bearer {{token}}
Accept: application/json
Content-Type: application/json
```

**Request Body**

```json
{
    "bulan": 3,
    "tahun": 2026
}
```

| Field   | Tipe    | Wajib | Keterangan    |
| ------- | ------- | ----- | ------------- |
| `bulan` | integer | Ya    | Bulan payroll |
| `tahun` | integer | Ya    | Tahun payroll |

**Contoh Request**

```json
{
    "bulan": 3,
    "tahun": 2026
}
```

**Contoh cURL**

```bash
curl --location --request POST '{{base_url}}/lecturer/payroll/generate' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "bulan": 3,
  "tahun": 2026
}'
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Slip gaji bulan 3/2026 berhasil digenerate.",
    "data": {
        "id_payroll": 12,
        "id_user_si": 5,
        "bulan": 3,
        "tahun": 2026,
        "gaji_bruto": 8500000,
        "total_potongan": 200000,
        "gaji_bersih": 8300000
    }
}
```

**Penjelasan Response 200**

- `total_pendapatan` adalah gaji pokok + tunjangan.
- `total_potongan` berasal dari hasil rekap presensi bulan tersebut.
- `gaji_bersih` adalah selisih pendapatan dan potongan.
- Field `data` memuat slip yang sudah tersimpan beserta komponen gaji.

**Response 422 (Validasi gagal)**

```json
{
    "message": "Data yang diberikan tidak valid.",
    "errors": {
        "bulan": ["Field bulan wajib diisi."]
    }
}
```

**Response 409 (Prasyarat belum terpenuhi)**

```json
{
    "status": "error",
    "message": "Rekap presensi belum tersedia untuk periode yang diminta. Silakan generate rekap terlebih dahulu."
}
```

**Response 500 (Kesalahan tak terduga)**

```json
{
    "status": "error",
    "message": "Terjadi kesalahan saat mengenerate slip gaji."
}
```

---

## API Daftar Slip Gaji

### GET `/lecturer/payroll`

Mengambil daftar slip gaji milik dosen login.

**Akses**

- Role: `dosen`
- Header wajib: `Authorization: Bearer {{token}}`
- Format response: JSON

**Query Parameters**

| Parameter | Tipe    | Wajib | Keterangan                      |
| --------- | ------- | ----- | ------------------------------- |
| `tahun`   | integer | Tidak | Filter daftar berdasarkan tahun |

**Contoh Request**

`GET /api/lecturer/payroll?tahun=2026`

**Contoh cURL**

```bash
curl --location --request GET '{{base_url}}/lecturer/payroll?tahun=2026' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json'
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Daftar slip gaji berhasil diambil.",
    "data": [
        {
            "id_payroll": 12,
            "bulan": 3,
            "tahun": 2026,
            "gaji_bruto": 8500000,
            "total_potongan": 200000,
            "gaji_bersih": 8300000,
            "generated_at": "2026-03-31T17:10:00.000000Z"
        }
    ]
}
```

**Response 200 (Data kosong)**

```json
{
    "status": "success",
    "message": "Daftar slip gaji berhasil diambil.",
    "data": []
}
```

**Penjelasan Response**

- Endpoint ini hanya mengembalikan slip milik dosen yang sedang login.
- Data diurutkan dari tahun terbaru lalu bulan terbaru.
- Jika parameter `tahun` dikirim, hasil akan difilter ke tahun tersebut.

---

## API Download Slip Gaji PDF

### GET `/lecturer/payroll/{id}/pdf`

Mengunduh slip gaji dalam format PDF berdasarkan ID slip gaji.

**Akses**

- Role: `dosen`
- Header wajib: `Authorization: Bearer {{token}}`
- Output: file PDF

**Headers**

```http
Authorization: Bearer {{token}}
Accept: application/pdf
```

**Path Parameter**

| Parameter | Tipe    | Wajib | Keterangan   |
| --------- | ------- | ----- | ------------ |
| `id`      | integer | Ya    | ID slip gaji |

**Contoh Request**

`GET /api/lecturer/payroll/12/pdf`

**Contoh cURL**

```bash
curl --location --request GET '{{base_url}}/lecturer/payroll/12/pdf' \
--header 'Authorization: Bearer {{token}}' \
--output Slip_Gaji.pdf
```

**Response 200 (PDF)**

- `Content-Type: application/pdf`
- File akan langsung terunduh dengan nama `Slip_Gaji_{nama_dosen}_{bulan}_{tahun}.pdf`

**Penjelasan Response 200**

- Response tidak berbentuk JSON.
- Browser atau client akan menerima binary PDF.
- Nama file mengikuti format slip gaji dosen, bulan, dan tahun.

**Response 403 (Bukan pemilik slip)**

```json
{
    "message": "Anda tidak memiliki izin untuk mengakses slip gaji ini."
}
```

**Response 404 (Slip tidak ditemukan)**

```json
{
    "message": "Slip gaji tidak ditemukan."
}
```

---

## API Manager Payroll

Seluruh endpoint di bawah ini memerlukan role `admin` atau `manager`.

**Akses**

- Role: `admin` atau `manager`
- Header wajib: `Authorization: Bearer {{token}}`
- Base URL: `/api/manager/payroll`

### Struktur Data Umum

- `lecturer` berisi identitas dosen yang sedang dilihat.
- `subjects` berisi ringkasan kehadiran per mata kuliah.
- `schedules` berisi detail pertemuan/schedule.
- `slips` berisi histori slip gaji dosen.

### 1) GET `/manager/payroll/lecturers`

Ambil daftar dosen yang siap diproses di modul payroll manager.

**Query Parameters (opsional)**

| Parameter  | Tipe    | Keterangan                                 |
| ---------- | ------- | ------------------------------------------ |
| `search`   | string  | Cari dosen berdasarkan nama/email/username |
| `per_page` | integer | Jumlah data per halaman (default 15)       |

**Contoh Request**

`GET /api/manager/payroll/lecturers?search=budi&per_page=10`

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Daftar dosen untuk modul gaji berhasil diambil.",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id_user_si": 12,
                "name": "Budi Santoso",
                "username": "budi",
                "is_active": true,
                "employee_id_number": "DOS-00012",
                "position": "Dosen Tetap",
                "program_name": "Teknik Informatika"
            }
        ],
        "per_page": 10,
        "total": 1
    }
}
```

**Penjelasan Response 200**

- Response berbentuk pagination Laravel.
- Field `data.data` berisi daftar dosen.
- Field `data.total` menunjukkan total data matching query.

### 2) GET `/manager/payroll/lecturers/{lecturerId}`

Ambil identitas dosen terpilih.

**Contoh Request**

`GET /api/manager/payroll/lecturers/12`

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Identitas dosen berhasil diambil.",
    "data": {
        "id_user_si": 12,
        "name": "Budi Santoso",
        "email": "budi@kampus.ac.id",
        "username": "budi",
        "is_active": true,
        "employee_id_number": "DOS-00012",
        "position": "Dosen Tetap",
        "program_name": "Teknik Informatika",
        "profile_image": null
    }
}
```

**Response 404 (Data tidak ditemukan)**

```json
{
    "message": "No query results for model [App\\Models\\User_si] 12"
}
```

### 3) GET `/manager/payroll/lecturers/{lecturerId}/attendance/subjects?bulan={bulan}&tahun={tahun}`

Ambil ringkasan kehadiran dosen per mata kuliah pada bulan/tahun tertentu.

**Query Parameters**

| Parameter | Tipe    | Wajib | Keterangan                                       |
| --------- | ------- | ----- | ------------------------------------------------ |
| `bulan`   | integer | Tidak | Bulan rekap. Jika kosong, default bulan saat ini |
| `tahun`   | integer | Tidak | Tahun rekap. Jika kosong, default tahun saat ini |

**Contoh Request**

`GET /api/manager/payroll/lecturers/12/attendance/subjects?bulan=3&tahun=2026`

Contoh hasil ringkasan:

```json
{
    "id_class": 10,
    "name_subject": "Basis Data",
    "total_hadir": 8,
    "total_pertemuan": 10,
    "ringkasan_hadir": "8/10"
}
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Rekap kehadiran dosen per mata kuliah berhasil diambil.",
    "data": {
        "lecturer": {
            "id_user_si": 12,
            "name": "Budi Santoso"
        },
        "periode": {
            "bulan": 3,
            "tahun": 2026
        },
        "subjects": [
            {
                "id_class": 10,
                "id_subject": 5,
                "code_class": "A",
                "code_subject": "BD101",
                "name_subject": "Basis Data",
                "sks": 3,
                "total_hadir": 8,
                "total_pertemuan": 10,
                "ringkasan_hadir": "8/10"
            }
        ]
    }
}
```

**Penjelasan Response 200**

- `subjects` adalah daftar kelas yang diajar dosen tersebut pada bulan/tahun terpilih.
- `ringkasan_hadir` memudahkan manager melihat pola kehadiran dengan cepat.
- Jika kelas tidak punya schedule pada periode yang diminta, kelas tetap bisa muncul dengan `total_pertemuan = 0`.

### 4) GET `/manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}?bulan={bulan}&tahun={tahun}`

Ambil detail kehadiran per pertemuan untuk mata kuliah tertentu.

**Contoh Request**

`GET /api/manager/payroll/lecturers/12/attendance/subjects/10?bulan=3&tahun=2026`

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Detail kehadiran dosen per pertemuan berhasil diambil.",
    "data": {
        "lecturer": {
            "id_user_si": 12,
            "name": "Budi Santoso"
        },
        "class": {
            "id_class": 10,
            "code_class": "A",
            "code_subject": "BD101",
            "name_subject": "Basis Data",
            "academic_period": "Semester Genap 2025/2026"
        },
        "periode": {
            "bulan": 3,
            "tahun": 2026
        },
        "summary": {
            "total_hadir": 8,
            "total_pertemuan": 10,
            "ringkasan_hadir": "8/10"
        },
        "schedules": [
            {
                "id_schedule": 101,
                "pertemuan_ke": 1,
                "tanggal": "2026-03-02",
                "status": "hadir",
                "is_validated": true,
                "validated_at": "2026-03-02T09:10:00.000000Z",
                "keterangan": null
            },
            {
                "id_schedule": 103,
                "pertemuan_ke": 3,
                "tanggal": "2026-03-16",
                "status": "alpha",
                "is_validated": false,
                "validated_at": null,
                "keterangan": null
            }
        ]
    }
}
```

**Penjelasan Response 200**

- `status` per schedule berasal dari data presensi dosen yang tersimpan.
- Jika belum ada presensi untuk schedule tertentu, status default dibaca sebagai `alpha`.
- `pertemuan_ke` mengikuti urutan schedule pada bulan dan tahun yang dipilih.

### 5) PATCH `/manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}/schedules/{scheduleId}`

Koreksi manual kehadiran dosen per schedule/pertemuan.

**Request Body**

```json
{
    "status": "hadir",
    "keterangan": "Validasi manual manager untuk pertemuan ke-3"
}
```

**Contoh Request**

`PATCH /api/manager/payroll/lecturers/12/attendance/subjects/10/schedules/103`

| Field        | Tipe   | Wajib | Keterangan                        |
| ------------ | ------ | ----- | --------------------------------- |
| `status`     | enum   | Ya    | `hadir`, `izin`, `sakit`, `alpha` |
| `keterangan` | string | Tidak | Catatan validasi manager          |

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Kehadiran dosen berhasil diperbarui oleh manager.",
    "data": {
        "id": 900,
        "id_user_si": 12,
        "id_schedule": 103,
        "tanggal": "2026-03-16",
        "status": "hadir",
        "is_validated": true,
        "id_manager_validator": 3,
        "validated_at": "2026-04-12T08:15:00.000000Z",
        "keterangan": "Validasi manual manager untuk pertemuan ke-3"
    }
}
```

**Penjelasan Response 200**

- Endpoint ini dapat membuat record baru jika presensi untuk schedule itu belum ada.
- Manager menjadi validator pada field `id_manager_validator`.
- Status yang diubah di sini akan dipakai saat rekap gaji dihitung ulang.

**Response 422 (Validasi gagal)**

```json
{
    "message": "Data yang diberikan tidak valid.",
    "errors": {
        "status": ["Field status wajib diisi."]
    }
}
```

### 6) GET `/manager/payroll/lecturers/{lecturerId}/slip?bulan={bulan}&tahun={tahun}`

Menampilkan slip gaji dosen per periode, dengan mode otomatis:

- `final` jika slip sudah tersimpan,
- `estimasi` jika periode adalah bulan berjalan dan slip final belum tersedia.

**Contoh Request**

`GET /api/manager/payroll/lecturers/12/slip?bulan=4&tahun=2026`

**Response 200 (Slip Final / Estimasi)**

```json
{
    "status": "success",
    "message": "Slip gaji bulan 4/2026 (Estimasi).",
    "data": {
        "is_estimation": true,
        "dosen": {
            "id_user_si": 12,
            "nama": "Budi Santoso",
            "email": "budi@kampus.ac.id",
            "nip": "DOS-00012",
            "jabatan": "Dosen Tetap"
        },
        "periode": {
            "bulan": 4,
            "tahun": 2026,
            "bulan_nama": "April",
            "periode_label": "April 2026"
        },
        "rekap_presensi": {
            "total_hadir": 18,
            "total_izin": 1,
            "total_sakit": 0,
            "total_alpha": 2,
            "total_hari_kerja": 21,
            "persentase_hadir": 85.71
        },
        "komponen_gaji": {
            "pendapatan": [
                {
                    "nama": "Gaji Pokok",
                    "nominal": 5000000
                },
                {
                    "nama": "Tunjangan",
                    "nominal": 2000000
                }
            ],
            "potongan": [
                {
                    "nama": "Potongan Alpha",
                    "nominal": 200000
                }
            ],
            "summary": {
                "total_pendapatan": 7000000,
                "total_potongan": 200000,
                "gaji_bersih": 6800000
            }
        },
        "metadata": {
            "generated_at": "2026-04-13T08:00:00.000000Z",
            "is_final": false,
            "can_edit": true
        }
    }
}
```

**Response 422 (Periode masa depan)**

```json
{
    "status": "failed",
    "message": "Slip gaji belum dapat dilihat untuk periode yang akan datang.",
    "data": {
        "bulan_diminta": 12,
        "tahun_diminta": 2026,
        "bulan_sekarang": 4,
        "tahun_sekarang": 2026
    }
}
```

**Response 404 (Periode lampau, slip final belum tersedia)**

```json
{
    "status": "failed",
    "message": "Data rekap presensi belum tersedia untuk periode ini.",
    "data": {
        "bulan": 1,
        "tahun": 2026
    }
}
```

**Penjelasan Response 200**

- `is_estimation = true` berarti slip bersifat sementara dan akan berubah sampai akhir periode.
- `is_estimation = false` berarti slip final sudah tersimpan permanen.
- `rekap_presensi.total_hari_kerja` diambil dari jumlah schedule dosen pada bulan/tahun terpilih.

### 7) GET `/manager/payroll/lecturers/{lecturerId}/slips?tahun={tahun}`

Daftar slip gaji dosen yang bisa ditinjau manager.

**Contoh Request**

`GET /api/manager/payroll/lecturers/12/slips?tahun=2026`

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Daftar slip gaji dosen berhasil diambil.",
    "data": [
        {
            "id": 21,
            "id_user_si": 12,
            "bulan": 3,
            "tahun": 2026,
            "total_pendapatan": 7000000,
            "total_potongan": 250000,
            "gaji_bersih": 6750000,
            "komponens": [
                {
                    "nama_komponen": "Gaji Pokok",
                    "tipe": "pendapatan",
                    "nominal": 5000000
                }
            ]
        }
    ]
}
```

**Penjelasan Response 200**

- Data hanya untuk dosen yang dipilih.
- Jika query `tahun` diisi, hasil difilter ke tahun tersebut.
- Relasi `komponens` ikut ditampilkan agar manager bisa meninjau komponen slip.

### 8) GET `/manager/payroll/lecturers/{lecturerId}/slips/{id}/pdf`

Download PDF slip gaji dosen oleh manager.

**Contoh Request**

`GET /api/manager/payroll/lecturers/12/slips/21/pdf`

**Response 200 (PDF)**

- `Content-Type: application/pdf`
- File akan terunduh dengan nama `Slip_Gaji_{nama_dosen}_{bulan}_{tahun}.pdf`

**Response 404 (Slip tidak ditemukan)**

```json
{
    "message": "Slip gaji tidak ditemukan."
}
```

**Penjelasan Response 200**

- Respons berupa binary PDF, bukan JSON.
- Endpoint ini aman karena slip harus milik dosen yang dipilih.

**Catatan Implementasi**

- Endpoint manager ini memakai template PDF yang sama dengan slip dosen.
- Jika suatu saat dibutuhkan branding manager yang berbeda, template bisa dipisah tanpa mengubah kontrak endpoint.

---

## Integrasi Dengan Modul Presensi

Perhitungan potongan gaji berasal dari endpoint modul presensi:

- `GET /lecturer/attendance/payroll-deduction?bulan={bulan}&tahun={tahun}`

Endpoint tersebut menjadi jembatan C.1 ke C.4 untuk menghitung total potongan berbasis jumlah alpha.

Dokumentasi detail endpoint integrasi tersedia di [documentation/presensi-dosen.md](documentation/presensi-dosen.md).

---

## Format Response

### Success

```json
{
    "status": "success",
    "message": "Pesan sukses.",
    "data": {}
}
```

### Error

```json
{
    "status": "error",
    "message": "Pesan error."
}
```

### Validation Error

```json
{
    "message": "The field is required.",
    "errors": {
        "field": ["The field is required."]
    }
}
```

### Unauthenticated

```json
{
    "message": "Unauthenticated."
}
```
