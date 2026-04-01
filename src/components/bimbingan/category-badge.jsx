'use client';

import { Dot } from 'lucide-react';

export default function CategoryBadge({ name, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[12px] py-[4px] text-[12px] font-semibold ${className}`}
      style={{
        backgroundColor: '#e6f4ea',
        color: '#015023',
        fontFamily: 'Urbanist, sans-serif',
      }}
    >
      <Dot className="-ml-1 h-4 w-4" />
      {name || 'Tanpa Kategori'}
    </span>
  );
}
