'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, MessageSquareReply, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminBimbinganShell from '@/components/admin/admin-bimbingan-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import {
  getAdminLibrarySuggestions,
  respondAdminLibrarySuggestion,
} from '@/lib/libraryApi';
import {
  formatDateTime,
  getErrorMessage,
  parseListData,
} from '@/features/library/utils';

const initialResponseForm = {
  status: 'approved',
  admin_response: '',
};

export default function AdminLibrarySuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [responseForm, setResponseForm] = useState(initialResponseForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getAdminLibrarySuggestions({
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      });
      setSuggestions(parseListData(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data usulan buku.'));
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, statusFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const pendingCount = useMemo(
    () => suggestions.filter((item) => item.status === 'pending').length,
    [suggestions],
  );

  const handleStartResponse = (suggestion) => {
    setActiveSuggestion(suggestion);
    setResponseForm(initialResponseForm);
  };

  const handleSubmitResponse = async (event) => {
    event.preventDefault();
    if (!activeSuggestion?.id_book_suggestion) return;

    if (!responseForm.admin_response.trim()) {
      toast.error('Respon admin wajib diisi.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await respondAdminLibrarySuggestion(activeSuggestion.id_book_suggestion, {
        status: responseForm.status,
        admin_response: responseForm.admin_response.trim(),
      });
      toast.success(response?.message || 'Usulan berhasil direspon.');
      setActiveSuggestion(null);
      setResponseForm(initialResponseForm);
      await fetchSuggestions();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim respon usulan.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminBimbinganShell
      title="Manajemen Usulan Buku"
      description="Tinjau dan respon usulan buku dari mahasiswa"
      backHref="/admin/library"
      backLabel="Kembali ke Dashboard Perpustakaan"
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchSuggestions} /> : null}

      <section className="rounded-[16px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Total {suggestions.length} usulan ({pendingCount} menunggu respon)
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                className="h-10 w-full rounded-[10px] border border-[#d1d5db] pl-9 pr-3 text-[14px] outline-none ring-[#015023] focus:ring-2 sm:w-[320px]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                placeholder="Cari judul, penulis, atau nama pengusul"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setAppliedSearch(searchInput.trim());
                  }
                }}
              />
            </div>

            <select
              className="h-10 rounded-[10px] border border-[#d1d5db] px-3 text-[14px]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>

            <PrimaryButton
              type="button"
              className="h-10 px-3 text-[13px] font-semibold"
              onClick={() => setAppliedSearch(searchInput.trim())}
            >
              Terapkan
            </PrimaryButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#e8f1eb]">
              <tr>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Pengusul</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Judul/penulis</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Alasan</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Status</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Direspon</th>
                <th className="px-3 py-3 text-left text-[13px] font-semibold text-[#015023]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[14px] text-[#6b7280]">
                    Memuat data usulan...
                  </td>
                </tr>
              ) : null}

              {!loading && suggestions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[14px] text-[#6b7280]">
                    Tidak ada usulan untuk filter saat ini.
                  </td>
                </tr>
              ) : null}

              {!loading
                ? suggestions.map((suggestion) => {
                    const canRespond = suggestion.status === 'pending';

                    return (
                      <tr key={suggestion.id_book_suggestion} className="border-t border-[#f1f5f9]">
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-semibold text-[#015023]">{suggestion.user_name || '-'}</p>
                          <p className="text-[12px] text-[#6b7280]">{suggestion.user_email || '-'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[13px] font-semibold text-[#015023]">{suggestion.title}</p>
                          <p className="text-[12px] text-[#6b7280]">{suggestion.author}</p>
                        </td>
                        <td className="max-w-[300px] px-3 py-3 text-[12px] text-[#374151]">{suggestion.reason}</td>
                        <td className="px-3 py-3">
                          <LibraryStatusBadge type="suggestion" status={suggestion.status} />
                        </td>
                        <td className="px-3 py-3 text-[12px] text-[#374151]">{formatDateTime(suggestion.responded_at)}</td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/admin/library/suggestions/${suggestion.id_book_suggestion}`}
                            className="mb-1 inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#0066CC] px-3 text-[12px] font-semibold text-white"
                            style={{ fontFamily: 'Urbanist, sans-serif' }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </Link>

                          {canRespond ? (
                            <button
                              type="button"
                              className="inline-flex h-8 items-center gap-1 rounded-[8px] bg-[#015023] px-3 text-[12px] font-semibold text-white"
                              style={{ fontFamily: 'Urbanist, sans-serif' }}
                              onClick={() => handleStartResponse(suggestion)}
                            >
                              <MessageSquareReply className="h-3.5 w-3.5" />
                              Respon
                            </button>
                          ) : (
                            <span className="text-[12px] text-[#6b7280]">Selesai</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </section>

      {activeSuggestion ? (
        <section className="rounded-[16px] bg-white p-5 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Respon Usulan
          </h2>

          <div className="mt-3 rounded-[12px] bg-[#f7faf8] p-3 text-[13px] text-[#374151]">
            <p>
              <span className="font-semibold">Judul:</span> {activeSuggestion.title}
            </p>
            <p>
              <span className="font-semibold">Penulis:</span> {activeSuggestion.author}
            </p>
            <p>
              <span className="font-semibold">Pengusul:</span> {activeSuggestion.user_name || '-'}
            </p>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubmitResponse}>
            <select
              className="h-10 w-full rounded-[10px] border border-[#d1d5db] px-3 text-[14px] outline-none ring-[#015023] focus:ring-2 md:w-[240px]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              value={responseForm.status}
              onChange={(event) =>
                setResponseForm((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
            >
              <option value="approved">Setujui Usulan</option>
              <option value="rejected">Tolak Usulan</option>
            </select>

            <textarea
              rows={4}
              className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[14px] outline-none ring-[#015023] focus:ring-2"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
              placeholder="Tuliskan respon admin..."
              value={responseForm.admin_response}
              onChange={(event) =>
                setResponseForm((prev) => ({
                  ...prev,
                  admin_response: event.target.value,
                }))
              }
            />

            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit" className="h-10 px-4 text-[13px] font-semibold" disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Respon'}
              </PrimaryButton>

              <button
                type="button"
                className="inline-flex h-10 items-center rounded-[10px] border border-[#d1d5db] px-4 text-[13px] font-semibold text-[#374151]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                onClick={() => {
                  setActiveSuggestion(null);
                  setResponseForm(initialResponseForm);
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </AdminBimbinganShell>
  );
}
