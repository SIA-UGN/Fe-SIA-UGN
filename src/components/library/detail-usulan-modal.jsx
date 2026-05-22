'use client';

import React from 'react';
import { BookOpen, X, Check } from 'lucide-react';

export default function DetailUsulanModal({ isOpen, onClose, data, onApprove, onReject }) {
  if (!isOpen || !data) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-urbanist"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="bg-[#015023] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-wide">Detail Usulan Buku</h2>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#015023] text-lg font-bold text-white shadow-sm">
              {data.user_name ? data.user_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#015023] leading-tight">
                {data.user_name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                NIM: {data.user_nim}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Diajukan pada {data.proposed_at}
          </p>

          <div className="w-full h-px bg-gray-200 mb-5"></div>

          <div className="space-y-4">
            <div>
              <p className="text-[13px] font-semibold text-[#4a5568] mb-1">Judul Buku</p>
              <p className="text-[16px] font-medium text-gray-800">{data.book_title}</p>
            </div>
            
            <div>
              <p className="text-[13px] font-semibold text-[#4a5568] mb-1">Penulis</p>
              <p className="text-[16px] font-medium text-gray-800">{data.author}</p>
            </div>
            
            <div>
              <p className="text-[13px] font-semibold text-[#4a5568] mb-2">Alasan Usulan</p>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-[14px] text-gray-700 leading-relaxed shadow-inner">
                {data.reason || "Tidak ada alasan yang dicantumkan."}
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={() => onReject(data.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e11d48] hover:bg-[#be123c] text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              <X className="w-5 h-5" /> Tolak
            </button>
            
            <button
              onClick={() => onApprove(data.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#00a651] hover:bg-[#008a43] text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              <Check className="w-5 h-5" /> Setujui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}