'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { thesisIntegrationService } from '@/services/thesisIntegrationService';


/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GaleriTAItem {
  id: number;
  kategori: string;
  judul: string;
  dosen: string;
  dosen_id: number;
  deskripsi: string;
  kuota_terisi: number;
  kuota_maksimal: number;
}

export const KATEGORI_OPTIONS = ['Semua Kategori'] as const;

export const CATEGORY_BADGE_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  'Artificial Intelligence': { bg: '#E6F4EA', text: '#015023' },
  'Software Engineering': { bg: '#E8F0FE', text: '#1D4ED8' },
  'Data Science': { bg: '#E0F7FA', text: '#0F766E' },
  'Cyber Security': { bg: '#FEE2E2', text: '#B91C1C' },
  'Internet of Things': { bg: '#FEF3C7', text: '#92400E' },
};

const ITEMS_PER_PAGE = 9;

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useGaleriTA() {
  const [galeriData, setGaleriData] = useState<GaleriTAItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTA, setSelectedTA] = useState<GaleriTAItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'terbaru' | 'populer' | 'nama'>('populer');

  const fetchGaleri = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const topics = await thesisIntegrationService.getPublishedTopicsForStudent();
      
      const mapped = topics.map((topic) => ({
        id: topic.id,
        kategori: topic.category || 'Lainnya',
        judul: topic.title,
        dosen: topic.lecturerName,
        dosen_id: topic.lecturerId,
        deskripsi: topic.description,
        kuota_terisi: topic.quotaFilled,
        kuota_maksimal: topic.quotaTotal,
      }));

      setGaleriData(mapped);
    } catch (err: any) {
      console.error('[useGaleriTA] Error:', err);
      setError(err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal memuat galeri judul TA.');
      setGaleriData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGaleri();
  }, [fetchGaleri]);

  /* ── Filtered data ─────────────────────────────────────────────── */
  // keep smooth UX when filtering/sorting
  useEffect(() => {
    const timer = setTimeout(() => undefined, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedKategori, sortBy]);

  const kategoriOptions = useMemo(() => {
    const dynamic = Array.from(new Set(galeriData.map((item) => item.kategori))).filter(Boolean);
    return ['Semua Kategori', ...dynamic];
  }, [galeriData]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    let data = galeriData.filter((item) => {
      const matchKategori =
        selectedKategori === 'Semua Kategori' || item.kategori === selectedKategori;

      const matchSearch =
        !term ||
        item.judul.toLowerCase().includes(term) ||
        item.dosen.toLowerCase().includes(term);

      return matchKategori && matchSearch;
    });

    // Apply sorting
    if (sortBy === 'nama') {
      data = [...data].sort((a, b) => a.judul.localeCompare(b.judul));
    } else if (sortBy === 'populer') {
      data = [...data].sort((a, b) => b.kuota_terisi - a.kuota_terisi);
    }
    // 'terbaru' keeps original order

    return data;
  }, [searchTerm, selectedKategori, sortBy, galeriData]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE)),
    [filteredData.length],
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedKategori]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const canGoPreviousPage = currentPage > 1;
  const canGoNextPage = currentPage < totalPages;

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const openModal = useCallback((ta: GaleriTAItem) => {
    setSelectedTA(ta);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTA(null);
  }, []);

  const handleKonfirmasiAjukan = useCallback(async () => {
    if (!selectedTA) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await thesisIntegrationService.requestMentorshipFromTopic(selectedTA.id, selectedTA.dosen_id);

      closeModal();
      await fetchGaleri();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.userMessage ?? err?.message ?? 'Gagal mengajukan bimbingan dari galeri.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTA, closeModal, fetchGaleri]);

  return {
    searchTerm,
    setSearchTerm,
    selectedKategori,
    setSelectedKategori,
    kategoriOptions,
    galeriData,
    filteredData,
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    canGoPreviousPage,
    canGoNextPage,
    goToPreviousPage,
    goToNextPage,
    isModalOpen,
    selectedTA,
    openModal,
    closeModal,
    handleKonfirmasiAjukan,
    isLoading,
    isSubmitting,
    error,
    refetch: fetchGaleri,
    sortBy,
    setSortBy,
  };
}
