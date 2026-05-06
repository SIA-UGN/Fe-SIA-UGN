'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import GaleriFilterBar from '@/features/bimbingan-ta/components/GaleriFilterBar';
import JudulTACard from '@/features/bimbingan-ta/components/JudulTACard';
import KonfirmasiAjuanModal from '@/features/bimbingan-ta/components/KonfirmasiAjuanModal';
import { useGaleriTA } from '@/features/bimbingan-ta/hooks/useGaleriTA';
import { useRiwayatTA } from '@/features/bimbingan-ta/hooks/useRiwayatTA';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

export default function GaleriJudulTAPage() {
  const {
    searchTerm,
    setSearchTerm,
    selectedKategori,
    setSelectedKategori,
    kategoriOptions,
    filteredData,
    paginatedData,
    currentPage,
    totalPages,
    canGoPreviousPage,
    canGoNextPage,
    goToPreviousPage,
    goToNextPage,
    isModalOpen,
    selectedTA,
    openModal,
    closeModal,
    handleKonfirmasiAjukan,
    isLoading,
    isSubmitting,
    error,
    refetch,
    sortBy,
    setSortBy,
    galeriData,
  } = useGaleriTA();
  const { thesis } = useRiwayatTA();
  const hasApprovedSupervisor =
    Boolean(thesis?.thesis_lecturers?.some((req) => req.status === 'accepted')) ||
    thesis?.status === 'on_progress' ||
    thesis?.status === 'revision' ||
    thesis?.status === 'finished';

  const disabledReason = 'Bimbingan TA sudah disetujui dosen. Anda tidak dapat mengajukan bimbingan dari galeri TA lagi.';

  const handleOpenAjukanModal = (item: (typeof filteredData)[number]) => {
    if (hasApprovedSupervisor) return;
    openModal(item);
  };

  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#E6EEE9' }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#015023' }} />
        <div className="absolute top-40 -left-32 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: '#015023' }} />
        <div className="absolute -bottom-32 right-20 w-80 h-80 rounded-full opacity-[0.08]" style={{ backgroundColor: '#015023' }} />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: '#DABC4E' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full opacity-15" style={{ backgroundColor: '#DABC4E' }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: '#DABC4E' }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full opacity-15" style={{ backgroundColor: '#DABC4E' }} />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <Container className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1 mb-1"
            style={{ ...font, fontSize: '14px' }}
          >
            <Link
              href="/dashboard"
              className="hover:underline flex items-center gap-1"
              style={{ color: '#6B7280' }}
            >
              <Home size={14} />
              Beranda
            </Link>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <Link href="/bimbingan/pengajuan" className="hover:underline" style={{ color: '#6B7280' }}>
              Bimbingan
            </Link>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span style={{ color: '#015023', fontWeight: 600 }}>Galeri Judul TA</span>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-2xl font-bold"
              style={{ ...font, color: '#015023' }}
            >
              Galeri Judul Tugas Akhir
            </h1>
            <p className="mt-1 text-sm text-gray-500" style={font}>
              Pilih dari judul-judul tugas akhir yang ditawarkan oleh dosen pembimbing
            </p>
          </div>

          {/* Filter bar */}
          <GaleriFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedKategori={selectedKategori}
            onKategoriChange={setSelectedKategori}
            kategoriOptions={kategoriOptions}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" style={font}>
              {error}
              <button onClick={refetch} className="ml-3 font-semibold underline hover:text-red-900">
                Coba lagi
              </button>
            </div>
          )}

          {hasApprovedSupervisor && (
            <div
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              style={font}
            >
              Bimbingan TA Anda sudah disetujui dosen. Pengajuan dari galeri TA dinonaktifkan.
            </div>
          )}

          {/* Result count */}
          <p
            className="mt-5 mb-4 text-sm text-gray-500"
            style={font}
          >
            Menampilkan{' '}
            <span className="font-semibold text-gray-700">{isLoading ? '-' : paginatedData.length}</span>{' '}
            dari{' '}
            <span className="font-semibold text-gray-700">{isLoading ? '-' : filteredData.length}</span>{' '}
            judul tugas akhir
          </p>

          {/* Grid */}
          {filteredData.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-500 text-base" style={{ ...font, marginBottom: '12px' }}>
                {galeriData.length === 0 
                  ? 'Belum ada judul tugas akhir yang dipublikasikan oleh dosen saat ini.'
                  : 'Tidak ada judul tugas akhir yang sesuai dengan pencarian Anda.'}
              </p>
              {galeriData.length === 0 && (
                <button
                  onClick={refetch}
                  className="text-sm font-semibold underline text-green-700 hover:text-green-900 mt-2"
                >
                  Muat ulang
                </button>
              )}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-lg h-80 animate-pulse"
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200">
              {paginatedData.map((item) => (
                <JudulTACard
                  key={item.id}
                  data={item}
                  onAjukan={handleOpenAjukanModal}
                  isDisabled={hasApprovedSupervisor}
                  disabledReason={disabledReason}
                />
              ))}
            </div>
          )}

          {filteredData.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <Pagination className="w-full">
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!canGoPreviousPage) return;
                        goToPreviousPage();
                      }}
                      className={!canGoPreviousPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span
                      className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-sm font-medium text-white"
                      style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                    >
                      {currentPage} / {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!canGoNextPage) return;
                        goToNextPage();
                      }}
                      className={!canGoNextPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Container>
      </main>

      {/* Footer */}
      <Footer />

      {/* Confirmation Modal */}
      <KonfirmasiAjuanModal
        open={isModalOpen}
        data={selectedTA}
        onClose={closeModal}
        onConfirm={handleKonfirmasiAjukan}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
