'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { DosenInfo } from '@/features/bimbingan-ta/hooks/useMonitoringTA';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DosenInfoCardProps {
  data: DosenInfo;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DosenInfoCard({ data }: DosenInfoCardProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100" style={font}>
      {/* Section label */}
      <h2 className="text-base font-bold mb-4" style={{ color: '#015023' }}>
        Dosen Pembimbing
      </h2>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#015023' }}
        >
          <User size={26} className="text-white" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
            Judul TA: {data.judulTA}
          </p>
          <a
            href={`mailto:${data.email}`}
            className="inline-flex items-center gap-1.5 text-sm mt-1 hover:underline"
            style={{ color: '#D4B54D' }}
          >
            {data.email}
          </a>
        </div>
      </div>
    </div>
  );
}
