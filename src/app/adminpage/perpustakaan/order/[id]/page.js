'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  confirmAdminLibraryBorrow,
  confirmAdminLibraryReturn,
  getAdminLibraryOrderById,
} from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parseApiBody } from '@/features/library/utils';

export default function AdminLibraryOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibraryOrderById(orderId);
      const payload = parseApiBody(response);
      setOrder(payload?.data || payload);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat detail pesanan.'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleBorrow = async () => {
    if (!order?.id_book_order) return;
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActing(true);

    try {
      const response = await confirmAdminLibraryBorrow(order.id_book_order, { admin_note: adminNote });
      toast.success(response?.message || 'Peminjaman dikonfirmasi.');
      await fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengonfirmasi peminjaman.'));
    } finally {
      setActing(false);
    }
  };

  const handleReturn = async () => {
    if (!order?.id_book_order) return;
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';
    setActing(true);

    try {
      const response = await confirmAdminLibraryReturn(order.id_book_order, { admin_note: adminNote });
      toast.success(response?.message || 'Pengembalian dikonfirmasi.');
      await fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengonfirmasi pengembalian.'));
    } finally {
      setActing(false);
    }
  };

  return (
    <AdminBimbinganShell
      title="Detail Pesanan"
      description="Informasi lengkap transaksi peminjaman buku"
      backHref="/admin/library/orders"
      backLabel="Kembali ke Manajemen Pesanan"
    >
      <Link
        href="/admin/library/orders"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#015023] hover:opacity-80"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      {error ? <ErrorMessageBoxWithButton message={error} action={fetchOrder} /> : null}

      {loading ? (
        <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
          <p className="text-[15px] text-[#4b5563]">Memuat detail pesanan...</p>
        </div>
      ) : null}

      {!loading && order ? (
        <section className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[28px] font-bold text-[#015023]">{order?.book?.title || '-'}</h2>
              <p className="text-[13px] text-[#6b7280]">{order?.book?.author || '-'}</p>
            </div>
            <LibraryStatusBadge type="order" status={order.status} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-[#374151] md:grid-cols-2">
            <p><span className="font-semibold">User:</span> {order.user_name || '-'}</p>
            <p><span className="font-semibold">Email:</span> {order.user_email || '-'}</p>
            <p><span className="font-semibold">Dipesan:</span> {formatDateTime(order.ordered_at)}</p>
            <p><span className="font-semibold">Dipinjam:</span> {formatDateTime(order.borrowed_at)}</p>
            <p><span className="font-semibold">Dikembalikan:</span> {formatDateTime(order.returned_at)}</p>
            <p><span className="font-semibold">Durasi:</span> {order.borrow_duration || '-'}</p>
            <p className="md:col-span-2"><span className="font-semibold">Catatan Admin:</span> {order.admin_note || '-'}</p>
          </div>

          {order.status === 'ordered' ? (
            <button
              type="button"
              className="mt-5 inline-flex h-9 items-center gap-1 rounded-[8px] bg-[#015023] px-3 text-[12px] font-semibold text-white"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              onClick={handleBorrow}
              disabled={acting}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {acting ? 'Memproses...' : 'Konfirmasi Pinjam'}
            </button>
          ) : null}

          {order.status === 'borrowed' ? (
            <button
              type="button"
              className="mt-5 inline-flex h-9 items-center gap-1 rounded-[8px] bg-[#16874b] px-3 text-[12px] font-semibold text-white"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              onClick={handleReturn}
              disabled={acting}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {acting ? 'Memproses...' : 'Konfirmasi Kembali'}
            </button>
          ) : null}
        </section>
      ) : null}
    </AdminBimbinganShell>
  );
}
