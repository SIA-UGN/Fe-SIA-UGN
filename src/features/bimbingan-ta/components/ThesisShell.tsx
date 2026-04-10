'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation-menu';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import { ArrowLeft } from 'lucide-react';

interface SharedShellProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function StudentThesisShell({
  title,
  description,
  backHref,
  backLabel = 'Kembali',
  actions,
  children,
}: SharedShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#E6EEE9]">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {backHref ? (
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#015023] hover:opacity-80"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-3xl text-sm text-gray-600" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function AdminThesisShell({
  title,
  description,
  backHref,
  backLabel = 'Kembali',
  actions,
  children,
}: SharedShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-light-sage">
      <AdminNavbar title={title} />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-6">
          {backHref ? (
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#015023] hover:opacity-80"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-3xl text-sm text-gray-600" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {description}
                </p>
              ) : null}
            </div>
            {actions}
          </div>

          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
