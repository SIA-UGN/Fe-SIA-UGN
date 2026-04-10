'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  getAdminLibrarySuggestionById,
  respondAdminLibrarySuggestion,
} from '@/lib/libraryApi';
import { formatDateTime, getErrorMessage, parseApiBody } from '@/features/library/utils';

export default function AdminLibrarySuggestionDetailPage() {
  const params = useParams();
  const suggestionId = params?.id;

  const [suggestion, setSuggestion] = useState(null);
  const [status, setStatus] = useState('approved');
  const [adminResponse, setAdminResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestion = useCallback(async () => {
    if (!suggestionId) return;

    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibrarySuggestionById(suggestionId);
      const payload = parseApiBody(response);
      const suggestionData = payload?.data || payload;
      setSuggestion(suggestionData);
      setAdminResponse(suggestionData?.admin_response || '');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat detail usulan.'));
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  }, [suggestionId]);

  useEffect(() => {
    fetchSuggestion();
  }, [fetchSuggestion]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!suggestion?.id_book_suggestion || suggestion.status !== 'pending') return;

    if (!adminResponse.trim()) {
      toast.error('Respon admin wajib diisi.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await respondAdminLibrarySuggestion(suggestion.id_book_suggestion, {
        status,
        admin_response: adminResponse.trim(),
      });
      toast.success(response?.message || 'Usulan berhasil direspon.');
      await fetchSuggestion();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim respon usulan.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminBimbinganShell
      title="Detail Usulan Buku"
      description="Tinjau usulan dan berikan respon admin"
      backHref="/admin/library/suggestions"
      backLabel="Kembali ke Manajemen Usulan"
    >
      <Link
        href="/admin/library/suggestions"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#015023] hover:opacity-80"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      {error ? <ErrorMessageBoxWithButton message={error} action={fetchSuggestion} /> : null}

      {loading ? (
        <div className="rounded-[16px] bg-white p-8 text-center shadow-sm">
          <p className="text-[15px] text-[#4b5563]">Memuat detail usulan...</p>
        </div>
      ) : null}

      {!loading && suggestion ? (
        <section className="rounded-[16px] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[28px] font-bold text-[#015023]">{suggestion.title || '-'}</h2>
              <p className="text-[13px] text-[#6b7280]">oleh {suggestion.author || '-'}</p>
            </div>
            <LibraryStatusBadge type="suggestion" status={suggestion.status} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-[#374151] md:grid-cols-2">
            <p><span className="font-semibold">Pengusul:</span> {suggestion.user_name || '-'}</p>
            <p><span className="font-semibold">Email:</span> {suggestion.user_email || '-'}</p>
            <p><span className="font-semibold">Diajukan:</span> {formatDateTime(suggestion.created_at)}</p>
            <p><span className="font-semibold">Direspon:</span> {formatDateTime(suggestion.responded_at)}</p>
            <p className="md:col-span-2"><span className="font-semibold">Alasan:</span> {suggestion.reason || '-'}</p>
            <p className="md:col-span-2"><span className="font-semibold">Respon Admin:</span> {suggestion.admin_response || '-'}</p>
          </div>

          {suggestion.status === 'pending' ? (
            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <select
                className="h-10 w-full rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2 md:w-[240px]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="approved">Setujui Usulan</option>
                <option value="rejected">Tolak Usulan</option>
              </select>

              <textarea
                rows={4}
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[14px] outline-none ring-[#015023] focus:ring-2"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                placeholder="Tuliskan respon admin..."
                value={adminResponse}
                onChange={(event) => setAdminResponse(event.target.value)}
              />

              <PrimaryButton type="submit" className="h-10 px-4 text-[13px] font-semibold" disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Respon'}
              </PrimaryButton>
            </form>
          ) : null}
        </section>
      ) : null}
    </AdminBimbinganShell>
  );
}
