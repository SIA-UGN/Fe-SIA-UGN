'use client';

import React from 'react';
import { Pencil, Trash2, FolderOpen, Archive, UploadCloud } from 'lucide-react';
import type { DosenTaTitle } from '@/services/dosenTaService';
import { getCategoryColor } from '@/features/bimbingan-ta/utils/getCategoryColor';

interface KelolaJudulListProps {
  data: DosenTaTitle[];
  isLoading?: boolean;
  isDeletingId?: number | null;
  isArchivingId?: number | null;
  isRepublishingId?: number | null;
  onEdit: (item: DosenTaTitle) => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  onRepublish: (id: number) => void;
}

export default function KelolaJudulList({
  data,
  isLoading = false,
  isDeletingId,
  isArchivingId,
  isRepublishingId,
  onEdit,
  onDelete,
  onArchive,
  onRepublish,
}: KelolaJudulListProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={font}>
        <div className="grid grid-cols-[2.3fr_1fr_0.7fr_0.8fr_0.8fr] px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-[#015023]">
          <span>Judul</span>
          <span>Kategori</span>
          <span>Kuota</span>
          <span>Status</span>
          <span>Aksi</span>
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-14 px-6 text-center" style={font}>
        <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#E6F4EA] flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-[#015023]" />
        </div>
        <p className="text-sm font-semibold text-[#015023]">Belum ada judul TA yang ditambahkan atau ditemukan</p>
        <p className="text-xs text-gray-500 mt-1">Tambah judul baru atau ubah kata kunci pencarian Anda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={font}>
      <div className="grid grid-cols-[2.3fr_1fr_0.7fr_0.8fr_0.8fr] px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-[#015023]">
        <span>Judul</span>
        <span>Kategori</span>
        <span>Kuota</span>
        <span>Status</span>
        <span>Aksi</span>
      </div>

      <div className="divide-y divide-gray-100">
        {data.map((item) => {
          const categoryColor = getCategoryColor(item.category);
          const isPublished = item.status === 'published';
          const isArchived = item.status === 'archived';
          return (
            <div key={item.id} className="grid grid-cols-[2.3fr_1fr_0.7fr_0.8fr_0.8fr] px-5 py-3 gap-3 items-center">
              <div>
                <p className="text-sm font-semibold text-[#015023] leading-snug">{item.title_ind}</p>
                <p className="text-xs text-gray-400 mt-0.5 italic line-clamp-1">{item.title_eng}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
              </div>

              <div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
                >
                  {item.category}
                </span>
              </div>

              <div className="text-sm font-semibold text-gray-700">
                {item.quota_filled} / {item.quota_total}
              </div>

              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white ${isArchived ? 'bg-slate-600' : isPublished ? 'bg-[#015023]' : 'bg-gray-400'}`}
                >
                  {isArchived ? 'Archived' : isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="w-8 h-8 rounded-lg border border-gray-300 text-gray-600 hover:border-[#015023] hover:text-[#015023] flex items-center justify-center"
                  title={isArchived ? 'Edit topik arsip (bisa publish ulang)' : 'Edit topik'}
                >
                  <Pencil size={14} />
                </button>
                {isArchived ? (
                  <button
                    type="button"
                    disabled={isRepublishingId === item.id}
                    onClick={() => onRepublish(item.id)}
                    className="w-8 h-8 rounded-lg border border-green-300 text-green-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50 disabled:opacity-50 flex items-center justify-center transition-colors"
                    title="Publish ulang topik"
                  >
                    <UploadCloud size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isArchivingId === item.id}
                    onClick={() => onArchive(item.id)}
                    className="w-8 h-8 rounded-lg border border-amber-200 text-amber-600 hover:border-amber-400 hover:text-amber-700 disabled:opacity-50 flex items-center justify-center"
                    title="Arsipkan topik"
                  >
                    <Archive size={14} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={isDeletingId === item.id || isArchived || isPublished}
                  onClick={() => onDelete(item.id)}
                  className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:border-red-400 hover:text-red-600 disabled:opacity-50 flex items-center justify-center"
                  title={
                    isArchived
                      ? 'Topik arsip tidak dapat dihapus'
                      : isPublished
                        ? 'Topik yang sudah dipublikasikan tidak dapat dihapus, arsipkan terlebih dahulu'
                        : 'Hapus topik'
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
