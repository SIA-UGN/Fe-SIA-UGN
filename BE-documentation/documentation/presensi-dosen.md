# Dokumentasi API Presensi Dosen

Dokumen ini khusus untuk modul C.1 (Presensi Dosen), mencakup check-in GPS dan rekap kehadiran bulanan.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Skema Tabel dan Relasi](#skema-tabel-dan-relasi)
- [Aturan Umum](#aturan-umum)
- [Ringkasan Endpoint](#ringkasan-endpoint)
- [API Check-in Presensi](#api-check-in-presensi)
- [API Rekap Kehadiran](#api-rekap-kehadiran)
- [Format Response](#format-response)

---

## Gambaran Umum

Modul presensi dosen digunakan untuk:

- melakukan check-in kehadiran berbasis GPS,
- menyimpan data presensi harian dosen,
- menghasilkan rekap kehadiran bulanan,
- menyediakan data dasar potongan presensi untuk modul gaji.

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

## Skema Tabel dan Relasi

Bagian ini merangkum tabel inti modul presensi dosen berdasarkan migration saat ini.

### 1) Tabel `campus_settings`

Menyimpan titik kampus dan radius validasi GPS.

| Kolom          | Tipe    | Keterangan                       |
| -------------- | ------- | -------------------------------- |
| `id_setting`   | PK      | Primary key setting kampus       |
| `nama_kampus`  | string  | Nama kampus                      |
| `latitude`     | decimal | Titik pusat GPS kampus (lintang) |
| `longitude`    | decimal | Titik pusat GPS kampus (bujur)   |
| `radius_meter` | integer | Radius validasi check-in (meter) |
| `is_active`    | boolean | Penanda kampus aktif/nonaktif    |

### 2) Tabel `presensi_dosen`

Menyimpan transaksi presensi per dosen per pertemuan/schedule.

| Kolom                  | Tipe                 | Keterangan                                          |
| ---------------------- | -------------------- | --------------------------------------------------- |
| `id`                   | PK                   | Primary key presensi                                |
| `id_user_si`           | FK                   | Relasi ke `users_si.id_user_si` (dosen)             |
| `id_schedule`          | FK (nullable)        | Relasi ke `schedules.id_schedule`                   |
| `id_academic_period`   | FK                   | Relasi ke `academic_periods.id_academic_period`     |
| `id_setting`           | FK (nullable)        | Relasi ke `campus_settings.id_setting`              |
| `tanggal`              | date                 | Tanggal presensi                                    |
| `jam_masuk`            | time (nullable)      | Jam check-in                                        |
| `jam_keluar`           | time (nullable)      | Jam check-out                                       |
| `latitude`             | decimal (nullable)   | Koordinat lintang saat check-in                     |
| `longitude`            | decimal (nullable)   | Koordinat bujur saat check-in                       |
| `is_dalam_radius`      | boolean              | Hasil validasi radius kampus                        |
| `status`               | enum                 | `hadir`, `izin`, `sakit`, `alpha`                   |
| `keterangan`           | text (nullable)      | Catatan presensi                                    |
| `is_validated`         | boolean              | Status validasi manager                             |
| `id_manager_validator` | FK (nullable)        | Relasi ke `users_si.id_user_si` (manager validator) |
| `validated_at`         | timestamp (nullable) | Waktu validasi manager                              |

### 3) Tabel `rekap_presensi_dosen`

Menyimpan agregasi bulanan presensi dosen (dipakai modul payroll).

| Kolom                | Tipe     | Keterangan                                         |
| -------------------- | -------- | -------------------------------------------------- |
| `id`                 | PK       | Primary key rekap                                  |
| `id_user_si`         | FK       | Relasi ke `users_si.id_user_si`                    |
| `id_academic_period` | FK       | Relasi ke `academic_periods.id_academic_period`    |
| `bulan`              | tinyint  | Bulan rekap (1-12)                                 |
| `tahun`              | smallint | Tahun rekap                                        |
| `total_hadir`        | integer  | Total status hadir                                 |
| `total_izin`         | integer  | Total status izin                                  |
| `total_sakit`        | integer  | Total status sakit                                 |
| `total_alpha`        | integer  | Total status alpha                                 |
| `total_hari_kerja`   | integer  | Total pertemuan/schedule dosen pada bulan tersebut |

Constraint penting:

- Unique key: `rekap_dosen_bulan_tahun_unique` pada kombinasi (`id_user_si`, `bulan`, `tahun`).

### Ringkasan Relasi

- `presensi_dosen.id_user_si` -> `users_si.id_user_si` (many-to-one)
- `presensi_dosen.id_schedule` -> `schedules.id_schedule` (many-to-one, nullable)
- `presensi_dosen.id_academic_period` -> `academic_periods.id_academic_period` (many-to-one)
- `presensi_dosen.id_setting` -> `campus_settings.id_setting` (many-to-one, nullable)
- `presensi_dosen.id_manager_validator` -> `users_si.id_user_si` (many-to-one, nullable)
- `rekap_presensi_dosen.id_user_si` -> `users_si.id_user_si` (many-to-one)
- `rekap_presensi_dosen.id_academic_period` -> `academic_periods.id_academic_period` (many-to-one)

---

## Aturan Umum

| Aturan          | Keterangan                                                  |
| --------------- | ----------------------------------------------------------- |
| Role access     | Endpoint presensi khusus role `dosen`                       |
| Validasi GPS    | Check-in diterima jika lokasi ada dalam radius kampus aktif |
| Validasi input  | Input tidak valid mengembalikan `422`                       |
| Unauthenticated | Request tanpa token mengembalikan `401`                     |
| Forbidden       | Role tidak sesuai mengembalikan `403`                       |

---

## Ringkasan Endpoint

| Method | Endpoint                                          | Deskripsi                                     |
| ------ | ------------------------------------------------- | --------------------------------------------- |
| `GET`  | `/lecturer/attendance/classes`                    | Daftar mata kuliah/kelas yang diampu dosen    |
| `GET`  | `/lecturer/attendance/classes/{classId}/meetings` | Detail pertemuan (schedule) per kelas         |
| `POST` | `/lecturer/attendance/check-in`                   | Check-in presensi dosen berbasis GPS          |
| `GET`  | `/lecturer/attendance/recap`                      | Ambil daftar rekap presensi dosen login       |
| `POST` | `/lecturer/attendance/recap/generate`             | Generate rekap presensi bulanan               |
| `GET`  | `/lecturer/attendance/payroll-deduction`          | Hitung potongan gaji dari data rekap presensi |

---

## API Check-in Presensi

### Alur Pertemuan Kelas (Direkomendasikan)

1. Dosen ambil daftar kelas yang diampu melalui `GET /lecturer/attendance/classes`.
2. Dosen pilih kelas, lalu ambil daftar pertemuan melalui `GET /lecturer/attendance/classes/{classId}/meetings`.
3. Dosen melakukan check-in pada pertemuan terpilih dengan mengirim `id_schedule` ke endpoint check-in.

Dengan alur ini, presensi dosen terikat langsung ke pertemuan/schedule kelas.

### POST `/lecturer/attendance/check-in`

Endpoint untuk mencatat kehadiran dosen berdasarkan koordinat GPS.

**Akses**

- Role: `dosen`
- Header wajib: `Authorization: Bearer {{token}}`

**Aturan Validasi Kritis**

- `id_schedule` wajib dikirim.
- `id_schedule` harus milik kelas yang diajar dosen login.
- Periode akademik kelas pada schedule harus aktif.
- Tanggal schedule harus sama dengan tanggal hari ini.
- **Jam check-in harus berada dalam rentang `start_time` hingga `end_time` dari kelas.**
- Dosen tidak boleh check-in dua kali pada schedule/pertemuan yang sama.

**Headers**

```http
Authorization: Bearer {{token}}
Accept: application/json
Content-Type: application/json
```

**Request Body**

```json
{
    "latitude": -7.77127,
    "longitude": 110.377541,
    "id_schedule": 1
}
```

| Field         | Tipe    | Wajib | Keterangan                                  |
| ------------- | ------- | ----- | ------------------------------------------- |
| `latitude`    | number  | Ya    | Koordinat lintang                           |
| `longitude`   | number  | Ya    | Koordinat bujur                             |
| `id_schedule` | integer | Ya    | ID schedule/pertemuan kelas yang dipresensi |

**Contoh cURL**

```bash
curl --location --request POST '{{base_url}}/lecturer/attendance/check-in' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "latitude": -7.77127,
  "longitude": 110.377541,
  "id_schedule": 1
}'
```

**Response 201 (Created)**

```json
{
    "status": "success",
    "message": "Presensi berhasil dicatat.",
    "data": {
        "id": 42,
        "tanggal": "2026-03-06",
        "jam_masuk": "08:15:00",
        "status": "hadir",
        "keterangan": "Hadir",
        "is_dalam_radius": true,
        "distance_meter": 87.34,
        "nama_kampus": "Kampus Utama UGN Padangsidimpuan",
        "id_schedule": 1,
        "id_class": 1,
        "code_class": "A",
        "academic_period": "Semester Genap 2025/2026"
    }
}
```

**Catatan:** Kolom `keterangan` secara otomatis diisi dengan nilai `"Hadir"` dan tidak perlu dikirim dari request.

**Response 409 (Sudah check-in pada pertemuan ini)**

```json
{
    "status": "failed",
    "message": "Presensi untuk pertemuan ini sudah pernah dicatat.",
    "data": {
        "id_schedule": 1
    }
}
```

**Response 403 (Jadwal bukan milik dosen login)**

```json
{
    "status": "failed",
    "message": "Anda tidak mengajar pada jadwal/pertemuan yang dipilih."
}
```

**Response 422 (Tanggal schedule tidak sesuai hari ini)**

```json
{
    "status": "failed",
    "message": "Presensi hanya dapat dilakukan pada tanggal pertemuan yang dipilih.",
    "data": {
        "tanggal_schedule": "2026-03-06",
        "tanggal_hari_ini": "2026-03-05"
    }
}
```

**Response 422 (Jam check-in di luar jadwal kelas)**

```json
{
    "status": "failed",
    "message": "Presensi hanya dapat dilakukan dalam jam jadwal kelas.",
    "data": {
        "jam_mulai": "08:00:00",
        "jam_berakhir": "10:00:00",
        "jam_sekarang": "10:45:30"
    }
}
```

**Response 422 (Di luar radius kampus)**

```json
{
    "status": "failed",
    "message": "Presensi gagal. Anda berada di luar radius semua kampus yang terdaftar.",
    "data": {
        "is_dalam_radius": false
    }
}
```

### GET `/lecturer/attendance/classes`

Ambil daftar kelas yang diampu dosen beserta jumlah pertemuan pada setiap kelas.

**Contoh Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Daftar kelas untuk presensi berhasil diambil.",
    "data": [
        {
            "id_class": 1,
            "kode_matkul": "BD101",
            "nama_matkul": "Basis Data",
            "kelas": "A",
            "jumlah_pertemuan": 6,
            "academic_period_name": "Semester Genap 2025/2026"
        }
    ]
}
```

### GET `/lecturer/attendance/classes/{classId}/meetings`

Ambil detail daftar schedule/pertemuan dari kelas tertentu untuk dipakai sebelum check-in.

**Contoh Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Daftar pertemuan untuk check-in dosen berhasil diambil.",
    "data": {
        "class_info": {
            "id_class": 1,
            "code_class": "A",
            "name_subject": "Basis Data"
        },
        "check_in_endpoint": "/api/lecturer/attendance/check-in",
        "meetings": [
            {
                "id_schedule": 1,
                "pertemuan_ke": 1,
                "tanggal": "2026-03-06",
                "is_active": true
            },
            {
                "id_schedule": 2,
                "pertemuan_ke": 2,
                "tanggal": "2026-03-13",
                "is_active": false
            }
        ]
    }
}
```

**Response 422 (Validasi input)**

```json
{
    "message": "Koordinat lintang harus berupa angka.",
    "errors": {
        "latitude": ["Koordinat lintang harus berupa angka."],
        "longitude": [
            "Koordinat bujur tidak valid (harus antara -180 dan 180)."
        ]
    }
}
```

---

## API Rekap Kehadiran

### GET `/lecturer/attendance/recap`

Mengambil daftar rekap presensi milik dosen login.

**Query Parameters**

| Parameter | Tipe    | Wajib | Keterangan        |
| --------- | ------- | ----- | ----------------- |
| `bulan`   | integer | Tidak | Filter bulan 1-12 |
| `tahun`   | integer | Tidak | Filter tahun      |

**Contoh cURL**

```bash
curl --location --request GET '{{base_url}}/lecturer/attendance/recap?bulan=3&tahun=2026' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json'
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Rekap presensi berhasil diambil.",
    "data": [
        {
            "id": 7,
            "id_user_si": 5,
            "id_academic_period": 2,
            "bulan": 3,
            "tahun": 2026,
            "total_hadir": 18,
            "total_izin": 2,
            "total_sakit": 1,
            "total_alpha": 0,
            "total_hari_kerja": 21,
            "academic_period": {
                "id_academic_period": 2,
                "name": "Semester Genap 2025/2026",
                "is_active": true
            }
        }
    ]
}
```

### POST `/lecturer/attendance/recap/generate`

Generate rekap presensi pada bulan berjalan atau bulan tertentu.

**Headers**

```http
Authorization: Bearer {{token}}
Accept: application/json
Content-Type: application/json
```

**Request Body**

```json
{
    "bulan": 2,
    "tahun": 2026
}
```

**Contoh cURL**

```bash
curl --location --request POST '{{base_url}}/lecturer/attendance/recap/generate' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "bulan": 2,
  "tahun": 2026
}'
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Rekap presensi bulan 2/2026 berhasil digenerate.",
    "data": {
        "id": 6,
        "bulan": 2,
        "tahun": 2026,
        "total_hadir": 16,
        "total_izin": 1,
        "total_sakit": 0,
        "total_alpha": 1,
        "total_hari_kerja": 18
    }
}
```

**Response 422 (Validasi gagal)**

```json
{
    "message": "The bulan field must be between 1 and 12.",
    "errors": {
        "bulan": ["The bulan field must be between 1 and 12."]
    }
}
```

### GET `/lecturer/attendance/payroll-deduction`

Menghitung potongan gaji berdasarkan data rekap presensi. Endpoint ini dipakai oleh modul payroll.

**Query Parameters**

| Parameter | Tipe    | Wajib | Keterangan        |
| --------- | ------- | ----- | ----------------- |
| `bulan`   | integer | Ya    | Bulan 1-12        |
| `tahun`   | integer | Ya    | Tahun empat digit |

**Contoh cURL**

```bash
curl --location --request GET '{{base_url}}/lecturer/attendance/payroll-deduction?bulan=3&tahun=2026' \
--header 'Authorization: Bearer {{token}}' \
--header 'Accept: application/json'
```

**Response 200 (Success)**

```json
{
    "status": "success",
    "message": "Data potongan presensi bulan 3/2026 berhasil dihitung.",
    "data": {
        "id_user_si": 5,
        "bulan": 3,
        "tahun": 2026,
        "total_alpha": 2,
        "denda_per_hari": 100000,
        "total_potongan": 200000
    }
}
```

**Catatan**

- Rekap untuk bulan terkait harus sudah digenerate terlebih dahulu.
- Endpoint ini hanya membaca data rekap, tidak menulis data payroll.

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
