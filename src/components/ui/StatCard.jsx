'use client';

import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const font = { fontFamily: 'Urbanist, sans-serif' };

/**
 * Universal Statistics Card
 */
export default function StatCard({ 
    title, 
    total = 0, 
    subText, 
    statuses = [], 
    MainIcon, 
    isLoading = false 
}) {
    return (
        <div
            className="relative flex items-center justify-between px-8 py-6"
            style={{ backgroundColor: '#015023', borderRadius: '16px', minHeight: '110px', ...font }}
        >
            {/* ── Left: Total Data ─────────────────────────── */}
            <div className="flex flex-col gap-1 z-10">
                <span className="text-white/70 text-xs font-medium tracking-wide uppercase">
                    {title}
                </span>
                <span className="text-white text-4xl font-bold leading-none">
                    {isLoading ? '...' : total}
                </span>
                {subText && (
                    <span className="text-xs font-medium mt-1" style={{ color: '#E5C158' }}>
                        {isLoading ? '...' : subText}
                    </span>
                )}
            </div>

            {/* ── Center: Dynamic status counts ── */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 z-10">
                {statuses.map((status, index) => {
                    const StatusIcon = status.icon;
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <StatusIcon size={16} className="text-white/60" />
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold" style={{ color: status.color || '#FFF' }}>
                                    {isLoading ? '...' : status.value}
                                </span>
                                <span className="text-white/60 text-[11px] font-medium">
                                    {status.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Right: Dynamic Gold icon button ───────────────────── */}
            {MainIcon && (
                <div
                    className="flex items-center justify-center z-10"
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        backgroundColor: '#E5C158',
                    }}
                >
                    <MainIcon size={28} style={{ color: '#015023' }} />
                </div>
            )}
        </div>
    );
}