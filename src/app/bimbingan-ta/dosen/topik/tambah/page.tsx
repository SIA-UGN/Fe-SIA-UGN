'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { ErrorMessageBoxWithButton } from '@/components/ui/message-box';
import TambahKategoriTAModal from '@/components/bimbingan/TambahKategoriTAModal';
import TambahProgramStudiModal from '@/components/bimbingan/TambahProgramStudiModal';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import LecturerTopicForm from '@/features/bimbingan-ta/components/forms/LecturerTopicForm';

import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
// 1. Import fungsi getSubjects dari adminApi
import { getSubjects } from '@/lib/adminApi'; 
import { getCurrentRole } from '@/features/bimbingan-ta/utils';
import type { ProgramOption, SubjectOption, ThesisCategory } from '@/features/bimbingan-ta/types';

export default function DosenAddTopicPage() {
  const router = useRouter();
  const currentRole = getCurrentRole();
  const canManagePrograms = currentRole === 'admin' || currentRole === 'manager';
  
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showProdiModal, setShowProdiModal] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);

  const fetchProgramsAndData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Ambil program studi dan kategori
      const [programData, categoryData] = await Promise.all([
        lecturerThesisApi.resolveProgramOptions(),
        lecturerThesisApi.getCategories(),
      ]);
      setPrograms(programData);
      setCategories(categoryData);

      // 2. Ambil data Mata Kuliah menggunakan API Dosen
      try {
        const subjectList = await lecturerThesisApi.getSubjects();
        setSubjects(subjectList);
      } catch (subjectError: any) {
        console.error("Gagal mengambil data mata kuliah:");
        console.error("Type:", typeof subjectError);
        console.error("Value:", JSON.stringify(subjectError, null, 2));
        console.error("Message:", subjectError instanceof Error ? subjectError.message : subjectError?.message || subjectError);
        setSubjects([]); // Set array kosong jika gagal agar form tidak error
      }
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat data formulir.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramsAndData();
  }, []);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await lecturerThesisApi.createTopic(payload);
      router.push('/bimbingan-ta/dosen/topik');
    } catch (err: any) {
      setSubmitError(err?.userMessage || err?.message || 'Gagal membuat topik TA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProgramCreated = async (subject: SubjectOption) => {
    try {
      const updatedSubjects = await getSubjects();
      setSubjects(updatedSubjects);
    } catch (err) {
      if (subjects && subject.id_subject) {
        setSubjects((prev) => {
          if (prev.some((item) => item.id_subject === subject.id_subject)) return prev;
          return [...prev, subject];
        });
      }
    }
  };

  const handleCategoryCreated = async (category: ThesisCategory) => {
    setCategories((prev) => {
      if (prev.some((item) => item.id_thesis_category === category.id_thesis_category)) return prev;
      return [...prev, category];
    });
    try {
      const latestCategories = await lecturerThesisApi.getCategories();
      setCategories(latestCategories);
    } catch (_error) {
      // Keep optimistic update
    }
  };

  return (
    <StudentThesisShell title="Tambah Topik TA" description="Buat topik baru dengan status awal draft." backHref="/bimbingan-ta/dosen/topik">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchProgramsAndData} />
      ) : ( 
        <ThesisSectionCard
          title="Form Topik TA"
          description="Topik akan disimpan sebagai draft sampai Anda publikasikan."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {canManagePrograms && (
                <button
                  type="button"
                  onClick={() => setShowProdiModal(true)}
                  className="inline-flex items-center gap-1 rounded-[6px] border border-[#d1d5dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#015023] transition hover:bg-[#f3f8f5]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Program Studi
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowKategoriModal(true)}
                className="inline-flex items-center gap-1 rounded-[6px] border border-[#d1d5dc] bg-white px-3 py-1.5 text-xs font-semibold text-[#015023] transition hover:bg-[#f3f8f5]"
              >
                <Plus className="h-3.5 w-3.5" />
                Kategori TA
              </button>
            </div>
          }
        >
          {/* Komponen Form ini akan menerima props subjects yang sudah diisi dari API */}
          <LecturerTopicForm
            programs={programs}
            subjects={subjects}
            categories={categories}
            submitError={submitError}
            isSubmitting={isSubmitting}
            submitLabel="Buat Topik"
            onSubmit={handleSubmit}
            onCancel={() => router.push('/bimbingan-ta/dosen/topik')}
          />
        </ThesisSectionCard>
      )}

      <TambahProgramStudiModal isOpen={showProdiModal} onClose={() => setShowProdiModal(false)} onSuccess={handleProgramCreated} />
      <TambahKategoriTAModal isOpen={showKategoriModal} onClose={() => setShowKategoriModal(false)} onSuccess={handleCategoryCreated} />
    </StudentThesisShell>
  );
}