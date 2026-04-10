import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/button';
import BookIconTile from '@/components/library/book-icon-tile';
import LibraryStockBadge from '@/components/library/library-stock-badge';

export default function LibraryBookCard({
  book,
  onOrder,
  ordering = false,
  detailHref,
}) {
  const isAvailable = Boolean(book?.is_available) && Number(book?.available_stock || 0) > 0;

  return (
    <article className="overflow-hidden rounded-[14px] bg-white shadow-md">
      <div className="relative">
        <BookIconTile />
        <LibraryStockBadge isAvailable={isAvailable} className="absolute right-3 top-3" />
      </div>

      <div className="space-y-3 p-4">
        <span
          className="inline-flex rounded-md bg-[#e6eee9] px-2 py-1 text-[12px] font-medium text-[#015023]"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          {book?.category?.name || 'Tanpa Kategori'}
        </span>

        <div>
          {detailHref ? (
            <Link
              href={detailHref}
              className="text-[28px] font-bold leading-tight text-[#015023] hover:underline"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {book?.title || '-'}
            </Link>
          ) : (
            <h3
              className="text-[28px] font-bold leading-tight text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {book?.title || '-'}
            </h3>
          )}
        </div>

        <div
          className="space-y-1 text-[15px] text-[#4b5563]"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          <p>Penulis: {book?.author || '-'}</p>
          <p>Penerbit: {book?.publisher || '-'}</p>
          <p>Tahun: {book?.year || '-'}</p>
          <p>ISBN: {book?.isbn || '-'}</p>
        </div>

        <p
          className="text-[16px] font-semibold"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          Stok:{' '}
          <span className={isAvailable ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
            {book?.available_stock || 0}/{book?.total_stock || 0}
          </span>
        </p>

        <PrimaryButton
          type="button"
          className="h-11 w-full text-[20px] font-semibold"
          disabled={!isAvailable || ordering}
          onClick={() => onOrder?.(book)}
          style={!isAvailable ? { backgroundColor: '#c6ccd7', color: '#6b7280' } : undefined}
        >
          {ordering ? 'Memesan...' : isAvailable ? 'Pesan Buku' : 'Stok Habis'}
        </PrimaryButton>
      </div>
    </article>
  );
}
