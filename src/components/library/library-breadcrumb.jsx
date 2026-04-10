'use client';

import Link from 'next/link';
import { ChevronRight, House } from 'lucide-react';

export default function LibraryBreadcrumb({ items = [] }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1" aria-label="Breadcrumb">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6a7282] hover:text-[#015023]"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <House className="h-3.5 w-3.5" />
        Beranda
      </Link>

      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <ChevronRight className="h-[14px] w-[14px] text-[#6a7282]" />
          {item.active ? (
            <span
              className="text-[12px] font-semibold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href || '#'}
              className="text-[12px] font-medium text-[#6a7282] hover:text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
