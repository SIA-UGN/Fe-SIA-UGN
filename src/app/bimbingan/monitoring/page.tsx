'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import DosenInfoCard from '@/features/bimbingan-ta/components/DosenInfoCard';
import JadwalBimbinganTable from '@/features/bimbingan-ta/components/JadwalBimbinganTable';
import CatatanTimeline from '@/features/bimbingan-ta/components/CatatanTimeline';
import CustomUGNSelect from '@/features/bimbingan-ta/components/CustomUGNSelect';
import { useMonitoringTA } from '@/features/bimbingan-ta/hooks/useMonitoringTA';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function MonitoringBimbinganPage() {
  const {
    monitoringOptions,
    selectedMonitoringId,
    setSelectedMonitoringId,
    dosenInfo,
    jadwalBimbingan,
    catatanBimbingan,
    isLoading,
    error,
    refetch,
    hasConfirmedMentorships,
  } = useMonitoringTA();

  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };
  const monitoringSelectOptions = monitoringOptions.map((option) => ({
    label: option.label,
    value: option.id,
  }));

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
            <span style={{ color: '#015023', fontWeight: 600 }}>Monitoring</span>
          </nav>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ ...font, color: '#015023' }}>
              Monitoring Bimbingan Tugas Akhir
            </h1>
            <p className="mt-1 text-sm text-gray-500" style={font}>
              Pantau progress bimbingan dan jadwal pertemuan dengan dosen pembimbing
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" style={font}>
              {error}
              <button onClick={refetch} className="ml-3 font-semibold underline hover:text-red-900">
                Coba lagi
              </button>
            </div>
          )}

          {/* Stacked content cards */}
          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-600" style={font}>
              Memuat data monitoring bimbingan...
            </div>
          ) : !hasConfirmedMentorships ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4" style={font}>
              <p className="text-sm font-medium text-amber-800">
                Belum ada bimbingan yang terkonfirmasi dosen untuk dimonitor.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Setelah dosen menyetujui bimbingan TA Anda, pilihan monitoring akan muncul di halaman ini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <CustomUGNSelect
                  label="Pilih bimbingan yang dimonitor"
                  value={selectedMonitoringId}
                  placeholder="Pilih dosen pembimbing"
                  options={monitoringSelectOptions}
                  onChange={setSelectedMonitoringId}
                  className="max-w-xl"
                />
                <p className="mt-3 text-sm text-gray-500" style={font}>
                  Mahasiswa dapat memonitor beberapa bimbingan sesuai konfirmasi dari dosen terkait.
                </p>
              </div>

              {dosenInfo && (
                <>
                  <DosenInfoCard data={dosenInfo} />
                  <JadwalBimbinganTable data={jadwalBimbingan} />
                  <CatatanTimeline data={catatanBimbingan} />
                </>
              )}
            </div>
          )}
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
