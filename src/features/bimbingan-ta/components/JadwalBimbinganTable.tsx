'use client';

import React from 'react';
import { Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import type { JadwalBimbinganItem, JadwalStatus } from '@/features/bimbingan-ta/hooks/useMonitoringTA';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface JadwalBimbinganTableProps {
  data: JadwalBimbinganItem[];
}

/* ------------------------------------------------------------------ */
/*  Status badge config                                                */
/* ------------------------------------------------------------------ */

const statusConfig: Record<
  JadwalStatus,
  { label: string; border: string; text: string; dotBg: string; Icon: React.ElementType }
> = {
  'Akan Datang': {
    label: 'Akan Datang',
    border: 'border-amber-400',
    text: 'text-amber-600',
    dotBg: 'bg-amber-500',
    Icon: Clock,
  },
  Selesai: {
    label: 'Selesai',
    border: 'border-green-500',
    text: 'text-green-700',
    dotBg: 'bg-green-600',
    Icon: CheckCircle,
  },
};

function StatusBadge({ status }: { status: JadwalStatus }) {
  const cfg = statusConfig[status];
  const { Icon } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.border} ${cfg.text} bg-white`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg}`} />
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function JadwalBimbinganTable({ data }: JadwalBimbinganTableProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100" style={font}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 rounded-t-xl"
        style={{ backgroundColor: '#015023' }}
      >
        <Calendar size={18} className="text-white" />
        <h2 className="text-white font-semibold text-base">Jadwal Bimbingan</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Tanggal</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Waktu</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Tempat</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Topik</th>
              <th className="text-center px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  Belum ada jadwal bimbingan.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{row.tanggal}</td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium whitespace-nowrap">{row.waktu}</td>
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      {row.tempat}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{row.topik}</td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
