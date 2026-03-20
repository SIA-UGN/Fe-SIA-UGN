# Detail Nilai Akhir Components

Komponen untuk menampilkan dan mengelola nilai akhir mahasiswa dengan dua perspektif yang berbeda: **Mahasiswa (Read-Only)** dan **Dosen (Input Nilai)**.

## 📁 File Structure

```
src/
├── components/ui/
│   ├── detail-nilai-mahasiswa.jsx  # Tampilan untuk Mahasiswa
│   └── detail-nilai-dosen.jsx      # Tampilan untuk Dosen
└── app/
    └── demo-nilai/
        └── page.js                  # Demo Page (Toggle antara 2 view)
```

## 🎯 Features

### 1. Detail Nilai Mahasiswa (Read-Only)

**File:** `src/components/ui/detail-nilai-mahasiswa.jsx`

#### Fitur:
- ✅ Hanya bisa melihat (read-only)
- ✅ Tabel nilai dengan kolom:
  - No
  - Kode Matkul
  - Mata Kuliah
  - SKS
  - Bobot (A, A-, B+, dll)
  - Nilai (4.00, 3.75, dll)
  - Nilai x SKS
- ✅ Ringkasan IPK:
  - Total SKS
  - Total Nilai x SKS
  - IPK Semester
- ✅ Keterangan bobot nilai lengkap
- ✅ Export PDF button (ready for implementation)
- ✅ Info mahasiswa (NIM, Nama, Prodi)

#### Kolom Tabel:
| No | Kode Matkul | Mata Kuliah | SKS | Bobot | Nilai | Nilai x SKS |
|----|-------------|-------------|-----|-------|-------|-------------|
| 1  | IF101       | Pemrograman Dasar | 3 | A | 4.00 | 12.00 |

---

### 2. Detail Nilai Dosen (Input Nilai)

**File:** `src/components/ui/detail-nilai-dosen.jsx`

#### Fitur:
- ✅ Dapat menambah/mengubah nilai mahasiswa
- ✅ Tabel nilai dengan kolom:
  - No
  - NIM
  - Nama Mahasiswa
  - Kode Matkul
  - Mata Kuliah
  - SKS
  - Tambah Nilai (dengan tombol Tambah/Ubah)
- ✅ Inline editing dengan dropdown nilai
- ✅ Tombol Save & Cancel per row
- ✅ Status tracking (Sudah Dinilai / Belum Dinilai)
- ✅ Simpan semua nilai sekaligus
- ✅ Validasi sebelum save all
- ✅ Keterangan bobot nilai

#### Kolom Tabel:
| No | NIM | Nama Mahasiswa | Kode Matkul | Mata Kuliah | SKS | Tambah Nilai |
|----|-----|----------------|-------------|-------------|-----|--------------|
| 1  | 2021110001 | John Doe | IF101 | Pemrograman Dasar | 3 | [A] [Ubah] |

#### Nilai Options:
- A (4.00)
- A- (3.75)
- B+ (3.50)
- B (3.00)
- B- (2.75)
- C+ (2.50)
- C (2.00)
- D (1.00)
- E (0.00)

---

## 🚀 Usage

### Menggunakan Komponen Mahasiswa

```jsx
import DetailNilaiMahasiswa from '@/components/ui/detail-nilai-mahasiswa';

export default function NilaiMahasiswaPage() {
  return <DetailNilaiMahasiswa />;
}
```

### Menggunakan Komponen Dosen

```jsx
import DetailNilaiDosen from '@/components/ui/detail-nilai-dosen';

export default function InputNilaiDosenPage() {
  return <DetailNilaiDosen />;
}
```

### Demo Page (Toggle View)

Akses: `/demo-nilai`

Demo page memungkinkan Anda toggle antara tampilan mahasiswa dan dosen untuk melihat perbedaannya.

```jsx
// Otomatis tersedia di /demo-nilai
// Klik tombol untuk switch view
```

---

## 🎨 Design System

Komponen menggunakan design system yang konsisten:

### Colors:
- **Primary:** `#015023` (Hijau tua)
- **Secondary:** `#DABC4E` (Emas)
- **Success:** `#16874B` (Hijau)
- **Danger:** `#BE0414` (Merah)
- **Background:** `bg-brand-light-sage`

### Typography:
- **Font Family:** `Urbanist, sans-serif`
- **Border Radius:** `12px` / `16px`

### Components Used:
- ✅ `DataTable` - Tabel dengan pagination
- ✅ `PrimaryButton` - Tombol utama
- ✅ `OutlineButton` - Tombol outline
- ✅ `WarningButton` - Tombol warning
- ✅ Lucide Icons (ArrowLeft, FileText, Save, X, Download, dll)

---

## 📊 Data Structure

### Mahasiswa Data (Read-Only):
```javascript
{
  id: 1,
  kode_matkul: 'IF101',
  nama_matkul: 'Pemrograman Dasar',
  sks: 3,
  bobot: 'A',
  nilai: 4.00,
  nilai_sks: 12.00
}
```

### Dosen Data (Editable):
```javascript
{
  id: 1,
  nim: '2021110001',
  nama: 'John Doe',
  kode_matkul: 'IF101',
  nama_matkul: 'Pemrograman Dasar',
  sks: 3,
  nilai: 'A' // Can be empty string
}
```

---

## 🔧 Customization

### Mengubah Nilai Options:
```javascript
// Di detail-nilai-dosen.jsx
const nilaiOptions = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'];
```

### Mengubah Items Per Page:
```javascript
// Di component DataTable
const itemsPerPage = 10; // Ubah sesuai kebutuhan
```

### Menambah Export PDF:
```javascript
// Di detail-nilai-mahasiswa.jsx - handleExport function
const handleExport = () => {
  // Implementasi export PDF
  // Gunakan library seperti jsPDF atau react-pdf
};
```

---

## 📱 Responsive Design

Kedua komponen fully responsive:
- ✅ Mobile-friendly
- ✅ Grid layout yang adaptive
- ✅ Tabel dengan horizontal scroll di mobile
- ✅ Button stacking di layar kecil

---

## ✨ Key Features Summary

| Feature | Mahasiswa | Dosen |
|---------|-----------|-------|
| View Nilai | ✅ | ✅ |
| Edit Nilai | ❌ | ✅ |
| Inline Edit | ❌ | ✅ |
| IPK Summary | ✅ | ❌ |
| Status Tracking | ❌ | ✅ |
| Save Individual | ❌ | ✅ |
| Save All | ❌ | ✅ |
| Export PDF | ✅ (Ready) | ❌ |
| Pagination | ✅ | ✅ |

---

## 🔄 API Integration (Ready)

Kedua komponen sudah siap untuk API integration:

```javascript
// Contoh API call untuk save nilai (Dosen)
const handleSaveNilai = async (item) => {
  const response = await fetch('/api/nilai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mahasiswa_id: item.id,
      matkul_id: item.kode_matkul,
      nilai: item.nilai
    })
  });
  
  if (!response.ok) throw new Error('Failed to save');
  // Success handling
};
```

---

## 📝 Notes

1. **Dummy Data:** Komponen menggunakan dummy data untuk demo. Replace dengan real API calls.
2. **Validation:** Validasi nilai sudah ada (tidak boleh kosong).
3. **Loading States:** Loading state sudah implemented dengan `isLoading`.
4. **Error Handling:** Basic error handling dengan alert (dapat diganti dengan toast notification).

---

## 🎯 Next Steps

1. ✅ Integrasi dengan API backend
2. ✅ Implementasi export PDF
3. ✅ Tambah toast notification
4. ✅ Tambah filter/search mahasiswa (untuk dosen)
5. ✅ Tambah print functionality
6. ✅ Tambah history nilai (untuk tracking perubahan)

---

## 📞 Support

Jika ada pertanyaan atau butuh customization, silakan hubungi developer team.

---

**Created with ❤️ using Next.js 15 & React 19**
