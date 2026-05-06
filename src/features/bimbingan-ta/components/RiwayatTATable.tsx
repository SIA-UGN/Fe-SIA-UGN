'use client';

import React, { useState } from 'react';
import { FileText, Clock, XCircle, CheckCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import type { StudentThesis, TAStudentStatus, TALecturerRequestStatus } from '@/services/taService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

/* ------------------------------------------------------------------ */
/*  Status Badge — thesis_lecturer request status                      */
/* ------------------------------------------------------------------ */

const requestStatusConfig: Record<
  TALecturerRequestStatus,
  { label: string; dot: string; text: string; bg: string; Icon: React.ElementType }
> = {
  pending: {
    label: 'Menunggu',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    bg: 'bg-amber-100',
    Icon: Clock,
  },
  accepted: {
    label: 'Diterima',
    dot: 'bg-green-600',
    text: 'text-green-800',
    bg: 'bg-green-100',
    Icon: CheckCircle,
  },
  rejected: {
    label: 'Ditolak',
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-100',
    Icon: XCircle,
  },
};

/* ------------------------------------------------------------------ */
/*  Status Badge — student_thesis status (header card)                 */
/* ------------------------------------------------------------------ */

const thesisStatusConfig: Record<
  TAStudentStatus,
  { label: string; dot: string; text: string; bg: string; Icon: React.ElementType }
> = {
  proposing: {
    label: 'Diajukan',
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    bg: 'bg-amber-100',
    Icon: Clock,
  },
  on_progress: {
    label: 'Berlangsung',
    dot: 'bg-blue-600',
    text: 'text-blue-800',
    bg: 'bg-blue-100',
    Icon: Loader2,
  },
  revision: {
    label: 'Revisi',
    dot: 'bg-orange-500',
    text: 'text-orange-800',
    bg: 'bg-orange-100',
    Icon: AlertCircle,
  },
  finished: {
    label: 'Selesai',
    dot: 'bg-green-600',
    text: 'text-green-800',
    bg: 'bg-green-100',
    Icon: CheckCircle,
  },
};

function StatusBadge({ status }: { status: TALecturerRequestStatus }) {
  const cfg = requestStatusConfig[status] ?? requestStatusConfig.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function ThesisStatusBadge({ status }: { status: TAStudentStatus }) {
  const cfg = thesisStatusConfig[status] ?? thesisStatusConfig.proposing;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: format ISO date → "28 Feb 2026"                            */
/* ------------------------------------------------------------------ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTanggal(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface RiwayatTATableProps {
  thesis: StudentThesis | null;
  isLoading?: boolean;
  isDeleting?: boolean;
  onDelete?: () => Promise<void>;
}

export default function RiwayatTATable({ thesis, isLoading, isDeleting, onDelete }: RiwayatTATableProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const lecturerRequests = thesis?.thesis_lecturers ?? [];

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting thesis:', error);
      // Error akan ditampilkan dari hook
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div
        className="flex items-center justify-between gap-2 px-5 py-3.5 rounded-t-lg"
        style={{ backgroundColor: '#015023' }}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-white" />
          <h2 className="text-white font-semibold text-base" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Riwayat Pengajuan
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {thesis && onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Hapus pengajuan TA (Sementara untuk development)"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
          {thesis && <ThesisStatusBadge status={thesis.status} />}
        </div>
      </div>

      {isLoading && (
        <div className="bg-white px-5 py-4 border-b border-gray-100 animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      )}
      {!isLoading && thesis && (
        <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-100" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          <p className="font-semibold text-sm text-gray-800">{thesis.title_ind}</p>
          <p className="text-xs text-gray-400 mt-0.5 italic">{thesis.title_eng}</p>
          {thesis.topic && (
            <span className="inline-block mt-1.5 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
              {thesis.topic}
            </span>
          )}
        </div>
      )}

      <div className="bg-white overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Tanggal</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Dosen Pembimbing</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Catatan</th>
              <th className="text-center px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-4 rounded bg-gray-200 w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : !thesis ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Belum ada pengajuan tugas akhir.</td></tr>
            ) : lecturerRequests.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Belum ada permintaan pembimbing yang diajukan.</td></tr>
            ) : (
              lecturerRequests.map((req) => (
                <tr key={req.id_thesis_lecturer} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{formatTanggal(req.created_at)}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium whitespace-nowrap">{req.lecturer.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-xs">
                    {req.status === 'rejected' && req.rejection_note ? (
                      <span className="text-red-500 text-xs">{req.rejection_note}</span>
                    ) : (
                      <span className="text-xs">{req.student_note ?? '—'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={req.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="" onClickOutside={() => setShowDeleteConfirm(false)}>
          <AlertDialogHeader className="">
            <AlertDialogTitle className="">Hapus Pengajuan TA?</AlertDialogTitle>
            <AlertDialogDescription className="">
              Tindakan ini akan menghapus pengajuan TA berjudul "<strong>{thesis?.title_ind}</strong>" dan semua riwayat pembimbingnya. Perubahan ini tidak dapat dibatalkan. Fitur ini hanya tersedia untuk development.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="" disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
