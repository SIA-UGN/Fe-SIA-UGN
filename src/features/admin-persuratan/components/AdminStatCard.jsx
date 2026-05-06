'use client';

import { BookOpen, Clock, CheckCircle2, XCircle } from 'lucide-react';

const font = { fontFamily: 'Urbanist, sans-serif' };

/**
 * Dark green statistics card for admin persuratan.
 * Layout: Total left | Diproses · Selesai · Ditolak center | Icon right
 */
export default function AdminStatCard({ stats = {}, isLoading = false }) {
    const { total = 0, diproses = 0, selesai = 0, ditolak = 0, diajukan = 0 } = stats;

    return (
        <div
            className="relative flex items-center justify-between px-8 py-6"
            style={{ backgroundColor: '#015023', borderRadius: '16px', minHeight: '110px', ...font }}
        >
            {/* ── Left: Total Surat ─────────────────────────── */}
            <div className="flex flex-col gap-1 z-10">
                <span className="text-white/70 text-xs font-medium tracking-wide uppercase">
                    Total Surat
                </span>
                <span className="text-white text-4xl font-bold leading-none">
                    {isLoading ? '...' : total}
                </span>
                <span className="text-xs font-medium mt-1" style={{ color: '#E5C158' }}>
                    {isLoading ? '...' : diajukan} Surat terkirim
                </span>
            </div>

            {/* ── Center: 3 status counts (absolutely centered) ── */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8 z-10 max-[980px]:relative max-[980px]:left-auto max-[980px]:translate-x-0 max-[980px]:mt-4 max-[980px]:w-full max-[980px]:justify-between">
                {/* Diproses */}
                <div className="flex items-center gap-1.5 md:gap-2 max-[980px]:flex-1 max-[980px]:justify-center">
                    <Clock size={16} className="text-white/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-xl md:text-2xl font-bold" style={{ color: '#E5C158' }}>
                            {isLoading ? '...' : diproses}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-[11px] font-medium">Diproses</span>
                    </div>
                </div>

                {/* Selesai */}
                <div className="flex items-center gap-1.5 md:gap-2 max-[980px]:flex-1 max-[980px]:justify-center">
                    <CheckCircle2 size={16} className="text-white/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-xl md:text-2xl font-bold text-emerald-400">
                            {isLoading ? '...' : selesai}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-[11px] font-medium">Selesai</span>
                    </div>
                </div>

                {/* Ditolak */}
                <div className="flex items-center gap-1.5 md:gap-2 max-[980px]:flex-1 max-[980px]:justify-center">
                    <XCircle size={16} className="text-white/60" />
                    <div className="flex flex-col items-center">
                        <span className="text-xl md:text-2xl font-bold text-red-400">
                            {isLoading ? '...' : ditolak}
                        </span>
                        <span className="text-white/60 text-[10px] md:text-[11px] font-medium">Ditolak</span>
                    </div>
                </div>
            </div>

            {/* ── Right: Gold icon button ───────────────────── */}
            <div
                className="flex items-center justify-center z-10"
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: '#E5C158',
                }}
            >
                <BookOpen size={28} style={{ color: '#015023' }} />
            </div>
        </div>
    );
}
