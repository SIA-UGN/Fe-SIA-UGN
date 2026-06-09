'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ErrorMessageBoxWithButton, SuccessMessageBox } from '@/components/ui/message-box';
import { StudentThesisShell } from '@/features/bimbingan-ta/components/ThesisShell';
import ThesisAttachmentLink from '@/features/bimbingan-ta/components/ThesisAttachmentLink';
import ThesisKeyValueList from '@/features/bimbingan-ta/components/ThesisKeyValueList';
import ThesisLoadingBlock from '@/features/bimbingan-ta/components/ThesisLoadingBlock';
import ThesisSectionCard from '@/features/bimbingan-ta/components/ThesisSectionCard';
import ThesisStatusBadge from '@/features/bimbingan-ta/components/ThesisStatusBadge';
import { lecturerThesisApi } from '@/features/bimbingan-ta/api/lecturer';
import type { StudentThesisRequest } from '@/features/bimbingan-ta/types';

export default function DosenRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<StudentThesisRequest | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lecturerThesisApi.getRequestDetail(Number(params.id));
      setRequest(data);
      setRejectionNote(data.rejection_note || '');
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal memuat detail permintaan.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await lecturerThesisApi.approveRequest(Number(params.id));
      setSuccess('Permintaan bimbingan berhasil disetujui.');
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal menyetujui permintaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await lecturerThesisApi.rejectRequest(Number(params.id), rejectionNote);
      setSuccess('Permintaan bimbingan berhasil ditolak.');
      await fetchData();
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Gagal menolak permintaan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentThesisShell title="Detail Permintaan" description="Review lengkap proposal mahasiswa sebelum mengambil keputusan." backHref="/bimbingan-ta/dosen/permintaan">
      {isLoading ? (
        <ThesisLoadingBlock />
      ) : error && !request ? (
        <ErrorMessageBoxWithButton message={error} action={fetchData} />
      ) : request ? (
        <div className="space-y-6">
          {success ? <SuccessMessageBox message={success} /> : null}
          {error ? <ErrorMessageBoxWithButton message={error} action={fetchData} /> : null}

          <ThesisSectionCard
            title={request.student_thesis?.student?.name || 'Mahasiswa'}
            description={request.student_thesis?.title_ind || 'Tidak ada judul'}
            actions={<ThesisStatusBadge status={request.status} />}
          >
            <div className="space-y-4">
              <ThesisKeyValueList
                items={[
                  { label: 'Program Studi', value: request.student_thesis?.program?.name || '-' },
                  { label: 'Status TA', value: request.student_thesis?.status || '-' },
                  { label: 'Status Permintaan', value: request.status },
                  { label: 'Topik Dosen', value: request.student_thesis?.thesis_topic?.title_ind || '-' },
                ]}
              />
              {request.student_note ? (
                <p className="text-sm leading-7 text-gray-700">Catatan mahasiswa: {request.student_note}</p>
              ) : null}
              <ThesisAttachmentLink
                path={request.student_thesis?.attachment_proposal}
                label="Buka proposal mahasiswa"
              />
            </div>
          </ThesisSectionCard>

          {request.status === 'pending' ? (
            <ThesisSectionCard
              title="Keputusan"
              description="Persetujuan akan menambah mahasiswa ke daftar bimbingan. Penolakan wajib menyertakan alasan."
            >
              <div className="space-y-4">
                <textarea
                  value={rejectionNote}
                  onChange={(event) => setRejectionNote(event.target.value)}
                  rows={4}
                  placeholder="Alasan penolakan (wajib saat reject)"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#015023]"
                />
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" disabled={isSubmitting} onClick={handleApprove}>
                    {isSubmitting ? 'Memproses...' : 'Setujui'}
                  </Button>
                  <Button
                    variant="warning"
                    disabled={isSubmitting || !rejectionNote.trim()}
                    onClick={handleReject}
                  >
                    {isSubmitting ? 'Memproses...' : 'Tolak'}
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/bimbingan-ta/dosen/permintaan')}>
                    Kembali ke Daftar
                  </Button>
                </div>
              </div>
            </ThesisSectionCard>
          ) : (
            <ThesisSectionCard
              title="Keputusan Akhir"
              description={`Permintaan ini telah ${request.status === 'accepted' ? 'disetujui' : 'ditolak'}.`}
            >
              <div className="space-y-4">
                {request.status === 'rejected' && rejectionNote ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Alasan Penolakan:</p>
                    <p className="text-sm text-gray-600">{rejectionNote}</p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button variant={request.status === 'accepted' ? "primary" : "warning"} disabled>
                    {request.status === 'accepted' ? 'Sudah Disetujui' : 'Sudah Ditolak'}
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/bimbingan-ta/dosen/permintaan')}>
                    Kembali ke Daftar
                  </Button>
                </div>
              </div>
            </ThesisSectionCard>
          )}
        </div>
      ) : null}
    </StudentThesisShell>
  );
}
