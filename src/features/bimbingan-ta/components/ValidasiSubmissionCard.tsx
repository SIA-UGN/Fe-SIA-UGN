'use client';

import React from 'react';
import { Calendar, CheckCircle2, Download, FileText, User, XCircle } from 'lucide-react';
import type { ValidasiSubmission } from '@/features/bimbingan-ta/hooks/useValidasiTA';

interface ValidasiSubmissionCardProps {
  item: ValidasiSubmission;
  onDownload: (fileUrl: string) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function ValidasiSubmissionCard({
  item,
  onDownload,
  onApprove,
  onReject,
}: ValidasiSubmissionCardProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4 flex flex-col md:flex-row justify-between gap-6" style={font}>
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#015023] text-white w-10 h-10 rounded-full flex items-center justify-center">
            <User size={18} />
          </div>
          <div>
            <p className="text-base font-bold text-[#015023]">{item.mahasiswa}</p>
            <p className="text-xs text-gray-500">NIM: {item.nim} • {item.prodi}</p>
          </div>
        </div>

        <div>
          <p className="text-lg font-bold text-[#015023] leading-snug">{item.title}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <FileText size={14} />
            {item.fileName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {item.date}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full md:w-40">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDownload(item.fileUrl);
          }}
          className="h-10 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 inline-flex items-center justify-center gap-2"
        >
          <Download size={15} />
          Download
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onApprove(item.id);
          }}
          className="h-10 rounded-lg bg-[#16A34A] text-white text-sm font-semibold hover:bg-green-700 inline-flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={15} />
          Approve
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onReject(item.id);
          }}
          className="h-10 rounded-lg bg-[#DC2626] text-white text-sm font-semibold hover:bg-red-700 inline-flex items-center justify-center gap-2"
        >
          <XCircle size={15} />
          Reject
        </button>
      </div>
    </div>
  );
}
