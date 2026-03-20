'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Search, X, ArrowLeft } from 'lucide-react';
import DataTable from '@/components/ui/table';
import AdminNavbar from '@/components/ui/admin-navbar';
import {
  AlertConfirmationDialog,
  AlertConfirmationDialogTwoOption,
  AlertConfirmationRedDialog,
  AlertErrorDialog,
  AlertSuccessDialog,
  AlertWarningDialog,
} from '@/components/ui/alert-dialog';
import { PrimaryButton, OutlineButton, WarningButton } from '@/components/ui/button';
import { getAcademicPeriods, deleteAcademicPeriod, toggleAcademicPeriodStatus } from '@/lib/adminApi';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';

export default function PeriodeAkademikDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [errorDelete, setErrorDelete] = useState(null);
  const [errorActivate, setErrorActivate] = useState(null);
  const [success, setSuccess] = useState(null);
  const [successActivate, setSuccessActivate] = useState(null);
  const [successDelete, setSuccessDelete] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showAllClassDialog, setShowAllClassDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Fetch periods from API
  const indexPeriods = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await getAcademicPeriods();
      if (response.status === 'success') {
        setSuccess(true);
        setPeriods(response.data);
      } else {
        setError('Gagal mengambil data periode akademik: ' + response.message);
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    indexPeriods();
  }, []);

  // Filter periods berdasarkan search query
  const filteredPeriods = periods.filter(period => {
    const query = searchQuery.toLowerCase();
    return (
      period.name.toLowerCase().includes(query) ||
      period.start_date.includes(query) ||
      period.end_date.includes(query)
    );
  });

  // Format tanggal
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Define columns untuk table
  const columns = [
    { key: 'name', label: 'Nama Periode' },
    { key: 'start_date', label: 'Tanggal Mulai' },
    { key: 'end_date', label: 'Tanggal Selesai' },
    { key: 'is_active', label: 'Status' },
  ];

  // Custom render untuk status dan tanggal
  const customRender = {
    start_date: (value) => formatDate(value),
    end_date: (value) => formatDate(value),
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

  // Handle add new period
  const handleAddPeriod = () => {
    router.push('/adminpage/periodeakademik/addform');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle edit action
  const handleEdit = (period, index) => {
    router.push(`/adminpage/periodeakademik/editform?id=${period.id_academic_period}`);
  };

  // Handle delete action
  const handleDelete = async (period, index) => {
    setSelectedPeriod(period);
    setSelectedIndex(index);
    setShowDeleteDialog(true);
  };

  const handleActivate = (period, index) => {
    setSelectedPeriod(period);
    setSelectedIndex(index);
    setShowActivateDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPeriod || selectedPeriod.is_active) {
      setShowDeleteDialog(false);
      return;
    }

    setShowDeleteDialog(false);
    
    try {
      const response = await deleteAcademicPeriod(selectedPeriod.id_academic_period);
      if (response.status === 'success') {
        // Update local state
        setPeriods(prevPeriods => prevPeriods.filter((_, i) => i !== selectedIndex));
        setSuccessDelete('Periode akademik ' + selectedPeriod.name + ' berhasil dihapus.');
        setCountdown(5);
        setShowSuccessDialog(true);
      } else {
        setErrorDelete('Gagal menghapus periode akademik: ' + response.message);
        setShowErrorDialog(true);
      }
    } catch (error) {
      setErrorDelete('Gagal menghapus periode akademik: ' + error.message);
      setShowErrorDialog(true);
    } finally {
      setSelectedPeriod(null);
      setSelectedIndex(null);
    }
  };

  useEffect(() => {
    let timer;
    if (showSuccessDialog) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        setShowSuccessDialog(false);
        setSuccessActivate(null);
        setSuccessDelete(null);
        setCountdown(5);
      }
    }
    return () => clearTimeout(timer);
  }, [showSuccessDialog, countdown]);

  
  const handleToSetAreTheUserNeedToActivateAllClassesWhenActivatingPeriod = () => {
    setShowActivateDialog(false);
    // Jika periode saat ini aktif maka aksi berikutnya adalah menonaktifkan -> tidak perlu tanya all_class
    if (selectedPeriod.is_active) {
      confirmActivate();
      return;
    }
    // Jika periode saat ini non-aktif dan akan diaktifkan -> tanya apakah semua kelas juga diaktifkan
    setShowAllClassDialog(true);
  }

  const handleCheckToAllClassBecauseApiWantToKnowIfAllClassesNeedToBeActiveOrNotWhenClassAreGoingToActivateByUser = () => {
    confirmActivate(true);
  };

  const handleSkipToActivateAllClassWhenActivatingPeriod = () => {
    confirmActivate();
  };
  
  const confirmActivate = async (allClass = null) => {
    setShowActivateDialog(false);
    setShowAllClassDialog(false);
    if (!selectedPeriod) {
      return;
    }
    
    setIsTogglingStatus(true);

    try {
      const senddata = { all_class: allClass };
      const response = await toggleAcademicPeriodStatus(selectedPeriod.id_academic_period, senddata);
      if (response.status === 'success') {
        // Karena mengaktifkan satu periode menonaktifkan periode lain, lebih aman re-fetch
        await indexPeriods();
        setSuccessActivate('Status periode akademik berhasil diubah menjadi ' + (response.data.is_active ? 'Aktif' : 'Non-Aktif'));
        setCountdown(5);
        setShowSuccessDialog(true);
      } else {
        setErrorActivate('Gagal mengubah status periode akademik: ' + (response.message || 'Terjadi kesalahan'));
        setShowErrorDialog(true);
      }
    } catch (error) {
      setErrorActivate('Gagal mengubah status periode akademik: ' + (error.message || 'Terjadi kesalahan'));
      setShowErrorDialog(true);
    } finally {
      setSelectedPeriod(null);
      setSelectedIndex(null);
      setIsTogglingStatus(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    router.push('/adminpage');
  };

  return (
    <div className="min-h-screen bg-brand-light-sage" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <AdminNavbar title="Dashboard Admin - Manajemen Periode Akademik" />
      
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
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
              Manajemen Periode Akademik
            </h2>
            <button 
              onClick={handleAddPeriod}
              className="text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition shadow-md hover:opacity-90 disabled:opacity-50" 
              style={{ backgroundColor: '#015023', borderRadius: '12px' }}
            >
              + Tambah Data Periode Akademik
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessageBoxWithButton message={error} action={indexPeriods} />
        )}

        {/* Stats Card */}
        <div className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl" style={{ background: 'linear-gradient(to bottom right, #015023, #013d1c)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Total Periode Akademik</h3>
              <p className="text-white text-3xl sm:text-4xl font-bold mb-1">{loading ? '...' : filteredPeriods.length}</p>
              <p className="text-sm" style={{ color: '#DABC4E' }}>
                {loading ? 'Loading...' : searchQuery ? 'Hasil pencarian' : 'Periode terdaftar'}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl shadow-lg" style={{ backgroundColor: '#DABC4E' }}>
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#015023' }} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 mb-4 flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#DABC4E', borderRadius: '12px' }}>
          <Search className="w-5 h-5" style={{ color: '#015023' }} />
          <input
            type="text"
            placeholder="Cari periode akademik..."
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

        {/* Data Table */}
        {success && (
        <DataTable
          columns={columns}
          data={filteredPeriods}
          actions={['edit', 'delete', 'activate']}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          customRender={customRender}
        />
        )}
      </div>

      {/* Alert Dialogs konfirm */}
      {selectedPeriod?.is_active ? (
        <AlertWarningDialog 
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title={'Tidak Dapat Menghapus'}
          description="Tidak dapat menghapus periode yang sedang aktif!"
        />
      ) : (
        <AlertConfirmationRedDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog}
          title={'Konfirmasi Hapus'}
          description={
            <>
              Apakah Anda yakin ingin menghapus periode <strong>{selectedPeriod?.name}</strong>?
              <br />
              <span style={{ color: '#BE0414', fontWeight: '600', marginTop: '8px', display: 'block' }}>
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </>
          }
          confirmText="Hapus"
          onConfirm={confirmDelete}
        />
      )}

      {/* Konfirmasi Ubah Status */}
      <AlertConfirmationDialog 
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
        title="Konfirmasi Ubah Status"
        description={
          `Apakah Anda yakin ingin ${selectedPeriod?.is_active ? 'menonaktifkan' : 'mengaktifkan'} periode ${selectedPeriod?.name}?`
        }
        confirmText={selectedPeriod?.is_active ? 'Non-Aktifkan' : 'Aktifkan'}
        onConfirm={handleToSetAreTheUserNeedToActivateAllClassesWhenActivatingPeriod}
      />

      {/* Konfirmasi Aktivasi Semua Kelas */}
      <AlertConfirmationDialogTwoOption 
        open={showAllClassDialog}
        onOpenChange={setShowAllClassDialog}
        title="Konfirmasi Aktivasi Semua Kelas"
        description={
          <>
            Apakah Anda ingin mengaktifkan semua kelas yang terkait dengan periode <strong>{selectedPeriod?.name}</strong>?<br />
            <span className="text-xs mt-2 block">Memilih "Lewati" tetap mengaktifkan periode tanpa mengaktifkan kelas.</span>
          </>
        }
        confirmText="Ya, Aktifkan Semua Kelas"
        onConfirm={handleCheckToAllClassBecauseApiWantToKnowIfAllClassesNeedToBeActiveOrNotWhenClassAreGoingToActivateByUser}
        cancelText="Lewati"
        onCancel={handleSkipToActivateAllClassWhenActivatingPeriod}
        closeText="Batalkan"
      />

      {/* Error Dialog */}
      <AlertErrorDialog 
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        description={errorDelete || errorActivate}
      />

      {/* Success Dialog */}
      <AlertSuccessDialog 
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description={
          <>
            {successActivate || successDelete}
            <br />
            <span className="text-xs mt-2 block">
              Pesan akan ditutup dalam {countdown} detik
            </span>
          </>
        }
        closeText={'Tutup' + (countdown > 0 ? ` (${countdown})` : '')}
      />
    </div>
  );
}
