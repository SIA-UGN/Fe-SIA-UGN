'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, SendHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import LibraryShell from '@/components/library/library-shell';
import LibraryStatusBadge from '@/components/library/library-status-badge';
import { PrimaryButton } from '@/components/ui/button';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { createLibrarySuggestion, getLibrarySuggestions } from '@/lib/libraryApi';
import {
  formatDate,
  getErrorMessage,
  parseListData,
} from '@/features/library/utils';

const MIN_REASON_LENGTH = 20;

const guideItems = [
  'Pastikan buku yang diusulkan relevan dengan program studi atau mendukung kegiatan akademik.',
  'Berikan alasan yang jelas dan spesifik mengapa buku tersebut diperlukan.',
  'Tim perpustakaan akan meninjau usulan dalam 3-5 hari kerja.',
  'Anda akan menerima notifikasi jika usulan disetujui atau ditolak.',
];

export default function LibrarySuggestionsPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const sortedSuggestions = useMemo(
    () =>
      [...suggestions].sort(
        (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      ),
    [suggestions],
  );

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getLibrarySuggestions({ status: statusFilter || undefined });
      setSuggestions(parseListData(response));
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat riwayat usulan buku.'));
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const validate = () => {
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = 'Judul buku wajib diisi.';
    if (!author.trim()) nextErrors.author = 'Nama penulis wajib diisi.';

    if (!reason.trim()) {
      nextErrors.reason = 'Alasan usulan wajib diisi.';
    } else if (reason.trim().length < MIN_REASON_LENGTH) {
      nextErrors.reason = `Alasan usulan minimal ${MIN_REASON_LENGTH} karakter.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setReason('');
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await createLibrarySuggestion({
        title: title.trim(),
        author: author.trim(),
        reason: reason.trim(),
      });

      toast.success(response?.message || 'Usulan buku berhasil dikirim.');
      resetForm();
      await fetchSuggestions();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim usulan buku.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LibraryShell
      title="Usulan Buku Baru"
      description="Usulkan buku baru untuk koleksi perpustakaan universitas"
      breadcrumbItems={[
        { label: 'Perpustakaan', href: '/library/books', active: false },
        { label: 'Usulan Buku', active: true },
      ]}
      actions={
        <select
          className="h-10 rounded-[10px] border border-[#d1d5db] bg-white px-3 text-[14px] text-[#374151] outline-none ring-[#015023] focus:ring-2"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      }
    >
      {error ? <ErrorMessageBoxWithButton message={error} action={fetchSuggestions} /> : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">
        <section className="h-fit rounded-[16px] bg-white p-5 shadow-sm md:p-6">
          <header className="mb-4 flex items-start gap-3">
            <div className="rounded-[10px] bg-[#015023] p-2.5 text-white">
              <SendHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Formulir Usulan Buku
              </h2>
              <p className="text-[14px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Isi formulir di bawah untuk mengusulkan buku baru
              </p>
            </div>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-[13px] font-semibold text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Judul Buku *
              </label>
              <input
                type="text"
                className="h-11 w-full rounded-[10px] border border-[#d1d5db] px-3 text-[14px] text-[#374151] outline-none ring-[#015023] focus:ring-2"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                placeholder="Masukkan judul buku yang diusulkan"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              {errors.title ? (
                <p className="mt-1 text-[12px] text-[#dc2626]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {errors.title}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Penulis *
              </label>
              <input
                type="text"
                className="h-11 w-full rounded-[10px] border border-[#d1d5db] px-3 text-[14px] text-[#374151] outline-none ring-[#015023] focus:ring-2"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                placeholder="Masukkan nama penulis buku"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
              {errors.author ? (
                <p className="mt-1 text-[12px] text-[#dc2626]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {errors.author}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-semibold text-[#374151]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Alasan Usulan *
              </label>
              <textarea
                rows={6}
                className="w-full rounded-[10px] border border-[#d1d5db] px-3 py-2 text-[14px] text-[#374151] outline-none ring-[#015023] focus:ring-2"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
                placeholder="Jelaskan mengapa buku ini penting untuk ditambahkan ke koleksi perpustakaan"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.reason ? (
                  <p className="text-[12px] text-[#dc2626]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    {errors.reason}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-[12px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {reason.trim().length} karakter
                </p>
              </div>
            </div>

            <PrimaryButton type="submit" className="h-11 w-full text-[18px] font-semibold" disabled={submitting}>
              <SendHorizontal className="h-4 w-4" />
              {submitting ? 'Mengirim...' : 'Kirim Usulan'}
            </PrimaryButton>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[16px] bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[20px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              Panduan Usulan Buku
            </h3>

            <ul className="space-y-3">
              {guideItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] text-[#4b5563]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[16px] bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[20px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              Riwayat Usulan Anda
            </h3>

            {loading ? (
              <p className="text-[13px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Memuat riwayat usulan...
              </p>
            ) : null}

            {!loading && sortedSuggestions.length === 0 ? (
              <p className="text-[13px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Belum ada usulan buku.
              </p>
            ) : null}

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedSuggestions.map((item) => (
                <article key={item.id_book_suggestion} className="rounded-[12px] border border-[#e5e7eb] p-3">
                  <h4 className="text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-[12px] text-[#6b7280]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    oleh {item.author}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9ca3af]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    {formatDate(item.created_at)}
                  </p>
                  <div className="mt-2">
                    <LibraryStatusBadge type="suggestion" status={item.status} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </LibraryShell>
  );
}
