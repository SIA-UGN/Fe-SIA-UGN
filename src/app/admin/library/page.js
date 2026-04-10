'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Layers,
  MessageSquare,
} from 'lucide-react';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { getAdminLibraryDashboard } from '@/lib/libraryApi';
import { getErrorMessage, parseApiBody } from '@/features/library/utils';

const quickLinks = [
  {
    href: '/admin/library/categories',
    label: 'Kelola Kategori',
    icon: Layers,
  },
  {
    href: '/admin/library/books',
    label: 'Kelola Buku',
    icon: BookOpen,
  },
  {
    href: '/admin/library/orders',
    label: 'Kelola Pesanan',
    icon: ClipboardList,
  },
  {
    href: '/admin/library/suggestions',
    label: 'Kelola Usulan',
    icon: MessageSquare,
  },
];

export default function AdminLibraryDashboardPage() {
  const [dashboard, setDashboard] = useState({
    total_books: 0,
    active_books: 0,
    total_orders: 0,
    active_orders: 0,
    pending_orders: 0,
    borrowed_orders: 0,
    total_suggestions: 0,
    pending_suggestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryDashboard();
      const payload = parseApiBody(response);
      setDashboard(payload?.data || payload || {});
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat dashboard perpustakaan.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const cards = useMemo(
    () => [
      { label: 'Total Buku', value: dashboard.total_books ?? 0 },
      { label: 'Buku Aktif', value: dashboard.active_books ?? 0 },
      { label: 'Total Pesanan', value: dashboard.total_orders ?? 0 },
      { label: 'Pesanan Aktif', value: dashboard.active_orders ?? 0 },
      { label: 'Menunggu Konfirmasi', value: dashboard.pending_orders ?? 0 },
      { label: 'Sedang Dipinjam', value: dashboard.borrowed_orders ?? 0 },
      { label: 'Total Usulan', value: dashboard.total_suggestions ?? 0 },
      { label: 'Usulan Pending', value: dashboard.pending_suggestions ?? 0 },
    ],
    [dashboard],
  );

  return (
    <AdminBimbinganShell
      title="Dashboard Perpustakaan"
      description="Pantau ringkasan koleksi buku, peminjaman, dan usulan"
      backHref="/adminpage"
      backLabel="Kembali ke Dashboard Admin"
      headerActions={
        <div className="inline-flex items-center gap-2 rounded-[12px] bg-[#015023] px-3 py-2 text-white">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-[13px] font-semibold" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Admin Library
          </span>
        </div>
      }
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchDashboard} /> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[14px] bg-white p-4 shadow-sm">
            <p className="text-[13px] font-semibold text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {card.label}
            </p>
            <p className="mt-1 text-[34px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {loading ? '...' : Number(card.value || 0).toLocaleString('id-ID')}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[16px] bg-white p-5 shadow-sm">
        <h2 className="text-[24px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          Aksi Cepat
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#d1d5db] px-4 py-3 text-[14px] font-semibold text-[#015023] hover:bg-[#f5fbf7]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>
    </AdminBimbinganShell>
  );
}
