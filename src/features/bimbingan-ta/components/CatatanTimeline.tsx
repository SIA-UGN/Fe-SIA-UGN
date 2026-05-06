'use client';

import React from 'react';
import { Calendar, FileText } from 'lucide-react';
import type { CatatanBimbinganItem } from '@/features/bimbingan-ta/hooks/useMonitoringTA';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CatatanTimelineProps {
  data: CatatanBimbinganItem[];
}

/* ------------------------------------------------------------------ */
/*  Timeline node                                                      */
/* ------------------------------------------------------------------ */

function TimelineItem({ item }: { item: CatatanBimbinganItem }) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="relative pl-8" style={font}>
      {/* Dot on the timeline line */}
      <span
        className="absolute left-0 top-1 w-3 h-3 rounded-sm -translate-x-1/2"
        style={{ backgroundColor: '#015023' }}
      />

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
        <Calendar size={13} className="shrink-0" />
        <span>{item.tanggal}</span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold" style={{ color: '#015023' }}>
        {item.judul}
      </h4>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.deskripsi}</p>

      {/* Tugas selanjutnya block */}
      {item.tugas_selanjutnya && (
        <div className="flex items-start gap-2.5 mt-3 rounded-lg px-4 py-3 bg-gray-100">
          <FileText size={16} className="shrink-0 mt-0.5 text-gray-500" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Tugas selanjutnya: {item.tugas_selanjutnya}
          </p>
        </div>
      )}

      {/* Author */}
      <p className="text-sm mt-2" style={{ color: '#D4B54D' }}>
        Oleh: {item.penulis}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CatatanTimeline({ data }: CatatanTimelineProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100" style={font}>
      {/* Section title */}
      <h2 className="text-base font-bold" style={{ color: '#015023' }}>
        Riwayat Catatan Bimbingan
      </h2>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-gray-400 text-center py-8">
          Belum ada catatan bimbingan.
        </p>
      ) : (
        /* Timeline container */
        <div className="relative border-l-2 border-gray-200 ml-1.5 mt-6 space-y-8">
          {data.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
