'use client';

import { useEffect, useState } from 'react';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import { formatDate } from '@/features/bimbingan-ta/utils';
import type { ThesisCategory } from '@/features/bimbingan-ta/types';

export default function MahasiswaThesisCategoriesPage() {
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentThesisApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat kategori thesis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <StudentThesisShell
      title="Kategori Thesis"
      description="Daftar kategori thesis yang digunakan sebagai referensi topik penelitian."
      backHref="/bimbingan-ta/mahasiswa"
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.length === 0 ? (
            <ThesisSectionCard title="Kategori Thesis" description="Belum ada kategori thesis yang tersedia.">
              <p className="text-sm text-gray-500">Tidak ada data kategori.</p>
            </ThesisSectionCard>
          ) : (
            categories.map((category) => (
              <ThesisSectionCard
                key={category.id_thesis_category}
                title={category.name}
                description={`Dibuat ${formatDate(category.created_at)}`}
              >
                <p className="text-sm leading-7 text-gray-700">
                  {category.description || 'Tidak ada deskripsi kategori.'}
                </p>
              </ThesisSectionCard>
            ))
          )}
        </div>
      )}
    </StudentThesisShell>
  );
}
