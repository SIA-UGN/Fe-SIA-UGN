'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Power, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  createAdminLibraryBook,
  getAdminLibraryBooks,
  getAdminLibraryCategories,
  toggleAdminLibraryBookStatus,
  updateAdminLibraryBook,
} from '@/lib/libraryApi';
import {
  getErrorMessage,
  parseListData,
  parsePaginatedData,
} from '@/features/library/utils';

const PER_PAGE = 10;

const initialForm = {
  title: '',
  author: '',
  publisher: '',
  year: '',
  isbn: '',
  id_book_category: '',
  total_stock: '',
};

export default function AdminLibraryBooksPage() {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: PER_PAGE, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAdminLibraryCategories();
      setCategories(parseListData(response));
    } catch (_err) {
      setCategories([]);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryBooks({
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
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
  }, [appliedSearch, page, statusFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim() || undefined,
      year: form.year ? Number(form.year) : undefined,
      isbn: form.isbn.trim() || undefined,
      id_book_category: form.id_book_category ? Number(form.id_book_category) : undefined,
      total_stock: form.total_stock ? Number(form.total_stock) : undefined,
    };

    if (!payload.title || !payload.author || !payload.id_book_category || payload.total_stock === undefined) {
      toast.error('Judul, penulis, kategori, dan stok total wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const response = await updateAdminLibraryBook(editingId, payload);
        toast.success(response?.message || 'Buku berhasil diperbarui.');
      } else {
        const response = await createAdminLibraryBook(payload);
        toast.success(response?.message || 'Buku berhasil ditambahkan.');
      }

      resetForm();
      await fetchBooks();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan buku.'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (book) => {
    setEditingId(book.id_book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
      year: book.year ? String(book.year) : '',
      isbn: book.isbn || '',
      id_book_category: String(book?.category?.id_book_category || ''),
      total_stock: String(book.total_stock || ''),
    });
  };

  const handleToggleStatus = async (bookId) => {
    const confirmed = window.confirm('Ubah status aktif/nonaktif buku ini?');
    if (!confirmed) return;

    setTogglingId(bookId);

    try {
      const response = await toggleAdminLibraryBookStatus(bookId);
      toast.success(response?.message || 'Status buku berhasil diperbarui.');
      await fetchBooks();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengubah status buku.'));
    } finally {
      setTogglingId(null);
    }
  };

  const submitLabel = useMemo(() => {
    if (saving) return editingId ? 'Menyimpan...' : 'Menambahkan...';
    return editingId ? 'Simpan Perubahan' : 'Tambah Buku';
  }, [editingId, saving]);

  return (
    <AdminBimbinganShell
      title="Manajemen Buku"
      description="Tambah, edit, dan atur status koleksi buku"
      backHref="/admin/library"
      backLabel="Kembali ke Dashboard Perpustakaan"
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchBooks} /> : null}

      <section className="rounded-[16px] bg-white p-5 shadow-sm">
        <h2 className="text-[22px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          {editingId ? 'Edit Buku' : 'Tambah Buku Baru'}
        </h2>

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSubmit}>
          <input
            type="text"
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            placeholder="Judul buku *"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          />

          <input
            type="text"
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            placeholder="Penulis *"
            value={form.author}
            onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
          />

          <input
            type="text"
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            placeholder="Penerbit"
            value={form.publisher}
            onChange={(event) => setForm((prev) => ({ ...prev, publisher: event.target.value }))}
          />

          <input
            type="number"
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            placeholder="Tahun"
            value={form.year}
            onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
          />

          <input
            type="text"
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            placeholder="ISBN"
            value={form.isbn}
            onChange={(event) => setForm((prev) => ({ ...prev, isbn: event.target.value }))}
          />

          <select
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            value={form.id_book_category}
            onChange={(event) => setForm((prev) => ({ ...prev, id_book_category: event.target.value }))}
          >
            <option value="">Pilih kategori *</option>
            {categories.map((category) => (
              <option key={category.id_book_category} value={category.id_book_category}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
            placeholder="Total stok *"
            value={form.total_stock}
            onChange={(event) => setForm((prev) => ({ ...prev, total_stock: event.target.value }))}
          />

          <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-2">
            <PrimaryButton type="submit" className="h-10 px-4 text-[13px] font-semibold" disabled={saving}>
              <Plus className="h-4 w-4" />
              {submitLabel}
            </PrimaryButton>

            {editingId ? (
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-[10px] border border-[#d1d5db] px-4 text-[13px] font-semibold text-[#374151]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                onClick={resetForm}
              >
                Batal Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-[16px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              className="h-10 w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 text-[14px] outline-none ring-[#015023] focus:ring-2"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              placeholder="Cari judul/penulis/isbn"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  setPage(1);
                  setAppliedSearch(searchInput.trim());
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <PrimaryButton
              type="button"
              className="h-10 px-3 text-[13px] font-semibold"
              onClick={() => {
                setPage(1);
                setAppliedSearch(searchInput.trim());
              }}
            >
              Terapkan
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#e8f1eb]">
              <tr>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Buku</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Kategori</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Stok</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Status</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[14px] text-[#6b7280]">
                    Memuat data buku...
                  </td>
                </tr>
              ) : null}

              {!loading && books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[14px] text-[#6b7280]">
                    Data buku belum tersedia.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? books.map((book) => {
                    const isActive = book.status === 'active';
                    const isToggling = togglingId === book.id_book;

                    return (
                      <tr key={book.id_book} className="border-t border-[#f1f5f9]">
                        <td className="px-3 py-3">
                          <p className="text-[14px] font-semibold text-[#015023]">{book.title}</p>
                          <p className="text-[12px] text-[#6b7280]">{book.author}</p>
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[#374151]">{book?.category?.name || '-'}</td>
                        <td className="px-3 py-3 text-[13px] text-[#374151]">
                          <span className={Number(book.available_stock || 0) > 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                            {book.available_stock || 0}/{book.total_stock || 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold"
                            style={{
                              fontFamily: 'Urbanist, sans-serif',
                              backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                              color: isActive ? '#166534' : '#991b1b',
                            }}
                          >
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/library/books/${book.id_book}`}
                              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#0066CC] px-3 text-[12px] font-semibold text-white"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </Link>

                            <button
                              type="button"
                              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#16874b] px-3 text-[12px] font-semibold text-white"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                              onClick={() => startEdit(book)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#015023] px-3 text-[12px] font-semibold text-white disabled:opacity-60"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                              onClick={() => handleToggleStatus(book.id_book)}
                              disabled={isToggling}
                            >
                              <Power className="h-3.5 w-3.5" />
                              {isToggling ? 'Memproses...' : 'Toggle Status'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 ? (
          <div className="mt-4 border-t border-[#f1f5f9] pt-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((prev) => Math.max(1, prev - 1));
                    }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: meta.last_page }, (_, idx) => idx + 1)
                  .slice(Math.max(0, page - 3), Math.min(meta.last_page, page + 2))
                  .map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === page}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((prev) => Math.min(meta.last_page, prev + 1));
                    }}
                    className={page >= meta.last_page ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </section>
    </AdminBimbinganShell>
  );
}
