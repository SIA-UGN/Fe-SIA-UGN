# Implementasi Lengkap Modul Bimbingan TA — Frontend

## Deskripsi

Implementasi penuh frontend modul Bimbingan TA agar semua halaman berfungsi sepenuhnya tanpa error. Mencakup perbaikan halaman yang sudah ada, pembuatan halaman yang belum ada, dan restrukturisasi folder agar lebih rapi.

## Analisis Status Saat Ini

### ✅ File yang SUDAH ADA dan Benar (TIDAK perlu diubah)
| File | Status |
|------|--------|
| `features/bimbingan-ta/api/student.ts` | ✅ Final |
| `features/bimbingan-ta/api/lecturer.ts` | ✅ Final |
| `features/bimbingan-ta/api/admin.ts` | ✅ Final |
| `features/bimbingan-ta/api/common.ts` | ✅ Final |
| `features/bimbingan-ta/types.ts` | ✅ Final |
| `features/bimbingan-ta/utils.ts` | ✅ Final |
| `features/bimbingan-ta/components/*.tsx` (12 files) | ✅ Final |
| `features/bimbingan-ta/components/forms/*.tsx` (5 files) | ✅ Final |

### ✅ Halaman yang SUDAH ADA dan Berfungsi
| Halaman | File | Status |
|---------|------|--------|
| Dashboard Mahasiswa | `bimbingan-ta/mahasiswa/page.tsx` | ✅ |
| Pengajuan TA | `bimbingan-ta/mahasiswa/pengajuan/page.tsx` | ✅ |
| Galeri Topik | `bimbingan-ta/mahasiswa/topik/page.tsx` | ✅ |
| Detail Topik + Pilih | `bimbingan-ta/mahasiswa/topik/[id]/page.tsx` | ✅ |
| Monitoring Mahasiswa | `bimbingan-ta/mahasiswa/monitoring/page.tsx` | ✅ |
| Kategori (readonly) | `bimbingan-ta/mahasiswa/kategori/page.tsx` | ✅ |
| Dashboard Dosen | `bimbingan-ta/dosen/page.tsx` | ✅ |
| Detail Topik Dosen | `bimbingan-ta/dosen/topik/[id]/page.tsx` | ✅ |
| Edit Topik Dosen | `bimbingan-ta/dosen/topik/[id]/edit/page.tsx` | ✅ |
| Tambah Konsultasi | `bimbingan-ta/dosen/konsultasi/tambah/page.tsx` | ✅ |
| Edit Konsultasi | `bimbingan-ta/dosen/konsultasi/[id]/edit/page.tsx` | ✅ |
| Root Redirect | `bimbingan-ta/page.tsx` | ✅ |

### ⚠️ Halaman yang SUDAH ADA tapi Perlu Review/Fix
| Halaman | File | Masalah |
|---------|------|---------|
| List Topik Dosen | `bimbingan-ta/dosen/topik/page.tsx` | Perlu review status filter & action buttons |
| Tambah Topik Dosen | `bimbingan-ta/dosen/topik/tambah/page.tsx` | Perlu review guard |
| List Permintaan Dosen | `bimbingan-ta/dosen/permintaan/page.tsx` | Perlu review status filter |
| Detail Permintaan | `bimbingan-ta/dosen/permintaan/[id]/page.tsx` | Perlu review approve/reject |
| Monitoring Dosen | `bimbingan-ta/dosen/bimbingan/page.tsx` | Perlu review konsultasi list |
| Kategori Dosen | `bimbingan-ta/dosen/kategori/page.tsx` | Perlu review CRUD modal |
| Admin Dashboard | `admin/bimbingan/page.jsx` | ✅ Sudah ada |
| Admin Kelola User | `admin/bimbingan/kelola-data-user/page.jsx` | Perlu review |
| Admin Monitoring | `admin/bimbingan/monitoring-pengajuan/page.jsx` | Perlu review |
| Admin Detail | `admin/bimbingan/monitoring-pengajuan/[id]/page.jsx` | Perlu review |
| Admin Semua | `admin/bimbingan/semua-pengajuan/page.jsx` | Perlu review |

### ⚠️ Hooks yang Perlu Diperiksa
| Hook | Status |
|------|--------|
| `useAjukanTA.ts` | ✅ Sudah direfactor, API benar |
| `useRiwayatTA.ts` | ✅ Sudah direfactor → `useCurrentThesis()` |

### 🗑️ Folder Lama (deprecated)
| Folder | Status |
|--------|--------|
| `src/app/bimbingan/` | ⚠️ DEPRECATED — berisi galeri-judul, monitoring, pengajuan-ta |

---

## Proposed Changes

### Fase 1 — Review & Fix Halaman Dosen yang Sudah Ada

Review setiap halaman dosen yang sudah ada, fix issue yang ditemukan:

---

#### [REVIEW] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/dosen/topik/page.tsx) — List Topik (B6)
- Review: Status filter tabs, action buttons per status (draft→edit/publish/delete, available→archive, taken→archive, archived→readonly)
- Pastikan konfirmasi dialog untuk publish/archive/delete
- Fix jika ada error handling yang kurang

#### [REVIEW] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/dosen/topik/tambah/page.tsx) — Form Buat Topik (B7)
- Review: program auto-select, category dropdown, quota input
- Pastikan guard dan redirect

#### [REVIEW] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/dosen/permintaan/page.tsx) — List Permintaan (B11)
- Review: Filter tab status (Semua/Menunggu/Disetujui/Ditolak)
- Tampilan student info, truncated note

#### [REVIEW] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/dosen/permintaan/%5Bid%5D/page.tsx) — Detail Permintaan (B12)
- Review: Approve/reject actions, rejection modal, 422 error handling
- Status guard (hanya pending yang bisa diaction)

#### [REVIEW] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/dosen/bimbingan/page.tsx) — Monitoring Bimbingan (B13)
- Review: Supervisee cards, konsultasi list, tombol tambah/edit konsultasi

#### [REVIEW] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/dosen/kategori/page.tsx) — Kategori CRUD (B10)
- Review: Modal tambah/edit, delete confirmation, inline form

---

### Fase 2 — Review & Fix Halaman Admin

#### [REVIEW] [page.jsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/admin/bimbingan/kelola-data-user/page.jsx) — Kelola Data User (B16)
- Review: Tab Mahasiswa/Dosen, pagination, click-to-detail navigation

#### [REVIEW] [page.jsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/admin/bimbingan/monitoring-pengajuan/page.jsx) — Monitoring Pengajuan (B17)
- Review: Tabel, filter status, pagination, click-to-detail

#### [REVIEW] [page.jsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/admin/bimbingan/monitoring-pengajuan/%5Bid%5D/page.jsx) — Detail Pengajuan (B18)
- Review: Full detail view, timeline, konsultasi list

#### [REVIEW] [page.jsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/admin/bimbingan/semua-pengajuan/page.jsx) — Semua Pengajuan (B19)
- Review: Card grid view, pagination, navigation

---

### Fase 3 — Monitoring Mahasiswa — Fix Button Labels

#### [MODIFY] [page.tsx](file:///c:/Users/OMEN/Documents/SMT%204/Fe-SIA-UGN/src/app/bimbingan-ta/mahasiswa/monitoring/page.tsx)
- Fix status filter button labels: "on_going" → "Berjalan", "finished" → "Selesai"

---

### Fase 4 — Restrukturisasi Folder

#### Remove deprecated `src/app/bimbingan/` folder
- Folder lama yang tidak digunakan lagi harus dihapus atau di-redirect

---

## Verification Plan

### Automated Tests
- Build check: `npm run build` setelah semua perubahan
- Run dev server dan cek setiap route tanpa error

### Manual Verification
- Test setiap halaman: navigasi, loading state, error state, empty state
- Verifikasi tidak ada import error atau missing component

> [!IMPORTANT]
> Sebelum membuat perubahan, saya perlu membaca semua 6 halaman dosen dan 4 halaman admin yang sudah ada untuk menentukan apa yang sebenarnya perlu di-fix. Setelah review, saya akan update plan ini dengan perubahan spesifik.

## Urutan Pelaksanaan

1. **Baca semua halaman** yang sudah ada untuk audit lengkap
2. **Fix halaman** yang memiliki issue/bug
3. **Fix monitoring button labels** (quick fix)
4. **Restructure folder** — redirect/hapus folder lama
5. **Build test** untuk verifikasi
