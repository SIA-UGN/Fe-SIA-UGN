'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { GaleriTAItem } from '@/features/bimbingan-ta/hooks/useGaleriTA';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface KonfirmasiAjuanModalProps {
  open: boolean;
  data: GaleriTAItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function KonfirmasiAjuanModal({
  open,
  data,
  onClose,
  onConfirm,
  isSubmitting = false,
}: KonfirmasiAjuanModalProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  if (!open || !data) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60"
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
        style={font}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold" style={{ color: '#015023' }}>
            Konfirmasi Pengajuan Bimbingan
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning text */}
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Pastikan Anda sudah membaca detail judul tugas akhir sebelum mengajukan bimbingan.
        </p>

        {/* Data display */}
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-800">Judul:</p>
            <p className="text-sm text-gray-600 mt-0.5">{data.judul}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Dosen Pembimbing:</p>
            <p className="text-sm text-gray-600 mt-0.5">{data.dosen}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Kategori:</p>
            <p className="text-sm text-gray-600 mt-0.5">{data.kategori}</p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#015023' }}
          >
            {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Ajukan'}
          </button>
        </div>
      </div>
    </>
  );
}
