'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/container-dashboard';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { BimbinganHeroCard } from '@/features/admin-bimbingan/components/BimbinganHeroCard';
import { BimbinganStatGrids } from '@/features/admin-bimbingan/components/BimbinganStatGrids';
import { BimbinganActionLinks } from '@/features/admin-bimbingan/components/BimbinganActionLinks';
import { PengajuanTerbaruList } from '@/features/admin-bimbingan/components/PengajuanTerbaruList';
import { AdminTADetailModal } from '@/features/admin-bimbingan/components/AdminTADetailModal';
import { useDashboardBimbingan } from '@/features/admin-bimbingan/hooks/useDashboardBimbingan';

export default function DashboardBimbinganPage() {
  const { stats, recentSubmissions, isLoading, errorMessage, isModalOpen, selectedItem, handleOpenModal, handleCloseModal } =
    useDashboardBimbingan();

  const handleAssignDosen = () => {
    // TODO: Implement assign dosen functionality
    console.log('Assigning dosen for:', selectedItem?.id);
    handleCloseModal();
  };

  return (
    <div
      className="min-h-screen bg-[#E6EEE9] flex flex-col"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      {/* Decorative Background Circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-10 right-20 w-64 h-64 rounded-full bg-[#015023] opacity-10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute top-40 left-10 w-48 h-48 rounded-full bg-[#015023] opacity-5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-20 right-1/3 w-72 h-72 rounded-full bg-[#015023] opacity-8 blur-3xl"
          aria-hidden="true"
        />
      </div>

      {/* Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <Container className="py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <span>← Kembali ke Dashboard</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#015023]">Dashboard Bimbingan</h1>
            <p className="text-sm text-gray-600 mt-2">Kelola pengajuan dan monitoring bimbingan tugas akhir mahasiswa</p>
          </div>

          {errorMessage && !isLoading && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Hero Card */}
          {!isLoading && <BimbinganHeroCard stats={stats} />}

          {/* Stat Grids */}
          {!isLoading && <BimbinganStatGrids stats={stats} />}

          {/* Action Links */}
          <BimbinganActionLinks />

          {/* Recent Submissions */}
          {!isLoading && (
            <PengajuanTerbaruList submissions={recentSubmissions} onItemClick={handleOpenModal} />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#015023] animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Memuat data dashboard...</p>
              </div>
            </div>
          )}
        </Container>
      </main>

      {/* Modal */}
      <AdminTADetailModal
        open={isModalOpen}
        submission={selectedItem}
        onClose={handleCloseModal}
        onAssignDosen={handleAssignDosen}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
