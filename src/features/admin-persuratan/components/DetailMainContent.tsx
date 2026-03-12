'use client';

import Link from 'next/link';
import { Paperclip, ExternalLink, User } from 'lucide-react';
import type { Correspondence } from '@/types/correspondence.d';

// ── Resolve sender info from any backend shape ──────────────────────
function resolveSender(data: Correspondence) {
    const name =
        data.user?.name ??
        data.sender_name ??
        data.user_name ??
        null;
    const sub =
        data.user?.email ??
        data.sender_email ??
        data.user_email ??
        data.sender_nim ??
        data.user?.nim ??
        data.sender_nip ??
        data.user?.nip ??
        null;
    return { name, sub };
}

interface DetailMainContentProps {
    data: Correspondence;
}

const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

/**
 * Main card showing the letter title, body, and optional attachment section.
 */
export default function DetailMainContent({ data }: DetailMainContentProps) {
    return (
        <div
            className="bg-white shadow-sm rounded-xl p-6"
            style={font}
        >
            {/* Letter title */}
            <h2
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{ color: '#015023' }}
            >
                {data.title}
            </h2>

            {/* Sender chip */}
            {(() => {
                const { name, sub } = resolveSender(data);
                if (!name) return null;
                return (
                    <div className="flex items-center gap-2 mb-4">
                        <div
                            className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
                            style={{ backgroundColor: '#D4B54D' }}
                        >
                            <User size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-500">
                            Dari{' '}
                            <span className="font-semibold" style={{ color: '#015023' }}>
                                {name}
                            </span>
                            {sub && (
                                <span className="text-gray-400"> · {sub}</span>
                            )}
                        </span>
                    </div>
                );
            })()}

            {/* Divider */}
            <hr className="border-gray-200 mb-4" />

            {/* Letter body — preserve line breaks */}
            <div
                className="text-sm sm:text-base leading-relaxed text-gray-700"
                style={{ whiteSpace: 'pre-wrap' }}
            >
                {data.correspondence_body}
            </div>

            {/* Attachment section */}
            {data.attachment_url && (
                <div
                    className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: '#E6F4EA' }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg"
                            style={{ backgroundColor: '#015023' }}
                        >
                            <Paperclip size={18} className="text-white" />
                        </div>
                        <div>
                            <p
                                className="text-sm font-semibold"
                                style={{ color: '#015023' }}
                            >
                                Dokumen Lampiran
                            </p>
                            <p className="text-xs text-gray-500">
                                File yang dilampirkan oleh pengirim
                            </p>
                        </div>
                    </div>

                    <Link
                        href={data.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-colors hover:bg-[#015023] hover:text-white"
                        style={{
                            color: '#015023',
                            borderColor: '#015023',
                        }}
                    >
                        <ExternalLink size={16} />
                        Lihat / Unduh
                    </Link>
                </div>
            )}
        </div>
    );
}
