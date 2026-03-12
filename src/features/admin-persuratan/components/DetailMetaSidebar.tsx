'use client';

import { User, Calendar, Folder, Building, Trash2 } from 'lucide-react';
import type { Correspondence } from '@/types/correspondence.d';

// ── Resolve sender info from any backend shape ──────────────────────
function resolveSender(data: Correspondence) {
    const name =
        data.user?.name ??
        data.sender_name ??
        data.user_name ??
        '-';
    const sub =
        data.user?.email ??
        data.sender_email ??
        data.user_email ??
        data.sender_nim ??
        data.user?.nim ??
        data.sender_nip ??
        data.user?.nip ??
        '-';
    return { name, sub };
}

interface DetailMetaSidebarProps {
    data: Correspondence;
    onUpdateStatus?: () => void;
    onDelete?: () => void;
}

const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

// ── Helper ──────────────────────────────────────────────────────────
function formatDate(iso?: string): string {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
}

// ── Reusable meta row ───────────────────────────────────────────────
function MetaRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                style={{ backgroundColor: '#E6F4EA' }}
            >
                <Icon size={16} style={{ color: '#015023' }} />
            </div>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p
                    className="text-sm font-semibold"
                    style={{ color: '#111827' }}
                >
                    {value || '-'}
                </p>
            </div>
        </div>
    );
}

/**
 * Sidebar card showing sender information, letter metadata, and an action button.
 */
export default function DetailMetaSidebar({
    data,
    onUpdateStatus,
    onDelete,
}: DetailMetaSidebarProps) {
    return (
        <div className="bg-white shadow-sm rounded-xl p-6 space-y-6" style={font}>
            {/* ── Informasi Pengirim ─────────────────────────── */}
            <div>
                <h3
                    className="text-sm font-bold uppercase tracking-wide mb-4"
                    style={{ color: '#015023' }}
                >
                    Informasi Pengirim
                </h3>

                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#D4B54D' }}
                    >
                        <User size={18} className="text-white" />
                    </div>
                    <div>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: '#015023' }}
                        >
                            {resolveSender(data).name}
                        </p>
                        <p className="text-xs text-gray-400">
                            {resolveSender(data).sub}
                        </p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* ── Informasi Surat ─────────────────────────────── */}
            <div>
                <h3
                    className="text-sm font-bold uppercase tracking-wide mb-4"
                    style={{ color: '#015023' }}
                >
                    Informasi Surat
                </h3>

                <div className="space-y-4">
                    <MetaRow
                        icon={Calendar}
                        label="Tanggal Pengajuan"
                        value={formatDate(data.created_at)}
                    />
                    <MetaRow
                        icon={Folder}
                        label="Kategori"
                        value={data.category?.name || '-'}
                    />
                    <MetaRow
                        icon={Building}
                        label="Tujuan / Penerima"
                        value={data.recipient?.name || '-'}
                    />
                </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* ── Action Button ────────────────────────────────── */}
            <button
                type="button"
                onClick={onUpdateStatus}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white rounded-xl transition-colors hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#015023' }}
            >
                Update Status
            </button>

            {/* ── Delete Button ─────────────────────────────────── */}
            <button
                type="button"
                onClick={onDelete}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl border-2 transition-colors hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer"
                style={{ color: '#DC2626', borderColor: '#DC2626' }}
            >
                <Trash2 size={16} />
                Hapus Surat
            </button>
        </div>
    );
}
