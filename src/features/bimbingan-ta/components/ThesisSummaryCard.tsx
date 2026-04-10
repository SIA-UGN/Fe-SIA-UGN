'use client';

import type { ReactNode } from 'react';

interface ThesisSummaryCardProps {
  title: string;
  value?: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}

export default function ThesisSummaryCard({
  title,
  value,
  subtitle,
  children,
}: ThesisSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        {title}
      </p>
      {value !== undefined ? (
        <div className="mt-2 text-3xl font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          {value}
        </div>
      ) : null}
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-600" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          {subtitle}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
