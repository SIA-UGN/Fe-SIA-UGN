'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import LibraryShell from '@/components/library/library-shell';
import BookIconTile from '@/components/library/book-icon-tile';
import LibraryStockBadge from '@/components/library/library-stock-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { getLibraryBookById, orderLibraryBook } from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parseApiBody } from '@/features/library/utils';

export default function LibraryBookDetailPage() {
  const params = useParams();
  const bookId = params?.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordering, setOrdering] = useState(false);

  const fetchBook = useCallback(async () => {
    if (!bookId) return;

    setLoading(true);
    setError('');

    try {
      const response = await getLibraryBookById(bookId);
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

  const handleOrder = async () => {
    if (!book?.id_book) return;

    setOrdering(true);

    try {
      const response = await orderLibraryBook(book.id_book);
      toast.success(response?.message || 'Buku berhasil dipesan.');
      await fetchBook();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memesan buku.'));
    } finally {
      setOrdering(false);
    }
  };

  const isAvailable = Boolean(book?.is_available) && Number(book?.available_stock || 0) > 0;

  return (
    <LibraryShell
      title="Detail Buku"
      description="Informasi lengkap buku perpustakaan"
      breadcrumbItems={[
        { label: 'Perpustakaan', href: '/library/books', active: false },
        { label: 'Katalog Buku', href: '/library/books', active: false },
        { label: 'Detail Buku', active: true },
      ]}
    >
      <Link
        href="/library/books"
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#015023] hover:opacity-80"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Katalog
      </Link>

      {error ? <ErrorMessageBoxWithButton message={error} action={fetchBook} /> : null}

      {loading ? (
        <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
          <p className="text-[15px] text-[#4b5563]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Memuat detail buku...
          </p>
        </div>
      ) : null}

      {!loading && book ? (
        <article className="overflow-hidden rounded-[16px] bg-white shadow-md">
          <div className="relative">
            <BookIconTile className="h-[220px]" />
            <LibraryStockBadge isAvailable={isAvailable} className="absolute right-4 top-4" />
          </div>

          <div className="space-y-4 p-5 md:p-6">
            <span
              className="inline-flex rounded-md bg-[#e6eee9] px-2.5 py-1 text-[13px] font-medium text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {book?.category?.name || 'Tanpa Kategori'}
            </span>

            <h2
              className="text-[32px] font-bold leading-tight text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {book?.title || '-'}
            </h2>

            <div className="grid grid-cols-1 gap-2 text-[15px] text-[#4b5563] md:grid-cols-2">
              <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">Penulis:</span> {book?.author || '-'}
              </p>
              <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">Penerbit:</span> {book?.publisher || '-'}
              </p>
              <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">Tahun:</span> {book?.year || '-'}
              </p>
              <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">ISBN:</span> {book?.isbn || '-'}
              </p>
              <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">Stok Tersedia:</span>{' '}
                <span className={isAvailable ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                  {book?.available_stock || 0}/{book?.total_stock || 0}
                </span>
              </p>
              <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">Status:</span> {book?.status || '-'}
              </p>
              <p className="md:col-span-2" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold">Terakhir Diperbarui:</span>{' '}
                {formatDateTime(book?.updated_at)}
              </p>
            </div>

            <PrimaryButton
              type="button"
              className="h-11 w-full text-[20px] font-semibold md:w-[260px]"
              disabled={!isAvailable || ordering}
              onClick={handleOrder}
              style={!isAvailable ? { backgroundColor: '#c6ccd7', color: '#6b7280' } : undefined}
            >
              {ordering ? 'Memproses...' : isAvailable ? 'Pesan Buku' : 'Stok Habis'}
            </PrimaryButton>
          </div>
        </article>
      ) : null}
    </LibraryShell>
  );
}
