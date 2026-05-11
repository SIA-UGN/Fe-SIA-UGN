'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  ErrorMessageBoxWithButton,
  SuccessMessageBox,
} from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import { formatDate } from '@/features/bimbingan-ta/utils';
import { getErrorMessage } from '@/features/library/utils';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/axios';
import type { ThesisTopic, ThesisTopicStatus } from '@/features/bimbingan-ta/types';

const DEFAULT_FORM = {
  title_ind: '',
  id_thesis_category: '',
  description: '',
  quota: '1',
  status: 'draft' as ThesisTopicStatus,
};

function normalizeTopicStatus(status?: string | null): ThesisTopicStatus {
  const valid: ThesisTopicStatus[] = ['draft', 'available', 'taken', 'archived'];
  return (valid.includes(status as ThesisTopicStatus) ? status : 'draft') as ThesisTopicStatus;
}

function deriveTopicKeyword(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

export default function DosenTopicsPage() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programId, setProgramId] = useState(null);

  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ThesisTopicStatus>('all');

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingTopic, setEditingTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<ThesisTopic | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getTopics();
      setTopics(data);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat daftar topik.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((category) => {
      map[category.id_thesis_category] = category.name;
    });
    return map;
  }, [categories]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const categoryName =
        topic?.thesis_category?.name ||
        topic?.category?.name ||
        categoryMap[topic?.id_thesis_category] ||
        '';

      const matchesSearch = [
        topic?.title_ind,
        topic?.description,
        topic?.topic,
        topic?.lecturer?.name,
        categoryName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || topic?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categoryMap, search, statusFilter, topics]);

  const resetModalState = () => {
    setModalOpen(false);
    setModalMode('add');
    setEditingTopic(null);
    setSubmitting(false);
    setForm(DEFAULT_FORM);
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingTopic(null);
    setForm(DEFAULT_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (topic) => {
    setModalMode('edit');
    setEditingTopic(topic);
    setForm({
      title_ind: topic?.title_ind || '',
      id_thesis_category: String(
        topic?.id_thesis_category ||
          topic?.thesis_category?.id_thesis_category ||
          topic?.category?.id_thesis_category ||
          '',
      ),
      description: topic?.description || '',
      quota: String(topic?.quota || 1),
      status: normalizeTopicStatus(topic?.status),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const onChangeForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title_ind.trim()) nextErrors.title_ind = 'Judul wajib diisi';
    if (!form.id_thesis_category) nextErrors.id_thesis_category = 'Kategori wajib dipilih';
    if (!form.description.trim()) nextErrors.description = 'Deskripsi wajib diisi';
    if (!Number(form.quota) || Number(form.quota) < 1) nextErrors.quota = 'Kuota minimal 1';

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const effectiveProgramId = Number(programId || user?.id_program || 0);
    if (!effectiveProgramId) {
      toast.error('Program studi tidak ditemukan. Muat ulang halaman lalu coba lagi.');
      return;
    }

    const payload = {
      topic: deriveTopicKeyword(form.title_ind),
      title_ind: form.title_ind.trim(),
      title_eng: '',
      description: form.description.trim(),
      quota: Number(form.quota),
      id_program: effectiveProgramId,
      id_thesis_category: form.id_thesis_category ? Number(form.id_thesis_category) : null,
    };

    setSubmitting(true);

    try {
      let savedTopic = null;

      if (modalMode === 'add') {
        const response = await api.post('/lecturer/thesis/topics', payload);
        savedTopic = response?.data?.data || null;
      } else {
        const response = await api.put(
          `/lecturer/thesis/topics/${editingTopic?.id_thesis_topic}`,
          payload,
        );
        savedTopic = response?.data?.data || null;
      }

      const desiredStatus = normalizeTopicStatus(form.status);
      const savedStatus = normalizeTopicStatus(savedTopic?.status || editingTopic?.status);
      const targetId = savedTopic?.id_thesis_topic || editingTopic?.id_thesis_topic;

      if (desiredStatus === 'available' && savedStatus === 'draft' && targetId) {
        await api.patch(`/lecturer/thesis/topics/${targetId}/publish`);
      }

      toast.success(modalMode === 'add' ? 'Judul TA berhasil ditambahkan' : 'Judul TA berhasil diperbarui');
      resetModalState();
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyimpan judul TA'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await lecturerThesisApi.deleteTopic(deleteTarget.id_thesis_topic);
      setSuccess('Topik TA berhasil dihapus.');
      setDeleteTarget(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal menghapus topik.');
    }
  };

  const handlePublish = async (topicId: number) => {
    try {
      await api.patch(`/lecturer/thesis/topics/${topicId}/publish`);
      toast.success('Topik berhasil dipublikasikan');
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mempublikasikan topik'));
    }
  };

  const handleArchive = async (topicId: number) => {
    try {
      await api.patch(`/lecturer/thesis/topics/${topicId}/archive`);
      toast.success('Topik berhasil diarsipkan');
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengarsipkan topik'));
    }
  };

  return (
    <StudentThesisShell
      title="Topik TA"
      description="Kelola seluruh topik tugas akhir milik dosen."
      backHref="/bimbingan-ta/dosen"
      actions={
        <Button variant="primary" asChild>
          <Link href="/bimbingan-ta/dosen/topik/tambah">Tambah Topik</Link>
        </Button>
      }
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : (
        <div className="space-y-6">
          {success ? <SuccessMessageBox message={success} /> : null}

          <ThesisSectionCard title="Filter Topik" description="Cari dan saring topik berdasarkan status publikasi.">
            <div className="grid gap-4 md:grid-cols-[1.5fr,1fr]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari topik..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | ThesisTopicStatus)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
              >
                <option value="all">Semua status</option>
                <option value="draft">draft</option>
                <option value="available">available</option>
                <option value="taken">taken</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </ThesisSectionCard>

          <div className="grid gap-4">
            {filteredTopics.length === 0 ? (
              <ThesisSectionCard title="Daftar Topik" description="Belum ada topik yang cocok dengan filter.">
                <p className="text-sm text-gray-500">Tidak ada data topik.</p>
              </ThesisSectionCard>
            ) : (
              filteredTopics.map((topic) => (
                <ThesisSectionCard
                  key={topic.id_thesis_topic}
                  title={topic.title_ind}
                  description={topic.title_eng || topic.topic || '-'}
                  actions={<ThesisStatusBadge status={topic.status} />}
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-4">
                      <p>Topik: {topic.topic || '-'}</p>
                      <p>Program: {topic.program?.name || '-'}</p>
                      <p>Kuota: {topic.quota || 0}</p>
                      <p>Dibuat: {formatDate(topic.created_at)}</p>
                    </div>
                    <p className="text-sm leading-7 text-gray-700">{topic.description || 'Tidak ada deskripsi.'}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" asChild>
                        <Link href={`/bimbingan-ta/dosen/topik/${topic.id_thesis_topic}`}>Detail</Link>
                      </Button>
                      {topic.status === 'draft' ? (
                        <>
                          <Button variant="outline" asChild>
                            <Link href={`/bimbingan-ta/dosen/topik/${topic.id_thesis_topic}/edit`}>Edit</Link>
                          </Button>
                          <Button variant="primary" onClick={() => handlePublish(topic.id_thesis_topic)}>
                            Publish
                          </Button>
                          <Button variant="warning" onClick={() => setDeleteTarget(topic)}>
                            Hapus
                          </Button>
                        </>
                      ) : null}
                      {(topic.status === 'available' || topic.status === 'taken') ? (
                        <Button variant="warning" onClick={() => handleArchive(topic.id_thesis_topic)}>
                          Arsipkan
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </ThesisSectionCard>
              ))
            )}
          </div>
        </div>
      )}

      <AlertConfirmationRedDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Topik TA"
        description={`Hapus topik "${deleteTarget?.title_ind || ''}"? Tindakan ini hanya valid untuk topik draft.`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
      />
    </StudentThesisShell>
  );
}
