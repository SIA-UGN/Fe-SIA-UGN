'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import LibraryShell from '@/components/library/library-shell';
import LibraryBookCard from '@/components/library/library-book-card';
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
  getLibraryBooks,
  getLibraryCategories,
  orderLibraryBook,
} from '@/lib/libraryApi';
import {
  getErrorMessage,
  parseListData,
  parsePaginatedData,
} from '@/features/library/utils';

const PER_PAGE = 9;

function buildPageNumbers(currentPage, lastPage) {
  if (lastPage <= 1) return [1];
  const pages = new Set([1, lastPage, currentPage, currentPage - 1, currentPage + 1]);

  return [...pages]
    .filter((page) => page >= 1 && page <= lastPage)
    .sort((a, b) => a - b);
}

export default function LibraryBooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [orderingBookId, setOrderingBookId] = useState(null);

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setAppliedSearch(searchInput.trim());
      setMeta((prev) => ({ ...prev, current_page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, lastPage),
    [currentPage, lastPage],
  );

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);

    try {
      const response = await getLibraryCategories();
      setCategories(parseListData(response));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memuat kategori buku.'));
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getLibraryBooks({
        search: appliedSearch || undefined,
        id_book_category: selectedCategory || undefined,
        page: currentPage,
        per_page: PER_PAGE,
      });

      const parsed = parsePaginatedData(response);
      setBooks(parsed.data);
      setMeta(parsed.meta);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat katalog buku.'));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, currentPage, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleOrder = async (book) => {
    if (!book?.id_book) return;

    setOrderingBookId(book.id_book);

    try {
      const response = await orderLibraryBook(book.id_book);
      toast.success(response?.message || 'Buku berhasil dipesan.');
      await fetchBooks();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memesan buku.'));
    } finally {
      setOrderingBookId(null);
    }
  };

  const handleSelectCategory = (categoryId) => {
    setMeta((prev) => ({ ...prev, current_page: 1 }));
    setSelectedCategory(String(categoryId || ''));
  };

  const goToPage = (targetPage) => {
    if (targetPage < 1 || targetPage > lastPage || targetPage === currentPage) return;
    setMeta((prev) => ({ ...prev, current_page: targetPage }));
  };

  return (
    <LibraryShell
      title="Katalog Koleksi Buku"
      description="Cari dan pesan buku dari koleksi perpustakaan universitas"
      breadcrumbItems={[
        { label: 'Perpustakaan', href: '/library/books', active: false },
        { label: 'Katalog Buku', active: true },
      ]}
    >
      <section className="rounded-[16px] bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              className="h-11 w-full rounded-[10px] border border-[#d1d5db] bg-[#f7f8fa] pl-9 pr-3 text-[14px] text-[#374151] outline-none ring-[#015023] focus:ring-2"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              placeholder="Cari berdasarkan judul.."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-[13px] font-semibold"
            style={{
              fontFamily: 'Urbanist, sans-serif',
              backgroundColor: selectedCategory ? '#f3f4f6' : '#015023',
              color: selectedCategory ? '#4b5563' : '#ffffff',
            }}
            onClick={() => handleSelectCategory('')}
          >
            Semua
          </button>

          {loadingCategories ? (
            <span
              className="rounded-full bg-[#f3f4f6] px-4 py-1.5 text-[13px] font-medium text-[#6b7280]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              Memuat kategori...
            </span>
          ) : (
            categories.map((category) => {
              const categoryId = String(category.id_book_category);
              const isActive = selectedCategory === categoryId;

              return (
                <button
                  key={category.id_book_category}
                  type="button"
                  className="rounded-full px-4 py-1.5 text-[13px] font-semibold"
                  style={{
                    fontFamily: 'Urbanist, sans-serif',
                    backgroundColor: isActive ? '#015023' : '#f3f4f6',
                    color: isActive ? '#ffffff' : '#4b5563',
                  }}
                  onClick={() => handleSelectCategory(categoryId)}
                >
                  {category.name}
                </button>
              );
            })
          )}
        </div>
      </section>

      <p
        className="mt-4 text-[14px] text-[#6b7280]"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        Menampilkan {meta.total || 0} buku
      </p>

      {error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchBooks} />
      ) : null}

      {loading ? (
        <div className="mt-4 rounded-[16px] bg-white p-8 text-center shadow-sm">
          <p className="text-[15px] text-[#4b5563]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Memuat katalog buku...
          </p>
        </div>
      ) : (
        <>
          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <LibraryBookCard
                key={book.id_book}
                book={book}
                detailHref={`/library/books/${book.id_book}`}
                onOrder={handleOrder}
                ordering={orderingBookId === book.id_book}
              />
            ))}
          </section>

          {books.length === 0 ? (
            <div className="mt-4 rounded-[16px] bg-white p-8 text-center shadow-sm">
              <p className="text-[15px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Buku tidak ditemukan untuk filter saat ini.
              </p>
            </div>
          ) : null}

          {lastPage > 1 ? (
            <div className="mt-6 rounded-[14px] bg-white py-3 shadow-sm">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {pageNumbers.map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          goToPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(currentPage + 1);
                      }}
                      className={currentPage >= lastPage ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </>
      )}
    </LibraryShell>
  );
}
