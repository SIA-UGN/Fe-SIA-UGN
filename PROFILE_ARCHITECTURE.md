# Profile Management Architecture

## Overview
Sistem profile management sekarang menggunakan **component-based architecture** yang memungkinkan setiap role memiliki form profile yang berbeda-beda sesuai kebutuhan mereka.

## Structure

```
src/
├── app/
│   └── profilepage/
│       └── page.js            # Wrapper/Router - mendeteksi role dan render component yang sesuai
└── components/
    └── ui/
        ├── profilemahasiswa.jsx   # Form profile untuk Mahasiswa ✅ (COMPLETED)
        ├── profiledosen.jsx       # Form profile untuk Dosen (TODO)
        ├── profilemanager.jsx     # Form profile untuk Manager (TODO)
        └── profileadmin.jsx       # Form profile untuk Admin (TODO)
```

## How It Works

### 1. Page Wrapper (`profilepage/page.js`)
- **Purpose**: Router berdasarkan role pengguna
- **Size**: ~65 lines (drastis berkurang dari 1046 lines)
- **Responsibility**:
  - Detect user role dari cookies/context
  - Render component profile yang sesuai (ProfileMahasiswa, ProfileDosen, dll)
  - Handle Navbar yang sama untuk semua role

```javascript
const userRole = 'mahasiswa'; // TODO: Get from Cookies.get('roles')

switch (userRole) {
  case 'mahasiswa':
    return <ProfileMahasiswa />;
  case 'dosen':
    return <ProfileDosen />;
  // ... dst
}
```

### 2. Profile Components

#### ProfileMahasiswa (`profilemahasiswa.jsx`) ✅
- **Purpose**: Form lengkap untuk edit profile mahasiswa
- **Fields**: 19 fields dalam 3 sections
- **Features**:
  - ✅ State management (profileData, errors, isLoading)
  - ✅ Real-time validation
  - ✅ Required fields check
  - ✅ NIK 16-digit validation
  - ✅ Avatar header dengan user info
  - ✅ Back button navigation
  - ✅ Cancel & Save buttons dengan loading state

**Section 1: Data Identitas** (9 fields)
- registration_number*, full_name*, gender*, religion*
- tempat_lahir*, tanggal_lahir*, nik* (16 digit)
- nomor_kartu_keluarga, citizenship

**Section 2: Alamat Lengkap** (7 fields)
- alamat*, dusun, kelurahan, kecamatan
- city_regency, provinsi, kode_pos

**Section 3: Data Keluarga & Pendidikan** (3 fields)
- birth_order, jumlah_saudara, sekolah_asal

#### ProfileDosen (TODO)
Fields yang perlu ditambahkan:
- NIDN (Nomor Induk Dosen Nasional)
- Jabatan Akademik (Asisten Ahli, Lektor, dll)
- Mata Kuliah yang diampu
- Bidang Keahlian
- Pendidikan Terakhir (S1, S2, S3)
- Publikasi/Research

#### ProfileManager (TODO)
Fields yang perlu ditambahkan:
- Employee ID
- Department/Divisi
- Position/Jabatan
- Manager Level
- Date Joined
- Contact Information

#### ProfileAdmin (TODO)
Fields yang perlu ditambahkan:
- Admin ID
- Access Level
- Permissions
- Last Login
- Activity Log

## Benefits

### 1. **Scalability**
- Mudah menambah role baru tanpa mengubah existing code
- Setiap role punya form independen

### 2. **Maintainability**
- Code terorganisir dan mudah di-maintain
- Bug fixing pada satu role tidak affect role lain
- Clear separation of concerns

### 3. **Reusability**
- Shared UI components (Field, Button, Avatar) digunakan semua profile
- Konsisten design pattern across roles

### 4. **Performance**
- Code splitting - hanya load component yang diperlukan
- Smaller bundle size untuk masing-masing role

## Next Steps

### Immediate (High Priority)
1. ✅ Create ProfileMahasiswa component - **DONE**
2. ✅ Refactor profilepage/page.js to wrapper - **DONE**
3. 🔄 Implement role detection from cookies
4. 🔄 Add API integration for data fetching

### Future (Medium Priority)
5. Create ProfileDosen component
6. Create ProfileManager component
7. Create ProfileAdmin component
8. Add unit tests for each component

### Enhancement (Low Priority)
9. Add image upload for avatar
10. Add form auto-save (draft)
11. Add change history/audit log
12. Add profile completeness indicator

## Usage Example

```javascript
// In profilepage/page.js
import Cookies from 'js-cookie';

const userRole = Cookies.get('roles') || 'mahasiswa';

// Component automatically renders correct profile form
return (
  <>
    <Navbar />
    {renderProfileComponent()} // Returns <ProfileMahasiswa /> if role is 'mahasiswa'
  </>
);
```

## Design Patterns Used

1. **Component Composition**: Page wrapper + Role-specific components
2. **Controlled Components**: All form inputs controlled via useState
3. **Validation Pattern**: Centralized validateForm function
4. **Error Handling**: Field-level error state management
5. **Loading States**: UI feedback during async operations

## Brand Design Consistency

All profile components follow the grand design:
- **Primary Color**: #015023 (green)
- **Error Color**: #BE0414 (red)
- **Success Color**: #16874B (green)
- **Accent Color**: #DABC4E (yellow)
- **Font**: Urbanist sans-serif
- **Border Radius**: 12px (inputs), 16px (cards)
- **Border**: 2px solid #015023

---

**Last Updated**: Profile management architecture refactored
**Component Count**: 1/4 completed (ProfileMahasiswa ✅)
**Lines Reduced**: 1046 → 65 (page.js) + reusable components
