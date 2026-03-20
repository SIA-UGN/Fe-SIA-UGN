# Halaman Akademik - Detail Nilai Akhir

## 📍 Route
`/akademik`

## 🎯 Fitur Utama

Halaman akademik yang **otomatis menampilkan tampilan berbeda** berdasarkan **role user yang login**:

### 1. **Role: MAHASISWA** (Read-Only)
- ✅ Hanya dapat **melihat nilai** (tidak bisa edit)
- ✅ Kolom tabel: **No, Kode Matkul, Mata Kuliah, SKS, Bobot, Nilai, Nilai x SKS**
- ✅ Ringkasan IPK (Total SKS, Total Nilai x SKS, IPK Semester)
- ✅ Keterangan bobot nilai
- ✅ Export PDF button

### 2. **Role: DOSEN** (Input Nilai)
- ✅ Dapat **menambah/mengubah nilai**
- ✅ Kolom tabel: **No, Kode Matkul, Mata Kuliah, SKS, Tambah Nilai**
- ✅ Inline editing dengan dropdown nilai
- ✅ Simpan per mata kuliah atau simpan semua
- ✅ Tracking status (Sudah Dinilai / Belum Dinilai)

---

## 🔄 Sistem Role Detection

```javascript
// Di page.js
const getUserRole = () => {
  // Ambil dari localStorage (development)
  const role = localStorage.getItem('userRole') || 'mahasiswa';
  
  // TODO Production: Ambil dari cookies/auth
  // const role = getCookie('roles');
  
  return role;
};
```

### Role yang Didukung:
- `mahasiswa` → Tampilkan DetailNilaiMahasiswa
- `dosen` → Tampilkan DetailNilaiDosen
- Selain itu → Error message "Role tidak dikenali"

---

## 🛠️ Development Tools

### Role Switcher (Dev Mode)
Floating button di kanan bawah untuk **testing role switching**:

```jsx
import RoleSwitcher from '@/components/ui/role-switcher';

// Di halaman akademik
<RoleSwitcher />
```

**Cara Pakai:**
1. Buka `/akademik`
2. Lihat floating button di kanan bawah
3. Klik "Mahasiswa" atau "Dosen" untuk switch role
4. Halaman otomatis reload dengan role baru

**Note:** Role Switcher hanya untuk development. Hapus di production!

---

## 📊 Struktur Data

### Mahasiswa (Read-Only)
```javascript
{
  id: 1,
  kode_matkul: 'IF101',
  nama_matkul: 'Pemrograman Dasar',
  sks: 3,
  bobot: 'A',        // Grade huruf
  nilai: 4.00,       // Nilai angka
  nilai_sks: 12.00   // SKS x Nilai
}
```

### Dosen (Editable)
```javascript
{
  id: 1,
  kode_matkul: 'IF101',
  nama_matkul: 'Pemrograman Dasar',
  sks: 3,
  nilai: 'A'  // Can be edited
}
```

---

## 🎨 UI/UX

### Mahasiswa View:
- **Header:** Info mahasiswa (NIM, Nama, Prodi)
- **Tabel:** Read-only dengan pagination
- **Summary:** Cards dengan IPK semester
- **Action:** Export PDF

### Dosen View:
- **Header:** Info dosen (Nama, Jumlah Matkul)
- **Tabel:** Editable dengan inline form
- **Summary:** Counter (Sudah/Belum Dinilai)
- **Actions:** Simpan per row / Simpan semua

---

## 🔐 Production Implementation

### 1. Ganti Role Detection dengan Real Auth:

```javascript
// Contoh dengan cookies
import { getCookie } from '@/lib/cookies';

const getUserRole = () => {
  const role = getCookie('roles'); // atau getCookie('userRole')
  return role;
};
```

### 2. Hapus Role Switcher:

```javascript
// Di akademik/page.js - HAPUS baris ini di production:
// <RoleSwitcher />
```

### 3. Tambah Auth Guard (Optional):

```javascript
// Redirect jika tidak login
useEffect(() => {
  const token = getCookie('token');
  if (!token) {
    router.push('/login');
  }
}, []);
```

---

## 📁 File Structure

```
src/
├── app/
│   └── akademik/
│       └── page.js              # Main page (role detection)
├── components/ui/
│   ├── detail-nilai-mahasiswa.jsx  # Mahasiswa view
│   ├── detail-nilai-dosen.jsx      # Dosen view
│   └── role-switcher.jsx           # Dev tool (remove in prod)
```

---

## 🚀 Cara Menggunakan

### Development:
1. Buka `/akademik`
2. Default role: `mahasiswa`
3. Gunakan Role Switcher untuk testing
4. Role disimpan di localStorage

### Production:
1. User login → Role disimpan di cookies/session
2. Akses `/akademik`
3. Sistem otomatis detect role dari cookies
4. Tampilkan view yang sesuai

---

## ✨ Key Differences

| Fitur | Mahasiswa | Dosen |
|-------|-----------|-------|
| Kolom NIM | ❌ | ❌ |
| Kolom Nama Mahasiswa | ❌ | ❌ |
| Kolom Kode Matkul | ✅ | ✅ |
| Kolom Mata Kuliah | ✅ | ✅ |
| Kolom SKS | ✅ | ✅ |
| Kolom Bobot | ✅ | ❌ |
| Kolom Nilai | ✅ | ❌ |
| Kolom Nilai x SKS | ✅ | ❌ |
| Kolom Tambah Nilai | ❌ | ✅ |
| Edit Capability | ❌ | ✅ |
| IPK Summary | ✅ | ❌ |
| Status Tracking | ❌ | ✅ |

---

## 🔧 Customization

### Menambah Role Baru (e.g., Admin):

```javascript
// Di akademik/page.js
return (
  <>
    {userRole === 'mahasiswa' ? (
      <DetailNilaiMahasiswa />
    ) : userRole === 'dosen' ? (
      <DetailNilaiDosen />
    ) : userRole === 'admin' ? (
      <DetailNilaiAdmin />  // Create new component
    ) : (
      <ErrorView />
    )}
  </>
);
```

### Mengubah Default Role:

```javascript
const role = localStorage.getItem('userRole') || 'dosen'; // Changed default
```

---

## 📝 Notes

1. **localStorage** hanya untuk development
2. Production harus pakai **cookies/session**
3. **Role Switcher** harus di-remove di production
4. Pastikan role validation di backend juga
5. Data dummy akan diganti dengan **API calls**

---

## 🎯 Next Steps

- [ ] Integrasi API untuk fetch data nilai
- [ ] Implementasi real authentication
- [ ] Tambah loading skeleton
- [ ] Tambah error boundary
- [ ] Implementasi export PDF
- [ ] Tambah filter/search
- [ ] Role-based middleware

---

**Last Updated:** November 6, 2025
**Status:** ✅ Ready for Testing
