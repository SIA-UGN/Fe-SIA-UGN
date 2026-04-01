'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';
import TopicCard from '@/components/bimbingan/topic-card';
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

function SkeletonCard() {
  return <div className="h-[280px] animate-pulse rounded-[16px] bg-gray-100" />;
}

export default function GaleriJudulPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const params = {
      my_program: true,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
    };

    const [topicsRes, categoriesRes] = await Promise.allSettled([
      api.get('/student/thesis/topics', { params }),
      api.get('/student/thesis/categories'),
    ]);

    if (topicsRes.status === 'fulfilled') {
      setTopics(topicsRes.value?.data?.data || []);
    } else {
      setTopics([]);
      toast.error(getErrorMessage(topicsRes.reason));
    }

    if (categoriesRes.status === 'fulfilled') {
      setCategories(categoriesRes.value?.data?.data || []);
    } else {
      setCategories([]);
    }

    setLoading(false);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleTopics = useMemo(() => topics || [], [topics]);

  const onAjukanFromCard = (topic) => {
    setSelectedTopic(topic);
    setConfirmOpen(true);
  };

  const submitAjukan = async () => {
    if (!selectedTopic?.id_thesis_topic) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('student_note', '');

      await api.post(`/student/thesis/topics/${selectedTopic.id_thesis_topic}/select`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Pengajuan bimbingan berhasil dikirim.');
      setConfirmOpen(false);
      router.push('/bimbingan/pengajuan-ta');
    } catch (err) {
      const message = getErrorMessage(err);

      if (err?.response?.status === 422 && message.toLowerCase().includes('anda sudah memiliki')) {
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
      title="Galeri Judul Tugas Akhir"
      description="Pilih dari judul-judul tugas akhir yang ditawarkan oleh dosen pembimbing"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan/pengajuan-ta' },
        { label: 'Galeri Judul TA', active: true },
      ]}
    >
      <section className="mb-5 rounded-[16px] bg-white p-[24px] shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[520px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717182]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari judul atau nama dosen..."
              className="w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] py-[8px] pl-9 pr-3 text-[14px] text-[#374151] outline-none focus:border-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            />
          </div>

          <div className="relative w-full md:w-[260px]">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717182]" />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full appearance-none rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] py-[8px] pl-9 pr-3 text-[14px] text-[#374151] outline-none focus:border-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id_thesis_category} value={category.id_thesis_category}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <p className="mb-4 text-[14px] text-[#4a5565]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        Menampilkan <span className="font-semibold text-[#015023]">{visibleTopics.length}</span> judul tugas akhir
      </p>

      {loading ? (
        <section className="grid grid-cols-1 gap-[28px] md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : visibleTopics.length === 0 ? (
        <section className="rounded-[16px] bg-white p-10 text-center shadow-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          <div className="mb-2 text-[#9ca3af]">
            <Search className="mx-auto h-7 w-7" />
          </div>
          <p className="text-[16px] font-semibold text-[#374151]">Tidak ada judul yang ditemukan</p>
          <p className="mt-1 text-[14px] text-[#6a7282]">Coba ubah kata kunci atau kategori pencarian</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-[28px] md:grid-cols-2 xl:grid-cols-3">
          {visibleTopics.map((topic) => (
            <TopicCard
              key={topic.id_thesis_topic}
              topic={topic}
              onLihatDetail={(item) => router.push(`/bimbingan/galeri-judul/${item.id_thesis_topic}`)}
              onAjukan={onAjukanFromCard}
            />
          ))}
        </section>
      )}

      <ConfirmAjukanModal
        open={confirmOpen}
        topic={selectedTopic}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submitAjukan}
        loading={submitting}
      />
    </BimbinganShell>
  );
}
