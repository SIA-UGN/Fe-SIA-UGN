'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import LibraryShell from '@/components/library/library-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { WarningButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { cancelLibraryActivity, getLibraryActivities } from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parseListData } from '@/features/library/utils';

const MAX_ACTIVE_BOOKS = 5;

export default function LibraryActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getLibraryActivities({ status: statusFilter || undefined });
      setActivities(parseListData(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat aktivitas perpustakaan.'));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCancelOrder = async (activityId) => {
    const confirmed = window.confirm('Batalkan pesanan buku ini?');
    if (!confirmed) return;

    setCancellingId(activityId);

    try {
      const response = await cancelLibraryActivity(activityId);
      toast.success(response?.message || 'Pesanan berhasil dibatalkan.');
      await fetchActivities();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal membatalkan pesanan.'));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <LibraryShell
      title="Aktivitas Perpustakaan"
      description="Pantau status pemesanan dan peminjaman buku Anda"
      breadcrumbItems={[
        { label: 'Perpustakaan', href: '/library/books', active: false },
        { label: 'Aktivitas Saya', active: true },
      ]}
      actions={
        <select
          className="h-10 rounded-[10px] border border-[#d1d5db] bg-white px-3 text-[14px] text-[#374151] outline-none ring-[#015023] focus:ring-2"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="ordered">Dipesan</option>
          <option value="borrowed">Dipinjam</option>
          <option value="returned">Dikembalikan</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      }
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchActivities} /> : null}

      {/* Active book count banner */}
      {!loading && activities.length > 0 ? (() => {
        const activeCount = activities.filter(
          (a) => a.status === 'ordered' || a.status === 'borrowed'
        ).length;
        if (activeCount === 0) return null;
        const hasReachedLimit = activeCount >= MAX_ACTIVE_BOOKS;
        return (
          <div
            className={`mb-4 rounded-[12px] border px-4 py-3 text-[13px] font-medium ${
              hasReachedLimit
                ? 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]'
                : 'border-[#d1e7dd] bg-[#e8f5e9] text-[#015023]'
            }`}
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            {hasReachedLimit
              ? `Anda sudah meminjam/memesan ${activeCount} dari ${MAX_ACTIVE_BOOKS} buku. Kembalikan buku terlebih dahulu sebelum memesan buku baru.`
              : `Buku aktif (dipesan/dipinjam): ${activeCount}/${MAX_ACTIVE_BOOKS}`}
          </div>
        );
      })() : null}

      <section className="overflow-hidden rounded-[16px] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#e8f1eb]">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Buku</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Status</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Dipesan</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Dipinjam</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-[#015023]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[#6b7280]">
                    Memuat aktivitas...
                  </td>
                </tr>
              ) : null}

              {!loading && activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[14px] text-[#6b7280]">
                    Belum ada aktivitas perpustakaan.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? activities.map((activity) => {
                    const activityId = activity.id_book_order;
                    const isOrdered = activity.status === 'ordered';
                    const isCancelling = cancellingId === activityId;

                    return (
                      <tr key={activityId} className="border-t border-[#f1f5f9]">
                        <td className="px-4 py-3">
                          <p className="text-[14px] font-semibold text-[#015023]">{activity?.book?.title || '-'}</p>
                          <p className="mt-0.5 text-[12px] text-[#6b7280]">{activity?.book?.author || '-'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <LibraryStatusBadge type="order" status={activity.status} />
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">
                          {formatDateTime(activity.ordered_at)}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#374151]">
                          {formatDateTime(activity.borrowed_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/library/activities/${activityId}`}
                              className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-[#015023] px-3 text-[12px] font-semibold text-white hover:opacity-90"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </Link>

                            {isOrdered ? (
                              <WarningButton
                                type="button"
                                className="h-9 px-3 text-[12px] font-semibold"
                                onClick={() => handleCancelOrder(activityId)}
                                disabled={isCancelling}
                              >
                                {isCancelling ? 'Membatalkan...' : 'Batalkan'}
                              </WarningButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </section>
    </LibraryShell>
  );
}
