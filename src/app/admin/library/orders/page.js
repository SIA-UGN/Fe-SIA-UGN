'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCheck, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  confirmAdminLibraryBorrow,
  confirmAdminLibraryReturn,
  getAdminLibraryOrders,
} from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parsePaginatedData } from '@/features/library/utils';

const PER_PAGE = 12;

export default function AdminLibraryOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryOrders({
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
        page: meta.current_page,
        per_page: PER_PAGE,
      });

      const parsed = parsePaginatedData(response);
      setOrders(parsed.data);
      setMeta(parsed.meta);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat pesanan buku.'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, meta.current_page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalLabel = useMemo(
    () => `Total ${meta.total || 0} pesanan`,
    [meta.total],
  );

  const handleConfirmBorrow = async (orderId) => {
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActingId(orderId);

    try {
      const response = await confirmAdminLibraryBorrow(orderId, {
        admin_note: adminNote,
      });
      toast.success(response?.message || 'Peminjaman berhasil dikonfirmasi.');
      await fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengonfirmasi peminjaman.'));
    } finally {
      setActingId(null);
    }
  };

  const handleConfirmReturn = async (orderId) => {
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActingId(orderId);

    try {
      const response = await confirmAdminLibraryReturn(orderId, {
        admin_note: adminNote,
      });
      toast.success(response?.message || 'Pengembalian berhasil dikonfirmasi.');
      await fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengonfirmasi pengembalian.'));
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminBimbinganShell
      title="Manajemen Pesanan Buku"
      description="Konfirmasi peminjaman dan pengembalian buku mahasiswa"
      backHref="/admin/library"
      backLabel="Kembali ke Dashboard Perpustakaan"
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchOrders} /> : null}

      <section className="rounded-[16px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            {totalLabel}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                className="h-10 w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 text-[14px] outline-none ring-[#015023] focus:ring-2 sm:w-[320px]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                placeholder="Cari user atau judul buku"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setMeta((prev) => ({ ...prev, current_page: 1 }));
                    setAppliedSearch(searchInput.trim());
                  }
                }}
              />
            </div>

            <select
              className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={statusFilter}
              onChange={(event) => {
                setMeta((prev) => ({ ...prev, current_page: 1 }));
                setStatusFilter(event.target.value);
              }}
            >
              <option value="">Semua Status</option>
              <option value="ordered">Dipesan</option>
              <option value="borrowed">Dipinjam</option>
              <option value="returned">Dikembalikan</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            <PrimaryButton
              type="button"
              className="h-10 px-3 text-[13px] font-semibold"
              onClick={() => {
                setMeta((prev) => ({ ...prev, current_page: 1 }));
                setAppliedSearch(searchInput.trim());
              }}
            >
              Terapkan
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#e8f1eb]">
              <tr>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">User</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Buku</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Status</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Dipesan</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Catatan</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[14px] text-[#6b7280]">
                    Memuat data pesanan...
                  </td>
                </tr>
              ) : null}

              {!loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[14px] text-[#6b7280]">
                    Tidak ada pesanan untuk filter saat ini.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? orders.map((order) => {
                    const isBorrowAction = order.status === 'ordered';
                    const isReturnAction = order.status === 'borrowed';
                    const isActing = actingId === order.id_book_order;

                    return (
                      <tr key={order.id_book_order} className="border-t border-[#f1f5f9]">
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-semibold text-[#015023]">{order.user_name || '-'}</p>
                          <p className="text-[12px] text-[#6b7280]">{order.user_email || '-'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-semibold text-[#015023]">{order?.book?.title || '-'}</p>
                          <p className="text-[12px] text-[#6b7280]">{order?.book?.author || '-'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <LibraryStatusBadge type="order" status={order.status} />
                        </td>
                        <td className="px-3 py-3 text-[13px] text-[#374151]">{formatDateTime(order.ordered_at)}</td>
                        <td className="px-3 py-3 text-[12px] text-[#374151]">{order.admin_note || '-'}</td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/admin/library/orders/${order.id_book_order}`}
                            className="mb-1 inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#0066CC] px-3 text-[12px] font-semibold text-white"
                            style={{ fontFamily: 'Urbanist, sans-serif' }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </Link>

                          {isBorrowAction ? (
                            <button
                              type="button"
                              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#015023] px-3 text-[12px] font-semibold text-white disabled:opacity-60"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                              onClick={() => handleConfirmBorrow(order.id_book_order)}
                              disabled={isActing}
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                              {isActing ? 'Memproses...' : 'Konfirmasi Pinjam'}
                            </button>
                          ) : null}

                          {isReturnAction ? (
                            <button
                              type="button"
                              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#16874b] px-3 text-[12px] font-semibold text-white disabled:opacity-60"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                              onClick={() => handleConfirmReturn(order.id_book_order)}
                              disabled={isActing}
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                              {isActing ? 'Memproses...' : 'Konfirmasi Kembali'}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 ? (
          <div className="mt-4 border-t border-[#f1f5f9] pt-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="rounded-[10px] border border-[#d1d5db] px-3 py-1.5 text-[13px] font-semibold text-[#374151] disabled:opacity-50"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                disabled={meta.current_page <= 1}
                onClick={() => setMeta((prev) => ({ ...prev, current_page: prev.current_page - 1 }))}
              >
                Sebelumnya
              </button>

              <span className="text-[13px] text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Halaman {meta.current_page} dari {meta.last_page}
              </span>

              <button
                type="button"
                className="rounded-[10px] border border-[#d1d5db] px-3 py-1.5 text-[13px] font-semibold text-[#374151] disabled:opacity-50"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setMeta((prev) => ({ ...prev, current_page: prev.current_page + 1 }))}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AdminBimbinganShell>
  );
}
