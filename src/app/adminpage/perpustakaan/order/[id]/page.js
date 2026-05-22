'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  useAdminLibraryOrderDetailQuery,
  useConfirmAdminLibraryBorrowMutation,
  useConfirmAdminLibraryReturnMutation,
} from '@/features/library/hooks/useAdminLibraryOrdersQuery';
import { formatDate, formatDateTime, getErrorMessage } from '@/features/library/utils';

export default function AdminLibraryOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id ? String(params.id) : null;

  const orderQuery = useAdminLibraryOrderDetailQuery(orderId);
  const borrowMutation = useConfirmAdminLibraryBorrowMutation();
  const returnMutation = useConfirmAdminLibraryReturnMutation();

  const order = orderQuery.data?.item || null;
  const isLoading = orderQuery.isLoading || orderQuery.isFetching;

  const visibleRows = useMemo(() => {
    if (!order) return [];

    return [
      { label: 'User', value: order.user_name || '-' },
      { label: 'Email', value: order.user_email || '-' },
      { label: 'NIM', value: order.user_nim || '-' },
      { label: 'Dipesan', value: formatDateTime(order.ordered_at) },
      { label: 'Dipinjam', value: formatDateTime(order.borrowed_at) },
      { label: 'Dikembalikan', value: formatDateTime(order.returned_at) },
      { label: 'Jatuh Tempo', value: formatDate(order.due_date) },
      { label: 'Durasi', value: order.borrow_duration || '-' },
      { label: 'Catatan Admin', value: order.admin_note || '-' },
    ];
  }, [order]);

  const handleBorrow = async () => {
    if (!order?.id_book_order) return;
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';

    try {
      const response = await borrowMutation.mutateAsync({
        orderId: order.id_book_order,
        payload: { admin_note: adminNote },
      });
      toast.success(response?.message || 'Peminjaman dikonfirmasi.');
      await orderQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengonfirmasi peminjaman.'));
    }
  };

  const handleReturn = async () => {
    if (!order?.id_book_order) return;
    const adminNote = window.prompt('Catatan admin (opsional):', '') ?? '';

    try {
      const response = await returnMutation.mutateAsync({
        orderId: order.id_book_order,
        payload: { admin_note: adminNote },
      });
      toast.success(response?.message || 'Pengembalian dikonfirmasi.');
      await orderQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal mengonfirmasi pengembalian.'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar title="Detail Pesanan" />

      <main className="flex-1 bg-brand-light-sage">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/adminpage/perpustakaan/order"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:opacity-80"
              style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
            >
              <ArrowLeft size={18} />
              Kembali ke Manajemen Pesanan
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                  Detail Pesanan
                </h1>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  Informasi lengkap transaksi peminjaman buku
                </p>
              </div>
            </div>

            {orderQuery.error ? (
              <ErrorMessageBoxWithButton
                message={getErrorMessage(orderQuery.error, 'Gagal memuat detail pesanan.')}
                action={orderQuery.refetch}
              />
            ) : null}

            {isLoading ? (
              <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
                <p className="text-[15px] text-[#4b5563]">Memuat detail pesanan...</p>
              </div>
            ) : null}

            {!isLoading && order ? (
              <section className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[28px] font-bold text-[#015023]">{order?.book?.title || '-'}</h2>
                    <p className="text-[13px] text-[#6b7280]">
                      {order?.book?.author || '-'} · {order?.book?.isbn || '-'}
                    </p>
                  </div>
                  <LibraryStatusBadge type="order" status={order.status} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-[#374151] md:grid-cols-2">
                  {visibleRows.map((row) => (
                    <p key={row.label}>
                      <span className="font-semibold">{row.label}:</span> {row.value}
                    </p>
                  ))}
                  <p className="md:col-span-2">
                    <span className="font-semibold">Judul Buku:</span> {order.book_title || '-'}
                  </p>
                  <p>
                    <span className="font-semibold">Kategori:</span> {order.book_category || '-'}
                  </p>
                  <p>
                    <span className="font-semibold">Status Label:</span> {order.status_label || order.status || '-'}
                  </p>
                </div>

                {order.status === 'ordered' ? (
                  <button
                    type="button"
                    className="mt-5 inline-flex h-9 items-center gap-1 rounded-[8px] bg-[#015023] px-3 text-[12px] font-semibold text-white"
                    style={{ fontFamily: 'Urbanist, sans-serif' }}
                    onClick={handleBorrow}
                    disabled={borrowMutation.isPending || returnMutation.isPending}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {borrowMutation.isPending ? 'Memproses...' : 'Konfirmasi Pinjam'}
                  </button>
                ) : null}

                {order.status === 'borrowed' ? (
                  <button
                    type="button"
                    className="mt-5 inline-flex h-9 items-center gap-1 rounded-[8px] bg-[#16874b] px-3 text-[12px] font-semibold text-white"
                    style={{ fontFamily: 'Urbanist, sans-serif' }}
                    onClick={handleReturn}
                    disabled={borrowMutation.isPending || returnMutation.isPending}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {returnMutation.isPending ? 'Memproses...' : 'Konfirmasi Kembali'}
                  </button>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
