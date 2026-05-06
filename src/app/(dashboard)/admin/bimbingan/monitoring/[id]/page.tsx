'use client';

import { use } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Calendar, MessageCircle } from 'lucide-react';
import { AdminNavbar } from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { useMonitoringDetail } from '@/features/admin-bimbingan/hooks/useMonitoringDetail';
import { MonitoringDetailHeader } from '@/features/admin-bimbingan/components/MonitoringDetailHeader';
import { ProgressStepper } from '@/features/admin-bimbingan/components/ProgressStepper';
import { InfoPengajuanCard } from '@/features/admin-bimbingan/components/InfoPengajuanCard';
import { EmptyStateCard } from '@/features/admin-bimbingan/components/EmptyStateCard';

export default function DetailMonitoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data } = useMonitoringDetail(id);

  return (
    <div style={{ fontFamily: 'Urbanist, sans-serif' }} className="min-h-screen flex flex-col bg-[#E6EEE9]">
      {/* Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link href="/admin/bimbingan/monitoring" className="text-[#015023] hover:underline text-sm font-semibold">
              ← Monitoring Pengajuan TA
            </Link>
          </div>

          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#015023]">Monitoring Pengajuan TA</h1>
            <p className="text-gray-600 mt-2">Detail pengajuan tugas akhir dan progres bimbingan</p>
          </div>

          {/* Detail Header Card */}
          <MonitoringDetailHeader data={data} />

          {/* Progress Stepper */}
          <div className="mt-6">
            <ProgressStepper currentStep={data.progress_step} />
          </div>

          {/* Deskripsi TA */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Deskripsi TA</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{data.deskripsi}</p>
          </div>

          {/* Catatan Bimbingan */}
          <div className="mt-6">
            <EmptyStateCard
              title="Catatan Bimbingan"
              icon={MessageCircle}
              message="Belum ada catatan bimbingan untuk pengajuan ini"
            />
          </div>

          {/* Info Pengajuan */}
          <div className="mt-6">
            <InfoPengajuanCard
              idPengajuan={data.id_pengajuan}
              programStudi={data.prodi}
              tanggalPengajuan={data.tanggal_pengajuan}
              semester={parseInt(data.semester)}
              dokumenProposal={data.dokumen_proposal}
            />
          </div>

          {/* Dosen Pembimbing */}
          <div className="mt-6">
            <EmptyStateCard
              title="Dosen Pembimbing"
              icon={Users}
              message="Belum ada dosen pembimbing yang ditugaskan"
            />
          </div>

          {/* Jadwal Bimbingan */}
          <div className="mt-6">
            <EmptyStateCard
              title="Jadwal Bimbingan"
              icon={Calendar}
              message="Belum ada jadwal bimbingan yang dijadwalkan"
            />
          </div>

          {/* Reference TA Details */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detail Pengajuan</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">ID Pengajuan</p>
                <p className="text-sm font-semibold text-gray-900">{data.id_pengajuan}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status Approval</p>
                <p className="text-sm font-semibold text-gray-900">{data.status_approval}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tanggal Pengajuan</p>
                <p className="text-sm font-semibold text-gray-900">{data.tanggal_pengajuan}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">IPK</p>
                <p className="text-sm font-semibold text-gray-900">{data.ipk}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
