'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const font = { fontFamily: 'Urbanist, sans-serif' };

const statusOptions = [
    {
        value: 'process',
        label: 'Diproses',
        icon: Clock,
        dotColor: '#F59E0B',
        activeBorder: '#F59E0B',
        activeBg: '#FFFBEB',
    },
    {
        value: 'resolved',
        label: 'Selesai',
        icon: CheckCircle2,
        dotColor: '#10B981',
        activeBorder: '#10B981',
        activeBg: '#ECFDF5',
    },
    {
        value: 'rejected',
        label: 'Ditolak',
        icon: XCircle,
        dotColor: '#EF4444',
        activeBorder: '#EF4444',
        activeBg: '#FEF2F2',
    },
];

/**
 * Auto-save status modal.
 * Clicking a status card directly calls the update handler — no Save button.
 */
export default function UpdateStatusModal({
    open,
    onOpenChange,
    surat,
    onConfirm,
    isLoading = false,
}) {
    const [mounted, setMounted] = useState(false);
    const [clickedStatus, setClickedStatus] = useState(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset clicked indicator when modal closes
    useEffect(() => {
        if (!open) setClickedStatus(null);
    }, [open]);

    if (!open || !mounted) return null;

    const currentStatus = surat?.status;

    const handleCardClick = async (e, statusValue) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setClickedStatus(statusValue);

        try {
            const success = await onConfirm(surat.id_correspondence, statusValue);

            if (success) {
                onOpenChange(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setClickedStatus(null);
        }
    };

    const content = (
        // Overlay
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => !isLoading && onOpenChange(false)}
        >
            {/* Modal container */}
            <div
                className="w-full max-w-lg mx-4 overflow-hidden shadow-2xl"
                style={{ borderRadius: '16px', backgroundColor: '#fff' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Dark green header ─────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ backgroundColor: '#015023' }}
                >
                    <h2 className="text-white text-lg font-bold" style={font}>
                        Manajemen Surat
                    </h2>
                    <button
                        onClick={() => !isLoading && onOpenChange(false)}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────── */}
                <div className="px-6 py-5">
                    {/* Title */}
                    <h3
                        className="text-lg font-bold mb-1"
                        style={{ color: '#015023', ...font }}
                    >
                        Update Status Surat
                    </h3>
                    {/* Subtitle with ID + title */}
                    {surat && (
                        <p className="text-sm text-gray-500 mb-5" style={font}>
                            KEL-{String(surat.id_correspondence || surat.id || '').padStart(4, '0')} — {surat.title}
                        </p>
                    )}

                    {/* Status cards */}
                    <div className="flex flex-col gap-3">
                        {statusOptions.map((opt) => {
                            const isActive = currentStatus === opt.value;
                            const isClicked = clickedStatus === opt.value;

                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    disabled={isLoading}
                                    onClick={(e) => handleCardClick(e, opt.value)}
                                    className="flex items-center gap-3 px-4 py-3.5 transition-all relative group"
                                    style={{
                                        borderRadius: '12px',
                                        border: isActive
                                            ? `2px solid ${opt.activeBorder}`
                                            : '2px solid #E5E7EB',
                                        backgroundColor: isActive ? opt.activeBg : '#FAFAFA',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading && !isClicked ? 0.5 : 1,
                                        ...font,
                                    }}
                                >
                                    {/* Colored dot */}
                                    <div
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            backgroundColor: opt.dotColor,
                                            flexShrink: 0,
                                        }}
                                    />

                                    <span className="font-semibold text-sm text-gray-700">
                                        {opt.label}
                                    </span>

                                    {/* Loading spinner on clicked card */}
                                    {isLoading && isClicked && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin ml-auto"
                                            style={{ color: opt.dotColor }}
                                        />
                                    )}

                                    {/* "Status saat ini" tag */}
                                    {isActive && !isLoading && (
                                        <span
                                            className="ml-auto text-xs font-medium px-2.5 py-1"
                                            style={{
                                                borderRadius: '8px',
                                                backgroundColor: opt.activeBg,
                                                border: `1px solid ${opt.activeBorder}`,
                                                color: opt.dotColor,
                                            }}
                                        >
                                            Status saat ini
                                        </span>
                                    )}

                                    {/* Hover hint for non-active, non-loading */}
                                    {!isActive && !isLoading && (
                                        <span
                                            className="ml-auto text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={font}
                                        >
                                            Klik untuk mengubah
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Footer: Cancel only ───────────────────────────── */}
                <div className="px-6 pb-5">
                    <button
                        onClick={() => !isLoading && onOpenChange(false)}
                        disabled={isLoading}
                        className="w-full py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
                        style={{
                            borderRadius: '10px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#fff',
                            color: '#374151',
                            ...font,
                        }}
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
