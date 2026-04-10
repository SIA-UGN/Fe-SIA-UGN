'use client';

import { FileText, ExternalLink } from 'lucide-react';
import { buildThesisAssetUrl } from '../utils';

interface ThesisAttachmentLinkProps {
  path?: string | null;
  label?: string;
}

export default function ThesisAttachmentLink({
  path,
  label = 'Lihat lampiran',
}: ThesisAttachmentLinkProps) {
  const href = buildThesisAssetUrl(path);

  if (!href || !path) {
    return (
      <span className="text-sm text-gray-500" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        Tidak ada lampiran
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-[#015023]/15 bg-[#015023]/5 px-3 py-2 text-sm font-medium text-[#015023] transition hover:bg-[#015023]/10"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      <FileText className="h-4 w-4" />
      <span>{label}</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
