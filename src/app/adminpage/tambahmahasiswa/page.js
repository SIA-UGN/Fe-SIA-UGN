'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, X, ArrowLeft } from 'lucide-react';
import DataTable from '@/components/ui/table';
import AdminNavbar from '@/components/ui/admin-navbar';
import { getMahasiswa, toggleUserStatus } from '@/lib/adminApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  AlertConfirmationDialog,
  AlertErrorDialog,
  AlertSuccessDialog,
} from '@/components/ui/alert-dialog';
import { PrimaryButton, OutlineButton, WarningButton } from '@/components/ui/button';

export default function StudentDashboard() {
const router = useRouter();
const [searchQuery, setSearchQuery] = useState('');
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
const [success, setSuccess] = useState(null);
const [students, setStudents] = useState([]);
const [errorActivate, setErrorActivate] = useState(null);
const [successActivate, setSuccessActivate] = useState(null);
const [showSuccessActivateDialog, setShowSuccessActivateDialog] = useState(false);
const [showErrorDialog, setShowErrorDialog] = useState(false);
const [showStatusDialog, setShowStatusDialog] = useState(false);
const [selectedStudent, setSelectedStudent] = useState(null);
const [countdown, setCountdown] = useState(5);

// Fetch students from API
const indexStudents = async () => {
  setLoading(true);
  try {
    setError(null);
    const response = await getMahasiswa();
      if (response.status === 'success') {
        setSuccess(true);
        setStudents(response.data);
      } else {
        setError('Gagal mengambil data mahasiswa');
      }
  } catch (error) {
    setError('Terjadi kesalahan saat mengambil data: ' + error.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  indexStudents();
}, []);

// Filter students berdasarkan search query
const filteredStudents = students.filter(student => {
  const query = searchQuery.toLowerCase();
  return (
    student.username.toLowerCase().includes(query) ||
    student.email.toLowerCase().includes(query) ||
    student.name.toLowerCase().includes(query) ||
    student.nim.toLowerCase().includes(query) ||
    student.program_name.toLowerCase().includes(query) ||
    (student.is_active ? 'active' : 'inactive').includes(query)
  );
});

// Define columns untuk table
const columns = [
{ key: 'username', label: 'Username' },
{ key: 'email', label: 'Email' },
{ key: 'name', label: 'Nama' },
{ key: 'nim', label: 'NIM' },
{ key: 'program_name', label: 'Program' },
{ key: 'is_active', label: 'Status' },
];

// Custom render untuk is_active status
const customRender = {
is_active: (value) => (
    <span 
    className="px-2 py-1 rounded text-xs font-semibold"
    style={{
        backgroundColor: value ? '#16874B' : '#BE0414',
        color: '#FFFFFF',
        borderRadius: '12px'
    }}
    >
    {value ? 'Active' : 'Inactive'}
    </span>
),
};

// Handle add new student
const handleAddStudent = () => {
router.push('/adminpage/tambahmahasiswa/addform');
};

// Handle search input change
const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
};

// Handle clear search
const handleClearSearch = () => {
  setSearchQuery('');
};

// Handle toggle status active/inactive
const handleActivate = async (student, index) => {
  setSelectedStudent(student);
  setShowStatusDialog(true);
};

const confirmToggleStatus = async () => {
  if (!selectedStudent) return;
  
  const userId = selectedStudent.id_user_si;
  setShowStatusDialog(false);
  
  try {
    const response = await toggleUserStatus(userId);
    
    if (response.status === 'success') {
      // Update local state
      setStudents(students.map(s => 
        (s.id_user_si) === userId
          ? { ...s, is_active: response.data.is_active }
          : s
      ));
      setSuccessActivate(`Berhasil mengubah status mahasiswa: ${selectedStudent.name} menjadi ${response.data.is_active ? 'Aktif' : 'Non-Aktif'}.`);
      setCountdown(5);
      setShowSuccessActivateDialog(true);
    } else {
      setErrorActivate('Gagal mengubah status mahasiswa: ' + response.message);
      setShowErrorDialog(true);
    }
  } catch (error) {
    setErrorActivate('Gagal mengubah status mahasiswa: ' + error.message);
    setShowErrorDialog(true);
  } finally {
    setSelectedStudent(null);
  }
};

useEffect(() => {
  let timer;
  if (showSuccessActivateDialog) {
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setShowSuccessActivateDialog(false);
      setSuccessActivate(null);
      setCountdown(5);
    }
  }
  return () => clearTimeout(timer);
}, [showSuccessActivateDialog, countdown]);

return (
  <>
<div className="min-h-screen bg-brand-light-sage" style={{ fontFamily: 'Urbanist, sans-serif' }}>
    {/* Admin Navbar */}
    <AdminNavbar title="Dashboard Admin - Mahasiswa" />

    {/* Main Content */}
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
    {/* Back Button */}
    <div className="mb-4">
        <button
        onClick={() => router.push('/adminpage')}
        className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition"
        style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
        <ArrowLeft className="w-5 h-5" />
        Kembali ke Dashboard
        </button>
    </div>

    {/* Page Title */}
    <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#015023' }}>
            Statistik Mahasiswa
        </h2>
        <button 
            onClick={handleAddStudent}
            className="text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition shadow-md hover:opacity-90" 
            style={{ backgroundColor: '#015023', borderRadius: '12px' }}
        >
            + Tambah Data Mahasiswa
        </button>
        </div>
    </div>

    {/* Error Message */}
    {error && (
      <ErrorMessageBoxWithButton message={error} action={indexStudents} />
    )}

    {/* Stats Card */}
    <div className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl" style={{ background: 'linear-gradient(to bottom right, #015023, #013d1c)' }}>
        <div className="flex items-center justify-between">
        <div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Total Mahasiswa</h3>
            <p className="text-white text-3xl sm:text-4xl font-bold mb-1">{loading ? '...' : filteredStudents.length}</p>
            <p className="text-sm" style={{ color: '#DABC4E' }}>
              {loading ? 'Loading...' : searchQuery ? 'Hasil pencarian' : error ? error : 'Mahasiswa aktif'}
            </p>
        </div>
        <div className="p-3 sm:p-4 rounded-2xl shadow-lg" style={{ backgroundColor: '#DABC4E' }}>
            <Users className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#015023' }} />
        </div>
        </div>
    </div>

    {/* Search Bar */}
    <div className="p-3 mb-4 flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#DABC4E', borderRadius: '12px' }}>
        <Search className="w-5 h-5" style={{ color: '#015023' }} />
        <input
        type="text"
        placeholder="Cari mahasiswa..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="bg-transparent flex-1 outline-none text-sm text-gray-700"
        style={{ color: '#015023' }}
        />
        {searchQuery && (
          <button 
            onClick={handleClearSearch}
            className="hover:opacity-80 transition" 
            style={{ color: '#015023' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
    </div>

    {/* Table using DataTable component */}
    {success && 
      <DataTable
          columns={columns}
          data={filteredStudents}
          actions={['activate']}
          pagination={true}
          onActivate={handleActivate}
          customRender={customRender}
      />
    }
    </div>
    <AlertConfirmationDialog 
      open={showStatusDialog}
      onOpenChange={setShowStatusDialog}
      title="Konfirmasi Ubah Status"
      description={
        <>
          Apakah Anda yakin ingin <strong>{selectedStudent?.is_active ? 'Non-Aktifkan' : 'Aktifkan'}</strong> akun <strong>{selectedStudent?.name}</strong>?
        </>
      }
      onConfirm={confirmToggleStatus}
      confirmText={selectedStudent?.is_active ? 'Non-Aktifkan' : 'Aktifkan'}
    />

    <AlertErrorDialog 
      open={showErrorDialog}
      onOpenChange={setShowErrorDialog}
      description={errorActivate}
    />

    <AlertSuccessDialog
      open={showSuccessActivateDialog}
      onOpenChange={setShowSuccessActivateDialog}
      description={
        <>
          {successActivate}
          <br />
          <span className="text-xs mt-2 block">
            Pesan akan ditutup dalam {countdown} detik
          </span>
        </>
      }
      closeText={'Tutup' + (countdown > 0 ? ` (${countdown})` : '')}
    />
</div>
</>
);
}