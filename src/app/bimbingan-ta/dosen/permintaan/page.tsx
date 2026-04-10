'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  CircleCheckBig,
  CircleX,
  ClipboardList,
  Download,
  FileSearch,
  MessageSquareQuote,
  Paperclip,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import BimbinganShell from '@/components/bimbingan/bimbingan-shell';
import { buildImageUrl } from '@/lib/utils';

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

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(name) {
  if (!name) return 'M';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAttachmentInfo(request) {
  const path = request?.student_thesis?.attachment_proposal || '';
  const fileName = path ? String(path).split('/').pop() : 'Proposal.pdf';
  const size = request?.student_thesis?.attachment_size || request?.attachment_size || null;

  return {
    path,
    fileName,
    sizeLabel: size ? `${size}` : null,
  };
}

function HistoryBadge({ status }) {
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#065f46]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#10b981]" />
        Disetujui
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#fecaca] bg-[#fef2f2] px-3 py-1 text-[12px] font-semibold text-[#991b1b]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#ef4444]" />
        Ditolak
      </span>
    );
  }

  return null;
}

function StatCard({ title, value, icon, iconWrapperClass }) {
  return (
    <div className="rounded-[14px] bg-white p-[20px] shadow-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] text-[#6a7282]">{title}</p>
          <p className="mt-1 text-[32px] font-bold leading-none text-[#1f2937]">{value}</p>
        </div>
        <span className={`inline-flex h-[56px] w-[56px] items-center justify-center rounded-[12px] ${iconWrapperClass}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function DosenRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [showHistory, setShowHistory] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/lecturer/thesis/requests');
      const list = response?.data?.data || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setRequests([]);
      toast.error(getErrorMessage(err, 'Gagal memuat daftar pengajuan'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const pendingRequests = useMemo(
    () => requests.filter((request) => String(request?.status).toLowerCase() === 'pending'),
    [requests],
  );

  const acceptedRequests = useMemo(
    () => requests.filter((request) => String(request?.status).toLowerCase() === 'accepted'),
    [requests],
  );

  const rejectedRequests = useMemo(
    () => requests.filter((request) => String(request?.status).toLowerCase() === 'rejected'),
    [requests],
  );

  const historyRequests = useMemo(() => {
    const merged = [...acceptedRequests, ...rejectedRequests];
    return merged.sort((a, b) => {
      const aTime = new Date(a?.updated_at || a?.created_at || 0).getTime();
      const bTime = new Date(b?.updated_at || b?.created_at || 0).getTime();
      return bTime - aTime;
    });
  }, [acceptedRequests, rejectedRequests]);

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);
      await api.patch(`/lecturer/thesis/requests/${id}/approve`);
      toast.success('Pengajuan berhasil disetujui');
      fetchRequests();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menyetujui pengajuan'));
    } finally {
      setLoadingId(null);
    }
  };

  const openRejectModal = (request) => {
    setRejectTarget(request);
    setRejectReason('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectTarget(null);
    setRejectReason('');
    setRejectError('');
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    if (!rejectReason.trim()) {
      setRejectError('Alasan penolakan wajib diisi');
      return;
    }

    try {
      setLoadingId(rejectTarget.id_thesis_lecturer);
      await api.patch(`/lecturer/thesis/requests/${rejectTarget.id_thesis_lecturer}/reject`, {
        rejection_note: rejectReason.trim(),
      });
      toast.success('Pengajuan berhasil ditolak');
      closeRejectModal();
      fetchRequests();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menolak pengajuan'));
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownload = (request) => {
    const { path } = getAttachmentInfo(request);
    const url = buildImageUrl(path);
    if (!url) {
      toast.error('Lampiran proposal tidak tersedia');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <BimbinganShell
      title="Validasi Pengajuan Tugas Akhir"
      description="Review dan setujui atau tolak pengajuan tugas akhir dari mahasiswa"
      breadcrumbItems={[
        { label: 'Bimbingan', href: '/bimbingan-ta/dosen/topik' },
        { label: 'Validasi Pengajuan', active: true },
      ]}
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          title="Menunggu Review"
          value={pendingRequests.length}
          icon={<ClipboardList className="h-6 w-6 text-[#b45309]" />}
          iconWrapperClass="bg-[#fff3cd]"
        />
        <StatCard
          title="Disetujui"
          value={acceptedRequests.length}
          icon={<CircleCheckBig className="h-6 w-6 text-[#16a34a]" />}
          iconWrapperClass="bg-[#dcfce7]"
        />
        <StatCard
          title="Ditolak"
          value={rejectedRequests.length}
          icon={<CircleX className="h-6 w-6 text-[#ef4444]" />}
          iconWrapperClass="bg-[#fee2e2]"
        />
      </section>

      <section className="mt-5 overflow-hidden rounded-[14px] bg-white shadow-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        <div className="border-b border-[#f3f4f6] bg-[#f0faf3] px-[22px] py-[14px]">
          <h2 className="text-[20px] font-bold text-[#015023]">
            Pengajuan Menunggu Review ({pendingRequests.length})
          </h2>
        </div>

        <div className="p-[18px] md:p-[24px]">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-[150px] animate-pulse rounded-[14px] bg-slate-100" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-14 text-center">
              <FileSearch className="mx-auto h-8 w-8 text-[#9ca3af]" />
              <p className="mt-3 text-[18px] font-semibold text-[#015023]">Belum ada pengajuan masuk</p>
              <p className="mt-1 text-[14px] text-[#6a7282]">Pengajuan dari mahasiswa akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingRequests.map((request) => {
                const studentName = request?.student_thesis?.student?.name || 'Mahasiswa';
                const studentNim = request?.student_thesis?.student?.username || '-';
                const title = request?.student_thesis?.title_ind || 'Judul belum tersedia';
                const description = request?.student_thesis?.description || 'Tidak ada deskripsi proposal';
                const { fileName, sizeLabel } = getAttachmentInfo(request);

                return (
                  <article
                    key={request.id_thesis_lecturer}
                    className="rounded-[14px] border border-[#f3f4f6] bg-white p-[18px] shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#015023] text-[14px] font-bold text-white">
                            {getInitials(studentName)}
                          </span>
                          <div>
                            <p className="text-[16px] font-semibold text-[#015023]">{studentName}</p>
                            <p className="text-[13px] text-[#6a7282]">NIM: {studentNim}</p>
                          </div>
                        </div>

                        <h3 className="mt-4 text-[22px] font-bold leading-tight text-[#015023]">{title}</h3>
                        <p className="mt-2 text-[14px] leading-6 text-[#4a5565]">{description}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#6a7282]">
                          <span className="inline-flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5" />
                            {fileName}
                            {sizeLabel ? ` (${sizeLabel})` : ''}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(request?.created_at)}
                          </span>
                        </div>

                        {request?.student_note ? (
                          <div className="mt-3 rounded-r-[8px] border-l-4 border-[#015023] bg-[#f0fdf4] p-3">
                            <p className="inline-flex items-center gap-2 text-[13px] italic text-[#4a5565]">
                              <MessageSquareQuote className="h-4 w-4 text-[#015023]" />
                              {request.student_note}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[160px]">
                        <button
                          type="button"
                          onClick={() => handleDownload(request)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#e5e7eb] bg-white py-[10px] text-[14px] text-[#374151] hover:bg-[#f9fafb]"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>

                        <button
                          type="button"
                          disabled={loadingId === request.id_thesis_lecturer}
                          onClick={() => handleApprove(request.id_thesis_lecturer)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#16a34a] py-[10px] text-[14px] font-semibold text-white hover:bg-[#15803d] disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" />
                          {loadingId === request.id_thesis_lecturer ? 'Memproses...' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          disabled={loadingId === request.id_thesis_lecturer}
                          onClick={() => openRejectModal(request)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#dc2626] py-[10px] text-[14px] font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {historyRequests.length > 0 ? (
        <section className="mt-4">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="rounded-[8px] border border-[#d1d5db] bg-white px-4 py-2 text-[14px] font-medium text-[#374151] hover:bg-[#f9fafb]"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            {showHistory ? 'Sembunyikan Riwayat Pengajuan' : 'Lihat Riwayat Pengajuan'}
          </button>

          {showHistory ? (
            <div className="mt-3 space-y-3 rounded-[14px] bg-white p-4 shadow-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {historyRequests.map((request) => (
                <div
                  key={`history-${request.id_thesis_lecturer}`}
                  className="flex flex-col gap-2 rounded-[12px] border border-[#eef1f4] bg-[#fafafa] p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#015023]">
                      {request?.student_thesis?.student?.name || 'Mahasiswa'}
                    </p>
                    <p className="text-[13px] text-[#4a5565]">{request?.student_thesis?.title_ind || '-'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-[12px] text-[#6a7282]">{formatDate(request?.updated_at || request?.created_at)}</p>
                    <HistoryBadge status={request?.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {rejectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-[480px] rounded-[12px] bg-white p-[24px] shadow-xl" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[20px] font-bold text-[#111827]">Tolak Pengajuan</h3>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  {(rejectTarget?.student_thesis?.student?.name || 'Mahasiswa')}
                </p>
                <p className="truncate text-[13px] text-[#6b7280]">
                  {rejectTarget?.student_thesis?.title_ind || '-'}
                </p>
              </div>

              <button type="button" onClick={closeRejectModal} className="text-[#6b7280] hover:text-[#111827]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <label className="text-[14px] font-semibold text-[#015023]">
                Alasan Penolakan <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  setRejectError('');
                }}
                placeholder="Tuliskan alasan penolakan untuk mahasiswa..."
                className={`mt-1 min-h-[100px] w-full rounded-[8px] border bg-white px-[12px] py-[8px] text-[14px] outline-none ${
                  rejectError ? 'border-[#ef4444]' : 'border-[#d1d5dc]'
                }`}
              />
              {rejectError ? <p className="mt-1 text-[12px] text-[#dc2626]">{rejectError}</p> : null}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRejectModal}
                className="rounded-[8px] border border-[#d1d5dc] bg-white px-4 py-2 text-[14px] text-[#0a0a0a]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loadingId === rejectTarget?.id_thesis_lecturer}
                className="rounded-[8px] bg-[#ef4444] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
              >
                {loadingId === rejectTarget?.id_thesis_lecturer ? 'Memproses...' : 'Tolak Pengajuan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </BimbinganShell>
  );
}
