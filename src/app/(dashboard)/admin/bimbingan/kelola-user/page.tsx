'use client';

import Link from 'next/link';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { Container } from '@/components/ui/container-dashboard';
import { SuccessMessageBox, ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { UserStatGrids } from '@/features/admin-bimbingan/components/UserStatGrids';
import { UserTabs } from '@/features/admin-bimbingan/components/UserTabs';
import { UserFilterBar } from '@/features/admin-bimbingan/components/UserFilterBar';
import { UserTable } from '@/features/admin-bimbingan/components/UserTable';
import { DosenTable } from '@/features/admin-bimbingan/components/DosenTable';
import { AssignDosenModal } from '@/features/admin-bimbingan/components/AssignDosenModal';
import { useKelolaUser } from '@/features/admin-bimbingan/hooks/useKelolaUser';

export default function KelolaUserPage() {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    selectedUser,
    isLoading,
    sortBy,
    setSortBy,
    stats,
    mahasiswaList,
    filteredMahasiswa,
    dosenList,
    filteredDosen,
    openAssignModal,
    closeModal,
    handleAssignDosen,
    successMessage,
    setSuccessMessage,
    errorMessage,
    setErrorMessage,
  } = useKelolaUser();

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
            <h1 className="text-3xl font-bold text-[#015023]">Kelola Data User</h1>
            <p className="text-sm text-gray-600 mt-2">Kelola data mahasiswa dan dosen pembimbing</p>
          </div>

          {/* Feedback Messages */}
          {successMessage && !errorMessage && (
            <div className="mb-4" onAnimationEnd={() => setSuccessMessage(null)}>
              <SuccessMessageBox message={successMessage} />
            </div>
          )}
          {!successMessage && errorMessage && (
            <div className="mb-4">
              <ErrorMessageBoxWithButton
                message={errorMessage}
                action={() => setErrorMessage(null)}
                btntext="Tutup"
                back={false}
                actionback={() => {}}
                btntextback=""
              />
            </div>
          )}

          {/* Stat Grids */}
          <UserStatGrids stats={stats} />

          {/* Tabs */}
          <UserTabs activeTab={activeTab} onTabChange={setActiveTab} mahasiswaCount={stats.totalMahasiswa} dosenCount={stats.totalDosen} />

          {/* Mahasiswa Tab Content */}
          {activeTab === 'mahasiswa' && (
            <>
              {/* Filter Bar */}
              <UserFilterBar
                activeTab={activeTab}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {/* Table */}
              <UserTable mahasiswa={filteredMahasiswa} onRowClick={openAssignModal} isLoading={isLoading} />
            </>
          )}

          {/* Dosen Tab Content */}
          {activeTab === 'dosen' && (
            <>
              {/* Filter Bar */}
              <UserFilterBar activeTab={activeTab} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

              {/* Table */}
              <DosenTable dosen={filteredDosen} />
            </>
          )}
        </Container>
      </main>

      {/* Modal */}
      {selectedUser && (
        <AssignDosenModal
          open={isModalOpen}
          mahasiswa={selectedUser}
          dosenList={dosenList}
          onClose={closeModal}
          onAssign={handleAssignDosen}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
