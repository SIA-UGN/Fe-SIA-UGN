'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import type { PengajuanTA, TAStatus } from '@/services/taService';

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

const statusConfig: Record<TAStatus, { label: string; border: string; text: string }> = {
  diproses: {
    label: 'Diproses',
    border: 'border-amber-500',
    text: 'text-amber-600',
  },
  ditolak: {
    label: 'Ditolak',
    border: 'border-red-500',
    text: 'text-red-600',
  },
  approved: {
    label: 'Approved',
    border: 'border-green-600',
    text: 'text-green-700',
  },
};

function StatusBadge({ status }: { status: TAStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.diproses;
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${cfg.border} ${cfg.text} bg-white`}
    >
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: format ISO date → DD/MM/YYYY                               */
/* ------------------------------------------------------------------ */

function formatTanggal(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface RiwayatTATableProps {
  data: PengajuanTA[];
  isLoading?: boolean;
}

export default function RiwayatTATable({ data, isLoading }: RiwayatTATableProps) {
  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
      {/* ── Dark-green header ────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-5 py-3.5 rounded-t-lg"
        style={{ backgroundColor: '#015023' }}
      >
        <FileText className="h-5 w-5 text-white" />
        <h2 className="text-white font-semibold text-base" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          Riwayat Pengajuan
        </h2>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-white overflow-x-auto">
        <table className="w-full text-sm" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">
                Tanggal
              </th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Judul</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">
                Dosen
              </th>
              <th className="text-center px-5 py-3 font-semibold text-gray-600 whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              /* skeleton rows */
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-4 rounded bg-gray-200 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                  Belum ada riwayat pengajuan.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                    {formatTanggal(row.tanggal)}
                  </td>
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{row.judul}</td>
                  <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{row.dosen}</td>
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
