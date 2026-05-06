'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCheck, Eye, Search, ClipboardCheck, ClipboardList, CheckCircle2, ChevronDown, RotateCcw, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import TypeTabs from '@/components/ui/TypeTabs';
import InfoCard from '@/components/ui/info-card';
import DataTable from '@/components/ui/table';
import {
  confirmAdminLibraryBorrow,
  confirmAdminLibraryReturn,
  getAdminLibraryOrders,
} from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parsePaginatedData } from '@/features/library/utils';

const PER_PAGE = 12;

export default function AdminLibraryOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeLibraryTab, setActiveLibraryTab] = useState('Peminjaman Buku');
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  //   Filter options for order status
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'ordered', label: 'Dipesan' },
    { value: 'borrowed', label: 'Dipinjam' },
    { value: 'returned', label: 'Dikembalikan' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const selectedStatusLabel = statusOptions.find((opt) => opt.value === statusFilter)?.label || 'Semua Status';

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { borrowed: 0, returned: 0, overdue: 0 };
    }
    const borrowed = orders.filter((o) => o.status === 'borrowed').length;
    const returned = orders.filter((o) => o.status === 'returned').length;
    const overdue = orders.filter((o) => o.status === 'overdue').length;
    return { borrowed, returned, overdue };
  }, [orders]);

  // Table columns definition
  const bookscolumn = [
    { key: 'mahasiswa', label: 'Mahasiswa', cellClassName: 'text-left' },
    { key: 'judul_buku', label: 'Judul Buku', cellClassName: 'text-left' },
    { key: 'tanggal_pinjam', label: 'Tanggal Pinjam' },
    { key: 'jatuh_tempo', label: 'Jatuh Tempo' },
    { key: 'status', label: 'Status' },
    { key: 'aksi_custom', label: 'Aksi' },
  ];

  // Custom render functions for specific columns in "Peminjaman Buku" tab
  const customRenderPeminjaman = {
  mahasiswa: (value, row) => (
    <div className="flex items-center gap-4">
      {/* Avatar Inisial */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#015023] text-[15px] font-bold text-white shadow-sm">
        {row.user_name ? row.user_name.charAt(0).toUpperCase() : 'U'}
      </div>
      {/* Nama & NIM */}
      <div className="flex flex-col text-left">
        <span className="text-[15px] font-bold text-gray-800 leading-tight mb-0.5">
          {row.user_name}
        </span>
        <span className="text-[13px] text-gray-500">
          {row.user_nim}
        </span>
      </div>
    </div>
  ),

  judul_buku: (value, row) => (
    <div className="flex flex-col text-left">
      <span className="text-[15px] font-bold text-gray-800 leading-tight mb-0.5">
        {row.book_title}
      </span>
      <span className="text-[13px] text-gray-500">
        {row.book_isbn}
      </span>
    </div>
  ),

  tanggal_pinjam: (value, row) => (
    <span className="text-[14px] font-medium text-gray-600">
      {row.borrowed_at}
    </span>
  ),

  jatuh_tempo: (value, row) => (
    <span className="text-[14px] font-medium text-gray-600">
      {row.due_date}
    </span>
  ),

  status: (value, row) => {
    let badgeClass = "bg-gray-100 text-gray-600";
    if (row.status === 'Dikembalikan') badgeClass = "bg-[#dcfce7] text-[#16a34a]";
    else if (row.status === 'Terlambat') badgeClass = "bg-[#fee2e2] text-[#dc2626]";
    else if (row.status === 'Dipinjam') badgeClass = "bg-[#e0e7ff] text-[#4f46e5]";

    return (
      <span className={`inline-flex px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide ${badgeClass}`}>
        {row.status}
      </span>
    );
  },

  aksi_custom: (value, row) => {
    const isReturned = row.status === 'returned';

    return (
      <div className="flex items-center justify-center gap-2">
        <Link
          href={`/adminpage/perpustakaan/order/${row.id}`}
          className="flex items-center gap-1.5 rounded-[8px] bg-[#0066CC] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:opacity-90 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" /> Detail
        </Link>

        {isReturned ? (
          <button
            disabled
            className="flex items-center gap-1.5 rounded-[8px] bg-[#cbd5e1] px-3 py-1.5 text-[12px] font-bold text-[#64748b] cursor-not-allowed"
          >
            Kembalikan
          </button>
        ) : (
          <button
            onClick={() => handleConfirmReturn(row.id)}
            className="flex items-center gap-1.5 rounded-[8px] bg-[#015023] px-3 py-1.5 text-[12px] font-bold text-white transition hover:opacity-90 shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Kembalikan
          </button>
        )}
      </div>
    );
  },
};

// Kolom dan custom render untuk tab "Usulan Buku"
const columnsUsulan = [
  { key: 'mahasiswa', label: 'Mahasiswa', cellClassName: 'text-left' },
  { key: 'judul_buku', label: 'Judul Buku', cellClassName: 'text-left' },
  { key: 'penulis', label: 'Penulis' },
  { key: 'tanggal_usulan', label: 'Tanggal Usulan' },
  { key: 'status', label: 'Status' },
  { key: 'aksi_custom', label: 'Aksi' },
];

const customRenderUsulan = {
  mahasiswa: (value, row) => (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#015023] text-[15px] font-bold text-white shadow-sm">
        {row.user_name ? row.user_name.charAt(0).toUpperCase() : 'U'}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[15px] font-bold text-gray-800 leading-tight mb-0.5">
          {row.user_name}
        </span>
        <span className="text-[13px] text-gray-500">{row.user_nim}</span>
      </div>
    </div>
  ),

  judul_buku: (value, row) => <span className="text-[15px] font-bold text-gray-800">{row.book_title}</span>,

  penulis: (value, row) => <span className="text-[14px] text-gray-500 font-medium">{row.author}</span>,

  tanggal_usulan: (value, row) => <span className="text-[14px] font-medium text-gray-600">{row.proposed_at}</span>,

  status: (value, row) => {
    if (row.status === 'Menunggu') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-500 text-[12px] font-bold">
          Menunggu
        </span>
      );
    } else if (row.status === 'Disetujui') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-600 text-[12px] font-bold">
          Disetujui
        </span>
      );
    } else if (row.status === 'Ditolak') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-500 text-[12px] font-bold">
          <XCircle className="w-3.5 h-3.5" /> Ditolak
        </span>
      );
    }
    return <span>{row.status}</span>;
  },

  aksi_custom: (value, row) => (
      <div className="flex items-center justify-center">
        <button
          onClick={() => handleOpenDetailUsulan(row)}
          className="flex items-center gap-1.5 rounded-[8px] bg-[#015023] px-4 py-2 text-[12px] font-bold text-white transition hover:opacity-90 shadow-sm"
        >
          <Eye className="w-4 h-4" /> Detail
        </button>
      </div>
    ),
  };

//   Fetch orders with applied filters and pagination
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryOrders({
        search: appliedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: meta.current_page,
        per_page: PER_PAGE,
      });

      const parsed = parsePaginatedData(response);
      setOrders(parsed.data);
      setMeta(parsed.meta);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat pesanan buku.'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, meta.current_page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orderTabs = useMemo(
    () => [
      { key: 'Peminjaman Buku', label: 'Peminjaman', icon: BookOpen, count: orders.length },
      { key: 'Usulan Buku', label: 'Usulan', icon: CheckCheck, count: orders.filter((order) => order.status === 'ordered').length },
    ],
    [orders],
  );

  const handleTabChange = (tabKey) => {
    setActiveLibraryTab(tabKey);
    setStatusFilter(tabKey);
    setMeta((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleConfirmBorrow = async (orderId) => {
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActingId(orderId);

    try {
      const response = await confirmAdminLibraryBorrow(orderId, {
        admin_note: adminNote,
      });
      toast.success(response?.message || 'Peminjaman berhasil dikonfirmasi.');
      await fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengonfirmasi peminjaman.'));
    } finally {
      setActingId(null);
    }
  };

  const handleConfirmReturn = async (orderId) => {
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActingId(orderId);

    try {
      const response = await confirmAdminLibraryReturn(orderId, {
        admin_note: adminNote,
      });
      toast.success(response?.message || 'Pengembalian berhasil dikonfirmasi.');
      await fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengonfirmasi pengembalian.'));
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminBimbinganShell
      title="Manajemen Peminjaman & usulan"
      description="Kelola peminjaman buku dan verifikasi usulan dari mahasiswa"
      backHref="/adminpage/perpustakaan"
      backLabel="Kembali ke Dashboard Perpustakaan"
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchOrders} /> : null}

          <div className="w-full flex justify-start">
            <TypeTabs activeTab={activeLibraryTab} onTabChange={handleTabChange} tabs={orderTabs} />
          </div>

{/* ==========================================
            KARTU STATISTIK (INFO CARD) DINAMIS
            ========================================== */}
        {activeLibraryTab === 'Peminjaman Buku' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
            <InfoCard
              title="Dipinjam"
              value={stats.borrowed || 0}
              subtitle="Buku sedang dipinjam"
              Icon={ClipboardList}
              theme="blue" 
              variant="vertical" 
            />
            <InfoCard
              title="Dikembalikan"
              value={stats.returned || 0}
              subtitle="Buku sudah dikembalikan"
              Icon={ClipboardCheck}
              theme="green"
              variant="vertical"
            />
            <InfoCard
              title="Terlambat"
              value={stats.late || stats.overdue || 0}
              subtitle="Buku terlambat dikembalikan"
              Icon={CheckCircle2}
              theme="red"
              variant="vertical"
            />
          </div>
        ) : activeLibraryTab === 'Usulan Buku' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
            <InfoCard
              title="Menunggu"
              value={stats.pending || 0}
              subtitle="Usulan sedang menunggu verifikasi"
              Icon={BookOpen}
              theme="yellow" 
              variant="vertical"
            />
            <InfoCard
              title="Disetujui"
              value={stats.approved || 0}
              subtitle="Usulan telah disetujui"
              Icon={CheckCircle2}
              theme="green"
              variant="vertical"
            />
            <InfoCard
              title="Ditolak"
              value={stats.rejected || 0}
              subtitle="Usulan telah ditolak"
              Icon={XCircle}
              theme="red"
              variant="vertical"
            />
          </div>
        ) : null}

        {/* Search bar & Status Filter */}
        <section className="my-6 flex flex-col sm:flex-row items-stretch gap-4 w-full font-urbanist">
          {/* Search bar */}
            <div 
                className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-sm" 
                style={{ backgroundColor: '#DABC4E' }}
            >
                <Search className="w-5 h-5" style={{ color: '#015023' }} />
                
                <input
                    type="text"
                    placeholder="Cari subjek, dosen, atau mahasiswa..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-600"
                    style={{ color: '#015023' }}
                />
                
                {searchInput && (
                    <button 
                        onClick={() => { setSearchInput(''); setAppliedSearch(''); setPage(1); }}
                        className="hover:opacity-80 transition" 
                        style={{ color: '#015023' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Status Filter */}
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

              {/* Menu Pilihan Dropdown */}
              {isStatusDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsStatusDropdownOpen(false)}
                  ></div>

                  {/* List Menu */}
                  <div className="absolute top-[48px] left-0 w-full bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden py-1.5">
                    {statusOptions.map((opt) => {
                      const isSelected = statusFilter === opt.value;
                      
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setActiveLibraryTab(opt.value);
                            setMeta((prev) => ({ ...prev, current_page: 1 }));
                            setStatusFilter(opt.value);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`px-4 py-2.5 text-[14px] font-medium cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#e6eee9] text-[#015023]'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-[#015023]'
                          }`}
                        >
                          {opt.label}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
        </section>
            
            {/* Status Filter */}
      <section className="mb-6 font-urbanist">
        {/* Kontainer Tabel Utama */}
        <div className="w-full mt-4">
          
          {activeLibraryTab === 'Peminjaman Buku' ? (
            
            // --- TABEL PEMINJAMAN BUKU ---
            <div className="w-full transition-all animate-in fade-in duration-300">
              <DataTable 
                columns={bookscolumn}
                data={orders}
                customRender={customRenderPeminjaman}
                pagination={true}
              />
            </div>

          ) : (
            // --- TABEL USULAN BUKU ---
            <div className="w-full transition-all animate-in fade-in duration-300">
              <DataTable 
                columns={columnsUsulan}
                data={orders.filter(o => o.type === 'suggestion')}
                customRender={customRenderUsulan}
                pagination={true}
              />
            </div>
          )}

        </div>

        {meta.last_page > 1 ? (
          <div className="mt-4 border-t border-[#f1f5f9] pt-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-[10px] border border-[#d1d5db] px-3 py-1.5 text-[13px] font-semibold text-[#374151] disabled:opacity-50"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                disabled={meta.current_page <= 1}
                onClick={() => setMeta((prev) => ({ ...prev, current_page: prev.current_page - 1 }))}
              >
                Sebelumnya
              </button>

              <span className="text-[13px] text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Halaman {meta.current_page} dari {meta.last_page}
              </span>

              <button
                type="button"
                className="rounded-[10px] border border-[#d1d5db] px-3 py-1.5 text-[13px] font-semibold text-[#374151] disabled:opacity-50"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setMeta((prev) => ({ ...prev, current_page: prev.current_page + 1 }))}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AdminBimbinganShell>
  );
}
