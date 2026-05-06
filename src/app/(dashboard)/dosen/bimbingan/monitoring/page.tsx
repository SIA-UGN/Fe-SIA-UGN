'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import MahasiswaSidebar from '@/features/bimbingan-ta/components/MahasiswaSidebar';
import MonitoringDetailContent from '@/features/bimbingan-ta/components/MonitoringDetailContent';
import { AturJadwalModal, TambahCatatanModal } from '@/features/bimbingan-ta/components/MonitoringModals';
import { useMonitoringDosen } from '@/features/bimbingan-ta/hooks/useMonitoringDosen';

export default function MonitoringBimbinganDosenPage() {
  const {
    filteredStudents,
    activeStudent,
    searchQuery,
    setSearchQuery,
    selectedStudentId,
    setSelectedStudentId,
    isCatatanModalOpen,
    setIsCatatanModalOpen,
    isJadwalModalOpen,
    setIsJadwalModalOpen,
    handleTambahCatatan,
    handleAturJadwal,
    handleUpdateStatus,
    toast,
    setToast,
  } = useMonitoringDosen();

  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ backgroundColor: '#E6EEE9' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10" style={{ backgroundColor: '#015023' }} />
        <div className="absolute -left-32 top-40 h-96 w-96 rounded-full opacity-5" style={{ backgroundColor: '#015023' }} />
        <div className="absolute -bottom-32 right-20 h-80 w-80 rounded-full opacity-[0.08]" style={{ backgroundColor: '#015023' }} />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1">
        <Container className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-1 flex items-center gap-1" style={{ ...font, fontSize: '14px' }}>
            <Link href="/dashboard" className="flex items-center gap-1 hover:underline" style={{ color: '#6B7280' }}>
              <Home size={14} />
              Beranda
            </Link>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <Link href="/dosen/bimbingan/kelola-judul" className="hover:underline" style={{ color: '#6B7280' }}>
              Bimbingan
            </Link>
            <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
            <span className="font-semibold" style={{ color: '#015023' }}>Monitoring Bimbingan</span>
          </nav>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#015023]">Monitoring Bimbingan Tugas Akhir</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola catatan bimbingan dan jadwal konsultasi mahasiswa bimbingan</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <MahasiswaSidebar
                students={filteredStudents}
                searchQuery={searchQuery}
                selectedStudentId={selectedStudentId}
                onSearchChange={setSearchQuery}
                onSelectStudent={setSelectedStudentId}
              />
            </div>

            <div className="lg:col-span-8">
              <MonitoringDetailContent
                student={activeStudent}
                onOpenCatatanModal={() => setIsCatatanModalOpen(true)}
                onOpenJadwalModal={() => setIsJadwalModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </div>
        </Container>
      </main>

      <Footer />

      <TambahCatatanModal
        open={isCatatanModalOpen}
        studentName={activeStudent?.nama}
        onClose={() => setIsCatatanModalOpen(false)}
        onSubmit={handleTambahCatatan}
      />

      <AturJadwalModal
        open={isJadwalModalOpen}
        studentName={activeStudent?.nama}
        onClose={() => setIsJadwalModalOpen(false)}
        onSubmit={handleAturJadwal}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-[60]" style={font}>
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs underline opacity-80 transition-opacity hover:opacity-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
