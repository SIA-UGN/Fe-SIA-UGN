'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import RiwayatTATable from '@/features/bimbingan-ta/components/RiwayatTATable';
import { useRiwayatTA } from '@/features/bimbingan-ta/hooks/useRiwayatTA';

export default function PengajuanTAPage() {
  const { data, isLoading, error, refetch } = useRiwayatTA();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* @ts-expect-error — JS component with forwardRef */}
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Breadcrumb ─────────────────────────────────────── */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-400">Bimbingan</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-700">Pengajuan TA</span>
        </nav>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengajuan Tugas Akhir</h1>
            <p className="text-sm text-gray-500 mt-1">Ajukan proposal tugas akhir Anda</p>
          </div>

          <Link
            href="/bimbingan/pengajuan/buat"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ backgroundColor: '#015023' }}
          >
            <Plus className="h-4 w-4" />
            Buat Pengajuan
          </Link>
        </div>

        {/* ── Error state ────────────────────────────────────── */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              onClick={refetch}
              className="ml-3 font-semibold underline hover:text-red-900"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────── */}
        <RiwayatTATable data={data} isLoading={isLoading} />
      </main>

      <Footer />
    </div>
  );
}
