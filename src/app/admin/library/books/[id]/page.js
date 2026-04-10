'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { getAdminLibraryBookById } from '@/lib/libraryApi';
import { getErrorMessage, parseApiBody } from '@/features/library/utils';

export default function AdminLibraryBookDetailPage() {
  const params = useParams();
  const bookId = params?.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBook = useCallback(async () => {
    if (!bookId) return;

    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryBookById(bookId);
      const payload = parseApiBody(response);
      setBook(payload?.data || payload);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat detail buku.'));
      setBook(null);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  return (
    <AdminBimbinganShell
      title="Detail Buku"
      description="Informasi lengkap koleksi buku perpustakaan"
      backHref="/admin/library/books"
      backLabel="Kembali ke Manajemen Buku"
    >
      <Link
        href="/admin/library/books"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#015023] hover:opacity-80"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      {error ? <ErrorMessageBoxWithButton message={error} action={fetchBook} /> : null}

      {loading ? (
        <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
          <p className="text-[15px] text-[#4b5563]">Memuat detail buku...</p>
        </div>
      ) : null}

      {!loading && book ? (
        <section className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-[28px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {book.title || '-'}
          </h2>
          <p className="text-[14px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {book.author || '-'}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-[#374151] md:grid-cols-2">
            <p><span className="font-semibold">Kategori:</span> {book?.category?.name || '-'}</p>
            <p><span className="font-semibold">Penerbit:</span> {book.publisher || '-'}</p>
            <p><span className="font-semibold">Tahun:</span> {book.year || '-'}</p>
            <p><span className="font-semibold">ISBN:</span> {book.isbn || '-'}</p>
            <p>
              <span className="font-semibold">Stok:</span>{' '}
              <span className={Number(book.available_stock || 0) > 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                {book.available_stock || 0}/{book.total_stock || 0}
              </span>
            </p>
            <p><span className="font-semibold">Status:</span> {book.status || '-'}</p>
          </div>

          <div className="mt-5 rounded-[12px] bg-[#f7faf8] p-4">
            <p className="mb-2 text-[14px] font-semibold text-[#015023]">Statistik Peminjaman</p>
            <div className="grid grid-cols-1 gap-2 text-[13px] text-[#374151] md:grid-cols-3">
              <p><span className="font-semibold">Total:</span> {book?.order_statistics?.total_orders ?? 0}</p>
              <p><span className="font-semibold">Aktif:</span> {book?.order_statistics?.active_orders ?? 0}</p>
              <p><span className="font-semibold">Selesai:</span> {book?.order_statistics?.completed_orders ?? 0}</p>
            </div>
          </div>
        </section>
      ) : null}
    </AdminBimbinganShell>
  );
}
