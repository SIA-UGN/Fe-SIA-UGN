'use client';

import { X } from 'lucide-react';
import { RecentSubmission } from '@/services/adminBimbinganService';
import { Button } from '@/components/ui/button';

interface AdminTADetailModalProps {
  open: boolean;
  submission: RecentSubmission | null;
  onClose: () => void;
  onAssignDosen?: () => void;
}

const formatDateFull = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const AdminTADetailModal = ({
  open,
  submission,
  onClose,
  onAssignDosen,
}: AdminTADetailModalProps) => {
  if (!open || !submission) return null;

  const getStatusColor = (status: RecentSubmission['status']) => {
    switch (status) {
      case 'Menunggu Approval':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Approved':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'Ditolak':
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail Pengajuan TA</h2>
              <p className="text-sm text-gray-500 mt-1">Informasi lengkap pengajuan mahasiswa</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Status
              </label>
              <div
                className={`px-4 py-2 rounded-lg border font-semibold text-sm inline-block ${getStatusColor(
                  submission.status
                )}`}
              >
                {submission.status}
              </div>
            </div>

            {/* Mahasiswa Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Nama Mahasiswa
                </label>
                <p className="text-sm font-semibold text-gray-900">{submission.name}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  NIM
                </label>
                <p className="text-sm font-semibold text-gray-900">{submission.nim}</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Judul Tugas Akhir
              </label>
              <p className="text-sm font-semibold text-[#015023]">{submission.title}</p>
            </div>

            {/* Submission Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Tanggal Pengajuan
              </label>
              <p className="text-sm text-gray-700">{formatDateFull(submission.date)}</p>
            </div>

            {/* Pembimbing */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Dosen Pembimbing
              </label>
              {submission.pembimbing ? (
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-700">{submission.pembimbing}</p>
                </div>
              ) : (
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">Belum ada pembimbing</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50">
            <Button
              variant="primary"
              size="default"
              onClick={onAssignDosen}
              className="flex-1"
              disabled={submission.pembimbing !== null}
              style={{}}
            >
              {submission.pembimbing ? 'Pembimbing Sudah Ditugaskan' : 'Assign Dosen Pembimbing'}
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={onClose}
              className="flex-1"
              style={{}}
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
