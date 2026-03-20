'use client';

import { FileText } from 'lucide-react';

interface DokumenProposal {
  nama: string;
  ukuran: string;
}

interface InfoPengajuanCardProps {
  idPengajuan: string;
  programStudi: string;
  tanggalPengajuan: string;
  semester: number;
  dokumenProposal: DokumenProposal;
}

export const InfoPengajuanCard = ({
  idPengajuan,
  programStudi,
  tanggalPengajuan,
  semester,
  dokumenProposal,
}: InfoPengajuanCardProps) => {
  const metadataFields = [
    { label: 'ID Pengajuan', value: idPengajuan },
    { label: 'Program Studi', value: programStudi },
    { label: 'Tanggal Pengajuan', value: tanggalPengajuan },
    { label: 'Semester', value: `Semester ${semester}` },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-6">Info Pengajuan</h3>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {metadataFields.map((field, idx) => (
          <div key={idx} className="flex flex-col">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{field.label}</p>
            <p className="text-sm font-semibold text-gray-900">{field.value}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-6" />

      {/* Dokumen Proposal */}
      <div className="flex flex-col">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Dokumen Proposal</p>
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
          <FileText className="w-6 h-6 text-[#D4B54D] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{dokumenProposal.nama}</p>
            <p className="text-xs text-gray-500">{dokumenProposal.ukuran}</p>
          </div>
          <button className="text-[#D4B54D] hover:text-[#015023] transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
