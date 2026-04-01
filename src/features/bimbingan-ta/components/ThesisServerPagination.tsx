'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ThesisServerPaginationProps {
  currentPage: number;
  lastPage?: number;
  onPageChange: (page: number) => void;
}

export default function ThesisServerPagination({
  currentPage,
  lastPage = 1,
  onPageChange,
}: ThesisServerPaginationProps) {
  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        <PaginationItem>
          <span
            className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-[#015023]"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Halaman {currentPage} / {lastPage || 1}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(event) => {
              event.preventDefault();
              if (currentPage < (lastPage || 1)) onPageChange(currentPage + 1);
            }}
            className={currentPage >= (lastPage || 1) ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
