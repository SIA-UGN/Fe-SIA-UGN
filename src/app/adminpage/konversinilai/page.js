'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/ui/table';
import AdminNavbar from '@/components/ui/admin-navbar';
import { Search, X, ArrowLeft, FileText } from 'lucide-react';
import { deleteGradeConversion, getGradeConversions } from '@/lib/gradeConv';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { AlertConfirmationRedDialog, AlertErrorDialog, AlertSuccessDialog } from '@/components/ui/alert-dialog';

export default function KonversiNilaiPage() {
  const router = useRouter();
  
  // Dummy data - 12 grade conversion rules
  const [gradeRules, setGradeRules] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [Loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);
  const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Fetch periods from API
  const indexGradeConversions = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await getGradeConversions();
      if (response.status === 'success') {
        setSuccess(true);
        setGradeRules(response.data);
      } else {
        setError('Gagal mengambil data konversi nilai: ' + response.message);
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    indexGradeConversions();
  }, []);

  useEffect(() => {
    let timer;
    if (showDeleteSuccessDialog) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        setShowDeleteSuccessDialog(false);
        setDeleteSuccess(null);
        setCountdown(5);
      }
    }
    return () => clearTimeout(timer);
  }, [showDeleteSuccessDialog, countdown]);

  const handleEdit = (rule) => {
    router.push(`/adminpage/konversinilai/editform?id=${rule.id_grades}`);
  };

  const handleDelete = async (rule) => {
    setSelectedRule(rule);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteGradeConversion(selectedRule.id_grades);
      if (response.status === 'success') {
        setDeleteSuccess('Konversi nilai ' + selectedRule.letter + ' berhasil dihapus.');
        setGradeRules(prev => prev.filter(r => r.id_grades !== selectedRule.id_grades));
        setCountdown(5);
        setShowDeleteSuccessDialog(true);
      } else {
        setDeleteError('Gagal menghapus konversi nilai: ' + response.message);
        setShowDeleteErrorDialog(true);
      }
    } catch (error) {
      setDeleteError('Gagal menghapus konversi nilai: ' + error.message);
      setShowDeleteErrorDialog(true);
    } finally {
      setLoading(false);
      setSelectedRule(null);
    }
  };

  const filteredRules = gradeRules.filter(rule => 
    rule.letter.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.min_grade.toString().includes(searchQuery) ||
    rule.max_grade.toString().includes(searchQuery) ||
    rule.ip_skor.toString().includes(searchQuery)
  );

  const columns = [
    {
      key: 'min_grade',
      label: 'Nilai Minimal'
    },
    {
      key: 'max_grade',
      label: 'Nilai Maksimal'
    },
    {
      key: 'letter',
      label: 'Nilai Huruf'
    },
    {
      key: 'ip_skor',
      label: 'Nilai IP'
    }
  ];

  const customRender = {
    letter: (value) => (
      <span 
        className="px-3 py-1 rounded-full font-semibold"
        style={{
          backgroundColor: value.startsWith('A') ? '#E8F5E9' :
                         value.startsWith('B') ? '#E3F2FD' :
                         value.startsWith('C') ? '#FFF3E0' :
                         value.startsWith('D') ? '#FFE0B2' : '#FFEBEE',
          color: value.startsWith('A') ? '#2E7D32' :
                 value.startsWith('B') ? '#1565C0' :
                 value.startsWith('C') ? '#E65100' :
                 value.startsWith('D') ? '#E64A19' : '#C62828',
          fontFamily: 'Urbanist, sans-serif',
          borderRadius: '12px'
        }}
      >
        {value}
      </span>
    ),
    ip_skor: (value) => (
      <span 
        className="font-semibold"
        style={{ 
          color: '#015023',
          fontFamily: 'Urbanist, sans-serif'
        }}
      >
        {typeof value === 'number' ? value.toFixed(2) : value}
      </span>
    )
  };

  return (
    <div className="min-h-screen bg-brand-light-sage" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Admin - Manajemen Konversi Nilai" />
      
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
              Manajemen Konversi Nilai
            </h2>
            <button 
              onClick={() => router.push('/adminpage/konversinilai/addform')}
              className="text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition shadow-md hover:opacity-90 disabled:opacity-50" 
              style={{ backgroundColor: '#015023', borderRadius: '12px' }}
            >
              + Tambah Data Konversi Nilai
            </button>
          </div>
        </div>

        {error && (
          <ErrorMessageBoxWithButton message={error} action={indexGradeConversions} />
        )}

        {/* Stats Card */}
        <div className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl" style={{ background: 'linear-gradient(to bottom right, #015023, #013d1c)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Total Konversi Nilai</h3>
              <p className="text-white text-3xl sm:text-4xl font-bold mb-1">{Loading ? '...' : filteredRules.length}</p>
              <p className="text-sm" style={{ color: '#DABC4E' }}>
                {Loading ? 'Loading...' : searchQuery ? 'Hasil pencarian' : 'Aturan konversi terdaftar'}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl shadow-lg" style={{ backgroundColor: '#DABC4E' }}>
              <FileText className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#015023' }} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 mb-4 flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#DABC4E', borderRadius: '12px' }}>
          <Search className="w-5 h-5" style={{ color: '#015023' }} />
          <input
            type="text"
            placeholder="Cari konversi nilai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm text-gray-700"
            style={{ color: '#015023' }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="hover:opacity-80 transition" 
              style={{ color: '#015023' }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Data Table */}
        {success && (
          <DataTable
            columns={columns}
            data={filteredRules}
            actions={['edit', 'delete']}
            onEdit={handleEdit}
            onDelete={handleDelete}
            customRender={customRender}
          />
        )}
      </div>
      <AlertConfirmationRedDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Konfirmasi Hapus Konversi Nilai"
        description={`Apakah Anda yakin ingin menghapus konversi nilai untuk ${selectedRule?.letter}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        confirmText="Hapus"
        cancelText="Batal"
      />

      <AlertSuccessDialog 
        open={showDeleteSuccessDialog}
        onOpenChange={setShowDeleteSuccessDialog}
        description={
          <>
            {deleteSuccess}
            <br />
            <span className="text-xs mt-2 block">
              Pesan akan ditutup dalam {countdown} detik
            </span>
          </>
        }
        closeText={'Tutup' + (countdown > 0 ? ` (${countdown})` : '')}
      />

      <AlertErrorDialog 
        open={showDeleteErrorDialog}
        onOpenChange={setShowDeleteErrorDialog}
        description={deleteError}
      />
    </div>
  );
}
