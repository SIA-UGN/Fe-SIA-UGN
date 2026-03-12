'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { CorrespondenceStatus } from '@/types/correspondence.d';

// ── Status badge configuration ──────────────────────────────────────
const STATUS_CONFIG: Record<
    CorrespondenceStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    submitted: { label: 'Diajukan', bg: '#E5E7EB', text: '#374151', dot: '#9CA3AF' },
    process:   { label: 'Diproses', bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    resolved:  { label: 'Selesai',  bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    rejected:  { label: 'Ditolak',  bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

interface DetailHeaderProps {
    status?: CorrespondenceStatus;
}

const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

/**
 * Top navigation area with a back link, page title, and a dynamic status badge.
 */
export default function DetailHeader({ status }: DetailHeaderProps) {
    const cfg = status ? STATUS_CONFIG[status] : null;

    return (
        <div className="mb-6" style={font}>
            {/* Back link */}
            <Link
                href="/adminpage/persuratan"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: '#015023' }}
            >
                <ArrowLeft size={18} />
                Kembali ke Daftar Surat
            </Link>

            {/* Title + badge row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
                <h1
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: '#015023' }}
                >
                    Detail Persuratan
                </h1>

                {cfg && (
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
                        style={{
                            backgroundColor: cfg.bg,
                            color: cfg.text,
                            borderRadius: '999px',
                        }}
                    >
                        <span
                            style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: cfg.dot,
                                flexShrink: 0,
                            }}
                        />
                        {cfg.label}
                    </span>
                )}
            </div>
        </div>
    );
}
