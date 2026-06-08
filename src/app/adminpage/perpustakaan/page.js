'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  X,
  TrendingUp,
  Trash2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import AdminBookModal from '@/components/library/admin-book-modal';
import StatCard from '@/components/ui/info-card';
import DataTable from '@/components/ui/table';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  createAdminLibraryCategory,
  createAdminLibraryBook,
  getAdminLibraryBooks,
  getAdminLibraryCategories,
  getAdminLibraryDashboard,
  toggleAdminLibraryBookStatus,
  updateAdminLibraryBook,
} from '@/lib/libraryApi';
import {
  getErrorMessage,
  parseApiBody,
  parseListData,
  parsePaginatedData,
} from '@/features/library/utils';
import InfoCard from '@/components/ui/info-card';

const PER_PAGE = 5;

export default function AdminLibraryPage() {
  /* ── Dashboard stats ── */
  const [dashboard, setDashboard] = useState({
    total_books: 0,
    active_books: 0,
    total_orders: 0,
    active_orders: 0,
    pending_orders: 0,
    borrowed_orders: 0,
    total_suggestions: 0,
    pending_suggestions: 0,
  });

  /* ── Books table ── */
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });

  /* ── UI states ── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  /* ── fetch dashboard ── */
  const fetchDashboard = useCallback(async () => {
    try {
      const response = await getAdminLibraryDashboard();
      const payload = parseApiBody(response);
      setDashboard(payload?.data || payload || {});
    } catch (_err) {
      /* silently fail, stats just show 0 */
    }
  }, []);

  /* ── fetch categories ── */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAdminLibraryCategories();
      setCategories(parseListData(response));
    } catch (_err) {
      setCategories([]);
    }
  }, []);

  /* ── fetch books ── */
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryBooks({
        search: appliedSearch || undefined,
        page,
        per_page: PER_PAGE,
      });
      const parsed = parsePaginatedData(response);
      setBooks(parsed.data);
      setMeta(parsed.meta);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data buku.'));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page]);

  useEffect(() => { fetchDashboard(); fetchCategories(); }, [fetchDashboard, fetchCategories]);
  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  /* ── computed stats ── */
  const statCards = useMemo(() => [
    { label: 'Total Buku', value: dashboard.total_books ?? 0, color: '#92400e', bgIcon: '#fef3c7', icon: BookOpen },
    { label: 'Tersedia', value: dashboard.active_books ?? 0, color: '#015023', bgIcon: '#e6f4ea', icon: BookOpen },
    { label: 'Dipinjam', value: dashboard.borrowed_orders ?? 0, color: '#1e40af', bgIcon: '#dbeafe', icon: BookOpen },
    { label: 'Stok Kritis', value: dashboard.pending_orders ?? 0, color: '#dc2626', bgIcon: '#fee2e2', icon: AlertTriangle },
  ], [dashboard]);

  // Table Columns definition
  const bookscolumn = [
    { key: 'judul_buku', label: 'Judul Buku', cellClassName: 'text-left' },
    { key: 'penulis', label: 'Penulis' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'stok', label: 'Stok' },
    { key: 'dipinjam', label: 'Dipinjam' },
    { key: 'pesanan', label: 'Pesanan' },
    { key: 'aksi_custom', label: 'Aksi' }, 
  ];

  const customRenderBooks = {
  judul_buku: (value, row) => (
    <div className="text-left">
      <div className="font-bold text-gray-800 text-[15px] mb-0.5">{row.title}</div>
      <div className="text-sm text-gray-400">{row.publisher}, {row.year}</div>
    </div>
  ),
  
  penulis: (value, row) => (
    <span className="text-gray-500 text-sm font-medium">{row.author}</span>
  ),
  
  kategori: (value, row) => (
    <span className="px-3 py-1.5 bg-[#e6eee9] text-[#015023] rounded-lg text-xs font-bold">
      {row.category?.name || row.category}
    </span>
  ),
  
  isbn: (value, row) => (
    <span className="text-gray-500 text-sm tracking-wide">{row.isbn}</span>
  ),
  
  stok: (value, row) => (
    <span className="px-3 py-1 bg-[#fefce8] text-[#a16207] rounded-full text-xs font-bold border border-yellow-100">
      {row.stock_available}/{row.stock_total}
    </span>
  ),
  
  dipinjam: (value, row) => (
    <span className="text-gray-600 text-sm font-medium">{row.borrowed}</span>
  ),
  
  pesanan: (value, row) => (
    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
      {row.orders}x
    </span>
  ),
  
  // Custom aksi agar icon biru dan merah tanpa background solid (seperti di gambar)
  aksi_custom: (value, row) => (
    <div className="flex items-center justify-center gap-4">
      <button 
        className="text-blue-600 hover:text-blue-800 transition-colors"
        onClick={() => handleOpenEditModal(row)}
      >
        <Edit className="w-4 h-4" />
      </button>
      <button 
        className="text-red-500 hover:text-red-700 transition-colors"
        onClick={() => handleDeleteBook(row.id_book)}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    )
  };



  /* ── book CRUD handlers ── */
  const handleOpenAddModal = () => {
    setEditingBook(null);
    setBookModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setBookModalOpen(true);
  };

  const slugifyCategoryName = (value = '') => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const handleCreateCategory = async (nameValue) => {
    const name = nameValue.trim();

    if (!name) {
      toast.error('Nama kategori wajib diisi.');
      return null;
    }

    const slug = slugifyCategoryName(name);

    if (!slug) {
      toast.error('Nama kategori tidak valid.');
      return null;
    }

    try {
      const res = await createAdminLibraryCategory({ name, slug });
      toast.success(res?.message || 'Kategori berhasil ditambahkan.');
      await fetchCategories();
      return res?.data?.data || res?.data || res?.category || null;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menambahkan kategori.'));
      throw err;
    }
  };

  const handleBookSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editingBook) {
        const res = await updateAdminLibraryBook(editingBook.id_book, payload);
        toast.success(res?.message || 'Buku berhasil diperbarui.');
      } else {
        const res = await createAdminLibraryBook(payload);
        toast.success(res?.message || 'Buku berhasil ditambahkan.');
      }
      setBookModalOpen(false);
      setEditingBook(null);
      await fetchBooks();
      await fetchDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan buku.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;
    setTogglingId(bookId);
    try {
      const res = await toggleAdminLibraryBookStatus(bookId);
      toast.success(res?.message || 'Buku berhasil dihapus.');
      await fetchBooks();
      await fetchDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus buku.'));
    } finally {
      setTogglingId(null);
    }
  };

  /* ── filter buttons ── */
  const filterButtons = [
    { key: 'all', label: 'Semua Buku', icon: null },
    { key: 'critical', label: 'Stok Kritis', icon: AlertTriangle },
    { key: 'popular', label: 'Populer', icon: TrendingUp },
  ];

  /* ── Pagination range with ellipsis ── */
  const pageRange = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= meta.last_page; i++) pages.push(i);
    return pages.slice(Math.max(0, page - 3), Math.min(meta.last_page, page + 2));
  }, [meta.last_page, page]);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar title="Manajemen Perpustakaan" />

      <main className="flex-1 bg-brand-light-sage">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/adminpage"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-80"
              style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
              <ArrowLeft size={18} />
              Kembali ke Dashboard
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold mb-1"
                  style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
                >
                  Manajemen Perpustakaan
                </h1>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Kelola data buku, stok, dan informasi perpustakaan
                </p>
              </div>
            </div>

            {error ? <ErrorMessageBoxWithButton message={error} action={fetchBooks} /> : null}

      {/* ── Info Card ── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <InfoCard
              key={card.label}
              title={card.label}
              value={card.value ?? 0}
              subtitle={
                card.label === 'Stok Kritis'
                  ? 'Jumlah buku dengan stok kritis (0 tersedia)'
                  : `Jumlah ${card.label.toLowerCase()} dalam katalog`
              }
              Icon={Icon}
              theme={
                card.label === 'Stok Kritis'
                  ? 'red'
                  : card.label === 'Dipinjam'
                    ? 'yellow'
                    : card.label === 'Tersedia'
                      ? 'green'
                      : 'blue'
              }
            />
          );
        })}
      </div>

      {/* ── Quick Link: Manajemen Peminjaman & Usulan ── */}
      <Link
        href="/adminpage/perpustakaan/order"
        className="flex items-center justify-between rounded-[16px] bg-white p-5 shadow-sm transition-colors hover:bg-[#f8faf9]"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-[#e6f4ea]">
            <ClipboardList className="h-5 w-5 text-[#015023]" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#101828]">Manajemen Peminjaman & Usulan</p>
            <p className="text-[13px] text-[#6a7282]">Kelola peminjaman buku dan verifikasi usulan dari mahasiswa</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-[#6a7282]" />
      </Link>

      {/* ── Search + Filters + Add Button ── */}
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

        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeFilter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => {
                  setActiveFilter(btn.key);
                  setPage(1);
                  setAppliedSearch(searchInput.trim());
                }}
                className={`inline-flex h-[40px] items-center gap-1.5 rounded-[10px] px-4 text-[14px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#015023] text-white'
                    : 'border border-[#d1d5dc] bg-white text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {btn.label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-[40px] items-center gap-1.5 rounded-[10px] bg-[#015023] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#013d1a]"
          >
            <Plus className="h-4 w-4" />
            Tambah Buku
          </button>
        </div>
      </section>

      {/* ── Books Table ── */}
      <div className='w-full mt-4'>        
        <DataTable
          columns={bookscolumn}
          data={books}
          customRender={customRenderBooks}
          pagination={true}
        />
      </div>

      {/* ── Book Modal ── */}
      <AdminBookModal
        open={bookModalOpen}
        onClose={() => { setBookModalOpen(false); setEditingBook(null); }}
        onSubmit={handleBookSubmit}
        categories={categories}
        editingBook={editingBook}
        saving={saving}
        onCreateCategory={handleCreateCategory}
      />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
