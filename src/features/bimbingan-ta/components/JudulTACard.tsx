'use client';

import React from 'react';
import { Tag, User } from 'lucide-react';
import {
  CATEGORY_BADGE_COLORS,
  type GaleriTAItem,
} from '@/features/bimbingan-ta/hooks/useGaleriTA';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface JudulTACardProps {
  data: GaleriTAItem;
  onAjukan: (data: GaleriTAItem) => void;
  isDisabled?: boolean;
  disabledReason?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function JudulTACard({ data, onAjukan, isDisabled = false, disabledReason }: JudulTACardProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };
  const isFull = data.kuota_terisi >= data.kuota_maksimal;
  const isBlocked = isFull || isDisabled;
  const badgeColor = CATEGORY_BADGE_COLORS[data.kategori] ?? {
    bg: '#E6F4EA',
    text: '#015023',
  };

  return (
    <div
      className="bg-white shadow-sm rounded-xl p-6 flex flex-col h-full border border-gray-100"
      style={font}
    >
      {/* Kategori badge */}
      <span
        className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
      >
        <Tag size={12} />
        {data.kategori}
      </span>

      {/* Title */}
      <h3
        className="mt-3 text-base font-bold leading-snug line-clamp-2"
        style={{ color: '#015023' }}
      >
        {data.judul}
      </h3>

      {/* Dosen */}
      <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
        <User size={14} className="shrink-0" />
        <span>{data.dosen}</span>
      </div>

      {/* Deskripsi */}
      <p className="mt-2.5 text-sm text-gray-600 leading-relaxed line-clamp-3">
        {data.deskripsi}
      </p>

      {/* Kuota + Button — pushed to bottom */}
      <div className="mt-auto pt-4 space-y-3">
        {/* Kuota */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Kuota Tersedia:</span>
          <span
            className="font-bold"
            style={{ color: isFull ? '#BE0414' : '#015023' }}
          >
            {data.kuota_terisi} / {data.kuota_maksimal}
          </span>
        </div>

        {/* Ajukan button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (isBlocked) return;
            onAjukan(data);
          }}
          disabled={isBlocked}
          title={isDisabled ? disabledReason : isFull ? 'Kuota bimbingan sudah penuh.' : undefined}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#015023' }}
        >
          Ajukan Bimbingan
        </button>
      </div>
    </div>
  );
}
