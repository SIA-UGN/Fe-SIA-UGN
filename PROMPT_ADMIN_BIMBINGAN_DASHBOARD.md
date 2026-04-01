# 🏗️ PROMPT IMPLEMENTASI — Dashboard Admin Bimbingan TA
## 5 Halaman + Navigasi Antar Halaman

---

## STACK & ATURAN UMUM

```
Framework  : Next.js 14 App Router (JavaScript, bukan TypeScript)
Styling    : Tailwind CSS
API client : src/lib/axios.js (axios instance, baseURL = '/backend')
Auth       : useAuth() dari @/lib/auth-context → { user }
Routing    : Next.js Link & useRouter
```

### Design Tokens (WAJIB dipakai di semua halaman)
```
Page background : bg-[#e6eee9]
Primary dark    : #015023
Primary light   : #E6EEE9
Secondary gold  : #DABC4E
Navbar bg       : bg-[#015023] rounded-bl-[18px] rounded-br-[18px]
Card default    : bg-white rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]
Card large      : bg-white rounded-[16px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]
Font            : Urbanist (semua heading/body)

Status badge colors:
  Menunggu Approval : bg-[#fef9ec] border-[#fde68a] text-[#b45309] dot-[#f59e0b]
  Approved          : bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46] dot-[#10b981]
  Ditolak           : bg-[#fef2f2] border-[#fecaca] text-[#991b1b] dot-[#ef4444]
  on_progress       : bg-[#eff6ff] border-[#bfdbfe] text-[#1e40af]
```

### Navbar Admin (sama di semua halaman)
```jsx
// Navbar Admin — berbeda dari navbar mahasiswa/dosen
// Kiri: Logo UGN + "Universitas Global Nusantara" (gold #dabc4e)
// Kanan: "Dashboard Admin" (text-white) + Avatar circle (bg-[#dabc4e] + initials)
// bg-[#015023] rounded-bl-[18px] rounded-br-[18px] px-[100px] py-[12px]
// Avatar: initial dari user?.name, fallback "AD"
```

---

## STRUKTUR FILE

```
src/app/
└── admin/
    └── bimbingan/
        ├── page.jsx                    ← HALAMAN 1: Dashboard Bimbingan
        ├── kelola-data-user/
        │   └── page.jsx               ← HALAMAN 2: Kelola Data User
        ├── monitoring-pengajuan/
        │   ├── page.jsx               ← HALAMAN 3: Monitoring Pengajuan (list)
        │   └── [id]/
        │       └── page.jsx           ← HALAMAN 4: Detail Pengajuan
        └── semua-pengajuan/
            └── page.jsx               ← HALAMAN 5: Semua Pengajuan TA
```

---

## HALAMAN 1: Dashboard Bimbingan
**File:** `src/app/admin/bimbingan/page.jsx`
**Route:** `/admin/bimbingan`

### API calls (Promise.allSettled)
```javascript
const [dashboardRes, studentsRes] = await Promise.allSettled([
  api.get('/admin/thesis/dashboard'),
  api.get('/admin/thesis/students', { params: { per_page: 5 } }),
]);
```

### Data mapping
```javascript
const dashboard = dashboardRes.value?.data?.data;
// dashboard.thesis_by_status.proposing    → Menunggu (kuning)
// dashboard.thesis_by_status.on_progress  → Approved (hijau)
// dashboard.thesis_by_status.finished     → juga dihitung approved
// dashboard.total_thesis                  → Total Pengajuan TA (angka besar)
// dashboard.total_topics                  → Total Judul TA card
// dashboard.total_supervisors             → Dosen Pembimbing Aktif card
// thesis_by_status.on_progress + revision + finished → Mahasiswa Monitoring

const students = studentsRes.value?.data?.data?.data ?? [];
// 5 terbaru untuk feed "Pengajuan TA Terbaru"
```

### Layout & komponen

**1. Navbar Admin** (lihat spec di atas)

**2. Header section**
```
← Kembali ke Dashboard   (link ke /dashboard, text-[#015023], dengan arrow icon)
H1: "Dashboard Bimbingan"  font-bold text-[30px] text-[#015023]
p:  "Ringkasan data dan aktivitas modul bimbingan tugas akhir"  text-[15px] text-[#4a6741]
```

**3. Stat Banner (gradient card)**
```
Background: linear-gradient(173deg, #015023 0%, #013d1c 100%)
rounded-[16px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)] p-[24px]

Kiri:
  "Total Pengajuan TA"   font-semibold text-[18px] text-white
  {total_thesis}         font-bold text-[36px] text-white
  "Pengajuan tercatat"   text-[14px] text-[#dabc4e]

Tengah (3 kolom breakdown):
  Approved   → angka text-[#10b981] text-[22px], label text-white/60
  Menunggu   → angka text-[#f59e0b] text-[22px], label text-white/60
  Ditolak    → angka text-[#ef4444] text-[22px], label text-white/60

Kanan (gold icon box):
  bg-gradient gold, rounded-[16px], p-[16px]
  SVG book/graduation icon
```

**4. 4 Summary Cards** (grid 4 kolom, gap-4)
```
Card 1 — Pengajuan TA Baru
  Icon bg: bg-[#fff3cd]
  Angka color: text-[#dabc4e]
  Value: thesis_by_status.proposing
  Sub: "Menunggu approval"

Card 2 — Total Judul TA
  Icon bg: bg-[#e6f4ea]
  Angka color: text-[#015023]
  Value: data.total_topics
  Sub: "Terdaftar di sistem"

Card 3 — Dosen Pembimbing Aktif
  Icon bg: bg-[#dbeafe]
  Angka color: text-[#1e40af]
  Value: data.total_supervisors
  Sub: "Dosen aktif bimbingan"

Card 4 — Mahasiswa Monitoring
  Icon bg: bg-[#f3e8ff]
  Angka color: text-[#7e22ce]
  Value: on_progress + revision
  Sub: "Dalam proses bimbingan"

Setiap card: bg-white rounded-[16px] shadow-sm p-[16px]
Icon box: size-[50px] rounded-[12px]
Angka: font-bold text-[32px]
Label: font-medium text-[13px] text-[#6a7282]
Sub: font-normal text-[12px] text-[#9ca3af]
Trending up icon (↗) di pojok kanan atas setiap card
```

**5. Quick Action Links** (2 kartu horizontal, gap-4)
```
Link 1 — Kelola Data User
  href="/admin/bimbingan/kelola-data-user"
  Icon bg: bg-[rgba(1,80,35,0.08)]
  Title: "Kelola Data User" font-semibold text-[15px] text-[#1f2937]
  Sub: "Kelola data mahasiswa dan dosen" text-[12px] text-[#6a7282]
  Arrow icon kanan → text-[#015023]

Link 2 — Monitoring Pengajuan
  href="/admin/bimbingan/monitoring-pengajuan"
  Icon bg: bg-[rgba(133,100,4,0.08)]
  Title: "Monitoring Pengajuan"
  Sub: "Pantau status pengajuan TA"
  Arrow icon kanan

Style: bg-white rounded-[14px] shadow-sm p-[24px] flex items-center gap-4
Hover: hover:shadow-md transition-shadow cursor-pointer
```

**6. Pengajuan TA Terbaru** (feed list)
```
Header: "Pengajuan TA Terbaru" (bold, text-[#015023]) + "Lihat semua →" link ke /admin/bimbingan/semua-pengajuan

Container: bg-white rounded-[14px] shadow-sm

Per item (border-b border-[#f3f4f6]):
  - Avatar circle bg-[#015023] + initials 2 huruf (dari nama mahasiswa)
  - Nama mahasiswa  font-semibold text-[14px] text-[#1f2937]
  - NIM · tanggal  text-[12px] text-[#9ca3af]
  - StatusBadge (kanan atas item)
  - Judul TA  text-[13px] text-[#4a5565]
  - Pembimbing atau "Belum ada pembimbing"  text-[11px]
  - Arrow icon kanan → klik navigasi ke /admin/bimbingan/monitoring-pengajuan/{id_student_thesis}

Data dari: GET /admin/thesis/students?per_page=5
thesis_lecturers[0]?.status untuk badge
supervisors[0]?.lecturer?.name untuk pembimbing
```

**7. Footer** (bg-[#015023], standard UGN footer)

---

## HALAMAN 2: Kelola Data User
**File:** `src/app/admin/bimbingan/kelola-data-user/page.jsx`
**Route:** `/admin/bimbingan/kelola-data-user`

### API calls
```javascript
const [studentsRes, supervisorsRes] = await Promise.allSettled([
  api.get('/admin/thesis/students', { params: { per_page: 50 } }),
  api.get('/admin/thesis/supervisors'),
]);
```

### Layout

**Header:**
```
← Dashboard Bimbingan  (link ke /admin/bimbingan)
H1: "Kelola Data User"
p: "Manajemen data mahasiswa dan dosen dalam sistem bimbingan TA"
```

**4 Summary mini-cards** (grid 2x2, gap-4):
```
Total Mahasiswa   → students.total
Sudah Punya Dosen → students yg punya supervisors.length > 0
Total Dosen       → distinct lecturers dari supervisors
Dosen Aktif       → distinct lecturers yg punya mahasiswa aktif

Style: bg-white rounded-[12px] p-[16px] flex items-center gap-3
Icon: size-[44px] rounded-[10px] (bg tinted sesuai kategori)
```

**Tab Switcher:**
```jsx
// 2 tabs: "Mahasiswa (N)" | "Dosen (N)"
// Active tab: bg-[#015023] text-white rounded-[8px]
// Inactive: bg-white text-[#6a7282] hover:bg-gray-50
// Container: bg-white rounded-[10px] p-[4px] gap-[4px] flex
```

**Tab Mahasiswa — Filter + Tabel:**
```
Filter row: Program Studi (select) | Status (select) | Pembimbing (select)
Search: "Cari Mahasiswa..." (bg-[#dabc4e]/10, rounded-[10px])

Table header (bg-[#dabc4e] text-[#015023] font-semibold):
  No | NIM / Nama | Program Studi | Semester | IPK | Status | Dosen Pembimbing

Table rows (border-b border-[#f3f4f6]):
  - Avatar circle (bg-[#015023] + initials)
  - Nama + NIM (2 baris)
  - Program studi (teks center)
  - Semester angka
  - IPK  (merah jika < 3.0, hijau jika >= 3.5)
  - Status dot: "Aktif" (hijau)
  - Nama dosen atau "Belum ditentukan" (text-[#9ca3af])

Pagination: Previous | 1 | 2 | ... | Next
Data source: GET /admin/thesis/students?per_page=6&page=N&status=&id_program=&search=
```

**Tab Dosen — Filter + Tabel:**
```
Filter row: Status (select)
Search: "Cari Dosen..."

Table header (bg-[#dabc4e] text-[#015023]):
  No | NIP / Nama | Bidang Keahlian | Jabatan | Status | Kuota Bimbingan

Table rows:
  - Avatar circle (bg-[#6a7282] + initials)
  - Nama + NIP (2 baris)
  - Bidang keahlian → dari staff_profile (atau "–")
  - Jabatan → staff_profile.position
  - Status: "Aktif" dot hijau
  - Kuota Bimbingan: "N/M" + progress bar fill
    - Fill color: hijau jika < 60%, kuning 60-90%, merah > 90%

Data source: GET /lecturer/thesis/* atau build dari supervisors data
Distinct dosen dari: api.get('/admin/thesis/supervisors')
Kuota = count supervisees / max (default max = 6 jika tidak diketahui)
```

---

## HALAMAN 3: Monitoring Pengajuan (List)
**File:** `src/app/admin/bimbingan/monitoring-pengajuan/page.jsx`
**Route:** `/admin/bimbingan/monitoring-pengajuan`

### API calls
```javascript
const [dashboardRes, studentsRes] = await Promise.allSettled([
  api.get('/admin/thesis/dashboard'),
  api.get('/admin/thesis/students', {
    params: { status: filterStatus, id_program: filterProgram, search, page, per_page: 6 }
  }),
]);
```

### Layout

**Header:**
```
← Dashboard Bimbingan  (link ke /admin/bimbingan)
H1: "Monitoring Pengajuan TA"
p: "Pantau status pengajuan judul tugas akhir seluruh mahasiswa"
```

**Stat Banner** (sama seperti halaman 1, gradient hijau gelap):
```
Total | Menunggu (kuning) | Approved (hijau) | Ditolak (merah)
Icon: clipboard/document SVG dalam gold box
```

**4 Status Summary Cards** (grid 2x2):
```
Menunggu Approval → thesis_by_status.proposing    (icon jam, bg-[#fef3c7])
Approved          → on_progress + finished         (icon centang, bg-[#d1fae5])
Sudah Ada Dosen   → mahasiswa dgn supervisors > 0  (icon person+, bg-[#dbeafe])
Belum Ada Dosen   → mahasiswa tanpa supervisor     (icon person-, bg-[#f3f4f6])
```

**Filter Row:**
```
Filter | Status (select) | Program Studi (select) | Dosen Pembimbing (select) | Dari Tanggal (date)
```

**Search bar:**
```
🔍 "Cari Mahasiswa..."  bg-[#dabc4e]/10 border border-[#dabc4e]/30 rounded-[10px]
```

**Table** (bg-white rounded-[14px]):
```
Header (bg-[#dabc4e] text-[#015023] font-semibold):
  No | ID Pengajuan | Mahasiswa | Judul TA | Tgl. Pengajuan | Status | Pembimbing | Aksi

Rows:
  - ID: "TA-{year}-{id.toString().padStart(3,'0')}"  (badge bg-[#e6eee9] rounded text-[#015023])
  - Avatar + Nama + NIM + Prodi (2-3 baris)
  - Judul TA (max 2 baris, text-ellipsis)
  - Tanggal (📅 icon + DD MMM YYYY)
  - StatusBadge (Menunggu Approval / Approved / Ditolak / on_progress)
  - Pembimbing: "Sudah Ada ✓ + nama dosen" atau "Belum Ada ✗" (text-[#9ca3af])
  - Aksi: Button "Detail →" bg-[#015023] text-white rounded-[8px] px-3 py-1.5
           → navigasi ke /admin/bimbingan/monitoring-pengajuan/{id_student_thesis}

Pagination: Menampilkan N-M dari X data | Previous | 1 | 2 | Next
```

**Status badge untuk thesis:**
```
proposing   → Menunggu Approval (kuning)
on_progress → Approved (hijau)
revision    → Revisi (orange)
finished    → Selesai (hijau tua)
```

---

## HALAMAN 4: Detail Pengajuan
**File:** `src/app/admin/bimbingan/monitoring-pengajuan/[id]/page.jsx`
**Route:** `/admin/bimbingan/monitoring-pengajuan/[id]`

### API call
```javascript
const res = await api.get(`/admin/thesis/students/${params.id}`);
const thesis = res.data?.data;
```

### Layout

**Back link:**
```
← Monitoring Pengajuan TA  (link ke /admin/bimbingan/monitoring-pengajuan)
H1: "Monitoring Pengajuan TA"
p: "Pantau status pengajuan judul tugas akhir seluruh mahasiswa"
```

**Student Header Card** (bg-gradient hijau gelap seperti stat banner):
```
Kiri:
  Avatar besar (bg-[#dabc4e] text-white font-bold size-[56px] rounded-[16px] + initials)
  Nama mahasiswa  font-bold text-[28px] text-white
  NIM · Prodi · Semester  text-[14px] text-white/80
  Email  text-[13px] text-white/60

Kanan:
  StatusBadge (Menunggu Approval / Approved / dll)
  IPK badge: "IPK {nilai}"  bg-white/10 text-white rounded-full px-3 py-1

Bawah header card:
  "JUDUL TUGAS AKHIR"  label uppercase text-[11px] text-white/60
  title_ind  font-bold text-[18px] text-white
  title_eng  text-[14px] text-white/70 italic
```

**Progress Stepper:**
```
5 langkah horizontal dengan connector line:
  1. Pengajuan       — "Mahasiswa mengajukan judul"
  2. Review Dosen    — "Dosen meninjau pengajuan"
  3. Penetapan Pembimbing — "Dosen pembimbing ditetapkan"
  4. Bimbingan Aktif — "Proses bimbingan berlangsung"
  5. Sidang TA       — "Siap untuk sidang"

Current step (filled circle bg-[#015023]) vs inactive (outline gray)
Connector: bg-[#015023] untuk completed, bg-gray-200 untuk belum

Mapping status → step:
  proposing   → step 1 active
  on_progress → step 3 active
  revision    → step 4 active
  finished    → step 5 active
```

**Section cards** (bg-white rounded-[14px] shadow-sm):

**A. Deskripsi Penelitian**
```
"Deskripsi Penelitian"  heading
{thesis.description}    paragraph text-[14px] text-[#4a5565]
```

**B. Catatan Bimbingan**
```
💬 "Catatan Bimbingan"  heading

Jika ada konsultasi:
  Per item timeline:
    Tanggal, subject (bold), catatan dosen, progress bar

Jika kosong:
  Empty state: icon + "Belum ada catatan bimbingan"
```

**C. Info Pengajuan** (2-col grid)
```
Kiri:
  📋 ID Pengajuan: TA-{year}-{id.padStart(3,'0')}
  📅 Tanggal Pengajuan: {format created_at}

Kanan:
  🎓 Program Studi: {program.name}
  📚 Semester: dari data mahasiswa (jika tersedia)

Dokumen Proposal (full width):
  Jika ada attachment_proposal:
    File card: 📄 nama file + ukuran + tombol Download
  Jika tidak ada:
    "Tidak ada dokumen proposal"
```

**D. Dosen Pembimbing**
```
"Dosen Pembimbing" heading

Jika ada supervisors:
  Per supervisor:
    Avatar + Nama + Email
    
Jika kosong:
  Empty state: icon + "Belum ada dosen pembimbing" + "Menunggu approval pengajuan"
```

**E. Jadwal Bimbingan**
```
📅 "Jadwal Bimbingan" heading

Jika ada consultations:
  Tabel: Tanggal | Waktu | Tempat | Topik | Status
  
Jika kosong:
  Empty state: icon kalender + "Belum ada jadwal"
```

---

## HALAMAN 5: Semua Pengajuan TA
**File:** `src/app/admin/bimbingan/semua-pengajuan/page.jsx`
**Route:** `/admin/bimbingan/semua-pengajuan`
**Akses dari:** "Lihat semua →" di Dashboard Bimbingan

### API calls
```javascript
const res = await api.get('/admin/thesis/students', {
  params: { status: filter, id_program: program, search, page, per_page: 15 }
});
```

### Layout

**Header:**
```
← Dashboard Bimbingan
H1: "Semua Pengajuan Tugas Akhir"
p: "Daftar lengkap seluruh pengajuan TA mahasiswa"
```

**Filter + Search** (sama seperti Monitoring Pengajuan):
```
Filter: Status | Program Studi | Dari Tanggal
Search: "Cari nama atau judul..."
```

**Table** (lebih lengkap dari monitoring):
```
Header (bg-[#dabc4e] text-[#015023]):
  No | ID Pengajuan | Mahasiswa | Judul TA | Tgl. Pengajuan | Status | Pembimbing | Aksi

Rows sama seperti Monitoring Pengajuan tapi per_page=15

Klik "Detail →" → navigasi ke /admin/bimbingan/monitoring-pengajuan/{id}
```

**Summary stats bar** (di atas tabel):
```
4 chip kecil:
  Semua (N) | Menunggu (N) | Approved (N) | Ditolak (N)
  Klik untuk filter cepat
  Active chip: bg-[#015023] text-white
  Inactive chip: bg-white border border-gray-200
```

---

## KOMPONEN SHARED YANG PERLU DIBUAT

### `AdminNavbar` (`src/components/ui/admin-navbar.jsx`)
```jsx
// Props: title="Dashboard Admin"
// Kiri: Logo UGN + nama universitas (gold)
// Kanan: title text + avatar (initials dari useAuth().user.name)
// bg-[#015023] rounded-bl-[18px] rounded-br-[18px]
```

### `StatusBadge` (extend yg sudah ada atau buat baru)
```jsx
// Variants: proposing | on_progress | revision | finished
//           pending | accepted | rejected (untuk thesis_lecturer)
const STATUS_CONFIG = {
  proposing:   { label: 'Menunggu Approval', bg: '#fef9ec', border: '#fde68a', text: '#b45309', dot: '#f59e0b' },
  on_progress: { label: 'Approved',           bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
  revision:    { label: 'Revisi',             bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', dot: '#f97316' },
  finished:    { label: 'Selesai',            bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
  ditolak:     { label: 'Ditolak',            bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' },
};
```

### `StatBanner` (`src/components/admin/stat-banner.jsx`)
```jsx
// Props: total, totalLabel, breakdown: [{label, value, color}], icon
// gradient bg: linear-gradient(173deg, #015023 0%, #013d1c 100%)
// rounded-[16px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1)]
```

### `SummaryCard` (`src/components/admin/summary-card.jsx`)
```jsx
// Props: icon, iconBg, label, value, sub, valueColor, trendIcon
// bg-white rounded-[16px] shadow-sm p-[16px]
```

### `ThesisTable` — reusable untuk Monitoring & Semua Pengajuan
```jsx
// Props: data, loading, onDetail
// Kolom bisa dikonfigurasi
// Status badge otomatis
```

### `ProgressStepper` (untuk halaman detail)
```jsx
// Props: currentStep (1-5), steps: [{label, sub}]
// Active: bg-[#015023] text-white circle
// Inactive: border-gray-200 circle
// Connector line: bg-[#015023] completed, bg-gray-200 belum
```

---

## NAVIGASI ANTAR HALAMAN (FLOW TOMBOL)

```
/admin/bimbingan (Dashboard)
    │
    ├── "Kelola Data User" card ──────────→ /admin/bimbingan/kelola-data-user
    │
    ├── "Monitoring Pengajuan" card ──────→ /admin/bimbingan/monitoring-pengajuan
    │
    ├── "Lihat semua →" link ────────────→ /admin/bimbingan/semua-pengajuan
    │
    └── Arrow (→) per item feed ─────────→ /admin/bimbingan/monitoring-pengajuan/{id}

/admin/bimbingan/kelola-data-user
    └── "← Dashboard Bimbingan" ─────────→ /admin/bimbingan

/admin/bimbingan/monitoring-pengajuan
    ├── "← Dashboard Bimbingan" ─────────→ /admin/bimbingan
    └── "Detail →" button per row ───────→ /admin/bimbingan/monitoring-pengajuan/{id}

/admin/bimbingan/monitoring-pengajuan/[id]
    └── "← Monitoring Pengajuan TA" ─────→ /admin/bimbingan/monitoring-pengajuan

/admin/bimbingan/semua-pengajuan
    ├── "← Dashboard Bimbingan" ─────────→ /admin/bimbingan
    └── "Detail →" per row ──────────────→ /admin/bimbingan/monitoring-pengajuan/{id}
```

---

## ERROR HANDLING (SEMUA HALAMAN)

```javascript
// Pattern standar:
const [res1, res2] = await Promise.allSettled([call1, call2]);

if (res1.status === 'fulfilled') {
  setData(res1.value?.data?.data);
} else {
  // Tampilkan empty state, bukan crash
  setData(defaultValue);
  // Log error tapi jangan console.error dengan HTML blob
  if (res1.reason?.response) {
    // API error with response (4xx, 5xx)
    console.warn('API error:', res1.reason.response.status);
  }
  // Jangan log full error object — hanya log pesan ringkas
}
```

---

## LOADING STATES

```jsx
// Skeleton untuk tabel:
{loading ? (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-[58px] bg-gray-100 rounded-lg animate-pulse" />
    ))}
  </div>
) : (
  <TableContent />
)}

// Skeleton untuk stat cards:
<div className="h-[120px] bg-gray-100 rounded-[16px] animate-pulse" />
```

---

## AVATAR HELPER

```javascript
// Fungsi untuk initials dari nama
function getInitials(name) {
  if (!name) return 'AD';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Fungsi untuk warna avatar berdasarkan nama (deterministic)
const AVATAR_COLORS = ['#015023', '#1e40af', '#7e22ce', '#b45309', '#991b1b'];
function getAvatarColor(name) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
```

---

## FORMAT ID PENGAJUAN

```javascript
function formatThesisId(id, createdAt) {
  const year = new Date(createdAt).getFullYear();
  return `TA-${year}-${String(id).padStart(3, '0')}`;
}
// Contoh: id=1, created="2026-03-08" → "TA-2026-001"
```

---

## FORMAT TANGGAL

```javascript
function formatDate(dateStr) {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
// "2026-03-08" → "08 Mar 2026"
```

---

*Implementasi prompt selesai. Semua 5 halaman connected dengan navigasi yang benar dan menggunakan API endpoints yang tersedia.*
