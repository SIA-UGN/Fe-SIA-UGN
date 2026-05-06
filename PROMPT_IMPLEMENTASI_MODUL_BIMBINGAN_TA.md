# PROMPT IMPLEMENTASI MODUL BIMBINGAN TUGAS AKHIR
## Fe-SIA-UGN — Next.js App Router

> Prompt ini dirancang untuk digunakan satu halaman per sesi AI.
> Paste seluruh bagian "KONTEKS GLOBAL" di setiap sesi, lalu tambahkan bagian halaman spesifik yang ingin diimplementasikan.

---

## ═══════════════════════════════════════
## BAGIAN A — KONTEKS GLOBAL (PASTE DI SETIAP SESI)
## ═══════════════════════════════════════

### A1. TECH STACK & STRUKTUR PROYEK

Proyek ini adalah Next.js 14 App Router, TypeScript + JSX campuran, Tailwind CSS, shadcn/ui.
- API calls menggunakan axios instance dari `@/lib/axios` (sudah ada interceptor token otomatis)
- Semua API modul TA ada di `src/features/bimbingan-ta/api/`
- Semua tipe TypeScript ada di `src/features/bimbingan-ta/types.ts`
- Utility functions ada di `src/features/bimbingan-ta/utils.ts`
- Komponen reusable thesis ada di `src/features/bimbingan-ta/components/`

### A2. STRUKTUR FOLDER AKTIF MODUL INI

```
src/
├── app/
│   ├── bimbingan-ta/
│   │   ├── page.tsx                          ← root redirect by role
│   │   ├── mahasiswa/
│   │   │   ├── page.tsx                      ← dashboard mahasiswa ✅ SUDAH ADA
│   │   │   ├── pengajuan/page.tsx            ← kelola pengajuan TA
│   │   │   ├── topik/
│   │   │   │   ├── page.tsx                  ← galeri topik dosen
│   │   │   │   └── [id]/page.tsx             ← detail topik
│   │   │   ├── monitoring/page.tsx           ← monitoring konsultasi
│   │   │   └── kategori/page.tsx             ← daftar kategori (readonly)
│   │   ├── dosen/
│   │   │   ├── page.tsx                      ← dashboard dosen ✅ SUDAH ADA
│   │   │   ├── topik/
│   │   │   │   ├── page.tsx                  ← list topik milik dosen
│   │   │   │   ├── tambah/page.tsx           ← form buat topik baru
│   │   │   │   ├── [id]/page.tsx             ← detail topik
│   │   │   │   └── [id]/edit/page.tsx        ← form edit topik
│   │   │   ├── kategori/page.tsx             ← kelola kategori
│   │   │   ├── permintaan/
│   │   │   │   ├── page.tsx                  ← list permintaan masuk
│   │   │   │   └── [id]/page.tsx             ← detail & approve/reject
│   │   │   ├── bimbingan/page.tsx            ← list mahasiswa bimbingan
│   │   │   └── konsultasi/
│   │   │       ├── tambah/page.tsx           ← form tambah konsultasi
│   │   │       └── [id]/edit/page.tsx        ← form edit konsultasi
│   │   └── admin — JANGAN BUAT DI SINI, lihat di bawah
│   └── admin/
│       └── bimbingan/
│           ├── page.jsx                      ← dashboard admin ✅ SUDAH ADA
│           ├── kelola-data-user/page.jsx     ← tabel mahasiswa + dosen
│           ├── monitoring-pengajuan/
│           │   ├── page.jsx                  ← semua pengajuan TA
│           │   └── [id]/page.jsx             ← detail pengajuan + timeline
│           └── semua-pengajuan/page.jsx      ← view alternatif semua pengajuan
│
├── features/
│   └── bimbingan-ta/
│       ├── api/
│       │   ├── student.ts     ✅ SUDAH ADA — JANGAN UBAH
│       │   ├── lecturer.ts    ✅ SUDAH ADA — JANGAN UBAH
│       │   ├── admin.ts       ✅ SUDAH ADA — JANGAN UBAH
│       │   └── common.ts      ✅ SUDAH ADA — JANGAN UBAH
│       ├── components/        ✅ KOMPONEN SUDAH ADA — GUNAKAN YANG ADA
│       ├── types.ts           ✅ SUDAH ADA — JANGAN UBAH
│       └── utils.ts           ✅ SUDAH ADA — JANGAN UBAH
```

> ⚠️ CATATAN PENTING: Folder `src/app/bimbingan/` adalah FOLDER LAMA yang sudah tidak aktif.
> Semua halaman baru HARUS dibuat di `src/app/bimbingan-ta/` (mahasiswa/dosen)
> atau `src/app/admin/bimbingan/` (admin). Jangan buat di `src/app/bimbingan/`.

### A3. API FUNCTIONS YANG TERSEDIA

#### Student API (`studentThesisApi` dari `@/features/bimbingan-ta/api/student`)
```typescript
studentThesisApi.getCurrentThesis()                        // GET /student/thesis
studentThesisApi.createThesis(payload)                     // POST /student/thesis — multipart/form-data
studentThesisApi.updateThesis(id, payload)                 // PUT /student/thesis/{id} — multipart/form-data
studentThesisApi.deleteThesis(id)                          // DELETE /student/thesis/{id}
studentThesisApi.getLecturers()                            // GET /student/thesis/lecturers
studentThesisApi.requestLecturer(thesisId, payload)        // POST /student/thesis/{id}/request-lecturer — JSON
studentThesisApi.getRequests()                             // GET /student/thesis/requests
studentThesisApi.getTopics(myProgram?)                     // GET /student/thesis/topics
studentThesisApi.getTopicDetail(id)                        // GET /student/thesis/topics/{id}
studentThesisApi.selectTopic(topicId, payload)             // POST /student/thesis/topics/{id}/select — multipart
studentThesisApi.getSupervisors()                          // GET /student/thesis/supervisors
studentThesisApi.getConsultations(status?)                 // GET /student/thesis/consultations
studentThesisApi.getCategories()                           // GET /student/thesis/categories
```

#### Lecturer API (`lecturerThesisApi` dari `@/features/bimbingan-ta/api/lecturer`)
```typescript
lecturerThesisApi.getTopics()                              // GET /lecturer/thesis/topics
lecturerThesisApi.createTopic(payload)                     // POST /lecturer/thesis/topics — JSON
lecturerThesisApi.getTopicDetail(id)                       // GET /lecturer/thesis/topics/{id}
lecturerThesisApi.updateTopic(id, payload)                 // PUT /lecturer/thesis/topics/{id} — JSON
lecturerThesisApi.deleteTopic(id)                          // DELETE /lecturer/thesis/topics/{id}
lecturerThesisApi.publishTopic(id)                         // PATCH /lecturer/thesis/topics/{id}/publish
lecturerThesisApi.archiveTopic(id)                         // PATCH /lecturer/thesis/topics/{id}/archive
lecturerThesisApi.getRequests(status?)                     // GET /lecturer/thesis/requests
lecturerThesisApi.getRequestDetail(id)                     // GET /lecturer/thesis/requests/{id}
lecturerThesisApi.approveRequest(id)                       // PATCH /lecturer/thesis/requests/{id}/approve
lecturerThesisApi.rejectRequest(id, rejectionNote)         // PATCH /lecturer/thesis/requests/{id}/reject
lecturerThesisApi.getSupervisees()                         // GET /lecturer/thesis/supervisees
lecturerThesisApi.getConsultations(params?)                // GET /lecturer/thesis/consultations
lecturerThesisApi.createConsultation(payload)              // POST /lecturer/thesis/consultations — multipart
lecturerThesisApi.getConsultationDetail(id)                // GET /lecturer/thesis/consultations/{id}
lecturerThesisApi.updateConsultation(id, payload)          // PUT /lecturer/thesis/consultations/{id} — multipart
lecturerThesisApi.getCategories()                          // GET /lecturer/thesis/categories
lecturerThesisApi.createCategory(payload)                  // POST /lecturer/thesis/categories — JSON
lecturerThesisApi.getCategoryDetail(id)                    // GET /lecturer/thesis/categories/{id}
lecturerThesisApi.updateCategory(id, payload)              // PUT /lecturer/thesis/categories/{id} — JSON
lecturerThesisApi.deleteCategory(id)                       // DELETE /lecturer/thesis/categories/{id}
lecturerThesisApi.resolveProgramOptions()                  // helper: dapat opsi program studi
```

#### Admin API (`adminThesisApi` dari `@/features/bimbingan-ta/api/admin`)
```typescript
adminThesisApi.getDashboard()                              // GET /admin/thesis/dashboard
adminThesisApi.getStudents(params?)                        // GET /admin/thesis/students — paginated
adminThesisApi.getStudentDetail(id)                        // GET /admin/thesis/students/{id}
adminThesisApi.getSupervisors(params?)                     // GET /admin/thesis/supervisors
adminThesisApi.getConsultations(params?)                   // GET /admin/thesis/consultations — paginated
adminThesisApi.getTopics(params?)                          // GET /admin/thesis/topics
```

### A4. TIPE DATA UTAMA (dari `@/features/bimbingan-ta/types`)

```typescript
// Status Enums
type StudentThesisStatus = 'proposing' | 'on_progress' | 'revision' | 'finished'
type ThesisTopicStatus = 'draft' | 'available' | 'taken' | 'archived'
type ThesisRequestStatus = 'pending' | 'accepted' | 'rejected'
type ConsultationStatus = 'on_going' | 'finished'

// Entity Types
interface StudentThesis {
  id_student_thesis: number; id_student?: number|null; id_program?: number|null;
  id_thesis_topic?: number|null; topic?: string|null; title_ind: string;
  title_eng?: string|null; status: StudentThesisStatus; description?: string|null;
  attachment_proposal?: string|null; created_at?: string; updated_at?: string;
  student?: BasicStudent|null; program?: ProgramOption|null;
  thesis_topic?: ThesisTopic|null; thesis_lecturers?: StudentThesisRequest[];
  supervisors?: ThesisSupervisor[];
}
interface ThesisTopic {
  id_thesis_topic: number; topic?: string|null; title_ind: string; title_eng?: string|null;
  status: ThesisTopicStatus; description?: string|null; quota?: number|null;
  id_thesis_category?: number|null; lecturer?: BasicLecturer|null;
  program?: ProgramOption|null; thesis_category?: Pick<ThesisCategory,...>|null;
  student_theses?: Array<{id_student_thesis:number; status:string; student?:BasicStudent|null}>;
}
interface StudentThesisRequest {
  id_thesis_lecturer: number; id_student_thesis: number; id_lecturer: number;
  status: ThesisRequestStatus; student_note?: string|null; rejection_note?: string|null;
  lecturer?: BasicLecturer|null; student_thesis?: StudentThesis|null;
}
interface ThesisSupervisor {
  id_supervisor: number; id_student_thesis: number; id_lecturer: number;
  lecturer?: BasicLecturer|null; student_thesis?: StudentThesis|null;
  consultations?: Consultation[];
}
interface Consultation {
  id_consultation: number; id_supervisor: number; consultation_date: string;
  start_time?: string|null; end_time?: string|null; location?: string|null;
  subject: string; student_notes?: string|null; lecturer_notes?: string|null;
  attachment?: string|null; next_task?: string|null; progress?: number|null;
  status: ConsultationStatus; supervisor?: ThesisSupervisor|null;
}
interface ThesisCategory { id_thesis_category: number; name: string; description?: string|null }
interface ThesisDashboardStats {
  thesis_by_status: Record<StudentThesisStatus, number>; total_thesis: number;
  topics_by_status: Record<ThesisTopicStatus, number>; total_topics: number;
  total_supervisors: number; consultations_by_status: Record<string,number>; total_consultations: number;
}
interface PaginatedResponse<T> { current_page: number; data: T[]; per_page: number; total: number; last_page?: number }
```

### A5. KOMPONEN REUSABLE YANG SUDAH ADA (GUNAKAN INI, JANGAN BUAT BARU)

```typescript
// Shell & Layout
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell'
// Props: title, description, actions?, children

// Cards & Display
import ThesisSummaryCard from '@/features/bimbingan-ta/components/ThesisSummaryCard'
// Props: title, value?, subtitle?, children?

import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard'
// Props: title, description?, actions?, children

import ThesisKeyValueList from '@/features/bimbingan-ta/components/ThesisKeyValueList'
// Props: items: Array<{label: string, value: string}>

import ThesisAttachmentLink from '@/features/bimbingan-ta/components/ThesisAttachmentLink'
// Props: path?: string|null, label?: string

import ThesisEmptyState from '@/features/bimbingan-ta/components/ThesisEmptyState'
// Props: title, description, action?: ReactNode

// Status & Progress
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge'
// Props: status: string

import ThesisQuotaMeter from '@/features/bimbingan-ta/components/ThesisQuotaMeter'
// Props: label, value, max, helperText?

// Loading & Error
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock'
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box'
// Props untuk ErrorMessageBoxWithButton: message: string, action: () => void

// Pagination
import ThesisServerPagination from '@/features/bimbingan-ta/components/ThesisServerPagination'
// Props: currentPage, totalPages, onPageChange

// Admin Shell
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell'
// Props: backHref, backLabel, title, description, children
import StatBanner from '@/components/admin/stat-banner'
import SummaryCard from '@/components/admin/summary-card'
import StatusBadge from '@/components/admin/status-badge'
```

### A6. UTILITY FUNCTIONS (dari `@/features/bimbingan-ta/utils`)

```typescript
import {
  getStatusLabel,         // string → label bahasa Indonesia
  getStatusTone,          // string → 'amber'|'green'|'red'|'slate'|'blue'
  formatDate,             // ISO string → 'DD MMMM YYYY' locale ID
  formatDateTime,         // ISO string → 'DD MMM YYYY, HH:mm' locale ID
  formatTime,             // 'HH:mm:ss' → 'HH:mm'
  buildThesisAssetUrl,    // storage path → full URL
  sortByNewest,           // array by updated_at/created_at DESC
  countActiveRequests,    // hitung status pending/accepted
  getThesisHomePath,      // role → home path string
  getCurrentRole,         // → cookie 'roles' value
} from '@/features/bimbingan-ta/utils'
```

### A7. ATURAN BISNIS KRITIS YANG HARUS DITERAPKAN DI UI

1. **Kuota request mahasiswa**: max 4 permintaan aktif (pending + accepted). `rejected` tidak dihitung.
2. **Kuota pembimbing**: max 2 dosen yang approve (dari `supervisors.length`). Dosen ke-3 tidak bisa approve.
3. **Edit TA**: hanya bisa ketika `status === 'proposing'`. Tampilkan disabled/pesan jika sudah `on_progress`.
4. **Edit topik dosen**: hanya bisa ketika `status === 'draft'`. Publish hanya dari `draft`. Archive dari `available`/`taken`.
5. **Delete topik**: hanya dari `status === 'draft'`.
6. **Mahasiswa dengan TA aktif**: tidak bisa lagi POST `/student/thesis` baru atau selectTopic.
7. **selectTopic**: mahasiswa yang sudah punya TA tidak bisa. Dihitung sebagai 1 dari 4 kuota.
8. **Approve request**: backend return 422 jika sudah 2 supervisor. Tangkap error ini dan tampilkan pesan.

### A8. POLA ERROR HANDLING STANDAR

```typescript
// Pattern yang sudah ada di project (gunakan ini konsisten)
try {
  setIsLoading(true);
  setError(null);
  const data = await someApi.method();
  setState(data);
} catch (err: any) {
  setError(err?.userMessage || err?.message || 'Gagal memuat data.');
} finally {
  setIsLoading(false);
}

// Render error:
{error && <ErrorMessageBoxWithButton message={error} action={fetchData} />}

// Render loading:
{isLoading && <ThesisLoadingBlock />}
```

### A9. KONVENSI KOMPONEN HALAMAN

```typescript
'use client';
// Semua halaman gunakan 'use client' karena ada state/useEffect

// Import order: react hooks → next → UI components → features → types

// Semua page di bimbingan-ta menggunakan StudentThesisShell sebagai wrapper

// Semua page di admin/bimbingan menggunakan AdminBimbinganShell sebagai wrapper
```

---

## ═══════════════════════════════════════
## BAGIAN B — IMPLEMENTASI PER HALAMAN
## ═══════════════════════════════════════

---

## B1. HALAMAN: `/bimbingan-ta/mahasiswa/pengajuan/page.tsx`
### Kelola Pengajuan TA Mahasiswa

**Path file:** `src/app/bimbingan-ta/mahasiswa/pengajuan/page.tsx`

**Deskripsi:** Halaman utama untuk mahasiswa mengelola satu pengajuan TA aktifnya. Menampilkan:
- Jika belum ada TA → form buat TA mandiri + tombol ke galeri topik dosen
- Jika sudah ada TA → detail TA + list request pembimbing + form request pembimbing baru

**API yang digunakan:**
- `studentThesisApi.getCurrentThesis()` → ambil TA aktif
- `studentThesisApi.getRequests()` → riwayat permintaan pembimbing
- `studentThesisApi.getLecturers()` → list dosen untuk dropdown request
- `studentThesisApi.createThesis(payload)` → buat TA mandiri
- `studentThesisApi.updateThesis(id, payload)` → edit TA (hanya jika status proposing)
- `studentThesisApi.deleteThesis(id)` → hapus TA (dengan konfirmasi dialog)
- `studentThesisApi.requestLecturer(thesisId, payload)` → kirim permintaan ke dosen

**Payload createThesis / updateThesis:**
```typescript
// StudentThesisPayload — dikirim sebagai multipart/form-data (sudah dihandle buildFormData)
{
  title_ind: string;      // required
  title_eng: string;      // required
  topic?: string;         // opsional
  description: string;    // required
  attachment_proposal?: File | null;  // opsional, PDF/DOC/DOCX max 10MB
}
```

**Payload requestLecturer:**
```typescript
// LecturerRequestPayload — dikirim sebagai JSON
{
  id_lecturer: number;    // required, dari dropdown getLecturers()
  student_note?: string;  // opsional, max 1000 char
}
```

**Logika UI yang harus diimplementasikan:**
1. **Tidak ada TA** (`thesis === null`):
   - Tampilkan `ThesisEmptyState` dengan judul "Belum ada pengajuan TA"
   - Tombol "Buat Pengajuan Mandiri" → expand form inline atau modal
   - Tombol `<Link href="/bimbingan-ta/mahasiswa/topik">` "Pilih dari Topik Dosen"
   - Form buat TA: input title_ind, title_eng, topic (opsional), description (textarea), attachment_proposal (file input)

2. **Ada TA** (`thesis !== null`):
   - Section detail TA: tampilkan `ThesisKeyValueList` dengan semua field
   - `ThesisStatusBadge` untuk status
   - `ThesisAttachmentLink` untuk proposal
   - Edit button: hanya tampil jika `thesis.status === 'proposing'`. Jika status lain, tampilkan tooltip/note "Tidak dapat diedit setelah dosen menyetujui"
   - Hapus button: tampilkan dengan alert-dialog konfirmasi. Setelah hapus, refresh state (thesis → null)

3. **Section Permintaan Pembimbing** (di bawah detail TA):
   - Tampilkan list `thesis_lecturers` dengan status badge masing-masing
   - Jika ada `rejection_note`, tampilkan dengan teks merah/amber
   - `ThesisQuotaMeter`: `countActiveRequests(requests.map(r => r.status))` / 4
   - Tombol "Ajukan Pembimbing Baru":
     - Disabled jika: activeRequests >= 4 ATAU thesis.status !== 'proposing'
     - Klik → expand form: dropdown pilih dosen (dari `getLecturers()`), textarea student_note
     - Setelah submit berhasil: refresh `getRequests()` dan update quota meter

**Error states:**
- 422 "Anda sudah memiliki pengajuan tugas akhir." → tampilkan sebagai info, refresh data
- 422 "Melebihi batas maksimal permintaan aktif" → tampilkan di bawah form request
- 422 duplikasi ke dosen yang sama → tampilkan pesan spesifik

**Contoh kode skeleton:**
```typescript
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import { formatDate, countActiveRequests } from '@/features/bimbingan-ta/utils';
import type { StudentThesis, StudentThesisRequest, ThesisLecturer } from '@/features/bimbingan-ta/types';
// ... import komponen lainnya

export default function PengajuanTAPage() {
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [requests, setRequests] = useState<StudentThesisRequest[]>([]);
  const [lecturers, setLecturers] = useState<ThesisLecturer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // showCreateForm state, showRequestForm state, isSubmitting state, formError state
  
  const fetchData = useCallback(async () => {
    // fetch getCurrentThesis, getRequests, getLecturers sekaligus
  }, []);
  
  useEffect(() => { fetchData(); }, [fetchData]);
  
  const handleCreateThesis = async (formData: StudentThesisPayload) => { /* ... */ };
  const handleEditThesis = async (formData: Partial<StudentThesisPayload>) => { /* ... */ };
  const handleDeleteThesis = async () => { /* konfirmasi dulu */ };
  const handleRequestLecturer = async (data: LecturerRequestPayload) => { /* ... */ };
  
  // Render dengan StudentThesisShell
}
```

---

## B2. HALAMAN: `/bimbingan-ta/mahasiswa/topik/page.tsx`
### Galeri Topik TA dari Dosen

**Path file:** `src/app/bimbingan-ta/mahasiswa/topik/page.tsx`

**Deskripsi:** Galeri topik TA yang dipublikasikan dosen. Mahasiswa bisa browse dan filter topik, lalu klik untuk melihat detail.

**API yang digunakan:**
- `studentThesisApi.getTopics(myProgram?)` → list topik (default: hanya program sendiri)
- `studentThesisApi.getCategories()` → untuk filter kategori
- `studentThesisApi.getCurrentThesis()` → cek apakah mahasiswa sudah punya TA (untuk disable tombol pilih)

**Logika UI:**
1. Grid card topik dengan info: title_ind, title_eng, nama dosen, kategori, quota visual
2. Filter: dropdown kategori, toggle "Semua Program" vs "Program Saya"
3. Badge status: hanya tampil `available` di galeri ini (backend otomatis filter)
4. `ThesisQuotaMeter` kecil di setiap card: jumlah mahasiswa yang sudah pilih / quota
5. Klik card → navigasi ke `/bimbingan-ta/mahasiswa/topik/[id]`
6. Jika mahasiswa sudah punya TA (`thesis !== null`): tampilkan banner info "Anda sudah memiliki TA aktif. Tidak dapat memilih topik baru."
7. Empty state jika tidak ada topik

**Card topik harus menampilkan:**
- `topic.title_ind` (judul utama)
- `topic.title_eng` (subtitle, italic, truncate)
- `topic.lecturer?.name`
- `topic.thesis_category?.name` → badge kategori
- Quota: `topic.student_theses?.length || 0` dari `topic.quota`
- Status badge (available/taken)
- Tombol "Lihat Detail" → Link ke `[id]`

---

## B3. HALAMAN: `/bimbingan-ta/mahasiswa/topik/[id]/page.tsx`
### Detail Topik TA + Form Pilih Topik

**Path file:** `src/app/bimbingan-ta/mahasiswa/topik/[id]/page.tsx`

**Deskripsi:** Detail lengkap satu topik TA dosen. Jika `status === 'available'` dan mahasiswa belum punya TA, tampilkan tombol "Pilih Topik Ini".

**API yang digunakan:**
- `studentThesisApi.getTopicDetail(id)` → detail topik
- `studentThesisApi.getCurrentThesis()` → cek apakah sudah punya TA
- `studentThesisApi.selectTopic(topicId, payload)` → pilih topik (trigger saat submit form)

**Payload selectTopic:**
```typescript
// TopicSelectionPayload — dikirim sebagai multipart/form-data
{
  student_note?: string;           // opsional, pesan ke dosen
  attachment_proposal?: File|null; // opsional, proposal awal PDF/DOC max 10MB
}
```

**Logika UI:**
1. Tampilkan detail lengkap topik dengan `ThesisKeyValueList`:
   - Judul (IND & ENG)
   - Bidang penelitian (`topic.topic`)
   - Dosen pengampu
   - Program studi
   - Kategori
   - Kuota & slot tersisa (`ThesisQuotaMeter`)
   - Deskripsi lengkap
2. List `student_theses` yang sudah memilih (hanya nama + status, tanpa detail sensitif)
3. Tombol "Pilih Topik Ini":
   - **Tampil** jika: `topic.status === 'available'` AND `thesis === null`
   - **Disabled dengan tooltip** jika: `topic.status === 'taken'` ("Kuota penuh")
   - **Disabled dengan banner** jika: `thesis !== null` ("Anda sudah memiliki pengajuan TA aktif")
4. Saat klik "Pilih Topik Ini" → modal/section muncul dengan:
   - Info: "Dengan memilih topik ini, permintaan bimbingan ke [nama dosen] akan terkirim otomatis"
   - Textarea `student_note` (opsional)
   - File input `attachment_proposal` (opsional)
   - Tombol "Konfirmasi Pilih" → call `selectTopic()`
5. Setelah berhasil → redirect ke `/bimbingan-ta/mahasiswa/pengajuan` dengan pesan sukses

**Error yang mungkin:**
- 422 "Anda sudah memiliki pengajuan tugas akhir." → banner error + disable tombol
- 422 kuota penuh → refresh data topik

---

## B4. HALAMAN: `/bimbingan-ta/mahasiswa/monitoring/page.tsx`
### Monitoring Bimbingan TA Mahasiswa

**Path file:** `src/app/bimbingan-ta/mahasiswa/monitoring/page.tsx`

**Deskripsi:** Halaman monitoring seluruh progress bimbingan, dosen pembimbing, dan riwayat konsultasi.

**API yang digunakan:**
- `studentThesisApi.getCurrentThesis()` → info TA + status
- `studentThesisApi.getSupervisors()` → daftar dosen pembimbing + konsultasi
- `studentThesisApi.getConsultations(status?)` → semua riwayat konsultasi

**Logika UI:**
1. **Guard**: jika `thesis === null` atau `thesis.status === 'proposing'` → tampilkan `ThesisEmptyState` dengan pesan "Monitoring tersedia setelah pembimbing menyetujui bimbingan Anda." dan tombol kembali ke pengajuan
2. **Summary bar**: status TA saat ini, jumlah pembimbing, total konsultasi, progress rata-rata
3. **Section per dosen pembimbing** (dari `getSupervisors()`):
   - Nama dosen, email
   - List konsultasi milik supervisor tersebut
   - Setiap konsultasi card: tanggal, subject, start_time-end_time, lokasi, status badge, progress bar (0-100), lecturer_notes, next_task, attachment link
4. **Filter konsultasi**: tab "Semua" / "Berjalan" / "Selesai" → gunakan `getConsultations(status)`
5. **Progress visualisasi**: rata-rata `progress` dari semua konsultasi finished → tampilkan sebagai `ThesisQuotaMeter` atau progress bar sederhana

**Tampilan tiap konsultasi:**
```
┌─────────────────────────────────────────┐
│ [Subject]                    [StatusBadge] │
│ 📅 15 Maret 2026  🕐 09:00 - 10:00         │
│ 📍 Ruang Dosen Lt. 3                       │
│ Progress: ████████░░ 80%                   │
│                                            │
│ Catatan Dosen: [lecturer_notes]            │
│ Tugas Selanjutnya: [next_task]             │
│ [Lampiran jika ada]                        │
└─────────────────────────────────────────┘
```

---

## B5. HALAMAN: `/bimbingan-ta/mahasiswa/kategori/page.tsx`
### Daftar Kategori TA (Readonly untuk Mahasiswa)

**Path file:** `src/app/bimbingan-ta/mahasiswa/kategori/page.tsx`

**Deskripsi:** Halaman informasi daftar kategori thesis. Read-only untuk mahasiswa.

**API yang digunakan:**
- `studentThesisApi.getCategories()` → list kategori

**Logika UI:**
1. Grid/list kategori: nama, deskripsi
2. Klik kategori → bisa filter galeri topik (opsional: `<Link href={/bimbingan-ta/mahasiswa/topik?category=${id}}>`)
3. Simple, tidak ada aksi CRUD

---

## B6. HALAMAN: `/bimbingan-ta/dosen/topik/page.tsx`
### List Topik TA Dosen

**Path file:** `src/app/bimbingan-ta/dosen/topik/page.tsx`

**Deskripsi:** Halaman list semua topik TA milik dosen yang sedang login. CRUD lengkap.

**API yang digunakan:**
- `lecturerThesisApi.getTopics()` → list semua topik milik dosen
- `lecturerThesisApi.publishTopic(id)` → publish topik
- `lecturerThesisApi.archiveTopic(id)` → archive topik
- `lecturerThesisApi.deleteTopic(id)` → hapus topik (hanya draft)

**Logika UI:**
1. Filter topik by status: tab atau dropdown (draft / available / taken / archived)
2. Tiap topik card/row menampilkan: title_ind, program, kategori, quota, status badge, jumlah peminat
3. **Action buttons per topik berdasarkan status:**
   - `draft`: Edit (→ `[id]/edit`), Publish, Hapus
   - `available`: Lihat Detail (→ `[id]`), Archive
   - `taken`: Lihat Detail, Archive
   - `archived`: Lihat Detail (tidak bisa aksi lain)
4. Tombol "Tambah Topik Baru" → navigasi ke `/bimbingan-ta/dosen/topik/tambah`
5. Konfirmasi dialog sebelum publish, archive, dan hapus
6. Setelah aksi berhasil → refresh list

**Perhatian:**
- Publish hanya dari `draft` → jika user coba publish dari status lain, backend return 422, tangkap dan tampilkan pesan
- Archive dari `available` atau `taken`
- Delete hanya dari `draft`

---

## B7. HALAMAN: `/bimbingan-ta/dosen/topik/tambah/page.tsx`
### Form Buat Topik TA Baru

**Path file:** `src/app/bimbingan-ta/dosen/topik/tambah/page.tsx`

**Deskripsi:** Form untuk dosen membuat topik TA baru. Status awal otomatis `draft`.

**API yang digunakan:**
- `lecturerThesisApi.createTopic(payload)` → buat topik (JSON, bukan multipart)
- `lecturerThesisApi.resolveProgramOptions()` → dapatkan opsi program studi
- `lecturerThesisApi.getCategories()` → untuk dropdown kategori

**Payload `LecturerTopicPayload`:**
```typescript
{
  topic: string;              // required, bidang penelitian
  title_ind: string;          // required
  title_eng: string;          // required
  description: string;        // required, textarea
  quota?: number;             // opsional, default 1, min 1
  id_program: number;         // required, dari resolveProgramOptions()
  id_thesis_category?: number|null;  // opsional, dari getCategories()
}
```

**Logika UI:**
1. Form dengan semua field di atas
2. `id_program`: jika `resolveProgramOptions()` return hanya 1 opsi → set otomatis dan hidden. Jika > 1 → dropdown
3. `id_thesis_category`: dropdown dari `getCategories()`, opsional + ada opsi "Tanpa Kategori"
4. `quota`: number input, min 1, default 1
5. Submit → call `createTopic()` → redirect ke `/bimbingan-ta/dosen/topik` dengan pesan sukses
6. Cancel → back ke list topik

---

## B8. HALAMAN: `/bimbingan-ta/dosen/topik/[id]/page.tsx`
### Detail Topik TA Dosen

**Path file:** `src/app/bimbingan-ta/dosen/topik/[id]/page.tsx`

**Deskripsi:** Detail topik + list mahasiswa yang sudah memilih.

**API yang digunakan:**
- `lecturerThesisApi.getTopicDetail(id)` → detail + `student_theses`

**Logika UI:**
1. Detail lengkap topik dengan `ThesisKeyValueList`
2. Status dan action buttons (sesuai logika B6)
3. Section "Mahasiswa yang Memilih Topik Ini":
   - List dari `topic.student_theses`
   - Tiap item: nama mahasiswa, status TA (`ThesisStatusBadge`), link ke permintaan jika ada
4. `ThesisQuotaMeter`: jumlah peminat / quota
5. Tombol "Edit" hanya jika `status === 'draft'` → navigasi ke `[id]/edit`

---

## B9. HALAMAN: `/bimbingan-ta/dosen/topik/[id]/edit/page.tsx`
### Form Edit Topik TA

**Path file:** `src/app/bimbingan-ta/dosen/topik/[id]/edit/page.tsx`

**Deskripsi:** Form edit topik. Hanya bisa diakses jika topik masih `draft`.

**API yang digunakan:**
- `lecturerThesisApi.getTopicDetail(id)` → pre-fill form
- `lecturerThesisApi.updateTopic(id, payload)` → update
- `lecturerThesisApi.resolveProgramOptions()` → opsi program
- `lecturerThesisApi.getCategories()` → opsi kategori

**Logika UI:**
1. Saat load: fetch detail topik → pre-fill semua field
2. Guard: jika `topic.status !== 'draft'` → tampilkan error/redirect "Topik yang sudah dipublikasikan tidak dapat diubah."
3. Form identik dengan form tambah (B7), tapi pre-filled
4. Submit → `updateTopic()` → redirect ke `/bimbingan-ta/dosen/topik/[id]`
5. Cancel → back ke detail topik

---

## B10. HALAMAN: `/bimbingan-ta/dosen/kategori/page.tsx`
### Kelola Kategori Thesis (Dosen)

**Path file:** `src/app/bimbingan-ta/dosen/kategori/page.tsx`

**Deskripsi:** CRUD kategori thesis untuk dosen.

**API yang digunakan:**
- `lecturerThesisApi.getCategories()` → list
- `lecturerThesisApi.createCategory({name, description?})` → buat baru (JSON)
- `lecturerThesisApi.updateCategory(id, {name?, description?})` → update (JSON)
- `lecturerThesisApi.deleteCategory(id)` → hapus

**Logika UI:**
1. List kategori dengan nama dan deskripsi
2. Tombol "Tambah Kategori" → inline form atau modal (mirip screenshot yang diberikan user di awal)
3. Tiap kategori: tombol Edit (inline form atau modal) dan Hapus (dengan konfirmasi)
4. Modal tambah/edit: input `name` (required), textarea `description` (opsional)
5. Setelah aksi berhasil → refresh list

---

## B11. HALAMAN: `/bimbingan-ta/dosen/permintaan/page.tsx`
### List Permintaan Bimbingan Masuk (Dosen)

**Path file:** `src/app/bimbingan-ta/dosen/permintaan/page.tsx`

**Deskripsi:** Semua permintaan bimbingan dari mahasiswa. Dosen bisa filter dan navigate ke detail.

**API yang digunakan:**
- `lecturerThesisApi.getRequests(status?)` → list semua, bisa filter by status

**Logika UI:**
1. Filter tab: "Semua" / "Menunggu" / "Disetujui" / "Ditolak"
2. Tiap item request menampilkan:
   - Nama mahasiswa (`request.student_thesis?.student?.name`)
   - Judul TA (`request.student_thesis?.title_ind`)
   - Program studi (`request.student_thesis?.program?.name`)
   - Status badge (`ThesisStatusBadge`)
   - `student_note` jika ada (truncated)
   - Tanggal pengajuan
3. Klik item → navigasi ke `/bimbingan-ta/dosen/permintaan/[id]`
4. Empty state per tab

---

## B12. HALAMAN: `/bimbingan-ta/dosen/permintaan/[id]/page.tsx`
### Detail Permintaan Bimbingan + Approve/Reject

**Path file:** `src/app/bimbingan-ta/dosen/permintaan/[id]/page.tsx`

**Deskripsi:** Detail satu permintaan bimbingan dengan aksi approve atau reject.

**API yang digunakan:**
- `lecturerThesisApi.getRequestDetail(id)` → detail permintaan
- `lecturerThesisApi.approveRequest(id)` → setujui
- `lecturerThesisApi.rejectRequest(id, rejectionNote)` → tolak

**Logika UI:**
1. Detail permintaan: nama mahasiswa, judul TA (IND & ENG), deskripsi TA, attachment_proposal link, student_note, program studi, tanggal pengajuan
2. Status badge saat ini
3. Jika `status === 'pending'`:
   - Tombol "Setujui Bimbingan" → konfirmasi → `approveRequest()`
   - Tombol "Tolak" → modal dengan textarea `rejection_note` (required) → `rejectRequest()`
4. Jika `status !== 'pending'`: tampilkan informasi hasil, tidak ada action button
5. Jika status `rejected`: tampilkan `rejection_note`
6. **Error 422 kuota pembimbing penuh** (saat approve): tampilkan pesan "Mahasiswa ini sudah memiliki 2 dosen pembimbing yang menyetujui."
7. Setelah approve/reject berhasil: update state lokal + tampilkan success message

---

## B13. HALAMAN: `/bimbingan-ta/dosen/bimbingan/page.tsx`
### Monitoring Mahasiswa Bimbingan (Dosen)

**Path file:** `src/app/bimbingan-ta/dosen/bimbingan/page.tsx`

**Deskripsi:** Daftar semua mahasiswa yang sedang dibimbing, dengan ringkasan konsultasi.

**API yang digunakan:**
- `lecturerThesisApi.getSupervisees()` → list supervisee + konsultasi

**Logika UI:**
1. Card per supervisee menampilkan:
   - Nama mahasiswa + email
   - Judul TA
   - Program studi
   - Status TA (`ThesisStatusBadge`)
   - Jumlah konsultasi (`supervisee.consultations?.length`)
   - Konsultasi terakhir: tanggal + subject (dari `consultations[0]` setelah sort)
2. Tombol "Tambah Konsultasi" per supervisee → navigasi ke `/bimbingan-ta/dosen/konsultasi/tambah?supervisor_id=[id]`
3. Tombol "Lihat Semua Konsultasi" per supervisee → expand inline list konsultasi atau navigasi
4. Empty state jika belum ada mahasiswa bimbingan

---

## B14. HALAMAN: `/bimbingan-ta/dosen/konsultasi/tambah/page.tsx`
### Form Tambah Konsultasi

**Path file:** `src/app/bimbingan-ta/dosen/konsultasi/tambah/page.tsx`

**Deskripsi:** Form input catatan/agenda konsultasi baru untuk satu mahasiswa bimbingan.

**API yang digunakan:**
- `lecturerThesisApi.getSupervisees()` → dropdown pilih mahasiswa (id_supervisor)
- `lecturerThesisApi.createConsultation(payload)` → submit (multipart/form-data)

**Query param:** `?supervisor_id=` (dari halaman bimbingan, pre-select mahasiswa)

**Payload `LecturerConsultationPayload`:**
```typescript
{
  id_supervisor: number;        // required — ID dari thesis_supervisors
  consultation_date: string;    // required — format YYYY-MM-DD
  start_time?: string;          // opsional — format HH:mm
  end_time?: string;            // opsional — format HH:mm
  location?: string;            // opsional
  subject: string;              // required
  student_notes?: string;       // opsional
  lecturer_notes?: string;      // opsional
  attachment?: File|null;       // opsional — PDF/DOC/DOCX/JPG/PNG max 10MB
  next_task?: string;           // opsional
  progress?: number;            // opsional — 0-100, default 0
  status?: ConsultationStatus;  // opsional — default 'on_going'
}
```

**Logika UI:**
1. Dropdown "Mahasiswa Bimbingan": list dari `getSupervisees()`, pre-select jika ada `?supervisor_id` di URL. Nilai yang disimpan adalah `id_supervisor` (bukan `id_student`)
2. Date picker untuk `consultation_date`
3. Time inputs untuk `start_time` dan `end_time` (format HH:mm)
4. Input `location`
5. Input `subject` (required)
6. Textarea `lecturer_notes`
7. Textarea `student_notes` (catatan dosen untuk mahasiswa)
8. File input `attachment`
9. Textarea `next_task`
10. Slider/number input `progress` (0-100)
11. Select `status` (on_going / finished)
12. Submit → `createConsultation()` → redirect ke `/bimbingan-ta/dosen/bimbingan`

---

## B15. HALAMAN: `/bimbingan-ta/dosen/konsultasi/[id]/edit/page.tsx`
### Form Edit Konsultasi

**Path file:** `src/app/bimbingan-ta/dosen/konsultasi/[id]/edit/page.tsx`

**Deskripsi:** Form edit konsultasi. Pre-fill semua field dari data existing.

**API yang digunakan:**
- `lecturerThesisApi.getConsultationDetail(id)` → pre-fill
- `lecturerThesisApi.updateConsultation(id, payload)` → update

**Logika UI:**
1. Fetch detail konsultasi saat load → pre-fill form identik dengan form tambah (B14)
2. `id_supervisor` di-lock (tidak bisa ubah mahasiswa bimbingan dari edit)
3. Submit → `updateConsultation()` → redirect ke `/bimbingan-ta/dosen/bimbingan`
4. Cancel → back ke bimbingan

---

## B16. HALAMAN: `/admin/bimbingan/kelola-data-user/page.jsx`
### Kelola Data User Bimbingan (Admin)

**Path file:** `src/app/admin/bimbingan/kelola-data-user/page.jsx`

**Deskripsi:** Admin melihat daftar mahasiswa yang punya TA dan dosen yang jadi pembimbing.

**API yang digunakan:**
- `adminThesisApi.getStudents({ per_page: 15, page: currentPage, ... })` → tab Mahasiswa, paginated
- `adminThesisApi.getSupervisors()` → tab Dosen

**Logika UI:**
1. **Tab "Mahasiswa"**:
   - Tabel: nama mahasiswa, NIM (username), judul TA, program, status TA, jumlah pembimbing
   - `ThesisStatusBadge` untuk kolom status
   - Pagination dengan `ThesisServerPagination`
   - Klik row → navigasi ke `/admin/bimbingan/monitoring-pengajuan/[id]`
   - Filter: search by nama, filter by status
2. **Tab "Dosen"**:
   - Tabel: nama dosen, NIP (employee_id_number), judul TA bimbingan, nama mahasiswa, status TA
   - Data dari `getSupervisors()` → array `ThesisSupervisor[]`
   - Tiap entry: `supervisor.lecturer?.name`, `supervisor.student_thesis?.student?.name`, `supervisor.student_thesis?.title_ind`, status

---

## B17. HALAMAN: `/admin/bimbingan/monitoring-pengajuan/page.jsx`
### List Semua Pengajuan TA (Admin)

**Path file:** `src/app/admin/bimbingan/monitoring-pengajuan/page.jsx`

**Deskripsi:** Tabel semua pengajuan TA dari seluruh mahasiswa. Admin bisa filter dan search.

**API yang digunakan:**
- `adminThesisApi.getStudents(params)` → paginated, support filter

**Params tersedia:**
```
{ status, page, per_page }
```

**Logika UI:**
1. Tabel dengan kolom: nama mahasiswa, judul TA, program, status, pembimbing, tanggal pengajuan
2. Filter: status (proposing/on_progress/revision/finished)
3. Pagination server-side
4. Klik baris → navigasi ke `/admin/bimbingan/monitoring-pengajuan/[id]`
5. `AdminBimbinganShell` sebagai wrapper dengan `backHref="/admin/bimbingan"`

---

## B18. HALAMAN: `/admin/bimbingan/monitoring-pengajuan/[id]/page.jsx`
### Detail Pengajuan TA + Timeline Bimbingan (Admin)

**Path file:** `src/app/admin/bimbingan/monitoring-pengajuan/[id]/page.jsx`

**Deskripsi:** Detail lengkap satu pengajuan TA: data mahasiswa, detail TA, riwayat request pembimbing, daftar supervisor, dan semua konsultasi.

**API yang digunakan:**
- `adminThesisApi.getStudentDetail(id)` → semua data nested

**Response `getStudentDetail` mencakup:**
```typescript
StudentThesis + {
  student: BasicStudent,
  program: ProgramOption,
  thesis_topic: ThesisTopic|null,
  thesis_lecturers: StudentThesisRequest[],  // dengan lecturer info
  supervisors: ThesisSupervisor[],           // dengan consultations[]
}
```

**Logika UI:**
1. **Header**: nama mahasiswa, NIM, status TA badge, program studi
2. **Detail TA**: ThesisKeyValueList — judul IND, judul ENG, topik, deskripsi, `ThesisAttachmentLink` proposal, tanggal buat
3. **Topik dari Dosen** (jika `id_thesis_topic` tidak null): tampilkan info topic dosen dengan link
4. **Riwayat Permintaan Pembimbing** (dari `thesis_lecturers`):
   - Timeline atau tabel: nama dosen, tanggal, status badge, student_note, rejection_note
5. **Dosen Pembimbing Aktif** (dari `supervisors`):
   - Tiap supervisor: nama dosen, tanggal mulai bimbingan
6. **Riwayat Konsultasi** (dari `supervisors[].consultations`):
   - Timeline konsultasi: tanggal, subject, progress, status, catatan dosen, tugas selanjutnya
   - `progress-stepper` component dari `@/components/admin/progress-stepper`
7. Tombol "Kembali" → `/admin/bimbingan/monitoring-pengajuan`

---

## B19. HALAMAN: `/admin/bimbingan/semua-pengajuan/page.jsx`
### Semua Pengajuan TA — View Alternatif (Admin)

**Path file:** `src/app/admin/bimbingan/semua-pengajuan/page.jsx`

**Deskripsi:** View alternatif untuk semua pengajuan TA. Bisa tampilkan dalam layout berbeda (card view).

**API yang digunakan:**
- `adminThesisApi.getStudents({ per_page: 20, page: currentPage })` → paginated

**Logika UI:**
1. Grid card per pengajuan atau tabel flat
2. Tiap card: nama mahasiswa, judul TA, status, pembimbing, program
3. Klik → `/admin/bimbingan/monitoring-pengajuan/[id]`
4. Berbeda dari `monitoring-pengajuan/page.jsx` yang lebih tabel-focused — ini bisa card-grid untuk overview cepat

---

## ═══════════════════════════════════════
## BAGIAN C — PERBAIKAN FILE YANG SUDAH ADA
## ═══════════════════════════════════════

### C1. PERBAIKAN: Hooks yang sudah ada tapi pakai service lama

**File:** `src/features/bimbingan-ta/hooks/useAjukanTA.ts`

**Masalah:** Hook ini menggunakan `taService` dari `@/services/taService` (file lama) alih-alih `studentThesisApi`.

**Yang harus dilakukan:** Refactor total hook ini untuk menggunakan API baru.

```typescript
// SEBELUM (buggy — taService tidak sinkron dengan API baru)
import { taService } from '@/services/taService';

// SESUDAH (benar)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesisPayload, ThesisLecturer } from '@/features/bimbingan-ta/types';

export function useAjukanTA() {
  const router = useRouter();
  const [lecturers, setLecturers] = useState<ThesisLecturer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLecturers, setIsLoadingLecturers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLecturers = useCallback(async () => {
    setIsLoadingLecturers(true);
    try {
      const list = await studentThesisApi.getLecturers();
      setLecturers(list);
    } catch (err: any) {
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat daftar dosen.');
    } finally {
      setIsLoadingLecturers(false);
    }
  }, []);

  useEffect(() => { fetchLecturers(); }, [fetchLecturers]);

  const onSubmit = useCallback(async (payload: StudentThesisPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await studentThesisApi.createThesis(payload);
      router.push('/bimbingan-ta/mahasiswa/pengajuan');
    } catch (err: any) {
      setError(err?.userMessage ?? err?.message ?? 'Gagal mengajukan tugas akhir.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return { onSubmit, isLoading, isLoadingLecturers, lecturers, error };
}
```

---

**File:** `src/features/bimbingan-ta/hooks/useRiwayatTA.ts`

**Masalah:** Menggunakan `taService.getAll()` yang tidak ada di API baru.

**Yang harus dilakukan:**

```typescript
// SESUDAH (benar)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import type { StudentThesis } from '@/features/bimbingan-ta/types';

export function useCurrentThesis() {
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await studentThesisApi.getCurrentThesis();
      setThesis(result);
    } catch (err: any) {
      setError(err?.userMessage ?? err?.message ?? 'Gagal memuat data TA.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { thesis, isLoading, error, refetch: fetchData };
}
// Rename hook dari useRiwayatTA → useCurrentThesis karena API tidak lagi return array
```

---

### C2. PERBAIKAN: `src/app/bimbingan-ta/page.tsx`
### Root Redirect by Role

**File:** `src/app/bimbingan-ta/page.tsx`

**Yang harus dilakukan:** Pastikan file ini mengecek role dari cookie dan redirect ke halaman yang tepat.

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentRole, getThesisHomePath } from '@/features/bimbingan-ta/utils';

export default function BimbinganTARootPage() {
  const router = useRouter();
  useEffect(() => {
    const role = getCurrentRole();
    const homePath = getThesisHomePath(role);
    router.replace(homePath);
  }, [router]);
  return null; // atau loading spinner
}
```

---

## ═══════════════════════════════════════
## BAGIAN D — CATATAN IMPLEMENTASI & URUTAN PENGERJAAN
## ═══════════════════════════════════════

### D1. URUTAN PENGERJAAN YANG DISARANKAN

```
FASE 1 — Perbaikan dan fondasi (1-2 jam)
  1. Perbaiki useAjukanTA.ts (C1)
  2. Perbaiki useRiwayatTA.ts (C1)
  3. Perbaiki bimbingan-ta/page.tsx untuk redirect (C2)

FASE 2 — Mahasiswa (3-4 jam)
  4. B1 — pengajuan/page.tsx   ← PALING PENTING, core flow
  5. B2 — topik/page.tsx       ← galeri
  6. B3 — topik/[id]/page.tsx  ← detail + select
  7. B4 — monitoring/page.tsx  ← monitoring konsultasi
  8. B5 — kategori/page.tsx    ← simple readonly

FASE 3 — Dosen (4-5 jam)
  9.  B6  — dosen/topik/page.tsx
  10. B7  — dosen/topik/tambah/page.tsx
  11. B8  — dosen/topik/[id]/page.tsx
  12. B9  — dosen/topik/[id]/edit/page.tsx
  13. B10 — dosen/kategori/page.tsx
  14. B11 — dosen/permintaan/page.tsx
  15. B12 — dosen/permintaan/[id]/page.tsx
  16. B13 — dosen/bimbingan/page.tsx
  17. B14 — dosen/konsultasi/tambah/page.tsx
  18. B15 — dosen/konsultasi/[id]/edit/page.tsx

FASE 4 — Admin (2-3 jam)
  19. B16 — admin/bimbingan/kelola-data-user/page.jsx
  20. B17 — admin/bimbingan/monitoring-pengajuan/page.jsx
  21. B18 — admin/bimbingan/monitoring-pengajuan/[id]/page.jsx
  22. B19 — admin/bimbingan/semua-pengajuan/page.jsx
```

### D2. CATATAN PENTING SAAT IMPLEMENTASI

1. **JANGAN ubah** file di `src/features/bimbingan-ta/api/` dan `types.ts` dan `utils.ts` — sudah benar.

2. **JANGAN buat halaman baru di `src/app/bimbingan/`** — folder itu sudah deprecated. Semua ada di `bimbingan-ta/`.

3. **Selalu gunakan komponen yang sudah ada** (`ThesisShell`, `ThesisStatusBadge`, dll.) — jangan buat komponen baru yang fungsinya sama.

4. **`id_supervisor`** bukan `id_user_si` dosen — ini adalah ID dari tabel `thesis_supervisors`. Selalu ambil dari `supervisee.id_supervisor` saat membuat konsultasi.

5. **Multipart vs JSON:**
   - createThesis, updateThesis, selectTopic, createConsultation, updateConsultation → `buildFormData()` sudah dihandle di dalam API functions, cukup pass object biasa
   - createTopic, updateTopic, requestLecturer, approveRequest, rejectRequest → JSON biasa

6. **Attachment URL:** Selalu gunakan `buildThesisAssetUrl(path)` dari utils, bukan raw path.

7. **Status guard di UI:** Jangan hanya andalkan backend — tambahkan guard di UI juga (disable tombol, tampilkan pesan) sebelum request dilakukan.

8. **`adminThesisApi.getStudents()` adalah paginated** (`PaginatedResponse<StudentThesis>`), bukan plain array.
   **`adminThesisApi.getSupervisors()`** return `ThesisSupervisor[]` plain array.

9. **Admin shell:** Gunakan `AdminBimbinganShell` (bukan `StudentThesisShell`) untuk semua halaman di `src/app/admin/bimbingan/`.

10. **Error handling konsisten:** Selalu tangkap `err?.userMessage` dulu baru `err?.message` — `normalizeApiError` di `common.ts` sudah set `userMessage`.

---

## ═══════════════════════════════════════
## BAGIAN E — CARA PENGGUNAAN PROMPT INI
## ═══════════════════════════════════════

### Untuk setiap sesi implementasi, gunakan format:

```
[PASTE BAGIAN A SELURUHNYA]

Sekarang implementasikan halaman berikut:

[PASTE BAGIAN B YANG RELEVAN — misalnya B1 saja untuk satu sesi]

Buat file lengkap yang siap dipakai di:
src/app/bimbingan-ta/mahasiswa/pengajuan/page.tsx
```

### Contoh prompt untuk satu sesi:

```
[Paste Bagian A1 sampai A9]

[Paste Bagian B1 — Halaman Pengajuan TA]

Buatkan implementasi lengkap untuk file ini. Gunakan semua komponen dan API 
yang sudah tersedia sesuai konteks. Jangan buat komponen baru jika sudah ada.
Pastikan semua aturan bisnis (kuota, status guard) diimplementasikan di UI.
```

---

*Dokumen ini dibuat berdasarkan: thesis-bimbingan-api.md, student.ts, lecturer.ts, admin.ts, common.ts, types.ts, utils.ts, useAjukanTA.ts, useRiwayatTA.ts, dosen/page.tsx, mahasiswa/page.tsx, admin/bimbingan/page.jsx*
