'use client';

import { X } from 'lucide-react';

export default function ConfirmAjukanModal({
  open,
  topic,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open || !topic) return null;

  const lecturerName =
    topic?.lecturer?.name ||
    topic?.supervisor?.name ||
    'Dosen Pembimbing';

  const categoryName =
    topic?.category?.name ||
    topic?.thesis_category?.name ||
    topic?.topic ||
    'Umum';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[440px] rounded-[16px] bg-white shadow-xl">
        <div className="rounded-t-[16px] px-[24px] pb-[16px] pt-[24px]">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h2
              className="text-[18px] font-bold text-[#1f2937]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              Konfirmasi Pengajuan Bimbingan
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full p-1 text-[#6a7282] hover:bg-gray-100"
              aria-label="Tutup modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p
            className="text-[13px] text-[#6a7282]"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Pastikan Anda sudah membaca detail judul tugas akhir sebelum mengajukan bimbingan.
          </p>
        </div>

        <div className="space-y-4 px-[24px] py-[16px]">
          <div>
            <p
              className="text-[13px] font-semibold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              Judul:
            </p>
            <p
              className="text-[14px] text-[#1f2937]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {topic.title_ind}
            </p>
          </div>

          <div>
            <p
              className="text-[13px] font-semibold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              Dosen Pembimbing:
            </p>
            <p
              className="text-[14px] text-[#1f2937]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {lecturerName}
            </p>
          </div>

          <div>
            <p
              className="text-[13px] font-semibold text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              Kategori:
            </p>
            <p
              className="text-[14px] text-[#1f2937]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {categoryName}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-[12px] px-[24px] pb-[24px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[8px] border border-gray-300 bg-white px-[20px] py-[8px] text-[13px] text-[#6a7282]"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-[8px] bg-[#015023] px-[20px] py-[8px] text-[13px] text-white disabled:opacity-60"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            {loading ? 'Memproses...' : 'Konfirmasi Ajukan'}
          </button>
        </div>
      </div>
    </div>
  );
}
