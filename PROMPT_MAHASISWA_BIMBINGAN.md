# 🎓 PROMPT IMPLEMENTASI — Modul Bimbingan TA (Role: Mahasiswa)
## 7 Halaman + Navigasi Lengkap

---

## STACK & ATURAN UMUM

```
Framework  : Next.js 14 App Router (JavaScript, bukan TypeScript)
Styling    : Tailwind CSS
API client : src/lib/axios.js (baseURL = '/backend', proxy ke backend)
Auth       : useAuth() dari @/lib/auth-context → { user }
Font       : Urbanist (semua elemen)
```

### Design Tokens (WAJIB pakai di semua halaman)
```
Page background    : bg-[#e6eee9]
Primary dark       : #015023
Primary light      : #E6EEE9
Secondary gold     : #DABC4E
Secondary light    : #FBF8ED

Navbar             : bg-[#015023] rounded-bl-[18px] rounded-br-[18px] px-[100px] py-[12px]
Card standar       : bg-white rounded-[16px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1)]
Card form          : bg-white rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]
Card header (dark) : bg-[#015023] rounded-t-[20px] px-[32px] py-[16px]
Page padding       : px-[112px] py-[32px]
Form input         : border-[#e5e7eb] border-[0.8px] rounded-[10px] px-[16px] py-[12px]
Button primary     : bg-[#015023] text-white rounded-[10px]
Button outline     : bg-white border border-[#015023] text-[#015023] rounded-[8px]

Status badges:
  Diproses/Menunggu  : bg-[#fef9ec] border-[#fde68a] text-[#b45309] dot-[#f59e0b]
  Approved/Selesai   : bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46] dot-[#10b981]
  Ditolak            : bg-[#fef2f2] border-[#fecaca] text-[#991b1b] dot-[#ef4444]
  Akan Datang        : bg-[#fef9ec] border-[#fde68a] text-[#b45309] dot-[#f59e0b]

Category badge     : bg-[#e6f4ea] text-[#015023] rounded-full px-[12px] py-[4px] text-[12px] font-semibold
```

### Breadcrumb Pattern (sama di semua halaman)
```jsx
// Beranda (home icon) → Bimbingan → [Halaman Aktif]
// Active item: text-[#015023] font-semibold
// Inactive: text-[#6a7282] font-medium
// Separator: ChevronRight icon size-[14px] text-[#6a7282]
```

---

## STRUKTUR FILE

```
src/app/
└── bimbingan/
    ├── pengajuan-ta/
    │   └── page.jsx          ← HALAMAN 1: Riwayat Pengajuan + Form
    ├── galeri-judul/
    │   ├── page.jsx          ← HALAMAN 2: Galeri Judul (grid cards)
    │   └── [id]/
    │       └── page.jsx      ← HALAMAN 3: Detail Judul + Konfirmasi Modal
    └── monitoring/
        └── page.jsx          ← HALAMAN 4: Monitoring Bimbingan
```

---

## NAVBAR MAHASISWA (Bimbingan dropdown)

Navbar ini sudah ada. Pastikan **dropdown Bimbingan** berisi:
```
Bimbingan ▾  (text-[#dabc4e] saat aktif di halaman bimbingan)
├── + Pengajuan TA        → /bimbingan/pengajuan-ta
├── 📋 Galeri Judul TA    → /bimbingan/galeri-judul
└── 🖥 Monitoring         → /bimbingan/monitoring
```
Menu item aktif = text-[#dabc4e], inactive = text-[#e6eee9]

---

## HALAMAN 1: Pengajuan Tugas Akhir
**File:** `src/app/bimbingan/pengajuan-ta/page.jsx`
**Route:** `/bimbingan/pengajuan-ta`
**Figma:** Node 3060-1075 (Buat Pengajuan TA) + Node 3058-496 (Riwayat)

### Logika tampilan:
```javascript
// 1. Cek apakah mahasiswa sudah punya TA
const thesisRes = await api.get('/student/thesis');
const hasThesis = thesisRes.data?.data !== null;
const thesis = thesisRes.data?.data;

// 2. Ambil daftar dosen untuk select
const lecturersRes = await api.get('/student/thesis/lecturers');

// 3. Tampilan:
//    - Jika BELUM punya TA → tampilkan form pengajuan
//    - Jika SUDAH punya TA → tampilkan riwayat pengajuan + status
```

### Header halaman (selalu tampil)
```
Breadcrumb: 🏠 Beranda › Bimbingan › Pengajuan TA
H1: "Pengajuan Tugas Akhir"  font-bold text-[30px] text-[#015023]
p:  "Ajukan proposal tugas akhir Anda"  text-[15px] text-[#6a7282]
Tombol "⊕ Buat Pengajuan" (kanan atas) → bg-[#015023] text-white
         Hanya tampil jika mahasiswa belum punya TA
```

### VIEW A — Riwayat Pengajuan (sudah ada TA)
**Figma:** Node 3058-496

```
Card: bg-white rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]

Header card (bg-[#015023] rounded-t-[20px]):
  📋 icon + "Riwayat Pengajuan"  text-white font-semibold text-[17px]

Tabel dalam card:
  Kolom: Tanggal | Judul | Dosen | Status

  Row data dari: thesis_lecturers array milik thesis
  Per row:
    - Tanggal: created_at → format "DD MMM YYYY"
    - Judul: title_ind mahasiswa (truncate 50 char)
    - Dosen: lecturer.name
    - Status badge: pending→Diproses, accepted→Approved, rejected→Ditolak

  Jika thesis.status === 'on_progress':
    Tampilkan info card SEBELUM tabel:
    ✅ "Pengajuan Berhasil! Dosen pembimbing telah menyetujui bimbingan Anda."
    bg-[#ecfdf5] border border-[#a7f3d0] rounded-[12px] p-[16px] text-[#065f46]

  Jika thesis_lecturers kosong:
    Empty state: icon + "Belum ada riwayat pengajuan"

  Tombol bawah:
    "Ajukan ke Dosen Lain" (jika aktif < 4) → buka form RequestDosen modal
    "Lihat Monitoring" → navigasi ke /bimbingan/monitoring
```

### VIEW B — Form Pengajuan Baru (belum ada TA)
**Figma:** Node 3060-1075

```
Card form: bg-white rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]

Header card: bg-[#015023] rounded-t-[20px] px-[32px] py-[16px]
  📄 "Formulir Pengajuan Baru"  text-white font-semibold text-[17px]

Form fields (px-[32px] py-[32px] gap-[24px]):

1. Judul Tugas Akhir (Bahasa Indonesia) *
   label: font-semibold text-[15px] text-[#015023]
   input: border-[#e5e7eb] border-[0.8px] rounded-[10px] px-[16px] py-[12px]
   placeholder: "Masukkan judul tugas akhir dalam Bahasa Indonesia"

2. Judul Tugas Akhir (Bahasa Inggris) *
   placeholder: "Enter your thesis title in English"

3. Ringkasan/Deskripsi Proposal *
   textarea: min-h-[138px] + counter "N karakter" di kanan bawah
   placeholder: "Jelaskan ringkasan proposal tugas akhir Anda (minimal 100 kata)"

4. Calon Dosen Pembimbing *
   label: "Calon Dosen Pembimbing *"
   sublabel: "Pilih minimal 1 dan maksimal 4 calon dosen pembimbing (urutan berdasarkan prioritas)"
             text-[12px] text-[#9ca3af]
   
   Select dropdown custom:
   - Fetch dari: GET /student/thesis/lecturers
   - Multi-select (maks 4 dosen)
   - Per item: Nama + NIP/jabatan
   - Urutan bisa diubah (drag/angka prioritas)
   - Border: border-[#e5e7eb] rounded-[10px] bg-white
   
5. Upload Proposal (PDF/DOC) *
   Drag & drop zone:
     border-[1.6px] border-dashed border-[#d1d5db] rounded-[12px] p-[32px]
     Center content:
       - Upload icon circle: bg-[#e6eee9] size-[52px] rounded-full
       - "Seret & lepas file di sini" font-semibold text-[#015023]
       - "atau klik untuk memilih file PDF, DOC, DOCX hingga 10MB" text-[#6a7282]
     onClick → open file picker
     Jika file dipilih: tampilkan nama file + ukuran + ✕ tombol hapus

Tombol Submit (full width):
   bg-[#015023] text-white rounded-[10px] py-[12px] text-[18px]
   "Submit Pengajuan"
   
   Loading state: "Menyimpan..."
   
   Validasi sebelum submit:
   - title_ind: required
   - title_eng: required
   - description: required, min 100 karakter
   - id_lecturer (setidaknya 1): required
   
   API call:
   POST /student/thesis (multipart/form-data)
   Body: { title_ind, title_eng, description, attachment_proposal: file }
   
   Setelah berhasil:
   1. Ambil id dari response: id_student_thesis
   2. Kirim request ke setiap dosen yang dipilih (sequential):
      POST /student/thesis/{id}/request-lecturer
      Body: { id_lecturer, student_note: "" }
   3. Tampilkan toast sukses
   4. Redirect ke /bimbingan/pengajuan-ta (reload untuk tampilkan riwayat)
   
   Handle error 422:
   - "Anda sudah memiliki pengajuan tugas akhir" → redirect ke riwayat
   - "Maksimal 4 dosen" → toast error
```

---

## HALAMAN 2: Galeri Judul Tugas Akhir
**File:** `src/app/bimbingan/galeri-judul/page.jsx`
**Route:** `/bimbingan/galeri-judul`
**Figma:** Node 3063-1579

### API calls
```javascript
const [topicsRes, categoriesRes] = await Promise.allSettled([
  api.get('/student/thesis/topics', { params: { my_program: true, search, category } }),
  api.get('/student/thesis/categories'),
]);
```

### Layout

**Header:**
```
Breadcrumb: 🏠 Beranda › Bimbingan › Galeri Judul TA
H1: "Galeri Judul Tugas Akhir"  font-bold text-[30px] text-[#015023]
p:  "Pilih dari judul-judul tugas akhir yang ditawarkan oleh dosen pembimbing"
```

**Search & Filter bar** (bg-white rounded-[16px] shadow-sm p-[24px]):
```
Kiri — Search input:
  bg-[#f3f3f5] border border-[#d1d5dc] rounded-[8px] px-[12px] py-[8px]
  🔍 icon + "Cari judul atau nama dosen..." placeholder text-[#717182]
  Debounce 300ms → update query

Kanan — Kategori select:
  bg-[#f3f3f5] border-[#d1d5dc] rounded-[8px] px-[12px] py-[8px]
  🔽 icon + "Semua Kategori" dropdown
  Option: Semua + setiap kategori dari GET /student/thesis/categories
  onChange → filter topics
```

**Count info:**
```
"Menampilkan {N} judul tugas akhir"  text-[14px] text-[#4a5565]
{N} = angka font-semibold text-[#015023]
```

**Grid cards** (3 kolom, gap-[28px]):
```
Per card (bg-white rounded-[16px] shadow-[0px_4px_6px...] p-[24px]):

  1. Category badge (top):
     bg-[#e6f4ea] rounded-full px-[12px] py-[4px]
     dot icon + category name  font-semibold text-[12px] text-[#015023]

  2. Judul (H3):
     font-bold text-[18px] text-[#015023] leading-[28px]
     max 2 baris (line-clamp-2)

  3. Dosen:
     👤 icon + nama dosen  text-[14px] text-[#4a5565] font-medium

  4. Deskripsi:
     text-[14px] text-[#4a5565] font-normal leading-[20px]
     max 3 baris (line-clamp-3) h-[60px] overflow-hidden

  5. Kuota:
     "Kuota Tersedia:  {sisa}/{total}"
     sisa = quota - taken count
     Jika sisa = 0: warna merah, text "Penuh"

  6. Tombol (2 kolom):
     [Lihat Detail]      → bg-white border border-[#015023] text-[#015023] rounded-[8px]
                           → navigasi ke /bimbingan/galeri-judul/{id_thesis_topic}
     [Ajukan Bimbingan]  → bg-[#015023] text-white rounded-[8px]
                           → buka ConfirmModal (lihat spec modal)
                           → Disabled + bg-gray-400 jika kuota habis

Kuota sisa:
  topic.quota - (mahasiswa yang sudah pilih topik ini)
  Gunakan: topic.quota sebagai max, status 'taken' berarti penuh
  Jika topic.status === 'taken' → Disable "Ajukan Bimbingan", tampilkan badge "Penuh"

Empty state (jika tidak ada hasil):
  Icon search + "Tidak ada judul yang ditemukan"
  "Coba ubah kata kunci atau kategori pencarian"
```

**Loading skeleton:**
```jsx
// Grid 3 kolom dengan 6 skeleton cards
<div className="bg-gray-100 animate-pulse rounded-[16px] h-[280px]" />
```

---

## HALAMAN 3: Detail Judul TA
**File:** `src/app/bimbingan/galeri-judul/[id]/page.jsx`
**Route:** `/bimbingan/galeri-judul/[id]`
**Figma:** Node 3068-2475

### API call
```javascript
const res = await api.get(`/student/thesis/topics/${params.id}`);
const topic = res.data?.data;
// Jika 404 (topic bukan 'available') → redirect ke /bimbingan/galeri-judul
```

### Layout

**Back link:**
```
← Kembali ke Galeri  (link ke /bimbingan/galeri-judul)
text-[#015023] font-medium text-[14px]
```

**Main card** (bg-white rounded-[16px] shadow-sm p-[24px]):

```
Section Header:
  Category badge (bg-[#e6f4ea] text-[#015023])
  H1: title_ind  font-bold text-[24px] text-[#015023]
  p:  title_eng  font-normal text-[14px] text-[#4a5565] italic
  
  Status info row:
    ✓ Tersedia  (bg-[#ecfdf5] text-[#065f46])
    👤 Kuota {sisa}/{total}

Section: Dosen Pembimbing
  "Dosen Pembimbing"  font-bold text-[16px] text-[#015023] dengan 👤 icon
  Card dosen: bg-gray-50 rounded-[12px] p-[16px]
    - Avatar circle bg-[#015023] size-[52px] + initials
    - Nama dosen  font-bold text-[16px] text-[#015023]
    - Email dosen  text-[14px] text-[#dabc4e]
    - Bidang keahlian  text-[13px] text-[#015023] font-medium (dari staff_profile jika ada)

Section: Deskripsi Penelitian
  "📄 Deskripsi Penelitian"  font-bold text-[16px] text-[#dabc4e]
  Paragraf 1 (description awal): text-[14px] text-[#4a5565]
  Blockquote (extended description jika ada):
    border-l-4 border-[#015023] bg-[#f9fafb] p-[16px] rounded-r-[8px]
    text-[13px] text-[#4a5565]

Section: Metodologi Penelitian (jika topic.methodology ada)
  "Metodologi Penelitian"  font-bold text-[16px] text-[#015023]
  Box: bg-gray-50 rounded-[12px] p-[16px] text-[14px]

Section: Persyaratan (jika ada)
  "Persyaratan"  font-bold text-[16px] text-[#015023]
  List: • item  text-[14px] text-[#4a5565]

Tombol bawah (full width):
  "Ajukan Bimbingan"  bg-[#015023] text-white rounded-[10px] py-[14px] text-[16px]
  → onClick: buka ConfirmModal
  → Disabled jika topic.status !== 'available' atau kuota habis
```

### ConfirmModal (overlay)
**Figma:** Node 3306-1884

```
Overlay: fixed inset-0 bg-black/50 z-50 flex items-center justify-center

Modal card: bg-white rounded-[16px] shadow-xl w-[440px] p-[0]

Header: bg-white rounded-t-[16px] px-[24px] pt-[24px] pb-[16px]
  "Konfirmasi Pengajuan Bimbingan"  font-bold text-[18px]
  X button kanan atas

  Sub: "Pastikan Anda sudah membaca detail judul tugas akhir sebelum mengajukan bimbingan."
       text-[13px] text-[#6a7282]

Body (px-[24px] py-[16px]):
  "Judul:"        label font-semibold text-[#015023]
  {topic.title_ind}  text-[14px] text-[#1f2937]
  
  "Dosen Pembimbing:"  label font-semibold text-[#015023]
  {lecturer.name}      text-[14px]
  
  "Kategori:"     label font-semibold text-[#015023]
  {category.name} text-[14px]

Footer: px-[24px] pb-[24px] flex gap-[12px] justify-end
  [Batal]           → bg-white border border-gray-300 text-[#6a7282] rounded-[8px] px-[20px] py-[8px]
  [Konfirmasi Ajukan] → bg-[#015023] text-white rounded-[8px] px-[20px] py-[8px]

API call saat Konfirmasi:
  POST /student/thesis/topics/{topicId}/select
  Body (multipart/form-data): { student_note: "" }
  
  Success:
    - Tutup modal
    - Toast sukses: "Pengajuan bimbingan berhasil dikirim ke dosen"
    - Redirect ke /bimbingan/pengajuan-ta
  
  Error 422 "Anda sudah memiliki TA":
    - Toast: "Anda sudah memiliki pengajuan tugas akhir aktif"
    - Redirect ke /bimbingan/pengajuan-ta
  
  Error lain:
    - Toast error dengan message dari API
    - Tutup modal
```

---

## HALAMAN 4: Monitoring Bimbingan
**File:** `src/app/bimbingan/monitoring/page.jsx`
**Route:** `/bimbingan/monitoring`
**Figma:** Node 3304-1451

### API calls
```javascript
const [supervisorsRes, consultationsRes] = await Promise.allSettled([
  api.get('/student/thesis/supervisors'),
  api.get('/student/thesis/consultations'),
]);
const supervisors = supervisorsRes.value?.data?.data ?? [];
const consultations = consultationsRes.value?.data?.data ?? [];
```

### Layout

**Header:**
```
Breadcrumb: 🏠 Beranda › Bimbingan › Monitoring
H1: "Monitoring Bimbingan Tugas Akhir"  font-bold text-[30px] text-[#015023]
p:  "Pantau progress bimbingan dan jadwal pertemuan dengan dosen pembimbing"
```

### Section A: Dosen Pembimbing
```
Card: bg-white rounded-[16px] shadow-sm p-[24px]
"Dosen Pembimbing"  font-bold text-[18px] text-[#015023]

Jika ada supervisor:
  Per supervisor (dari supervisors array):
    Avatar circle bg-[#015023] size-[52px] + initials
    Nama dosen       font-bold text-[16px] text-[#015023]
    Judul TA         "Judul TA: {thesis.title_ind}"  text-[14px] text-[#4a5565]
    Email dosen      text-[14px] text-[#dabc4e] (clickable mailto:)

Jika belum ada supervisor:
  Empty state: 👤 icon + "Belum ada dosen pembimbing"
  Sub: "Ajukan permintaan bimbingan terlebih dahulu"
  Tombol: "Ajukan Bimbingan" → /bimbingan/pengajuan-ta
```

### Section B: Jadwal Bimbingan
**Figma:** Header dark green dengan 📅 icon
```
Card header: bg-[#015023] rounded-t-[16px] px-[24px] py-[16px]
  📅 "Jadwal Bimbingan"  text-white font-semibold text-[18px]

Tabel dalam card (bg-white rounded-b-[16px]):
  Header: Tanggal | Waktu | Tempat | Topik | Status
  Font header: text-[14px] text-[#6a7282]
  Border: border-b border-[#f3f4f6]

  Rows dari consultations yang punya start_time/end_time:
    - Tanggal: consultation_date → "DD MMM YYYY"
    - Waktu: "{start_time} - {end_time}"
    - Tempat: 📍 location (atau "–" jika kosong)
    - Topik: subject
    - Status badge:
        on_going + future date → "Akan Datang" (kuning)
        finished              → "Selesai" (hijau)
        on_going + past date  → "Selesai" (hijau)

  Sort: descending by consultation_date (terbaru dulu)

  Jika kosong:
    Empty: "Belum ada jadwal bimbingan"
```

### Section C: Riwayat Catatan Bimbingan
**Figma:** Timeline dengan garis hijau kiri
```
Card: bg-white rounded-[16px] shadow-sm p-[24px]
"Riwayat Catatan Bimbingan"  font-bold text-[18px] text-[#015023]

Timeline (dari consultations):
  Garis vertikal: bg-[#015023] w-[2px] ml-[8px]
  
  Per item:
    ● dot: bg-[#015023] size-[16px] rounded-full (gantung di kiri garis)
    📅 tanggal: text-[14px] text-[#6a7282]
    Subject: font-bold text-[16px] text-[#1f2937] (heading)
    Catatan dosen: text-[14px] text-[#4a5565] (lecturer_notes)
    
    Jika ada next_task:
      Task box: bg-[#e6eee9] rounded-[8px] px-[12px] py-[8px]
        📝 "Tugas selanjutnya: {next_task}"  text-[13px] text-[#1f2937]
    
    Footer: "Oleh: Dosen"  text-[12px] text-[#dabc4e] font-medium
    
    Progress bar (jika progress > 0):
      "Progress: {N}%"
      bar: bg-[#e6eee9] h-[6px] rounded-full
      fill: bg-[#015023] width-[{N}%]

  Sort: descending (terbaru dulu)
  
  Jika kosong:
    Empty state: 📋 icon + "Belum ada catatan bimbingan"
    Sub: "Catatan akan muncul setelah dosen menambahkan hasil konsultasi"
```

### State: Belum Ada TA (mahasiswa belum mengajukan)
```
Jika GET /student/thesis → data null:
  Tampilkan full-page empty state:
    Illustration/Icon
    "Anda belum mengajukan Tugas Akhir"
    "Mulai dengan mengajukan proposal TA atau memilih judul dari dosen"
    
    2 tombol:
    [+ Buat Pengajuan Mandiri] → /bimbingan/pengajuan-ta
    [📋 Galeri Judul Dosen]    → /bimbingan/galeri-judul
```

---

## HALAMAN 5: Detail Judul (dari Galeri) dengan Modal Konfirmasi
Sudah dicakup di Halaman 3. Modal adalah komponen yang muncul di atas halaman detail.

---

## KOMPONEN SHARED YANG PERLU DIBUAT

### `StatusBadgeMahasiswa` (`src/components/ui/status-badge-mahasiswa.jsx`)
```jsx
// Untuk status pengajuan dosen (thesis_lecturer.status):
const STATUS = {
  pending:  { label: 'Diproses',  bg: '#fef9ec', border: '#fde68a', text: '#b45309', dot: '#f59e0b' },
  accepted: { label: 'Approved',  bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', dot: '#10b981' },
  rejected: { label: 'Ditolak',   bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' },
};

// Untuk status jadwal/konsultasi:
// on_going+future  → 'Akan Datang' (kuning)
// finished/past    → 'Selesai'     (hijau)

// Semua badge: rounded-full px-[8px] py-[4px] border-[0.8px] flex items-center gap-[6px]
// Dot: size-[6px] rounded-full
```

### `CategoryBadge` (untuk Galeri dan Detail)
```jsx
// bg-[#e6f4ea] text-[#015023] rounded-full px-[12px] py-[4px]
// dot icon + category.name  font-semibold text-[12px]
```

### `TopicCard` (`src/components/bimbingan/topic-card.jsx`)
```jsx
// Reusable card untuk Galeri dan halaman lainnya
// Props: topic, onLihatDetail, onAjukan
// Design dari Figma NavCardJudulTa
```

### `ConfirmAjukanModal` (`src/components/bimbingan/confirm-ajukan-modal.jsx`)
```jsx
// Props: topic, onConfirm, onCancel, loading
// Overlay modal konfirmasi pengajuan bimbingan dari galeri
```

---

## NAVIGASI ANTAR HALAMAN (FLOW TOMBOL)

```
Navbar Bimbingan ▾
  ├── Pengajuan TA ──────────→ /bimbingan/pengajuan-ta
  ├── Galeri Judul TA ───────→ /bimbingan/galeri-judul
  └── Monitoring ────────────→ /bimbingan/monitoring

/bimbingan/pengajuan-ta
  ├── "Buat Pengajuan" btn ──→ tampilkan form (toggle state)
  ├── Submit form ───────────→ POST /student/thesis → POST requests → reload
  └── "Lihat Monitoring" ───→ /bimbingan/monitoring

/bimbingan/galeri-judul
  ├── [Lihat Detail] card ───→ /bimbingan/galeri-judul/{id}
  └── [Ajukan Bimbingan] ───→ buka ConfirmModal

/bimbingan/galeri-judul/[id]
  ├── "← Kembali ke Galeri" →  /bimbingan/galeri-judul
  ├── [Ajukan Bimbingan] ───→ buka ConfirmModal
  └── Modal [Konfirmasi] ───→ POST /student/thesis/topics/{id}/select
                               → success → /bimbingan/pengajuan-ta

/bimbingan/monitoring
  ├── [Ajukan Bimbingan] ───→ /bimbingan/pengajuan-ta  (jika belum ada TA)
  └── [Galeri Judul] btn ───→ /bimbingan/galeri-judul  (jika belum ada TA)
```

---

## API ENDPOINTS REFERENSI (MAHASISWA)

```javascript
// GET /student/thesis               → cek apakah sudah ada TA + data TA
// GET /student/thesis/lecturers     → daftar dosen untuk select
// POST /student/thesis              → buat pengajuan TA mandiri (multipart)
// POST /student/thesis/{id}/request-lecturer  → kirim request ke dosen
// GET /student/thesis/requests      → riwayat semua request ke dosen
// GET /student/thesis/topics        → galeri judul dari dosen (params: my_program, search)
// GET /student/thesis/topics/{id}   → detail 1 judul
// POST /student/thesis/topics/{topicId}/select → pilih topik dari dosen
// GET /student/thesis/supervisors   → dosen yang sudah disetujui
// GET /student/thesis/consultations → riwayat konsultasi (params: status)
// GET /student/thesis/categories    → kategori untuk filter galeri
```

---

## ERROR HANDLING

```javascript
// Pattern standar untuk semua halaman:
try {
  const res = await api.get('/student/thesis');
  setData(res.data?.data);
} catch (err) {
  if (err?.response?.status === 401) {
    // Auth context will handle redirect to login
    return;
  }
  if (err?.response?.status === 404) {
    setData(null); // Empty state
    return;
  }
  // Network error — tampilkan toast, jangan crash halaman
  console.warn('API error:', err?.response?.status, err?.message?.slice(0, 50));
  setData(null);
}

// Untuk form submission, tampilkan error ke user:
const message = err?.response?.data?.message 
  || err?.response?.data?.errors 
  || 'Terjadi kesalahan, coba lagi.';
// Toast error dengan message tersebut
```

---

## LOADING STATES

```jsx
// Page loading: spinner di tengah atau skeleton
// Form submit: button disabled + "Menyimpan..." text
// Card skeleton:
<div className="bg-white rounded-[16px] p-[24px] animate-pulse">
  <div className="h-6 bg-gray-100 rounded w-1/3 mb-3" />
  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
  <div className="h-4 bg-gray-100 rounded w-2/3" />
</div>
```

---

## TOAST NOTIFICATIONS

```javascript
// Gunakan toast library yang sudah ada di proyek (react-hot-toast atau sonner)
// Sukses: toast.success("Pesan sukses")
// Error: toast.error("Pesan error")
// Info: toast("Pesan info")

// Contoh penggunaan:
toast.success('Pengajuan berhasil dikirim!');
toast.error('Gagal mengirim: ' + message);
```

---

*Prompt implementasi selesai. 7 halaman mahasiswa untuk modul bimbingan TA.*
*Semua navigasi dan API sudah terhubung end-to-end.*
