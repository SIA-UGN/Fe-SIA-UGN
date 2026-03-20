# Input Nilai Mahasiswa - README

## Overview
Sistem input nilai akhir mahasiswa untuk dosen yang terdiri dari dua halaman:
1. **Daftar Mata Kuliah** (`detail-nilai-dosen.jsx`) - Menampilkan daftar mata kuliah dengan button "Detail Nilai"
2. **Input Nilai Mahasiswa** (`input-nilai-mahasiswa.jsx`) - Form input nilai numerik (0-100) untuk setiap mahasiswa

## Flow Aplikasi

### 1. Halaman Daftar Mata Kuliah (Dosen)
**Route:** `/akademik` (dengan role dosen)

**Fitur:**
- Menampilkan daftar mata kuliah yang diampu
- Semester selector untuk memilih periode
- Button "Detail Nilai" untuk setiap mata kuliah
- Informasi dosen pengampu dan jumlah mata kuliah

**Kolom Tabel:**
- Kode Matkul
- Mata Kuliah
- SKS
- Aksi (Button Detail Nilai)

**Aksi:**
- Klik button "Detail Nilai" → Navigate ke halaman Input Nilai Mahasiswa dengan parameter:
  - `kode`: Kode mata kuliah (e.g., IF101)
  - `nama`: Nama mata kuliah (e.g., Pemrograman Dasar)
  - `sks`: Jumlah SKS (e.g., 3)

### 2. Halaman Input Nilai Mahasiswa
**Route:** `/input-nilai-mahasiswa?kode=IF101&nama=Pemrograman%20Dasar&sks=3`

**Fitur:**
- Menampilkan daftar mahasiswa untuk mata kuliah tertentu
- Input nilai numerik (0-100) untuk setiap mahasiswa
- Konversi otomatis nilai numerik ke grade (A-E)
- Inline editing dengan validation
- Summary: Jumlah mahasiswa, sudah dinilai, belum dinilai
- Keterangan konversi nilai
- Button "Simpan Semua Nilai"

**Kolom Tabel:**
- NIM
- Nama Mahasiswa
- Nilai Akhir (0-100) - dengan inline editing

**Konversi Nilai:**
```
A:  85-100
A-: 80-84
B+: 75-79
B:  70-74
B-: 65-69
C+: 60-64
C:  55-59
D:  40-54
E:  0-39
```

## Components

### 1. DetailNilaiDosen
**File:** `src/components/ui/detail-nilai-dosen.jsx`

**Props:** None (standalone component)

**State:**
```javascript
const [selectedSemester, setSelectedSemester] = useState('2024-ganjil');
const [matkulData, setMatkulData] = useState([...]);
const [isLoading, setIsLoading] = useState(false);
```

**Functions:**
- `handleDetailNilai(item)` - Navigate ke halaman input nilai dengan URL params

**Data Structure:**
```javascript
{
  id: 1,
  kode_matkul: 'IF101',
  nama_matkul: 'Pemrograman Dasar',
  sks: 3
}
```

### 2. InputNilaiMahasiswa
**File:** `src/components/ui/input-nilai-mahasiswa.jsx`

**URL Params (from useSearchParams):**
- `kode` - Kode mata kuliah
- `nama` - Nama mata kuliah
- `sks` - Jumlah SKS

**State:**
```javascript
const [mahasiswaData, setMahasiswaData] = useState([...]);
const [editMode, setEditMode] = useState({});
const [isLoading, setIsLoading] = useState(false);
```

**Functions:**
- `handleNilaiChange(id, newNilai)` - Update nilai mahasiswa
- `toggleEditMode(id)` - Toggle edit mode untuk row tertentu
- `handleSaveNilai(item)` - Simpan nilai individual dengan validation
- `handleCancelEdit(id)` - Batalkan edit
- `nilaiToGrade(nilai)` - Konversi nilai numerik ke grade
- `handleSaveAll()` - Simpan semua nilai dengan konfirmasi

**Data Structure:**
```javascript
{
  id: 1,
  nim: '2021110001',
  nama: 'John Doe',
  nilai: 85  // null jika belum dinilai
}
```

**Validation:**
- Nilai tidak boleh kosong
- Nilai harus antara 0-100
- Warning jika masih ada mahasiswa belum dinilai saat simpan semua

## Page Route

### input-nilai-mahasiswa/page.js
**File:** `src/app/input-nilai-mahasiswa/page.js`

**Purpose:** Route wrapper dengan Suspense untuk handling async

**Features:**
- Suspense boundary dengan loading spinner
- Brand-consistent loading state
- Error handling ready

## Styling

### Brand Colors
```javascript
Primary Green: #015023
Secondary Gold: #DABC4E
Success Green: #16874B
Error Red: #BE0414
Light Sage: bg-brand-light-sage
```

### Border Radius
- Cards: 16px
- Buttons/Inputs: 12px

### Font
- Family: Urbanist, sans-serif
- Weights: medium (500), semibold (600), bold (700)

## User Journey

### Skenario 1: Input Nilai Baru
1. Dosen login → Halaman Akademik (role: dosen)
2. Pilih semester dari dropdown
3. Lihat daftar mata kuliah
4. Klik button "Detail Nilai" pada mata kuliah tertentu
5. Redirected ke `/input-nilai-mahasiswa?kode=IF101&nama=...&sks=3`
6. Lihat daftar mahasiswa dengan status nilai
7. Klik button "Input" pada mahasiswa yang belum dinilai
8. Input nilai numerik (0-100)
9. Klik icon Save (✓)
10. Nilai tersimpan, grade otomatis ditampilkan
11. Ulangi untuk mahasiswa lain
12. Klik "Simpan Semua Nilai" untuk commit ke backend
13. Klik "Kembali ke Daftar Mata Kuliah"

### Skenario 2: Ubah Nilai Existing
1. Ikuti step 1-6 dari skenario 1
2. Mahasiswa sudah ada nilai (tampil badge nilai dan grade)
3. Klik button "Ubah"
4. Edit nilai di input field
5. Klik icon Save (✓)
6. Nilai terupdate, grade otomatis recalculate
7. Lanjut dengan "Simpan Semua Nilai"

## API Integration (TODO)

### 1. Fetch Mata Kuliah Dosen
**Endpoint:** `GET /api/dosen/matakuliah?semester={semester}`

**Response:**
```json
[
  {
    "id": 1,
    "kode_matkul": "IF101",
    "nama_matkul": "Pemrograman Dasar",
    "sks": 3
  }
]
```

**Implementation:**
```javascript
// In DetailNilaiDosen useEffect
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch(`/api/dosen/matakuliah?semester=${selectedSemester}`);
    const data = await response.json();
    setMatkulData(data);
  };
  fetchData();
}, [selectedSemester]);
```

### 2. Fetch Mahasiswa per Mata Kuliah
**Endpoint:** `GET /api/nilai/mahasiswa?kode_matkul={kode}`

**Response:**
```json
[
  {
    "id": 1,
    "nim": "2021110001",
    "nama": "John Doe",
    "nilai": 85
  }
]
```

**Implementation:**
```javascript
// In InputNilaiMahasiswa useEffect
useEffect(() => {
  const fetchMahasiswa = async () => {
    const response = await fetch(`/api/nilai/mahasiswa?kode_matkul=${kodeMatkul}`);
    const data = await response.json();
    setMahasiswaData(data);
  };
  fetchMahasiswa();
}, [kodeMatkul]);
```

### 3. Save Nilai Individual
**Endpoint:** `POST /api/nilai/save`

**Request:**
```json
{
  "mahasiswa_id": 1,
  "kode_matkul": "IF101",
  "nilai": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nilai berhasil disimpan",
  "data": {
    "nilai": 85,
    "grade": "A"
  }
}
```

### 4. Save Semua Nilai
**Endpoint:** `POST /api/nilai/save-all`

**Request:**
```json
{
  "kode_matkul": "IF101",
  "nilai_list": [
    { "mahasiswa_id": 1, "nilai": 85 },
    { "mahasiswa_id": 2, "nilai": 90 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Semua nilai berhasil disimpan",
  "saved_count": 2
}
```

## Notifications (Enhancement)

Replace `alert()` with toast notifications:

```bash
npm install react-hot-toast
```

```javascript
import toast from 'react-hot-toast';

// Success
toast.success('Nilai berhasil disimpan!');

// Error
toast.error('Gagal menyimpan nilai');

// Warning
toast('Masih ada mahasiswa yang belum dinilai', { icon: '⚠️' });
```

## Production Checklist

- [ ] Replace localStorage role detection dengan cookies
- [ ] Implement API endpoints untuk fetch mata kuliah
- [ ] Implement API endpoints untuk fetch mahasiswa
- [ ] Implement API endpoints untuk save nilai
- [ ] Add toast notifications (replace alert)
- [ ] Add loading states untuk async operations
- [ ] Add error handling untuk failed API calls
- [ ] Add confirmation dialog untuk save all
- [ ] Implement export functionality (PDF/Excel)
- [ ] Add search/filter untuk daftar mahasiswa
- [ ] Add sorting pada tabel
- [ ] Test dengan data real dari backend
- [ ] Add permission checking (ensure user is dosen)
- [ ] Add audit trail untuk perubahan nilai
- [ ] Add deadline checking untuk input nilai

## Testing Scenarios

### Unit Tests
```javascript
describe('InputNilaiMahasiswa', () => {
  test('converts nilai 85 to grade A', () => {
    expect(nilaiToGrade(85)).toBe('A');
  });
  
  test('validates nilai range 0-100', () => {
    // Test validation logic
  });
  
  test('handles empty nilai', () => {
    // Test null/empty handling
  });
});
```

### Integration Tests
- Test navigation dari daftar mata kuliah ke input nilai
- Test URL params passing correctly
- Test save individual nilai
- Test save all nilai with warning

### E2E Tests
- Complete flow: Login → Select semester → Detail nilai → Input nilai → Save
- Test back button navigation
- Test concurrent edits

## Troubleshooting

### Issue: URL params not showing
**Solution:** Ensure Suspense wrapper in page.js for useSearchParams

### Issue: Grade not updating after nilai change
**Solution:** Check nilaiToGrade function and ensure state update triggers re-render

### Issue: Save all doesn't validate
**Solution:** Verify handleSaveAll logic checks for null/empty nilai

### Issue: Navigation back loses semester selection
**Solution:** Consider using URL params for semester or global state management

## Future Enhancements

1. **Batch Import**
   - Excel upload untuk import nilai bulk
   - Template download

2. **Grade Distribution Chart**
   - Visualisasi distribusi nilai (pie chart)
   - Statistik: rata-rata, median, min, max

3. **History/Audit Log**
   - Track siapa mengubah nilai dan kapan
   - Rollback capability

4. **Email Notification**
   - Auto-email ke mahasiswa saat nilai diinput
   - Reminder untuk dosen deadline input nilai

5. **Mobile Responsive**
   - Optimize layout untuk mobile
   - Touch-friendly input controls

## Contributors

Created: November 6, 2025
Last Updated: November 6, 2025
