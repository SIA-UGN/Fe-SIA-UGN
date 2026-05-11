'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Eye,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import TypeTabs from '@/components/ui/TypeTabs';
import InfoCard from '@/components/ui/info-card';
import DataTable from '@/components/ui/table';
import AdminSuggestionDetailModal from '@/components/library/admin-suggestion-detail-modal';
import { formatDate, formatDateTime, getErrorMessage } from '@/features/library/utils';
import {
  useAdminLibraryOrdersQuery,
  useConfirmAdminLibraryBorrowMutation,
  useConfirmAdminLibraryReturnMutation,
} from '@/features/library/hooks/useAdminLibraryOrdersQuery';
import {
  useAdminLibrarySuggestionsQuery,
  useRespondAdminLibrarySuggestionMutation,
} from '@/features/library/hooks/useAdminLibrarySuggestionsQuery';

const PER_PAGE = 12;

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'ordered', label: 'Dipesan' },
  { value: 'borrowed', label: 'Dipinjam' },
  { value: 'returned', label: 'Dikembalikan' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const SUGGESTION_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

function isLateOrder(order) {
  if (!order?.due_date || order.status !== 'borrowed') return false;
  const dueDate = new Date(order.due_date);
  if (Number.isNaN(dueDate.getTime())) return false;
  return dueDate.getTime() < Date.now();
}

export default function AdminLibraryOrdersPage() {
  const [activeLibraryTab, setActiveLibraryTab] = useState('orders');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actingId, setActingId] = useState(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [suggestionDetailOpen, setSuggestionDetailOpen] = useState(false);

  const orderQueryParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      status: activeLibraryTab === 'orders' && statusFilter !== 'all' ? statusFilter : undefined,
      page,
      per_page: PER_PAGE,
    }),
    [activeLibraryTab, appliedSearch, page, statusFilter],
  );

  const suggestionQueryParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      status: activeLibraryTab === 'suggestions' && statusFilter !== 'all' ? statusFilter : undefined,
    }),
    [activeLibraryTab, appliedSearch, statusFilter],
  );

  const ordersQuery = useAdminLibraryOrdersQuery(orderQueryParams);
  const suggestionsQuery = useAdminLibrarySuggestionsQuery(suggestionQueryParams);

  const borrowMutation = useConfirmAdminLibraryBorrowMutation();
  const returnMutation = useConfirmAdminLibraryReturnMutation();
  const respondSuggestionMutation = useRespondAdminLibrarySuggestionMutation();

  const orderItems = ordersQuery.data?.items || [];
  const orderMeta = ordersQuery.data?.meta || { current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 };
  const suggestionItems = suggestionsQuery.data?.items || [];
  const suggestionMeta = suggestionsQuery.data?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: suggestionItems.length || 1,
    total: suggestionItems.length,
  };

  const activeItems = activeLibraryTab === 'orders' ? orderItems : suggestionItems;
  const activeMeta = activeLibraryTab === 'orders' ? orderMeta : suggestionMeta;
  const activeStatusOptions = activeLibraryTab === 'orders' ? ORDER_STATUS_OPTIONS : SUGGESTION_STATUS_OPTIONS;
  const selectedStatusLabel = activeStatusOptions.find((option) => option.value === statusFilter)?.label || 'Semua Status';

  useEffect(() => {
    setIsStatusDropdownOpen(false);
  }, [activeLibraryTab]);

  const orderStats = useMemo(() => {
    const borrowed = orderItems.filter((item) => item.status === 'borrowed').length;
    const returned = orderItems.filter((item) => item.status === 'returned').length;
    const late = orderItems.filter(isLateOrder).length;

    return { borrowed, returned, late };
  }, [orderItems]);

  const suggestionStats = useMemo(() => {
    const pending = suggestionItems.filter((item) => item.status === 'pending').length;
    const approved = suggestionItems.filter((item) => item.status === 'approved').length;
    const rejected = suggestionItems.filter((item) => item.status === 'rejected').length;

    return { pending, approved, rejected };
  }, [suggestionItems]);

  const columnsOrders = [
    { key: 'mahasiswa', label: 'Mahasiswa', cellClassName: 'text-left' },
    { key: 'judul_buku', label: 'Judul Buku', cellClassName: 'text-left' },
    { key: 'tanggal_pinjam', label: 'Tanggal Pinjam' },
    { key: 'jatuh_tempo', label: 'Jatuh Tempo' },
    { key: 'status', label: 'Status' },
    { key: 'aksi_custom', label: 'Aksi' },
  ];

  const columnsUsulan = [
    { key: 'mahasiswa', label: 'Mahasiswa', cellClassName: 'text-left' },
    { key: 'judul_buku', label: 'Judul Buku', cellClassName: 'text-left' },
    { key: 'penulis', label: 'Penulis' },
    { key: 'tanggal_usulan', label: 'Tanggal Usulan' },
    { key: 'status', label: 'Status' },
    { key: 'aksi_custom', label: 'Aksi' },
  ];

  const handleConfirmBorrow = async (orderId) => {
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActingId(orderId);

    try {
      const response = await borrowMutation.mutateAsync({
        orderId,
        payload: { admin_note: adminNote },
      });
      toast.success(response?.message || 'Peminjaman berhasil dikonfirmasi.');
      await ordersQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengonfirmasi peminjaman.'));
    } finally {
      setActingId(null);
    }
  };

  const handleConfirmReturn = async (orderId) => {
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActingId(orderId);

    try {
      const response = await returnMutation.mutateAsync({
        orderId,
        payload: { admin_note: adminNote },
      });
      toast.success(response?.message || 'Pengembalian berhasil dikonfirmasi.');
      await ordersQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengonfirmasi pengembalian.'));
    } finally {
      setActingId(null);
    }
  };

  const handleOpenDetailUsulan = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setSuggestionDetailOpen(true);
  };

  const handleCloseDetailUsulan = () => {
    setSuggestionDetailOpen(false);
    setSelectedSuggestion(null);
  };

  const handleApproveSuggestion = async (suggestionId, adminResponse) => {
    try {
      const result = await respondSuggestionMutation.mutateAsync({
        suggestionId,
        payload: { status: 'approved', admin_response: adminResponse },
      });
      toast.success(result?.message || 'Usulan berhasil disetujui.');
      handleCloseDetailUsulan();
      await suggestionsQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyetujui usulan.'));
    }
  };

  const handleRejectSuggestion = async (suggestionId, adminResponse) => {
    try {
      const result = await respondSuggestionMutation.mutateAsync({
        suggestionId,
        payload: { status: 'rejected', admin_response: adminResponse },
      });
      toast.success(result?.message || 'Usulan berhasil ditolak.');
      handleCloseDetailUsulan();
      await suggestionsQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menolak usulan.'));
    }
  };

  const customRenderOrders = {
    mahasiswa: (_value, row) => (
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#015023] text-[15px] font-bold text-white shadow-sm">
          {(row.user_name || 'U').charAt(0).toUpperCase()
}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[15px] font-bold text-gray-800 leading-tight mb-0.5">{row.user_name}</span>
          <span className="text-[13px] text-gray-500">{row.user_nim}</span>
        </div>
      </div>
    ),
    judul_buku: (_value, row) => (
      <div className="flex flex-col text-left">
        <span className="text-[15px] font-bold text-gray-800 leading-tight mb-0.5">{row.book_title}</span>
        <span className="text-[13px] text-gray-500">{row.book_isbn}</span>
      </div>
    ),
    tanggal_pinjam: (_value, row) => (
      <span className="text-[14px] font-medium text-gray-600">{formatDateTime(row.borrowed_at || row.ordered_at)}</span>
    ),
    jatuh_tempo: (_value, row) => (
      <span className="text-[14px] font-medium text-gray-600">{formatDate(row.due_date)}</span>
    ),
    status: (_value, row) => (
      <div className="flex items-center justify-center">
        <LibraryStatusBadge type="order" status={row.status} />
      </div>
    ),
    aksi_custom: (_value, row) => {
      const isCompleted = row.status === 'returned' || row.status === 'cancelled';

      return (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/adminpage/perpustakaan/order/${row.id_book_order}`}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#0066CC] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" /> Detail
          </Link>

          {row.status === 'ordered' ? (
            <PrimaryButton
              type="button"
              className="h-auto rounded-[8px] bg-[#015023] px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90 shadow-sm"
              onClick={() => handleConfirmBorrow(row.id_book_order)}
              disabled={actingId === row.id_book_order || borrowMutation.isPending || returnMutation.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Konfirmasi
            </PrimaryButton>
          ) : null}

          {row.status === 'borrowed' ? (
            <PrimaryButton
              type="button"
              className="h-auto rounded-[8px] bg-[#015023] px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90 shadow-sm"
              onClick={() => handleConfirmReturn(row.id_book_order)}
              disabled={actingId === row.id_book_order || borrowMutation.isPending || returnMutation.isPending}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Kembalikan
            </PrimaryButton>
          ) : null}

          {isCompleted ? (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-[8px] bg-[#cbd5e1] px-3 py-1.5 text-[12px] font-bold text-[#64748b] cursor-not-allowed"
              disabled
            >
              <CheckCheck className="w-3.5 h-3.5" /> Selesai
            </button>
          ) : null}
        </div>
      );
    },
  };

  const customRenderUsulan = {
    mahasiswa: (_value, row) => (
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#015023] text-[15px] font-bold text-white shadow-sm">
          {(row.user_name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[15px] font-bold text-gray-800 leading-tight mb-0.5">{row.user_name}</span>
          <span className="text-[13px] text-gray-500">{row.user_nim}</span>
        </div>
      </div>
    ),
    judul_buku: (_value, row) => <span className="text-[15px] font-bold text-gray-800">{row.title}</span>,
    penulis: (_value, row) => <span className="text-[14px] text-gray-500 font-medium">{row.author}</span>,
    tanggal_usulan: (_value, row) => <span className="text-[14px] font-medium text-gray-600">{formatDate(row.created_at)}</span>,
    status: (_value, row) => (
      <div className="flex items-center justify-center">
        <LibraryStatusBadge type="suggestion" status={row.status} />
      </div>
    ),
    aksi_custom: (_value, row) => (
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => handleOpenDetailUsulan(row)}
          className="flex items-center gap-1.5 rounded-[8px] bg-[#015023] px-4 py-2 text-[12px] font-bold text-white transition hover:opacity-90 shadow-sm"
        >
          <Eye className="w-4 h-4" /> Detail
        </button>
      </div>
    ),
  };

  const handleTabChange = (tabKey) => {
    setActiveLibraryTab(tabKey);
    setStatusFilter('all');
    setIsStatusDropdownOpen(false);
    setPage(1);
  };

  const handleApplySearch = useCallback(() => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  }, [searchInput]);

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  const orderTab = { key: 'orders', label: 'Peminjaman', icon: BookOpen, count: orderItems.length };
  const suggestionTab = { key: 'suggestions', label: 'Usulan', icon: CheckCheck, count: suggestionItems.length };

  const activeError = activeLibraryTab === 'orders' ? ordersQuery.error : suggestionsQuery.error;
  const activeRefetch = activeLibraryTab === 'orders' ? ordersQuery.refetch : suggestionsQuery.refetch;
  const activeIsLoading = activeLibraryTab === 'orders' ? ordersQuery.isLoading : suggestionsQuery.isLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar title="Manajemen Peminjaman & Usulan" />

      <main className="flex-1 bg-brand-light-sage">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/adminpage/perpustakaan"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-80"
              style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
              <ArrowLeft size={18} />
              Kembali ke Dashboard Perpustakaan
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold mb-1"
                  style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                  Manajemen Peminjaman & Usulan
                </h1>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Kelola peminjaman buku dan verifikasi usulan dari mahasiswa
                </p>
              </div>
            </div>

            {activeError ? <ErrorMessageBoxWithButton message={getErrorMessage(activeError, 'Gagal memuat data perpustakaan.')} action={activeRefetch} /> : null}

            <div className="w-full flex justify-start mb-4">
              <TypeTabs activeTab={activeLibraryTab} onTabChange={handleTabChange} tabs={[orderTab, suggestionTab]} />
            </div>

            {activeLibraryTab === 'orders' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
                <InfoCard
                  title="Dipinjam"
                  value={orderStats.borrowed || 0}
                  subtitle="Buku sedang dipinjam"
                  Icon={ClipboardList}
                  theme="blue"
                  variant="vertical"
                />
                <InfoCard
                  title="Dikembalikan"
                  value={orderStats.returned || 0}
                  subtitle="Buku sudah dikembalikan"
                  Icon={ClipboardCheck}
                  theme="green"
                  variant="vertical"
                />
                <InfoCard
                  title="Terlambat"
                  value={orderStats.late || 0}
                  subtitle="Buku terlambat dikembalikan"
                  Icon={CheckCircle2}
                  theme="red"
                  variant="vertical"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
                <InfoCard
                  title="Menunggu"
                  value={suggestionStats.pending || 0}
                  subtitle="Usulan sedang menunggu verifikasi"
                  Icon={BookOpen}
                  theme="yellow"
                  variant="vertical"
                />
                <InfoCard
                  title="Disetujui"
                  value={suggestionStats.approved || 0}
                  subtitle="Usulan telah disetujui"
                  Icon={CheckCircle2}
                  theme="green"
                  variant="vertical"
                />
                <InfoCard
                  title="Ditolak"
                  value={suggestionStats.rejected || 0}
                  subtitle="Usulan telah ditolak"
                  Icon={XCircle}
                  theme="red"
                  variant="vertical"
                />
              </div>
            )}

            <section className="my-6 flex flex-col sm:flex-row items-stretch gap-4 w-full font-urbanist">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm" style={{ backgroundColor: '#DABC4E' }}>
                <Search className="w-5 h-5" style={{ color: '#015023' }} />
                <input
                  type="text"
                  placeholder={activeLibraryTab === 'orders' ? 'Cari buku, mahasiswa, atau ISBN...' : 'Cari judul, penulis, atau mahasiswa...'}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApplySearch();
                    }
                  }}
                  className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-600"
                  style={{ color: '#015023' }}
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:opacity-80 transition"
                    style={{ color: '#015023' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : null}
              </div>

              <div className="relative min-w-[180px] font-urbanist">
                <div
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`flex items-center justify-between h-10 rounded-[10px] border px-4 text-[14px] cursor-pointer bg-white transition-all ${
                    isStatusDropdownOpen
                      ? 'border-[#015023] ring-2 ring-[#015023]/20 shadow-sm'
                      : 'border-[#d1d5db] hover:border-[#015023]/50'
                  }`}
                >
                  <span className="text-[#015023] font-semibold">{selectedStatusLabel}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#015023] transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>

                {isStatusDropdownOpen ? (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                    <div className="absolute top-[48px] left-0 w-full bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden py-1.5">
                      {activeStatusOptions.map((option) => {
                        const isSelected = statusFilter === option.value;

                        return (
                          <div
                            key={option.value}
                            onClick={() => {
                              setStatusFilter(option.value);
                              setIsStatusDropdownOpen(false);
                              setPage(1);
                            }}
                            className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#e6eee9] text-[#015023]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#015023]'
                            }`}
                          >
                            {option.label}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>
            </section>

            <section className="mb-6 font-urbanist">
              <div className="w-full mt-4">
                {activeIsLoading ? (
                  <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
                    <p className="text-[15px] text-[#4b5563]">Memuat data...</p>
                  </div>
                ) : activeLibraryTab === 'orders' ? (
                  <div className="w-full transition-all animate-in fade-in duration-300">
                    <DataTable columns={columnsOrders} data={activeItems} customRender={customRenderOrders} pagination={true} />
                  </div>
                ) : (
                  <div className="w-full transition-all animate-in fade-in duration-300">
                    <DataTable columns={columnsUsulan} data={activeItems} customRender={customRenderUsulan} pagination={true} />
                  </div>
                )}
              </div>

              {activeLibraryTab === 'orders' && activeMeta.last_page > 1 ? (
                <div className="mt-4 border-t border-[#f1f5f9] pt-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="rounded-[10px] border border-[#d1d5db] px-3 py-1.5 text-[13px] font-semibold text-[#374151] disabled:opacity-50"
                      style={{ fontFamily: 'Urbanist, sans-serif' }}
                      disabled={activeMeta.current_page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Sebelumnya
                    </button>

                    <span className="text-[13px] text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                      Halaman {activeMeta.current_page} dari {activeMeta.last_page}
                    </span>

                    <button
                      type="button"
                      className="rounded-[10px] border border-[#d1d5db] px-3 py-1.5 text-[13px] font-semibold text-[#374151] disabled:opacity-50"
                      style={{ fontFamily: 'Urbanist, sans-serif' }}
                      disabled={activeMeta.current_page >= activeMeta.last_page}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </main>

      <AdminSuggestionDetailModal
        open={suggestionDetailOpen}
        onClose={handleCloseDetailUsulan}
        suggestion={selectedSuggestion}
        onApprove={handleApproveSuggestion}
        onReject={handleRejectSuggestion}
        submitting={respondSuggestionMutation.isPending}
      />

      <Footer />
    </div>
  );
}
