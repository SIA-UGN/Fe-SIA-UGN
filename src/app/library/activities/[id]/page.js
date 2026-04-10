'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import LibraryShell from '@/components/library/library-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { WarningButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { cancelLibraryActivity, getLibraryActivityById } from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parseApiBody } from '@/features/library/utils';

export default function LibraryActivityDetailPage() {
  const params = useParams();
  const activityId = params?.id;

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchActivity = useCallback(async () => {
    if (!activityId) return;

    setLoading(true);
    setError('');

    try {
      const response = await getLibraryActivityById(activityId);
      const payload = parseApiBody(response);
      setActivity(payload?.data || payload);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat detail aktivitas.'));
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleCancel = async () => {
    if (!activity?.id_book_order) return;

    const confirmed = window.confirm('Batalkan pesanan ini?');
    if (!confirmed) return;

    setCancelling(true);

    try {
      const response = await cancelLibraryActivity(activity.id_book_order);
      toast.success(response?.message || 'Pesanan berhasil dibatalkan.');
      await fetchActivity();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal membatalkan pesanan.'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <LibraryShell
      title="Detail Aktivitas"
      description="Informasi lengkap status pemesanan atau peminjaman buku"
      breadcrumbItems={[
        { label: 'Perpustakaan', href: '/library/books', active: false },
        { label: 'Aktivitas Saya', href: '/library/activities', active: false },
        { label: 'Detail Aktivitas', active: true },
      ]}
    >
      <Link
        href="/library/activities"
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#015023] hover:opacity-80"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Aktivitas
      </Link>

      {error ? <ErrorMessageBoxWithButton message={error} action={fetchActivity} /> : null}

      {loading ? (
        <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
          <p className="text-[15px] text-[#4b5563]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Memuat detail aktivitas...
          </p>
        </div>
      ) : null}

      {!loading && activity ? (
        <article className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                className="text-[28px] font-bold text-[#015023]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                {activity?.book?.title || '-'}
              </h2>
              <p className="text-[14px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {activity?.book?.author || '-'}
              </p>
            </div>
            <LibraryStatusBadge type="order" status={activity.status} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 text-[14px] text-[#374151] md:grid-cols-2">
            <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">Pemesan:</span> {activity?.user_name || '-'}
            </p>
            <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">ID Pesanan:</span> #{activity?.id_book_order || '-'}
            </p>
            <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">Dipesan:</span> {formatDateTime(activity?.ordered_at)}
            </p>
            <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">Dipinjam:</span> {formatDateTime(activity?.borrowed_at)}
            </p>
            <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">Dikembalikan:</span> {formatDateTime(activity?.returned_at)}
            </p>
            <p style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">Durasi:</span> {activity?.borrow_duration || '-'}
            </p>
            <p className="md:col-span-2" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span className="font-semibold">Catatan Admin:</span> {activity?.admin_note || '-'}
            </p>
          </div>

          {activity?.status === 'ordered' ? (
            <WarningButton
              type="button"
              className="mt-5 h-10 px-4 text-[13px] font-semibold"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
            </WarningButton>
          ) : null}
        </article>
      ) : null}
    </LibraryShell>
  );
}
