'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BookOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';
import { useAuth } from '@/lib/auth-context';
import { getProfile } from '@/lib/profileApi';

const DEFAULT_FORM = {
  title_ind: '',
  id_thesis_category: '',
  description: '',
  quota: '1',
  status: 'draft',
};

function getErrorMessage(err, fallback = 'Terjadi kesalahan, coba lagi.') {
  const message = err?.response?.data?.message || err?.message;
  const errors = err?.response?.data?.errors;

  if (typeof message === 'string' && message.trim()) return message;

  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];
    if (Array.isArray(firstValue) && firstValue[0]) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }

  return fallback;
}

function normalizeTopicStatus(status) {
  if (!status) return 'draft';
  const value = String(status).toLowerCase();
  if (value === 'published') return 'available';
  return value;
}

function resolveProgramId(profilePayload) {
  const payload = profilePayload?.data || profilePayload || {};
  return (
    payload?.id_program ||
    payload?.program?.id_program ||
    payload?.program_id ||
    payload?.staff_profile?.id_program ||
    payload?.staff?.id_program ||
    payload?.study_program?.id_program ||
    null
  );
}

function deriveTopicKeyword(title) {
  const words = String(title || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  return words.join(' ');
}

function TopicStatusBadge({ status }) {
  const normalized = normalizeTopicStatus(status);

  if (normalized === 'available') {
    return (
      <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#015023] px-[10px] py-[3px] text-[12px] font-semibold text-white">
        <span className="h-[6px] w-[6px] rounded-full bg-[#10b981]" />
        Published
      </span>
    );
  }

  if (normalized === 'taken') {
    return (
      <span className="inline-flex items-center rounded-[6px] bg-[#dbeafe] px-[10px] py-[3px] text-[12px] font-semibold text-[#1e40af]">
        Penuh
      </span>
    );
  }

  if (normalized === 'archived') {
    return (
      <span className="inline-flex items-center rounded-[6px] bg-[#fef2f2] px-[10px] py-[3px] text-[12px] font-semibold text-[#991b1b]">
        Diarsipkan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#f3f4f6] px-[10px] py-[3px] text-[12px] text-[#6a7282]">
      <span className="h-[6px] w-[6px] rounded-full bg-[#9ca3af]" />
      Draft
    </span>
  );
}

function TopicSkeletonRows() {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-[#f3f4f6] px-[16px] py-[14px] animate-pulse"
        >
          <div className="h-4 w-2/5 rounded bg-slate-100" />
          <div className="h-4 w-[140px] rounded bg-slate-100" />
          <div className="h-4 w-[90px] rounded bg-slate-100" />
          <div className="h-4 w-[110px] rounded bg-slate-100" />
          <div className="h-8 w-[110px] rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function DosenTopicsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [programId, setProgramId] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingTopic, setEditingTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [topicsRes, categoriesRes, profileRes] = await Promise.allSettled([
      api.get('/lecturer/thesis/topics'),
      api.get('/lecturer/thesis/categories'),
      getProfile(),
    ]);

    if (topicsRes.status === 'fulfilled') {
      const list = topicsRes.value?.data?.data || [];
      setTopics(Array.isArray(list) ? list : []);

      if (!programId && list?.[0]?.id_program) {
        setProgramId(Number(list[0].id_program));
      }
    } else {
      setTopics([]);
      toast.error(getErrorMessage(topicsRes.reason, 'Gagal memuat topik TA'));
    }

    if (categoriesRes.status === 'fulfilled') {
      const list = categoriesRes.value?.data?.data || [];
      setCategories(Array.isArray(list) ? list : []);
    } else {
      setCategories([]);
    }

    if (profileRes.status === 'fulfilled') {
      const resolved = resolveProgramId(profileRes.value);
      if (resolved) {
        setProgramId(Number(resolved));
      }
    }

    setLoading(false);
  }, [programId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((category) => {
      map[category.id_thesis_category] = category.name;
    });
    return map;
  }, [categories]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return topics;

    return topics.filter((topic) => {
      const categoryName =
        topic?.thesis_category?.name ||
        topic?.category?.name ||
        categoryMap[topic?.id_thesis_category] ||
        '';

      return [
        topic?.title_ind,
        topic?.description,
        topic?.topic,
        topic?.lecturer?.name,
        categoryName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchQuery));
    });
  }, [categoryMap, searchQuery, topics]);

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

  const handleDelete = async (topic) => {
    if (normalizeTopicStatus(topic?.status) !== 'draft') return;
    const confirmed = window.confirm(`Hapus judul "${topic?.title_ind || '-'}"?`);
    if (!confirmed) return;

    setActionLoadingId(topic?.id_thesis_topic);
    try {
      await api.delete(`/lecturer/thesis/topics/${topic.id_thesis_topic}`);
      toast.success('Judul TA berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus judul TA'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublish = async (topicId) => {
    setActionLoadingId(topicId);
    try {
      await api.patch(`/lecturer/thesis/topics/${topicId}/publish`);
      toast.success('Judul berhasil dipublikasikan');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal publish judul'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (topicId) => {
    setActionLoadingId(topicId);
    try {
      await api.patch(`/lecturer/thesis/topics/${topicId}/archive`);
      toast.success('Judul berhasil diarsipkan');
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengarsipkan judul'));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <BimbinganShell
      title="Kelola Judul Tugas Akhir"
      description="Tambah, edit, dan kelola judul-judul tugas akhir yang Anda tawarkan kepada mahasiswa"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan-ta/dosen/topik' },
        { label: 'Kelola Judul TA', active: true },
      ]}
    >
      <section className="mb-5 rounded-[14px] bg-white px-[24px] py-[20px] shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[680px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a7282]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari judul atau nama dosen..."
              className="h-[38px] w-full rounded-[10px] border border-[#e5e7eb] bg-white pl-10 pr-3 text-[14px] text-[#374151] outline-none focus:border-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[8px] bg-[#015023] px-[16px] text-[14px] font-semibold text-white"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            <Plus className="h-4 w-4" />
            Tambah Judul Baru
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[14px] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full">
            <thead className="border-b border-[#f3f4f6]">
              <tr className="text-left text-[14px] font-medium text-[#6a7282]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                <th className="px-[14px] py-[12px]">Judul</th>
                <th className="px-[14px] py-[12px]">Kategori</th>
                <th className="px-[14px] py-[12px] text-center">Kuota</th>
                <th className="px-[14px] py-[12px]">Status</th>
                <th className="px-[14px] py-[12px]">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <TopicSkeletonRows />
                  </td>
                </tr>
              ) : filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                    <div className="mx-auto flex max-w-[420px] flex-col items-center">
                      <BookOpen className="h-8 w-8 text-[#9ca3af]" />
                      <p className="mt-3 text-[18px] font-semibold text-[#015023]">Belum ada judul TA</p>
                      <p className="mt-1 text-[14px] text-[#6a7282]">
                        Mulai tambahkan judul tugas akhir untuk ditawarkan ke mahasiswa
                      </p>
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-[#015023] px-4 py-2 text-[14px] font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Judul Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTopics.map((topic) => {
                  const topicStatus = normalizeTopicStatus(topic?.status);
                  const isDraft = topicStatus === 'draft';
                  const categoryName =
                    topic?.thesis_category?.name ||
                    topic?.category?.name ||
                    categoryMap[topic?.id_thesis_category] ||
                    '–';
                  const usedQuota = Array.isArray(topic?.student_theses)
                    ? topic.student_theses.length
                    : Number(topic?.used_quota || 0);

                  return (
                    <tr
                      key={topic.id_thesis_topic}
                      className="border-b border-[#f3f4f6] text-[14px] hover:bg-[#fafafa]"
                      style={{ fontFamily: 'Urbanist, sans-serif' }}
                    >
                      <td className="px-[14px] py-[12px]">
                        <p className="font-medium text-[#1f2937]">{topic?.title_ind || '-'}</p>
                        <p className="mt-1 max-w-[560px] truncate text-[13px] text-[#6a7282]">
                          {topic?.description || 'Tanpa deskripsi'}
                        </p>
                      </td>

                      <td className="px-[14px] py-[12px]">
                        <span className="inline-flex rounded-[20px] bg-[#e6f4ea] px-[10px] py-[3px] text-[12px] font-semibold text-[#015023]">
                          {categoryName}
                        </span>
                      </td>

                      <td className="px-[14px] py-[12px] text-center font-medium text-[#1f2937]">
                        {usedQuota} / {Number(topic?.quota || 0)}
                      </td>

                      <td className="px-[14px] py-[12px]">
                        <TopicStatusBadge status={topicStatus} />
                      </td>

                      <td className="px-[14px] py-[12px]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={!isDraft || actionLoadingId === topic.id_thesis_topic}
                            onClick={() => openEditModal(topic)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#f3f4f6] text-[#374151] transition hover:bg-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-40"
                            title={isDraft ? 'Edit' : 'Hanya topik draft yang dapat diubah'}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={!isDraft || actionLoadingId === topic.id_thesis_topic}
                            onClick={() => handleDelete(topic)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#fef2f2] text-[#ef4444] transition hover:bg-[#fecaca] disabled:cursor-not-allowed disabled:opacity-40"
                            title={isDraft ? 'Hapus' : 'Hanya topik draft yang dapat dihapus'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {topicStatus === 'draft' ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === topic.id_thesis_topic}
                              onClick={() => handlePublish(topic.id_thesis_topic)}
                              className="ml-1 rounded-[6px] bg-[#ecfdf5] px-2 py-1 text-[12px] font-medium text-[#015023] hover:bg-[#dcfce7] disabled:opacity-50"
                            >
                              {actionLoadingId === topic.id_thesis_topic ? '...' : 'Publish'}
                            </button>
                          ) : null}

                          {(topicStatus === 'available' || topicStatus === 'taken') ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === topic.id_thesis_topic}
                              onClick={() => handleArchive(topic.id_thesis_topic)}
                              className="ml-1 inline-flex items-center gap-1 rounded-[6px] bg-[#fff7ed] px-2 py-1 text-[12px] font-medium text-[#9a3412] hover:bg-[#ffedd5] disabled:opacity-50"
                            >
                              <Archive className="h-3 w-3" />
                              Arsipkan
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[600px] rounded-[10px] bg-white p-[24px] shadow-xl" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#015023]">
                  {modalMode === 'add' ? 'Tambah Judul TA Baru' : 'Edit Judul TA'}
                </h2>
                <p className="mt-1 text-[14px] text-[#717182]">
                  Tambahkan judul tugas akhir baru untuk mahasiswa
                </p>
              </div>

              <button
                type="button"
                onClick={resetModalState}
                className="text-[#6b7280] transition hover:text-[#111827]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-[16px] space-y-[16px]">
              <div>
                <label className="text-[14px] font-semibold text-[#015023]">
                  Judul <span className="text-[#fb2c36]">*</span>
                </label>
                <input
                  type="text"
                  value={form.title_ind}
                  onChange={(event) => onChangeForm('title_ind', event.target.value)}
                  placeholder="Masukkan judul tugas akhir"
                  className="mt-1 h-[36px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                />
                {formErrors.title_ind ? <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.title_ind}</p> : null}
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#015023]">
                  Kategori <span className="text-[#fb2c36]">*</span>
                </label>
                <select
                  value={form.id_thesis_category}
                  onChange={(event) => onChangeForm('id_thesis_category', event.target.value)}
                  className="mt-1 h-[36px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id_thesis_category} value={category.id_thesis_category}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formErrors.id_thesis_category ? (
                  <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.id_thesis_category}</p>
                ) : null}
              </div>

              <div>
                <label className="text-[14px] font-semibold text-[#015023]">
                  Deskripsi <span className="text-[#fb2c36]">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => onChangeForm('description', event.target.value)}
                  placeholder="Jelaskan detail penelitian, tujuan, dan metodologi"
                  className="mt-1 min-h-[82px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] py-[8px] text-[14px] outline-none focus:border-[#015023]"
                />
                {formErrors.description ? (
                  <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.description}</p>
                ) : null}
              </div>

              <div className="grid gap-[16px] md:grid-cols-2">
                <div>
                  <label className="text-[14px] font-semibold text-[#015023]">Kuota Mahasiswa</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quota}
                    onChange={(event) => onChangeForm('quota', event.target.value)}
                    className="mt-1 h-[36px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                  />
                  {formErrors.quota ? <p className="mt-1 text-[12px] text-[#dc2626]">{formErrors.quota}</p> : null}
                </div>

                <div>
                  <label className="text-[14px] font-semibold text-[#015023]">Status</label>
                  <select
                    value={form.status}
                    onChange={(event) => onChangeForm('status', event.target.value)}
                    className="mt-1 h-[36px] w-full rounded-[8px] border border-[#d1d5dc] bg-[#f3f3f5] px-[12px] text-[14px] outline-none focus:border-[#015023]"
                  >
                    <option value="draft">Draft</option>
                    <option value="available">Available</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-[8px] pt-2">
                <button
                  type="button"
                  onClick={resetModalState}
                  className="rounded-[8px] border border-[#d1d5dc] bg-white px-[16px] py-[8px] text-[14px] text-[#0a0a0a]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#015023] px-[16px] py-[8px] text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </BimbinganShell>
  );
}
