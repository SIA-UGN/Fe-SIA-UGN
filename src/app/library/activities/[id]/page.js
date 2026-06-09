'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Calendar, Clock, Hash, User, RotateCcw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import LibraryShell from '@/components/library/library-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton, WarningButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { cancelLibraryActivity, getLibraryActivityById, returnLibraryBook } from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parseApiBody } from '@/features/library/utils';

export default function LibraryActivityDetailPage() {
  const params = useParams();
  const activityId = params?.id;

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);

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

    const confirmed = window.confirm('Apakah Anda yakin ingin membatalkan pesanan buku ini?');
    if (!confirmed) return;

    setCancelling(true);

    try {
      const response = await cancelLibraryActivity(activity.id_book_order);
      toast.success(response?.message || 'Pesanan berhasil dibatalkan.');
      await fetchActivity();
    } catch (err) {
      const message = getErrorMessage(err, 'Gagal membatalkan pesanan.');
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReturn = async () => {
    if (!activity?.id_book_order) return;

    const confirmed = window.confirm('Apakah Anda yakin ingin mengembalikan buku ini?');
    if (!confirmed) return;

    setReturning(true);

    try {
      const response = await returnLibraryBook(activity.id_book_order);
      toast.success(response?.message || 'Buku berhasil dikembalikan.');
      await fetchActivity();
    } catch (err) {
      const message = getErrorMessage(err, 'Gagal mengembalikan buku.');
      toast.error(message);
    } finally {
      setReturning(false);
    }
  };

  const isOrdered = activity?.status === 'ordered';
  const isBorrowed = activity?.status === 'borrowed';

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
        <div className="space-y-5">
          {/* Header Card */}
          <article className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  className="text-[24px] font-bold text-[#015023] md:text-[28px]"
                  style={{ fontFamily: 'Urbanist, sans-serif' }}
                >
                  {activity?.book?.title || '-'}
                </h2>
                <p className="mt-1 text-[14px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {activity?.book?.author || '-'}
                </p>
              </div>
              <LibraryStatusBadge type="order" status={activity.status} />
            </div>
          </article>

          {/* Informasi Buku */}
          <article className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
            <h3
              className="mb-4 flex items-center gap-2 text-[16px] font-bold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              <Book className="h-5 w-5" />
              Informasi Buku
            </h3>
            <div className="grid grid-cols-1 gap-3 text-[14px] text-[#374151] md:grid-cols-2">
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Judul</span>
                <p className="mt-0.5 font-medium">{activity?.book?.title || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Penulis</span>
                <p className="mt-0.5 font-medium">{activity?.book?.author || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Penerbit</span>
                <p className="mt-0.5 font-medium">{activity?.book?.publisher || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Tahun Terbit</span>
                <p className="mt-0.5 font-medium">{activity?.book?.year || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">ISBN</span>
                <p className="mt-0.5 font-medium">{activity?.book?.isbn || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Kategori</span>
                <p className="mt-0.5 font-medium">{activity?.book?.category?.name || '-'}</p>
              </div>
            </div>
          </article>

          {/* Informasi Peminjaman */}
          <article className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
            <h3
              className="mb-4 flex items-center gap-2 text-[16px] font-bold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              <Calendar className="h-5 w-5" />
              Informasi Peminjaman
            </h3>
            <div className="grid grid-cols-1 gap-3 text-[14px] text-[#374151] md:grid-cols-2">
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">ID Pesanan</span>
                <p className="mt-0.5 font-medium">#{activity?.id_book_order || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Pemesan</span>
                <p className="mt-0.5 font-medium">{activity?.user_name || activity?.user?.name || '-'}</p>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Status</span>
                <div className="mt-0.5">
                  <LibraryStatusBadge type="order" status={activity.status} />
                </div>
              </div>
              <div style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <span className="font-semibold text-[#6b7280]">Durasi Peminjaman</span>
                <p className="mt-0.5 font-medium">{activity?.borrow_duration || '-'}</p>
              </div>
            </div>
          </article>

          {/* Timeline */}
          <article className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
            <h3
              className="mb-4 flex items-center gap-2 text-[16px] font-bold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              <Clock className="h-5 w-5" />
              Timeline Aktivitas
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e6eee9]">
                  <Hash className="h-4 w-4 text-[#015023]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#6b7280]">Dipesan</p>
                  <p className="text-[14px] font-medium text-[#374151]">{formatDateTime(activity?.ordered_at)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e6eee9]">
                  <Book className="h-4 w-4 text-[#015023]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#6b7280]">Dipinjam</p>
                  <p className="text-[14px] font-medium text-[#374151]">{formatDateTime(activity?.borrowed_at)}</p>
                </div>
              </div>

              {activity?.returned_at ? (
                <div className="flex items-start gap-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#dbeafe]">
                    <RotateCcw className="h-4 w-4 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#6b7280]">Dikembalikan</p>
                    <p className="text-[14px] font-medium text-[#374151]">{formatDateTime(activity?.returned_at)}</p>
                  </div>
                </div>
              ) : null}

              {activity?.cancelled_at ? (
                <div className="flex items-start gap-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#fee2e2]">
                    <Hash className="h-4 w-4 text-[#dc2626]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#6b7280]">Dibatalkan</p>
                    <p className="text-[14px] font-medium text-[#374151]">{formatDateTime(activity?.cancelled_at)}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </article>

          {/* Catatan Admin */}
          {activity?.admin_note ? (
            <article className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
              <h3
                className="mb-3 flex items-center gap-2 text-[16px] font-bold text-[#015023]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                <User className="h-5 w-5" />
                Catatan Admin
              </h3>
              <p className="text-[14px] leading-relaxed text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {activity.admin_note}
              </p>
            </article>
          ) : null}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isOrdered ? (
              <WarningButton
                type="button"
                className="h-10 px-4 text-[13px] font-semibold"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
              </WarningButton>
            ) : null}

            {isBorrowed ? (
              <PrimaryButton
                type="button"
                className="h-10 px-4 text-[13px] font-semibold"
                onClick={handleReturn}
                disabled={returning}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                {returning ? 'Mengembalikan...' : 'Kembalikan Buku'}
              </PrimaryButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </LibraryShell>
  );
}
