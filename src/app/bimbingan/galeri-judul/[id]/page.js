'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UserRound,
  CheckCircle2,
  BookText,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';
import CategoryBadge from '@/components/bimbingan/category-badge';
import ConfirmAjukanModal from '@/components/bimbingan/confirm-ajukan-modal';

function getErrorMessage(err) {
  const message = err?.response?.data?.message;
  const errors = err?.response?.data?.errors;

  if (typeof message === 'string' && message.trim()) return message;

  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];
    if (Array.isArray(firstValue) && firstValue[0]) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }

  return 'Terjadi kesalahan, coba lagi.';
}

function getInitials(name) {
  if (!name) return 'DS';
  const letters = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return letters || 'DS';
}

function normalizeRequirements(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw !== 'string') return [];

  return raw
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DetailJudulPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get(`/student/thesis/topics/${params.id}`);
      setTopic(res?.data?.data || null);
    } catch (err) {
      if (err?.response?.status === 404) {
        router.replace('/bimbingan/galeri-judul');
        return;
      }

      toast.error(getErrorMessage(err));
      router.replace('/bimbingan/galeri-judul');
      return;
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const quota = useMemo(() => {
    const total = Number(topic?.quota || 0);
    const usedFromList = Array.isArray(topic?.student_theses)
      ? topic.student_theses.filter((item) => item?.status !== 'rejected').length
      : 0;
    const used = Number(topic?.taken_count ?? usedFromList);
    const remaining = Math.max(total - used, 0);
    const isFull = String(topic?.status || '').toLowerCase() !== 'available' || remaining <= 0;

    return {
      total,
      remaining,
      isFull,
    };
  }, [topic]);

  const requirements = useMemo(
    () => normalizeRequirements(topic?.requirements),
    [topic?.requirements],
  );

  const onConfirmAjukan = async () => {
    if (!topic?.id_thesis_topic) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('student_note', '');

      await api.post(`/student/thesis/topics/${topic.id_thesis_topic}/select`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Pengajuan bimbingan berhasil dikirim.');
      setConfirmOpen(false);
      router.push('/bimbingan/pengajuan-ta');
    } catch (err) {
      const message = getErrorMessage(err);

      if (err?.response?.status === 422 && message.toLowerCase().includes('anda sudah memiliki ta')) {
        toast.error('Anda sudah memiliki pengajuan tugas akhir aktif');
        router.push('/bimbingan/pengajuan-ta');
      } else {
        toast.error(message);
      }

      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BimbinganShell
      title="Detail Judul Tugas Akhir"
      description="Tinjau detail topik sebelum mengajukan bimbingan"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan/pengajuan-ta' },
        { label: 'Galeri Judul TA', href: '/bimbingan/galeri-judul' },
        { label: 'Detail Judul', active: true },
      ]}
    >
      <button
        type="button"
        onClick={() => router.push('/bimbingan/galeri-judul')}
        className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#015023]"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Galeri
      </button>

      {loading ? (
        <div className="rounded-[16px] bg-white p-6 shadow-sm">
          <div className="mb-3 h-7 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-5 h-56 animate-pulse rounded bg-gray-100" />
        </div>
      ) : topic ? (
        <article className="overflow-hidden rounded-[16px] bg-white shadow-sm">
          <section className="border-b border-[#e5e7eb] p-[24px]">
            <CategoryBadge
              name={topic?.category?.name || topic?.thesis_category?.name || topic?.topic || 'Tanpa Kategori'}
            />

            <h1
              className="mt-3 text-[24px] font-bold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {topic.title_ind}
            </h1>

            <p className="mt-1 text-[14px] italic text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {topic.title_eng || '-'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium"
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  fontFamily: 'Urbanist, sans-serif',
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {quota.isFull ? 'Tidak Tersedia' : 'Tersedia'}
              </span>

              <span className="inline-flex items-center gap-1 text-[13px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <UserRound className="h-4 w-4" />
                Kuota {quota.remaining}/{quota.total}
              </span>
            </div>
          </section>

          <section className="border-b border-[#e5e7eb] p-[24px]">
            <h2 className="mb-3 inline-flex items-center gap-2 text-[16px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <UserRound className="h-4 w-4" />
              Dosen Pembimbing
            </h2>

            <div className="rounded-[12px] bg-gray-50 p-[16px]">
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#015023] text-[15px] font-bold text-white"
                  style={{ fontFamily: 'Urbanist, sans-serif' }}
                >
                  {getInitials(topic?.lecturer?.name)}
                </span>

                <div>
                  <p className="text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    {topic?.lecturer?.name || 'Dosen'}
                  </p>
                  <p className="text-[13px] text-[#6a7282]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    {topic?.lecturer?.email || '-'}
                  </p>
                  {topic?.lecturer?.staff_profile?.position ? (
                    <p className="mt-1 text-[13px] font-medium text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                      Bidang keahlian: {topic.lecturer.staff_profile.position}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#e5e7eb] p-[24px]">
            <h2 className="mb-3 inline-flex items-center gap-2 text-[16px] font-bold text-[#dabc4e]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <BookText className="h-4 w-4" />
              Deskripsi Penelitian
            </h2>

            <p className="text-[14px] leading-7 text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {topic?.description || 'Tidak ada deskripsi penelitian.'}
            </p>

            {topic?.extended_description ? (
              <blockquote
                className="mt-4 rounded-r-[8px] border-l-4 bg-[#f9fafb] p-[16px] text-[13px] text-[#4a5565]"
                style={{ borderLeftColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
              >
                {topic.extended_description}
              </blockquote>
            ) : null}
          </section>

          {topic?.methodology ? (
            <section className="border-b border-[#e5e7eb] p-[24px]">
              <h2 className="mb-3 text-[16px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Metodologi Penelitian
              </h2>
              <div className="rounded-[12px] bg-gray-50 p-[16px] text-[14px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {topic.methodology}
              </div>
            </section>
          ) : null}

          {requirements.length > 0 ? (
            <section className="border-b border-[#e5e7eb] p-[24px]">
              <h2 className="mb-3 text-[16px] font-bold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Persyaratan
              </h2>
              <ul className="space-y-1 text-[14px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {requirements.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="p-[24px]">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={quota.isFull}
              className="w-full rounded-[10px] py-[14px] text-[16px] text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: '#015023',
                fontFamily: 'Urbanist, sans-serif',
              }}
            >
              Ajukan Bimbingan
            </button>
          </section>
        </article>
      ) : null}

      <ConfirmAjukanModal
        open={confirmOpen}
        topic={topic}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onConfirmAjukan}
        loading={submitting}
      />
    </BimbinganShell>
  );
}
