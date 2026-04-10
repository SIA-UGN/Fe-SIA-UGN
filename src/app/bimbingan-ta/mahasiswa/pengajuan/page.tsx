'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  ErrorMessageBoxWithButton,
  SuccessMessageBox,
} from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import ThesisQuotaMeter from '@/features/bimbingan-ta/components/ThesisQuotaMeter';
import ThesisAttachmentLink from '@/features/bimbingan-ta/components/ThesisAttachmentLink';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisEmptyState from '@/features/bimbingan-ta/components/ThesisEmptyState';
import StudentThesisForm from '@/features/bimbingan-ta/components/forms/StudentThesisForm';
import StudentLecturerRequestForm from '@/features/bimbingan-ta/components/forms/StudentLecturerRequestForm';
import { studentThesisApi } from '@/features/bimbingan-ta/api/student';
import { countActiveRequests, formatDate } from '@/features/bimbingan-ta/utils';
import type {
  StudentThesis,
  StudentThesisPayload,
  StudentThesisRequest,
  ThesisLecturer,
} from '@/features/bimbingan-ta/types';

export default function MahasiswaThesisSubmissionPage() {
  const [thesis, setThesis] = useState<StudentThesis | null>(null);
  const [lecturers, setLecturers] = useState<ThesisLecturer[]>([]);
  const [requests, setRequests] = useState<StudentThesisRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setPageError(null);

    try {
      const [thesisData, lecturerData, requestData] = await Promise.all([
        studentThesisApi.getCurrentThesis(),
        studentThesisApi.getLecturers(),
        studentThesisApi.getRequests(),
      ]);

      setThesis(thesisData);
      setLecturers(lecturerData);
      setRequests(requestData);
    } catch (err: any) {
      setPageError(err?.userMessage || err?.message || 'Gagal memuat data pengajuan TA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const activeRequestCount = useMemo(
    () => countActiveRequests(requests.map((item) => item.status)),
    [requests],
  );

  const activeLecturerIds = useMemo(
    () =>
      requests
        .filter((item) => item.status === 'pending' || item.status === 'accepted')
        .map((item) => item.id_lecturer),
    [requests],
  );

  const handleCreateOrUpdate = async (payload: StudentThesisPayload) => {
    setIsSaving(true);
    setFormError(null);
    try {
      if (thesis) {
        await studentThesisApi.updateThesis(thesis.id_student_thesis, payload);
        setSuccessMessage('Pengajuan TA berhasil diperbarui.');
      } else {
        await studentThesisApi.createThesis(payload);
        setSuccessMessage('Pengajuan TA berhasil dibuat.');
      }
      await fetchData();
    } catch (err: any) {
      setFormError(err?.userMessage || err?.message || 'Gagal menyimpan pengajuan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!thesis) return;
    setIsDeleting(true);
    setFormError(null);
    try {
      await studentThesisApi.deleteThesis(thesis.id_student_thesis);
      setSuccessMessage('Pengajuan TA berhasil dihapus.');
      setShowDeleteDialog(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err?.userMessage || err?.message || 'Gagal menghapus pengajuan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestLecturer = async (payload: { id_lecturer: number; student_note?: string }) => {
    if (!thesis) return;
    setIsRequesting(true);
    setRequestError(null);
    try {
      await studentThesisApi.requestLecturer(thesis.id_student_thesis, payload);
      setSuccessMessage('Permintaan pembimbing berhasil dikirim.');
      await fetchData();
    } catch (err: any) {
      setRequestError(err?.userMessage || err?.message || 'Gagal mengirim permintaan pembimbing.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <StudentThesisShell
      title="Pengajuan TA"
      description="Kelola proposal tugas akhir, ajukan dosen pembimbing, dan pantau status permintaan."
      backHref="/bimbingan-ta/mahasiswa"
      actions={
        <Button variant="outline" asChild>
          <Link href="/bimbingan-ta/mahasiswa/topik">Pilih Topik Dosen</Link>
        </Button>
      }
    >
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : pageError ? (
        <ErrorMessageBoxWithButton message={pageError} action={fetchData} />
      ) : (
        <div className="space-y-6">
          {successMessage ? <SuccessMessageBox message={successMessage} /> : null}

          {thesis ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <ThesisQuotaMeter
                  label="Permintaan Pembimbing Aktif"
                  value={activeRequestCount}
                  max={4}
                  helperText="Request pending dan accepted dihitung aktif."
                />
                <ThesisSectionCard
                  title="Status Pengajuan"
                  description="Ringkasan singkat tugas akhir Anda saat ini."
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#015023]">{thesis.title_ind}</p>
                        <p className="text-sm text-gray-600">{thesis.title_eng || '-'}</p>
                      </div>
                      <ThesisStatusBadge status={thesis.status} />
                    </div>
                    <p className="text-sm text-gray-600">Topik: {thesis.topic || thesis.thesis_topic?.topic || '-'}</p>
                    <p className="text-sm text-gray-600">Program Studi: {thesis.program?.name || '-'}</p>
                    <p className="text-sm text-gray-600">Dibuat: {formatDate(thesis.created_at)}</p>
                  </div>
                </ThesisSectionCard>
              </div>

              <ThesisSectionCard
                title="Detail Proposal"
                description="Proposal dapat diperbarui selama status masih proposing."
                actions={
                  thesis.status === 'proposing' ? (
                    <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
                      Hapus Pengajuan
                    </Button>
                  ) : null
                }
              >
                {thesis.status === 'proposing' ? (
                  <StudentThesisForm
                    initialValues={{
                      title_ind: thesis.title_ind,
                      title_eng: thesis.title_eng || '',
                      topic: thesis.topic || '',
                      description: thesis.description || '',
                    }}
                    currentAttachment={thesis.attachment_proposal}
                    isSubmitting={isSaving}
                    submitError={formError}
                    submitLabel="Perbarui Pengajuan"
                    onSubmit={handleCreateOrUpdate}
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">{thesis.description || 'Tidak ada deskripsi.'}</p>
                    <ThesisAttachmentLink path={thesis.attachment_proposal} label="Buka proposal aktif" />
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Pengajuan hanya dapat diubah saat status masih <strong>proposing</strong>.
                    </p>
                  </div>
                )}
              </ThesisSectionCard>

              <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <ThesisSectionCard
                  title="Ajukan Pembimbing"
                  description="Kirim permintaan ke dosen yang belum memiliki request aktif."
                >
                  <StudentLecturerRequestForm
                    lecturers={lecturers}
                    disabledLecturerIds={activeLecturerIds}
                    isSubmitting={isRequesting}
                    submitError={requestError}
                    onSubmit={handleRequestLecturer}
                  />
                </ThesisSectionCard>

                <ThesisSectionCard
                  title="Riwayat Permintaan"
                  description="Daftar semua permintaan pembimbing yang pernah dikirim."
                >
                  <div className="space-y-3">
                    {requests.length === 0 ? (
                      <p className="text-sm text-gray-500">Belum ada permintaan pembimbing.</p>
                    ) : (
                      requests.map((request) => (
                        <div key={request.id_thesis_lecturer} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-[#015023]">
                              {request.lecturer?.name || `Dosen #${request.id_lecturer}`}
                            </p>
                            <ThesisStatusBadge status={request.status} />
                          </div>
                          <p className="mt-2 text-sm text-gray-600">Dikirim: {formatDate(request.created_at)}</p>
                          {request.student_note ? (
                            <p className="mt-2 text-sm text-gray-700">Catatan: {request.student_note}</p>
                          ) : null}
                          {request.rejection_note ? (
                            <p className="mt-2 text-sm text-red-600">Alasan penolakan: {request.rejection_note}</p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </ThesisSectionCard>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <ThesisEmptyState
                title="Belum ada pengajuan aktif"
                description="Isi formulir berikut untuk mengajukan proposal tugas akhir secara mandiri."
              />
              <ThesisSectionCard title="Form Pengajuan Baru" description="Proposal mandiri hanya dapat dibuat sekali selama masih aktif.">
                <StudentThesisForm
                  isSubmitting={isSaving}
                  submitError={formError}
                  submitLabel="Buat Pengajuan TA"
                  onSubmit={handleCreateOrUpdate}
                />
              </ThesisSectionCard>
            </div>
          )}
        </div>
      )}

      <AlertConfirmationRedDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Hapus Pengajuan TA"
        description="Fitur ini bersifat sementara dan akan menghapus seluruh data terkait bimbingan. Lanjutkan?"
        confirmText={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        onConfirm={handleDelete}
      />
    </StudentThesisShell>
  );
}
