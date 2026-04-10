'use client';

import type { ReactNode } from 'react';

interface ThesisSectionCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function ThesisSectionCard({
  title,
  description,
  actions,
  children,
}: ThesisSectionCardProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-gray-600" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
