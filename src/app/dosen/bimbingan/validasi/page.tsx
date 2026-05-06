'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import ValidasiStatCards from '@/features/bimbingan-ta/components/ValidasiStatCards';
import ValidasiSubmissionCard from '@/features/bimbingan-ta/components/ValidasiSubmissionCard';
import { useValidasiTA } from '@/features/bimbingan-ta/hooks/useValidasiTA';

export default function ValidasiPengajuanTAPage() {
  const {
    stats,
    pendingSubmissions,
    isLoading,
    handleApprove,
    handleReject,
    handleDownload,
    toast,
    setToast,
    refetch,
  } = useValidasiTA();

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
            <span style={{ color: '#015023', fontWeight: 600 }}>Validasi Pengajuan</span>
          </nav>

          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ ...font, color: '#015023' }}>
              Validasi Pengajuan Tugas Akhir
            </h1>
            <p className="mt-1 text-sm text-gray-500" style={font}>
              Review dan setujui atau tolak pengajuan tugas akhir dari mahasiswa
            </p>
          </div>

          <ValidasiStatCards stats={stats} />

          <div className="mb-4 bg-[#F4F9F5] p-3 rounded-t-xl" style={font}>
            <h2 className="text-[#015023] font-bold text-lg">
              Pengajuan Menunggu Review ({stats.pending})
            </h2>
          </div>

          {isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center" style={font}>
              <p className="text-sm text-gray-500">Memuat pengajuan mahasiswa...</p>
            </div>
          )}

          {!isLoading && pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center" style={font}>
              <p className="text-sm text-gray-500">Semua pengajuan sudah diproses.</p>
              <button onClick={refetch} className="ml-2 text-[#015023] text-sm font-semibold underline">
                Muat ulang
              </button>
            </div>
          ) : (
            !isLoading && pendingSubmissions.map((item) => (
              <ValidasiSubmissionCard
                key={item.id}
                item={item}
                onDownload={handleDownload}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </Container>
      </main>

      <Footer />

      {toast && (
        <div className="fixed right-4 bottom-4 z-50" style={font}>
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg border ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : toast.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs underline opacity-80 hover:opacity-100"
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
