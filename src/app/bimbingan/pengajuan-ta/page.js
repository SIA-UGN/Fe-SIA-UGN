'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  FileText,
  Plus,
  Upload,
  X,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';
import StatusBadgeMahasiswa from '@/components/ui/status-badge-mahasiswa';
import RequestDosenModal from '@/components/bimbingan/request-dosen-modal';

const MIN_DESCRIPTION = 100;

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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

function buildLecturerLabel(lecturer) {
  const fullName = lecturer?.staff_profile?.full_name || lecturer?.name || '-';
  const nip = lecturer?.staff_profile?.employee_id_number || lecturer?.username || '';
  const position = lecturer?.staff_profile?.position || '';
  const postfix = [nip, position].filter(Boolean).join(' • ');
  return postfix ? `${fullName} (${postfix})` : fullName;
}

export default function PengajuanTaPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const [thesis, setThesis] = useState(null);
  const [lecturers, setLecturers] = useState([]);

  const [titleInd, setTitleInd] = useState('');
  const [titleEng, setTitleEng] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [pickerLecturer, setPickerLecturer] = useState('');
  const [selectedLecturers, setSelectedLecturers] = useState([]);

  const [formErrors, setFormErrors] = useState({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const hasThesis = Boolean(thesis);
  const requests = useMemo(() => thesis?.thesis_lecturers || [], [thesis?.thesis_lecturers]);

  const activeRequestCount = useMemo(
    () => requests.filter((item) => ['pending', 'accepted'].includes(item?.status)).length,
    [requests],
  );

  const activeLecturerIds = useMemo(
    () =>
      requests
        .filter((item) => ['pending', 'accepted'].includes(item?.status))
        .map((item) => Number(item?.id_lecturer)),
    [requests],
  );

  const availableForPicker = useMemo(
    () =>
      lecturers.filter(
        (item) => !selectedLecturers.some((selected) => Number(selected.id_user_si) === Number(item.id_user_si)),
      ),
    [lecturers, selectedLecturers],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const [thesisRes, lecturersRes] = await Promise.allSettled([
        api.get('/student/thesis'),
        api.get('/student/thesis/lecturers'),
      ]);

      if (thesisRes.status === 'fulfilled') {
        setThesis(thesisRes.value?.data?.data || null);
      } else {
        const status = thesisRes.reason?.response?.status;
        if (status === 401) {
          router.replace('/unauthorized');
          return;
        }
        setThesis(null);
      }

      if (lecturersRes.status === 'fulfilled') {
        setLecturers(lecturersRes.value?.data?.data || []);
      } else {
        setLecturers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setTitleInd('');
    setTitleEng('');
    setDescription('');
    setFile(null);
    setPickerLecturer('');
    setSelectedLecturers([]);
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!titleInd.trim()) nextErrors.title_ind = 'Judul Bahasa Indonesia wajib diisi.';
    if (!titleEng.trim()) nextErrors.title_eng = 'Judul Bahasa Inggris wajib diisi.';

    if (!description.trim()) {
      nextErrors.description = 'Ringkasan proposal wajib diisi.';
    } else if (description.trim().length < MIN_DESCRIPTION) {
      nextErrors.description = 'Ringkasan minimal 100 karakter.';
    }

    if (selectedLecturers.length === 0) {
      nextErrors.id_lecturer = 'Pilih minimal 1 dosen pembimbing.';
    }

    if (selectedLecturers.length > 4) {
      nextErrors.id_lecturer = 'Maksimal 4 dosen pembimbing.';
    }

    if (!file) {
      nextErrors.attachment_proposal = 'File proposal wajib diunggah.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const addLecturer = () => {
    if (!pickerLecturer) return;

    const found = lecturers.find((item) => String(item.id_user_si) === String(pickerLecturer));
    if (!found) return;

    if (selectedLecturers.length >= 4) {
      toast.error('Maksimal 4 dosen pembimbing.');
      return;
    }

    setSelectedLecturers((prev) => [...prev, found]);
    setPickerLecturer('');

    setFormErrors((prev) => {
      const clone = { ...prev };
      delete clone.id_lecturer;
      return clone;
    });
  };

  const moveLecturer = (index, direction) => {
    setSelectedLecturers((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;

      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[nextIndex];
      copy[nextIndex] = temp;
      return copy;
    });
  };

  const removeLecturer = (lecturerId) => {
    setSelectedLecturers((prev) => prev.filter((item) => Number(item.id_user_si) !== Number(lecturerId)));
  };

  const setSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFormErrors((prev) => ({
        ...prev,
        attachment_proposal: 'File harus berformat PDF, DOC, atau DOCX.',
      }));
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        attachment_proposal: 'Ukuran file maksimal 10MB.',
      }));
      return;
    }

    setFile(selectedFile);

    setFormErrors((prev) => {
      const clone = { ...prev };
      delete clone.attachment_proposal;
      return clone;
    });
  };

  const onDropFile = (event) => {
    event.preventDefault();
    setDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title_ind', titleInd.trim());
      formData.append('title_eng', titleEng.trim());
      formData.append('description', description.trim());
      if (file) formData.append('attachment_proposal', file);

      const createRes = await api.post('/student/thesis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const thesisId = createRes?.data?.data?.id_student_thesis;

      for (const lecturer of selectedLecturers) {
        await api.post(`/student/thesis/${thesisId}/request-lecturer`, {
          id_lecturer: Number(lecturer.id_user_si),
          student_note: '',
        });
      }

      toast.success('Pengajuan berhasil dikirim!');
      resetForm();
      router.replace('/bimbingan/pengajuan-ta');
      await fetchData();
    } catch (err) {
      const message = getErrorMessage(err);
      const status = err?.response?.status;

      if (status === 422 && message.toLowerCase().includes('anda sudah memiliki pengajuan tugas akhir')) {
        toast.error('Anda sudah memiliki pengajuan tugas akhir aktif.');
        router.replace('/bimbingan/pengajuan-ta');
        await fetchData();
      } else if (status === 422 && message.toLowerCase().includes('maksimal 4 dosen')) {
        toast.error('Maksimal 4 dosen pembimbing.');
      } else {
        toast.error(`Gagal mengirim: ${message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const requestAnotherLecturer = async (payload) => {
    if (!thesis?.id_student_thesis) return;

    setRequesting(true);

    try {
      await api.post(`/student/thesis/${thesis.id_student_thesis}/request-lecturer`, payload);
      toast.success('Permintaan ke dosen berhasil dikirim.');
      setRequestModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <BimbinganShell
      title="Pengajuan Tugas Akhir"
      description="Ajukan proposal tugas akhir Anda"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan/pengajuan-ta' },
        { label: 'Pengajuan TA', active: true },
      ]}
      actions={
        !hasThesis ? (
          <button
            type="button"
            onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#015023] px-4 py-3 text-white"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            <Plus className="h-4 w-4" />
            Buat Pengajuan
          </button>
        ) : null
      }
    >
      {loading ? (
        <div className="space-y-4 rounded-[20px] bg-white p-6 shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]">
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-48 animate-pulse rounded bg-gray-100" />
        </div>
      ) : hasThesis ? (
        <div className="rounded-[20px] bg-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]">
          <div className="rounded-t-[20px] bg-[#015023] px-[32px] py-[16px]">
            <p className="inline-flex items-center gap-2 text-[17px] font-semibold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <ClipboardList className="h-5 w-5" />
              Riwayat Pengajuan
            </p>
          </div>

          <div className="px-[24px] py-[24px] md:px-[32px]">
            {thesis?.status === 'on_progress' ? (
              <div
                className="mb-4 rounded-[12px] border p-[16px] text-[14px] text-[#065f46]"
                style={{
                  backgroundColor: '#ecfdf5',
                  borderColor: '#a7f3d0',
                  fontFamily: 'Urbanist, sans-serif',
                }}
              >
                Pengajuan Anda sudah masuk tahap bimbingan aktif. Silakan pantau perkembangan di halaman monitoring.
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-[12px] border border-[#eef1f4]">
              <table className="min-w-[760px] w-full">
                <thead className="bg-[#f8fafc] text-left text-[13px] text-[#6a7282]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Judul</th>
                    <th className="px-4 py-3 font-semibold">Dosen</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <div className="inline-flex flex-col items-center gap-2 text-[#9ca3af]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                          <FileText className="h-6 w-6" />
                          <p className="text-[14px]">Belum ada riwayat pengajuan</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requests.map((item) => (
                      <tr key={item.id_thesis_lecturer} className="border-b border-[#eef1f4] text-[14px]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                        <td className="px-4 py-3 text-[#6a7282]">{formatDate(item.created_at)}</td>
                        <td className="px-4 py-3 text-[#1f2937]">{thesis?.title_ind || '-'}</td>
                        <td className="px-4 py-3 text-[#4a5565]">{item?.lecturer?.name || '-'}</td>
                        <td className="px-4 py-3">
                          <StatusBadgeMahasiswa status={item.status} type="request" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {activeRequestCount < 4 ? (
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  className="rounded-[8px] border border-[#015023] bg-white px-4 py-2 text-[14px] text-[#015023]"
                  style={{ fontFamily: 'Urbanist, sans-serif' }}
                >
                  Ajukan ke Dosen Lain
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => router.push('/bimbingan/monitoring')}
                className="rounded-[10px] bg-[#015023] px-4 py-2 text-[14px] text-white"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                Lihat Monitoring
              </button>
            </div>
          </div>

          <RequestDosenModal
            open={requestModalOpen}
            lecturers={lecturers}
            disabledLecturerIds={activeLecturerIds}
            loading={requesting}
            onClose={() => setRequestModalOpen(false)}
            onSubmit={requestAnotherLecturer}
          />
        </div>
      ) : (
        <section
          ref={formRef}
          className="overflow-hidden rounded-[20px] bg-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.08)]"
        >
          <div className="rounded-t-[20px] bg-[#015023] px-[32px] py-[16px]">
            <p className="inline-flex items-center gap-2 text-[17px] font-semibold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <FileText className="h-5 w-5" />
              Formulir Pengajuan Baru
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-[20px] py-[24px] md:px-[32px] md:py-[32px]">
            <div>
              <label className="mb-2 block text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Judul Tugas Akhir (Bahasa Indonesia) *
              </label>
              <input
                value={titleInd}
                onChange={(event) => setTitleInd(event.target.value)}
                placeholder="Masukkan judul tugas akhir dalam Bahasa Indonesia"
                className="w-full rounded-[10px] border-[0.8px] border-[#e5e7eb] px-[16px] py-[12px] text-[14px] outline-none focus:border-[#015023]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              />
              {formErrors.title_ind ? <p className="mt-1 text-[12px] text-[#991b1b]">{formErrors.title_ind}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Judul Tugas Akhir (Bahasa Inggris) *
              </label>
              <input
                value={titleEng}
                onChange={(event) => setTitleEng(event.target.value)}
                placeholder="Enter your thesis title in English"
                className="w-full rounded-[10px] border-[0.8px] border-[#e5e7eb] px-[16px] py-[12px] text-[14px] outline-none focus:border-[#015023]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              />
              {formErrors.title_eng ? <p className="mt-1 text-[12px] text-[#991b1b]">{formErrors.title_eng}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Ringkasan/Deskripsi Proposal *
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Jelaskan ringkasan proposal tugas akhir Anda (minimal 100 kata)"
                className="min-h-[138px] w-full rounded-[10px] border-[0.8px] border-[#e5e7eb] px-[16px] py-[12px] text-[14px] outline-none focus:border-[#015023]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              />
              <div className="mt-1 text-right text-[12px] text-[#9ca3af]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                {description.length} karakter
              </div>
              {formErrors.description ? <p className="mt-1 text-[12px] text-[#991b1b]">{formErrors.description}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Calon Dosen Pembimbing *
              </label>
              <p className="mb-2 text-[12px] text-[#9ca3af]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Pilih minimal 1 dan maksimal 4 calon dosen pembimbing (urutan berdasarkan prioritas)
              </p>

              <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                <select
                  value={pickerLecturer}
                  onChange={(event) => setPickerLecturer(event.target.value)}
                  className="flex-1 rounded-[10px] border border-[#e5e7eb] bg-white px-3 py-3 text-[14px] outline-none focus:border-[#015023]"
                  style={{ fontFamily: 'Urbanist, sans-serif' }}
                >
                  <option value="">Pilih dosen pembimbing</option>
                  {availableForPicker.map((lecturer) => (
                    <option key={lecturer.id_user_si} value={lecturer.id_user_si}>
                      {buildLecturerLabel(lecturer)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={addLecturer}
                  disabled={!pickerLecturer || selectedLecturers.length >= 4}
                  className="rounded-[8px] bg-[#015023] px-4 py-2 text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: 'Urbanist, sans-serif' }}
                >
                  Tambah
                </button>
              </div>

              <div className="space-y-2">
                {selectedLecturers.map((lecturer, index) => (
                  <div
                    key={lecturer.id_user_si}
                    className="flex flex-col gap-2 rounded-[10px] border border-[#e5e7eb] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{ fontFamily: 'Urbanist, sans-serif' }}
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-[#015023]">
                        Prioritas {index + 1} - {lecturer.staff_profile?.full_name || lecturer.name}
                      </p>
                      <p className="text-[12px] text-[#6a7282]">
                        {[lecturer.staff_profile?.employee_id_number, lecturer.staff_profile?.position]
                          .filter(Boolean)
                          .join(' • ') || 'Dosen'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveLecturer(index, -1)}
                        className="rounded border border-[#d1d5db] p-1 text-[#6a7282] disabled:opacity-40"
                        disabled={index === 0}
                        aria-label="Naikkan prioritas"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLecturer(index, 1)}
                        className="rounded border border-[#d1d5db] p-1 text-[#6a7282] disabled:opacity-40"
                        disabled={index === selectedLecturers.length - 1}
                        aria-label="Turunkan prioritas"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLecturer(lecturer.id_user_si)}
                        className="rounded border border-[#fecaca] p-1 text-[#991b1b]"
                        aria-label="Hapus dosen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {formErrors.id_lecturer ? <p className="mt-1 text-[12px] text-[#991b1b]">{formErrors.id_lecturer}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-[15px] font-semibold text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Upload Proposal (PDF/DOC) *
              </label>

              {file ? (
                <div className="flex items-center justify-between rounded-[12px] border border-[#d1d5db] bg-[#f9fafb] p-3" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <div>
                    <p className="text-[14px] font-semibold text-[#015023]">{file.name}</p>
                    <p className="text-[12px] text-[#6a7282]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-full bg-[#fef2f2] p-2 text-[#991b1b]"
                    aria-label="Hapus file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDropFile}
                  className={`rounded-[12px] border-[1.6px] border-dashed p-[32px] text-center ${
                    dragging ? 'border-[#015023] bg-[#f7fbf8]' : 'border-[#d1d5db] bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mx-auto inline-flex flex-col items-center gap-2"
                    style={{ fontFamily: 'Urbanist, sans-serif' }}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f4ea] text-[#015023]">
                      <Upload className="h-5 w-5" />
                    </span>
                    <span className="text-[14px] font-semibold text-[#015023]">Seret & lepas file di sini</span>
                    <span className="text-[12px] text-[#6a7282]">atau klik untuk memilih file PDF, DOC, DOCX hingga 10MB</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(event) => setSelectedFile(event.target.files?.[0])}
                  />
                </div>
              )}

              {formErrors.attachment_proposal ? (
                <p className="mt-1 text-[12px] text-[#991b1b]">{formErrors.attachment_proposal}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-[10px] bg-[#015023] py-[12px] text-[18px] text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {submitting ? 'Menyimpan...' : 'Submit Pengajuan'}
            </button>
          </form>
        </section>
      )}
    </BimbinganShell>
  );
}
