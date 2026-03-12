'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';

const font = { fontFamily: 'Urbanist, sans-serif' };

/**
 * Delete confirmation modal with dark green header, centered red trash icon,
 * and side-by-side Batal / Hapus buttons.
 */
export default function DeleteSuratModal({
    open,
    onOpenChange,
    surat,
    onConfirm,
    isLoading = false,
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!open || !mounted) return null;

    const handleConfirm = () => {
        if (surat && !isLoading) {
            onConfirm(surat.id_correspondence);
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
                className="w-full max-w-md mx-4 overflow-hidden shadow-2xl"
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
                <div className="px-6 py-8 flex flex-col items-center text-center">
                    {/* Centered red trash icon in a pink circle */}
                    <div
                        className="flex items-center justify-center mb-5"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#FEF2F2',
                        }}
                    >
                        <Trash2 size={36} style={{ color: '#DC2626' }} />
                    </div>

                    {/* Title */}
                    <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: '#1F2937', ...font }}
                    >
                        Hapus Surat?
                    </h3>

                    {/* Description */}
                    <p
                        className="text-sm text-gray-500 max-w-xs leading-relaxed"
                        style={font}
                    >
                        Apakah Anda yakin ingin menghapus surat
                        {surat && (
                            <strong className="text-gray-700"> &quot;{surat.title}&quot;</strong>
                        )}
                        ? Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>

                {/* ── Footer: two side-by-side buttons ──────────────── */}
                <div className="px-6 pb-6 flex gap-3">
                    {/* Batal */}
                    <button
                        onClick={() => !isLoading && onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
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

                    {/* Hapus */}
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                        style={{
                            borderRadius: '10px',
                            backgroundColor: '#DC2626',
                            ...font,
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
