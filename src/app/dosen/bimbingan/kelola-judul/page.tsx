'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import { ErrorMessageBoxWithButton, SuccessMessageBox } from '@/components/ui/message-box';
import KelolaToolbar from '@/features/bimbingan-ta/components/KelolaToolbar';
import KelolaJudulList from '@/features/bimbingan-ta/components/KelolaJudulList';
import JudulTAModal from '@/features/bimbingan-ta/components/JudulTAModal';
import { useKelolaJudulTA } from '@/features/bimbingan-ta/hooks/useKelolaJudulTA';

export default function KelolaJudulTAPage() {
  const router = useRouter();

  const {
    filteredData,
    isLoading,
    accessDenied,
    searchQuery,
    setSearchQuery,
    isModalOpen,
    editingItem,
    isSubmitting,
    isDeletingId,
    isArchivingId,
    categoryOptions,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
    modalError,
    fetchData,
    openCreateModal,
    openEditModal,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleArchive,
    handleRepublish,
    isRepublishingId,
  } = useKelolaJudulTA();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDelete = (id: number) => {
    const ok = window.confirm('Apakah Anda yakin ingin menghapus judul TA ini?');
    if (!ok) return;
    handleDelete(id);
  };

  const onArchive = (id: number) => {
    const ok = window.confirm('Arsipkan topik TA ini? Topik yang diarsipkan tidak akan tampil sebagai topik aktif.');
    if (!ok) return;
    handleArchive(id);
  };

  const onRepublish = (id: number) => {
    const ok = window.confirm('Publikasikan ulang topik TA ini? Topik akan kembali tampil sebagai topik aktif.');
    if (!ok) return;
    handleRepublish(id);
  };

  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#E6EEE9' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#015023' }} />
        <div className="absolute top-40 -left-32 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: '#015023' }} />
        <div className="absolute -bottom-32 right-20 w-80 h-80 rounded-full opacity-[0.08]" style={{ backgroundColor: '#015023' }} />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        <Container className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-1 mb-1" style={{ ...font, fontSize: '14px' }}>
            <Link href="/dashboard" className="hover:underline flex items-center gap-1" style={{ color: '#6B7280' }}>
              <Home size={14} />
              Beranda
            </Link>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <Link href="/bimbingan/pengajuan" className="hover:underline" style={{ color: '#6B7280' }}>
              Bimbingan
            </Link>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#015023', fontWeight: 600 }}>Kelola Judul TA</span>
          </nav>

          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ ...font, color: '#015023' }}>
              Kelola Judul Tugas Akhir
            </h1>
            <p className="mt-1 text-sm text-gray-500" style={font}>
              Tambah, edit, dan kelola judul-judul tugas akhir yang Anda tawarkan kepada mahasiswa
            </p>
          </div>

          {successMessage && !errorMessage && (
            <div onAnimationEnd={() => setSuccessMessage(null)}>
              <SuccessMessageBox message={successMessage} />
            </div>
          )}

          {!successMessage && errorMessage && (
            <ErrorMessageBoxWithButton
              message={errorMessage}
              action={() => {
                if (accessDenied) {
                  router.push('/dashboard');
                  return;
                }
                setErrorMessage(null);
                fetchData();
              }}
              btntext={accessDenied ? 'Ke Dashboard' : 'Coba Lagi'}
              back={false}
              actionback={() => {}}
              btntextback="Kembali"
            />
          )}

          {accessDenied ? (
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
              }}
            >
              <h2 className="text-lg font-semibold" style={{ ...font, color: '#015023' }}>
                Akses Ditolak (403)
              </h2>
              <p className="mt-2 text-sm text-gray-600" style={font}>
                Halaman ini hanya dapat diakses oleh akun dosen. Silakan login dengan akun dosen yang terdaftar.
              </p>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#013A1A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#015023')}
              >
                Kembali ke Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <KelolaToolbar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onOpenCreate={openCreateModal}
                />
              </div>

              <KelolaJudulList
                data={filteredData}
                isLoading={isLoading}
                isDeletingId={isDeletingId}
                isArchivingId={isArchivingId}
                isRepublishingId={isRepublishingId}
                onEdit={openEditModal}
                onDelete={onDelete}
                onArchive={onArchive}
                onRepublish={onRepublish}
              />
            </>
          )}
        </Container>
      </main>

      <Footer />

      {!accessDenied && (
        <JudulTAModal
          open={isModalOpen}
          editingItem={editingItem}
          categoryOptions={categoryOptions}
          isSubmitting={isSubmitting}
          serverError={modalError}
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
