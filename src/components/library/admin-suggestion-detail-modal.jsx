'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Check, X, BookPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/features/library/utils';

export default function AdminSuggestionDetailModal({
  open,
  onClose,
  suggestion,
  onApprove,
  onReject,
  submitting = false,
}) {
  const router = useRouter();
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (open) {
      setAdminResponse('');
    }
  }, [open, suggestion]);

  if (!open || !suggestion) return null;

  const isPending = suggestion.status === 'pending';
  const initial = (suggestion.user_name || '?')[0].toUpperCase();

  const handleApprove = () => {
    onApprove(suggestion.id_book_suggestion, adminResponse.trim());
  };

  const handleReject = () => {
    onReject(suggestion.id_book_suggestion, adminResponse.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[540px] overflow-hidden rounded-[16px] bg-white shadow-2xl"
        style={{ fontFamily: 'Urbanist, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#015023] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-[20px] font-bold text-white">Detail Usulan Buku</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#015023]">
              <span className="text-[18px] font-bold text-white">{initial}</span>
            </div>
            <div>
              <p className="text-[17px] font-bold text-[#101828]">{suggestion.user_name || '-'}</p>
              <p className="text-[14px] text-[#6a7282]">NIM: {suggestion.user_nim || suggestion.user_email || '-'}</p>
            </div>
          </div>

          <p className="mt-3 text-[13px] text-[#6a7282]">
            Diajukan pada {formatDate(suggestion.created_at)}
          </p>

          {/* Book info */}
          <div className="mt-5">
            <p className="text-[13px] font-semibold text-[#015023]">Judul Buku</p>
            <p className="mt-0.5 text-[16px] font-bold text-[#101828]">{suggestion.title || '-'}</p>
          </div>

          <div className="mt-4">
            <p className="text-[13px] font-semibold text-[#015023]">Penulis</p>
            <p className="mt-0.5 text-[16px] text-[#101828]">{suggestion.author || '-'}</p>
          </div>

          {/* Alasan Usulan */}
          <div className="mt-5">
            <p className="text-[13px] font-bold text-[#101828]">Alasan Usulan</p>
            <div className="mt-2 rounded-[12px] bg-[#f3f4f6] px-4 py-3">
              <p className="text-[14px] leading-relaxed text-[#374151]">
                {suggestion.reason || '-'}
              </p>
            </div>
          </div>

          {/* Admin response (if already responded) */}
          {!isPending ? (
            <div className="mt-4">
              <p className="text-[13px] font-bold text-[#101828]">Respon Admin</p>
              <div className="mt-2 rounded-[12px] bg-[#e8f5e9] px-4 py-3">
                <p className="text-[14px] leading-relaxed text-[#015023]">
                  {suggestion.admin_response && suggestion.admin_response !== '-' ? suggestion.admin_response : '-'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Admin response input (only for pending) */}
          {isPending ? (
            <div className="mt-4">
              <label className="text-[13px] font-bold text-[#101828]">Respon Admin</label>
              <textarea
                rows={3}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Tuliskan respon untuk mahasiswa..."
                className="mt-2 w-full rounded-[10px] border border-[#d1d5dc] px-4 py-3 text-[14px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20"
              />
            </div>
          ) : null}

          {/* Action buttons */}
          {isPending ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={submitting}
                className="flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#dc2626] text-[16px] font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
              >
                <X className="h-5 w-5" />
                Tolak
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[#16a34a] text-[16px] font-semibold text-white transition-colors hover:bg-[#15803d] disabled:opacity-60"
              >
                <Check className="h-5 w-5" />
                Setujui
              </button>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {suggestion.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      addBook: 'true',
                      title: suggestion.title || '',
                      author: suggestion.author || ''
                    });
                    router.push(`/adminpage/perpustakaan?${params.toString()}`);
                  }}
                  className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#015023] text-[15px] font-semibold text-white transition-colors hover:bg-[#013d1a]"
                >
                  <BookPlus className="h-4 w-4" />
                  Jadikan Buku Katalog
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[#e5e7eb] text-[15px] font-semibold text-[#374151] transition-colors hover:bg-[#d1d5db]"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
