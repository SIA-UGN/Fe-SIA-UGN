# 📚 PROMPT IMPLEMENTASI — Modul Bimbingan TA (Role: Dosen)
## 3 Halaman + 4 Modal Overlay + Navbar Dosen

---

## STACK & ATURAN UMUM

```
Framework  : Next.js 14 App Router (JavaScript, bukan TypeScript)
Styling    : Tailwind CSS
API client : src/lib/axios.js  (baseURL = '/backend', proxy ke backend)
Auth       : useAuth() dari @/lib/auth-context → { user }
Font       : Urbanist (semua elemen)
```

### Design Tokens (WAJIB pakai di semua halaman)
```
Page background  : bg-[#e6eee9]
Primary dark     : #015023
Primary light    : #E6EEE9
Secondary gold   : #DABC4E
Secondary light  : #FBF8ED

Navbar           : bg-[#015023] rounded-bl-[18px] rounded-br-[18px] px-[100px] py-[12px]
Card standar     : bg-white rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]
Card large       : bg-white rounded-[20px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]
Page padding     : px-[112px] py-[32px]

Input field      : bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] px-[12px] py-[4px] h-[36px]
Textarea field   : bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] px-[12px] py-[8px] min-h-[64px]
Button primary   : bg-[#015023] text-white rounded-[8px] px-[16px] py-[8px] font-semibold text-[14px]
Button outline   : bg-white border-[#d1d5dc] border-[0.8px] text-[#0a0a0a] rounded-[8px] px-[16px] py-[8px]
Button danger    : bg-[#ef4444] text-white rounded-[8px] px-[16px] py-[8px] font-semibold text-[14px]

Status badges:
  Published/available : bg-[#015023] text-white px-[10px] py-[4px] rounded-[6px] font-semibold text-[12px]
                        → dot hijau + "Published"
  Draft               : bg-[#f3f4f6] text-[#6a7282] px-[10px] py-[4px] rounded-[6px]
                        → dot abu + "Draft"
  Menunggu Review     : bg-[#fef9ec] border-[#fde68a] text-[#b45309] dot-[#f59e0b]
  Disetujui/Approved  : bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46] dot-[#10b981]
  Ditolak             : bg-[#fef2f2] border-[#fecaca] text-[#991b1b] dot-[#ef4444]
```

---

## NAVBAR DOSEN (Figma node 3077-5208 + 3080-5807)

Navbar ini adalah `navigation-menu-dosen.jsx` yang sudah dibuat sebelumnya.
Pastikan dropdown **Bimbingan** berisi 3 item:
```
Bimbingan ▾  (text-[#dabc4e] saat di halaman bimbingan, text-[#fbf8ed] lainnya)
├── 📖 Kelola Judul TA      → /bimbingan/kelola-judul
├── ✅ Validasi Pengajuan   → /bimbingan/validasi-pengajuan  (+ badge merah pending count)
└── 🖥  Monitoring Bimbingan → /bimbingan/monitoring
```
Icon: Kelola=octicon:book-24, Validasi=fluent:clipboard-task-16-regular, Monitoring=majesticons:monitor-line
Active item text: `text-[#dabc4e]`, Inactive: `text-[#e6eee9]`
Selalu load pending count dari `GET /lecturer/thesis/requests?status=pending` tiap 2 menit.

---

## STRUKTUR FILE

```
src/app/
└── (dosen)/
    └── bimbingan/
        ├── kelola-judul/
        │   └── page.jsx              ← HALAMAN 1: Kelola Judul TA
        ├── validasi-pengajuan/
        │   └── page.jsx              ← HALAMAN 2: Validasi Pengajuan
        └── monitoring/
            └── page.jsx              ← HALAMAN 3: Monitoring Bimbingan (2-panel)
```

---

## HALAMAN 1: Kelola Judul Tugas Akhir
**File:** `src/app/(dosen)/bimbingan/kelola-judul/page.jsx`
**Route:** `/bimbingan/kelola-judul`
**Figma:** Node 3077-5208 (page) + 3304-1395 (overlay modal)

### API calls
```javascript
// Pada mount, gunakan Promise.allSettled:
const [topicsRes, categoriesRes] = await Promise.allSettled([
  api.get('/lecturer/thesis/topics'),
  api.get('/lecturer/thesis/categories'),
]);
const topics = topicsRes.value?.data?.data ?? [];
const categories = categoriesRes.value?.data?.data ?? [];
```

### Layout

**Breadcrumb:**
```
🏠 Beranda › Bimbingan › Kelola Judul TA
Active: text-[#015023] font-semibold text-[14px]
Inactive: text-[#6a7282] font-medium text-[14px]
```

**Header:**
```
H1: "Kelola Judul Tugas Akhir"   font-bold text-[30px] text-[#015023]
p:  "Tambah, edit, dan kelola judul-judul tugas akhir yang Anda tawarkan kepada mahasiswa"
    text-[15px] text-[#6a7282]
```

**Search + Tambah bar:**
```
Card: bg-white rounded-[14px] shadow-sm px-[24px] py-[24px]

Kiri — Search:
  bg-white border border-[#e5e7eb] rounded-[10px] px-[12px] py-[8px]
  🔍 icon + "Cari judul atau nama dosen..." placeholder
  Debounce 300ms → filter topics secara lokal

Kanan — Tombol:
  bg-[#015023] text-white rounded-[8px] px-[16px] py-[10px]
  ⊕ "Tambah Judul Baru"
  → onClick: buka AddTopicModal (state tambah)
```

**Tabel topics:**
```
Card: bg-white rounded-[14px] shadow-sm overflow-hidden

Header row (border-b border-[#f3f4f6]):
  Kolom: Judul | Kategori | Kuota | Status | Aksi
  font-medium text-[14px] text-[#6a7282] px-[8px] py-[10px]

Data rows (border-b border-[#f3f4f6] hover:bg-[#fafafa]):
  Judul (lebar):
    - title_ind  font-medium text-[14px] text-[#1f2937] (klik untuk lihat detail)
    - description (2 baris, text-[13px] text-[#6a7282] line-clamp-1)

  Kategori:
    - Badge: bg-[#e6f4ea] text-[#015023] rounded-[20px] px-[10px] py-[3px] text-[12px] font-semibold
    - Nama kategori atau "–" jika tidak ada

  Kuota:
    - "{0} / {topic.quota}"  font-medium text-[14px] text-center

  Status:
    - published/available :
        bg-[#015023] text-white rounded-[6px] px-[10px] py-[3px] text-[12px] font-semibold
        ● dot hijau + "Published"
    - draft :
        bg-[#f3f4f6] text-[#6a7282] rounded-[6px] px-[10px] py-[3px] text-[12px]
        ● dot abu + "Draft"
    - taken :
        bg-[#dbeafe] text-[#1e40af] rounded-[6px] px-[10px] py-[3px] text-[12px]
        "Penuh"
    - archived :
        bg-[#fef2f2] text-[#991b1b] rounded-[6px] px-[10px] py-[3px] text-[12px]
        "Diarsipkan"

  Aksi (flex gap-[4px]):
    ✏️ Edit icon button (bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-[6px] size-[32px])
       - Hanya aktif jika status = 'draft'
       - Disabled + opacity-40 jika bukan draft
       - onClick → buka AddTopicModal dalam mode edit, prefill form dengan data topic
    
    🗑 Delete icon button (bg-[#fef2f2] hover:bg-[#fecaca] text-[#ef4444] rounded-[6px] size-[32px])
       - Hanya aktif jika status = 'draft'
       - onClick → konfirmasi alert/dialog sederhana → DELETE /lecturer/thesis/topics/{id}
    
    [Action button tambahan per status]:
       - Jika draft: tombol kecil "Publish" (text-[#015023] font-medium text-[12px])
         → onClick → PATCH /lecturer/thesis/topics/{id}/publish → refetch
       - Jika available: tombol kecil "Arsipkan"
         → onClick → PATCH /lecturer/thesis/topics/{id}/archive → refetch

Empty state (jika topics kosong):
  Icon + "Belum ada judul TA"
  Sub: "Mulai tambahkan judul tugas akhir untuk ditawarkan ke mahasiswa"
  Tombol: [+ Tambah Judul Pertama] → buka AddTopicModal
```

### Modal: Tambah / Edit Judul TA (Figma node 3304-1395)
```
Overlay: fixed inset-0 bg-black/50 z-50 flex items-center justify-center

Modal card: bg-white rounded-[10px] shadow-[0px_10px_15px...] w-[600px] p-[24px]

Header:
  H2: "Tambah Judul TA Baru" / "Edit Judul TA"   font-bold text-[18px] text-[#015023]
  p:  "Tambahkan judul tugas akhir baru untuk mahasiswa"  text-[14px] text-[#717182]
  X button kanan atas: opacity-70 hover:opacity-100

Form fields (flex flex-col gap-[16px] mt-[16px]):

1. Judul *
   label: font-semibold text-[14px] text-[#015023] + "*" text-[#fb2c36]
   input: bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] h-[36px] px-[12px]
   placeholder: "Masukkan judul tugas akhir"
   FIELD INI ADALAH title_ind (Bahasa Indonesia)

2. Kategori *
   label: font-semibold text-[14px] text-[#015023]
   Select dropdown: bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] h-[36px]
   Populate dari categories (GET /lecturer/thesis/categories)
   ChevronDown icon kanan
   value: id_thesis_category

3. Deskripsi *
   label: font-semibold text-[14px] text-[#015023]
   textarea: bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] min-h-[64px] px-[12px] py-[8px]
   placeholder: "Jelaskan detail penelitian, tujuan, dan metodologi"

4. Row 2 kolom (gap-[16px]):
   Kiri — Kuota Mahasiswa:
     label: font-semibold text-[14px] text-[#015023]
     input type=number: min=1 default=1
   
   Kanan — Status:
     label: font-semibold text-[14px] text-[#015023]
     Select: "Draft" | "Available"
     bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] h-[36px]

Footer (flex justify-end gap-[8px] mt-[24px]):
  [Batal]   → bg-white border-[#d1d5dc] text-[#0a0a0a] rounded-[8px] px-[16px] py-[8px]
  [Simpan]  → bg-[#015023] text-white rounded-[8px] px-[16px] py-[8px] font-semibold

API call:
  Mode tambah: POST /lecturer/thesis/topics
  Body JSON: { topic: title_ind, title_ind, title_eng: "", description, quota, id_program: user.id_program }
  
  Mode edit: PUT /lecturer/thesis/topics/{id}
  Body JSON: sama (semua optional)

  Catatan field API:
  - "topic"       : bidang/area penelitian (ringkas dari judul)
  - "title_ind"   : judul lengkap Indonesia (dari input Judul)
  - "title_eng"   : judul Inggris (opsional, bisa kosong string)
  - "description" : dari textarea
  - "quota"       : dari input kuota
  - "id_program"  : dari user profile (auth context)
  - "id_thesis_category" : dari select kategori (nullable)

  Success → tutup modal + refetch topics + toast sukses
  Error   → toast error dengan message API
```

---

## HALAMAN 2: Validasi Pengajuan Tugas Akhir
**File:** `src/app/(dosen)/bimbingan/validasi-pengajuan/page.jsx`
**Route:** `/bimbingan/validasi-pengajuan`
**Figma:** Node 3080-5807 (page)

### API calls
```javascript
const res = await api.get('/lecturer/thesis/requests');
// Fetch ulang setiap kali approve/reject
```

### Layout

**Breadcrumb:**
```
🏠 Beranda › Bimbingan › Validasi Pengajuan
```

**Header:**
```
H1: "Validasi Pengajuan Tugas Akhir"  font-bold text-[30px] text-[#015023]
p:  "Review dan setujui atau tolak pengajuan tugas akhir dari mahasiswa"
```

**3 Stat Cards** (grid 3 kolom, gap-[16px]):
```
Card 1 — Menunggu Review:
  Value: requests.filter(r => r.status === 'pending').length
  Label: "Menunggu Review"
  Icon: clipboard icon  bg-[#fff3cd] size-[56px] rounded-[12px] (icon kuning)
  bg-white rounded-[14px] shadow-sm p-[24px]
  Value font-bold text-[36px] text-[#1f2937]
  Label text-[14px] text-[#6a7282]

Card 2 — Disetujui:
  Value: requests.filter(r => r.status === 'accepted').length
  Icon: checkmark circle  bg-[#dcfce7] (icon hijau)

Card 3 — Ditolak:
  Value: requests.filter(r => r.status === 'rejected').length
  Icon: X circle  bg-[#fee2e2] (icon merah)
```

**Section: Pengajuan Menunggu Review ({N})**
```
H2: "Pengajuan Menunggu Review ({pendingCount})"  font-bold text-[18px] text-[#015023]
Hanya tampilkan request dengan status = 'pending'

Per request card (bg-white rounded-[14px] shadow-sm p-[24px] mb-[16px]):

  Kiri (flex-1):
    Row 1 — Info mahasiswa:
      Avatar circle: bg-[#015023] size-[48px] rounded-full + initials (2 huruf dari nama)
      Nama mahasiswa: font-semibold text-[16px] text-[#1f2937]
      NIM: "NIM: {student.username}"  text-[14px] text-[#6a7282]

    H3 (judul TA):
      title_ind  font-bold text-[18px] text-[#015023]  mt-[12px]

    Deskripsi:
      description  text-[14px] text-[#4a5565] line-clamp-2  mt-[8px]

    Meta row (flex gap-[24px] mt-[12px]):
      📎 filename + ukuran  text-[13px] text-[#6a7282]
         Jika attachment_proposal ada:
           nama file = "Proposal_{NamaDepan}_TA.pdf"
           → klik = buka URL backend + attachment_proposal
      📅 tanggal created_at → "DD MMM YYYY"  text-[13px] text-[#6a7282]
    
    Jika ada student_note:
      Box: bg-[#f0fdf4] border-l-4 border-[#015023] rounded-r-[8px] p-[12px] mt-[8px]
      💬 "{student_note}"  text-[13px] text-[#4a5565] italic

  Kanan (flex-col gap-[8px] w-[160px] shrink-0):
    [↓ Download]  bg-white border border-[#e5e7eb] text-[#374151] rounded-[8px] py-[10px] w-full
                  → onClick: window.open(backend_url + '/' + attachment_proposal)
                  → Disabled + text-gray-300 jika tidak ada attachment
    
    [✓ Approve]   bg-[#015023] text-white rounded-[8px] py-[10px] w-full font-semibold
                  → onClick: handleApprove(request.id_thesis_lecturer)
    
    [✗ Reject]    bg-[#ef4444] text-white rounded-[8px] py-[10px] w-full font-semibold
                  → onClick: buka RejectModal(request)
```

**Approve flow:**
```javascript
async function handleApprove(id) {
  try {
    setLoadingId(id);
    await api.patch(`/lecturer/thesis/requests/${id}/approve`);
    toast.success('Pengajuan berhasil disetujui');
    // Refresh requests
    fetchRequests();
  } catch (err) {
    const msg = err?.response?.data?.message || 'Gagal menyetujui';
    // Handle 422 "Mahasiswa sudah memiliki 2 dosen pembimbing"
    toast.error(msg);
  } finally {
    setLoadingId(null);
  }
}
```

**RejectModal (inline state, bukan file terpisah):**
```
Modal card: bg-white rounded-[12px] shadow-xl w-[480px] p-[24px]

Title: "Tolak Pengajuan"  font-bold text-[18px]
Sub: nama mahasiswa + judul TA (truncate)

Textarea:
  label: "Alasan Penolakan *"  font-semibold text-[14px] text-[#015023]
  textarea: border-[#d1d5dc] border-[0.8px] rounded-[8px] min-h-[100px] px-[12px] py-[8px]
  placeholder: "Tuliskan alasan penolakan untuk mahasiswa..."
  required: true

Footer:
  [Batal]   → tutup modal
  [Tolak Pengajuan] → bg-[#ef4444] text-white

API: PATCH /lecturer/thesis/requests/{id}/reject
Body: { rejection_note: alasanText }
Error: validasi — rejection_note required (tampilkan border merah + pesan)
```

**Section: Riwayat (opsional)**
```
Jika ada request accepted/rejected:
  Toggle button: "Lihat Riwayat Pengajuan"
  → tampilkan/sembunyikan list accepted + rejected dengan status badge

Empty state (jika tidak ada request):
  Icon clipboard + "Belum ada pengajuan masuk"
  Sub: "Pengajuan dari mahasiswa akan muncul di sini"
```

---

## HALAMAN 3: Monitoring Bimbingan
**File:** `src/app/(dosen)/bimbingan/monitoring/page.jsx`
**Route:** `/bimbingan/monitoring`
**Figma:** Node 3086-6336 (2-panel layout) + 3108-8184 (modal catatan) + 3108-8511 (modal jadwal)

### API calls
```javascript
const supervisees = await api.get('/lecturer/thesis/supervisees');
// supervisees.data.data = array of supervisor records
// Setiap item punya: student_thesis (+ student, program), consultations[]

// Ketika klik mahasiswa di panel kiri, tampilkan detail di panel kanan
// Consultations sudah include dalam supervisees, tidak perlu fetch ulang
```

### Layout: 2-Panel

**Breadcrumb:**
```
🏠 Beranda › Bimbingan › Monitoring Bimbingan
```

**Header:**
```
H1: "Monitoring Bimbingan Tugas Akhir"  font-bold text-[30px] text-[#015023]
p:  "Kelola catatan bimbingan dan jadwal konsultasi mahasiswa bimbingan"
```

**Main area: flex gap-[24px]**

---

### Panel Kiri (w-[400px] shrink-0)
```
Card: bg-white rounded-[16px] shadow-sm p-[24px]

H2: "Mahasiswa Bimbingan"  font-bold text-[18px] text-[#015023]

Search:
  bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] px-[12px] py-[8px]
  🔍 "Cari nama/NIM..."
  Filter lokal dari supervisees array

Per mahasiswa card (cursor-pointer, border-b border-[#f3f4f6]):
  bg-[#f0fdf4] border-[2px] border-[#015023] saat terpilih (selected)
  bg-white border-transparent saat tidak terpilih
  rounded-[10px] p-[16px] mb-[8px] hover:bg-[#f9fafb]

  Layout per card:
    Avatar circle: bg-[#6a7282] size-[40px] rounded-full + initials
    Nama: font-semibold text-[15px] text-[#1f2937]
    NIM + Semester: text-[13px] text-[#6a7282]
    Progress bar + persentase:
      Track: bg-[#e5e7eb] h-[6px] rounded-full w-full
      Fill:  bg-[#015023] h-[6px] rounded-full width={progress%}
      "{progress}%" text-[12px] text-[#6a7282] text-right

  Progress calculation:
    Ambil dari consultation terakhir → progress field (0-100)
    Jika tidak ada consultation → 0

Empty state panel kiri:
  "Belum ada mahasiswa bimbingan"
```

---

### Panel Kanan (flex-1)

**Jika belum ada mahasiswa dipilih:**
```
Empty state center:
  Icon graduation + "Pilih mahasiswa dari daftar kiri"
  Sub: "Klik nama mahasiswa untuk melihat detail bimbingan"
```

**Jika ada mahasiswa dipilih (selectedSupervisee):**

```
Section 1 — Info Mahasiswa (Card bg-[#015023] rounded-[16px] p-[24px]):
  
  Layout: flex gap-[16px]
  
  Avatar: bg-[#dabc4e] size-[64px] rounded-full + initials font-bold text-[24px]
  
  Kanan:
    Nama: font-bold text-[22px] text-white
    NIM · Semester: text-[14px] text-white/70
    Progress row: "Progress TA:" + bar + "{N}%"
      bar: bg-white/20 rounded-full, fill: bg-[#dabc4e]
  
  Bawah card (bg-white/10 rounded-[10px] p-[12px] mt-[8px]):
    "Judul Tugas Akhir:"  text-[12px] text-white/60
    {thesis.title_ind}   font-semibold text-[15px] text-white

Section 2 — Action Buttons (2 tombol, gap-[12px]):
  [+ Tambah Catatan]  
    bg-[#015023] text-white rounded-[10px] py-[10px] flex-1
    → onClick: buka AddNoteModal

  [📅 Atur Jadwal]    
    bg-[#dabc4e] text-white rounded-[10px] py-[10px] flex-1
    → onClick: buka ScheduleModal

Section 3 — Riwayat Catatan Bimbingan (Card bg-white rounded-[16px] shadow-sm p-[24px]):
  
  H2: "Riwayat Catatan Bimbingan"  font-bold text-[18px] text-[#015023]
  
  Timeline dari consultations (sort descending by consultation_date):
    Setiap item:
      ● dot: bg-[#015023] size-[14px] rounded-full (kiri garis)
      Garis vertikal: bg-[#d1fae5] w-[2px]
      
      📅 tanggal  text-[13px] text-[#6a7282]
      Subject: font-bold text-[16px] text-[#1f2937]
      
      Catatan (lecturer_notes atau student_notes):
        text-[14px] text-[#4a5565] mt-[4px]
      
      Jika next_task ada:
        Box: bg-[#e6eee9] rounded-[8px] px-[12px] py-[8px] mt-[8px] flex gap-[8px]
        📝 "Tugas selanjutnya: {next_task}"  text-[13px] text-[#1f2937]
      
      "Oleh: Dosen"  text-[12px] text-[#dabc4e] font-medium mt-[4px]
      
      Jika progress > 0:
        "Progress: {progress}%" + mini progress bar  mt-[4px]
  
  Empty state: 💬 icon + "Belum ada catatan bimbingan"

Section 4 — Jadwal Bimbingan (Card bg-[#015023] header, tabel putih):
  
  Card header: bg-[#015023] rounded-t-[14px] px-[24px] py-[16px]
    📅 "Jadwal Bimbingan"  text-white font-semibold text-[18px]
  
  Tabel (bg-white rounded-b-[14px]):
    Header: Tanggal | Waktu | Tempat | Topik | Status
    font-medium text-[13px] text-[#6a7282] border-b border-[#f3f4f6]
    
    Rows dari consultations yang punya start_time:
      - Tanggal: "DD MMM YYYY"
      - Waktu: "{start_time} - {end_time}" atau "–"
      - Tempat: 📍 {location} atau "–"
      - Topik: {subject}
      - Status badge (Akan Datang/Selesai)
    
    Sort: descending
    
    Empty state: "Belum ada jadwal bimbingan"
```

---

### Modal 1: Tambah Catatan Bimbingan (Figma 3108-8184)
```
Overlay: fixed inset-0 bg-black/50 z-50 flex items-center justify-center

Modal: bg-white rounded-[12px] shadow-xl w-[500px] p-[0]

Header (px-[24px] pt-[24px] pb-[16px]):
  H2: "Tambah Catatan Bimbingan"  font-bold text-[18px] text-[#015023]
  p:  "Tambahkan catatan hasil bimbingan untuk {selectedSupervisee.student.name}"
      text-[14px] text-[#717182]
  X button kanan atas

Body (px-[24px] py-[16px] flex flex-col gap-[16px]):

  1. Topik Pembahasan
     label: "Topik Pembahasan"  font-semibold text-[14px] text-[#015023]
     input: bg-[#f3f3f5] border-[#d1d5dc] border-[0.8px] rounded-[8px] h-[36px] px-[12px]
     placeholder: "Contoh: Review BAB 1"
     → field: subject (required)

  2. Catatan
     label: "Catatan"  font-semibold text-[14px] text-[#015023]
     textarea: bg-[#f3f3f5] border-[#d1d5dc] min-h-[64px] px-[12px] py-[8px] rounded-[8px]
     placeholder: "Tuliskan catatan, feedback, dan arahan untuk mahasiswa..."
     → field: lecturer_notes

  3. Tugas Selanjutnya
     label: "Tugas Selanjutnya"  font-semibold text-[14px] text-[#015023]
     textarea: same style min-h-[64px]
     placeholder: "Tuliskan tugas selanjutnya untuk mahasiswa..."
     → field: next_task

Footer (px-[24px] pb-[24px] flex justify-end gap-[8px]):
  [Batal]         → bg-white border-[#d1d5dc] text-[#0a0a0a] rounded-[8px] px-[16px] py-[8px]
  [Simpan Catatan] → bg-[#015023] text-white rounded-[8px] px-[20px] py-[8px] font-semibold

API call:
  POST /lecturer/thesis/consultations (multipart/form-data)
  Body: {
    id_supervisor: selectedSupervisee.id_supervisor,
    consultation_date: new Date().toISOString().split('T')[0],  // hari ini
    subject: topikPembahasan,
    lecturer_notes: catatan,
    next_task: tugasSelanjutnya,
    status: 'on_going',
  }
  
  Success: tutup modal + refresh supervisees + toast "Catatan berhasil ditambahkan"
  Error: toast error
```

---

### Modal 2: Atur Jadwal Bimbingan (Figma 3108-8511)
```
Modal: bg-white rounded-[12px] shadow-xl w-[500px] p-[0]

Header:
  H2: "Atur Jadwal Bimbingan"  font-bold text-[18px] text-[#015023]
  p:  "Buat jadwal bimbingan baru untuk {selectedSupervisee.student.name}"

Body (flex flex-col gap-[16px]):

  1. Tanggal
     label: "Tanggal"  font-semibold
     input type=date: bg-[#f3f3f5] border-[#d1d5dc] rounded-[8px] h-[36px] px-[12px]
     placeholder: "dd/mm/yyyy"

  2. Row 2 kolom:
     Kiri — Waktu Mulai:
       label: "Waktu Mulai"
       input type=time: same style
       placeholder: "-- : --"
     
     Kanan — Waktu Selesai:
       label: "Waktu Selesai"
       input type=time: same style

  3. Topik Pembahasan *
     label: "Topik Pembahasan"  font-semibold
     input: bg-[#f3f3f5] h-[36px] px-[12px] rounded-[8px]
     placeholder: "Contoh: Review BAB 3"
     → field: subject

  4. Lokasi
     label: "Lokasi"
     input: placeholder: "Contoh: Ruang Dosen A.301"
     → field: location

Footer:
  [Batal]         → tutup modal
  [Simpan Jadwal] → bg-[#015023] text-white font-semibold

API call:
  POST /lecturer/thesis/consultations (multipart/form-data)
  Body: {
    id_supervisor: selectedSupervisee.id_supervisor,
    consultation_date: tanggal,     // YYYY-MM-DD
    start_time: waktuMulai,         // HH:mm
    end_time: waktuSelesai,         // HH:mm
    subject: topikPembahasan,
    location: lokasi,
    status: 'on_going',
  }
  
  Validasi: tanggal + subject required
  Success: tutup modal + refresh supervisees + toast "Jadwal berhasil ditambahkan"
```

---

## NAVIGASI ANTAR HALAMAN (FLOW TOMBOL)

```
Navbar Bimbingan ▾
  ├── Kelola Judul TA     ──────────→ /bimbingan/kelola-judul
  ├── Validasi Pengajuan  ──────────→ /bimbingan/validasi-pengajuan
  └── Monitoring Bimbingan ─────────→ /bimbingan/monitoring

/bimbingan/kelola-judul
  ├── "Tambah Judul Baru" btn ──────→ buka AddTopicModal (state: add)
  ├── ✏️ Edit icon ────────────────→ buka AddTopicModal (state: edit, prefill)
  ├── 🗑 Delete icon ──────────────→ konfirmasi → DELETE → refetch
  ├── "Publish" btn per row ───────→ PATCH publish → refetch
  └── "Arsipkan" btn per row ──────→ PATCH archive → refetch

/bimbingan/validasi-pengajuan
  ├── "Approve" btn ───────────────→ PATCH approve → refresh
  ├── "Reject" btn ────────────────→ buka RejectModal → PATCH reject → refresh
  └── "Download" btn ──────────────→ window.open(backend + attachment)

/bimbingan/monitoring
  ├── Klik mahasiswa kiri ─────────→ tampilkan detail di panel kanan
  ├── "Tambah Catatan" ────────────→ buka AddNoteModal
  ├── "Atur Jadwal" ───────────────→ buka ScheduleModal
  └── Modal submit ────────────────→ POST consultations → refresh supervisees
```

---

## API ENDPOINTS REFERENSI (DOSEN)

```javascript
// Topics
GET    /lecturer/thesis/topics                     // list topik dosen
POST   /lecturer/thesis/topics                     // buat topik baru (JSON)
PUT    /lecturer/thesis/topics/{id}                // edit topik (JSON, hanya draft)
DELETE /lecturer/thesis/topics/{id}                // hapus topik (hanya draft)
PATCH  /lecturer/thesis/topics/{id}/publish        // publish draft → available
PATCH  /lecturer/thesis/topics/{id}/archive        // arsipkan available/taken

// Requests (Validasi)
GET    /lecturer/thesis/requests                   // semua request masuk
GET    /lecturer/thesis/requests?status=pending    // filter pending
PATCH  /lecturer/thesis/requests/{id}/approve      // approve request
PATCH  /lecturer/thesis/requests/{id}/reject       // reject (body: {rejection_note})

// Monitoring
GET    /lecturer/thesis/supervisees                // mahasiswa bimbingan + consultations
POST   /lecturer/thesis/consultations              // tambah catatan/jadwal (multipart)
PUT    /lecturer/thesis/consultations/{id}         // update catatan

// Categories
GET    /lecturer/thesis/categories                 // daftar kategori
POST   /lecturer/thesis/categories                 // buat kategori baru
DELETE /lecturer/thesis/categories/{id}            // hapus kategori
```

---

## ERROR HANDLING

```javascript
// Pattern Promise.allSettled untuk semua fetch awal:
const [topicsRes, catRes] = await Promise.allSettled([
  api.get('/lecturer/thesis/topics'),
  api.get('/lecturer/thesis/categories'),
]);

// Handle gracefully:
const topics = topicsRes.status === 'fulfilled'
  ? topicsRes.value?.data?.data ?? []
  : [];

// Error 422 khusus:
// "Topik yang sudah dipublikasikan tidak dapat diubah" → toast warning
// "Mahasiswa sudah memiliki 2 dosen pembimbing" → toast warning (approve)
// "Hanya permintaan berstatus pending yang dapat disetujui" → toast info

// Jangan console.error dengan full error object (menghindari HTML blob log)
```

---

## LOADING & SKELETON

```jsx
// Skeleton row tabel (Halaman 1):
{loading ? (
  [...Array(3)].map((_, i) => (
    <div key={i} className="flex gap-4 p-4 border-b border-[#f3f4f6] animate-pulse">
      <div className="flex-1 h-4 bg-gray-100 rounded" />
      <div className="w-24 h-4 bg-gray-100 rounded" />
      <div className="w-16 h-4 bg-gray-100 rounded" />
    </div>
  ))
) : <TableContent />}

// Skeleton mahasiswa card (Panel Kiri):
{loading ? (
  [...Array(3)].map((_, i) => (
    <div key={i} className="p-4 animate-pulse flex gap-3">
      <div className="size-10 bg-gray-100 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  ))
) : <SuperviseeList />}
```

---

## AVATAR HELPER (sama untuk semua halaman)

```javascript
function getInitials(name) {
  if (!name) return 'D';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
```

---

*Prompt implementasi selesai. 3 halaman dosen + 4 modal overlay.*
*Semua navigasi tombol, API calls, validasi, dan error handling sudah tercover.*
