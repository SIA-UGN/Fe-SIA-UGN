'use client';

import Link from 'next/link';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import { MonitoringHeroCard } from '@/features/admin-bimbingan/components/MonitoringHeroCard';
import { MonitoringStatGrids } from '@/features/admin-bimbingan/components/MonitoringStatGrids';
import { MonitoringFilterBar } from '@/features/admin-bimbingan/components/MonitoringFilterBar';
import { MonitoringTable } from '@/features/admin-bimbingan/components/MonitoringTable';
import { useMonitoringPengajuan } from '@/features/admin-bimbingan/hooks/useMonitoringPengajuan';

export default function MonitoringPengajuanPage() {
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterProdi,
    setFilterProdi,
    filterDosen,
    setFilterDosen,
    dateRange,
    setDateRange,
    isLoading,
    sortBy,
    setSortBy,
    filteredPengajuan,
    heroStats,
    gridStats,
    handleDetailClick,
  } = useMonitoringPengajuan();

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
          <div className="mb-6">
            <Link
              href="/admin/bimbingan"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>← Dashboard Bimbingan</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#015023]">Monitoring Pengajuan TA</h1>
            <p className="text-sm text-gray-600 mt-2">Pantau status pengajuan tugas akhir setiap mahasiswa</p>
          </div>

          {/* Hero Card */}
          <MonitoringHeroCard stats={heroStats} />

          {/* Stat Grids */}
          <MonitoringStatGrids stats={gridStats} />

          {/* Filter Bar */}
          <MonitoringFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterProdi={filterProdi}
            onProdiChange={setFilterProdi}
            filterDosen={filterDosen}
            onDosenChange={setFilterDosen}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Table */}
          <MonitoringTable pengajuan={filteredPengajuan} onDetailClick={handleDetailClick} isLoading={isLoading} />
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
