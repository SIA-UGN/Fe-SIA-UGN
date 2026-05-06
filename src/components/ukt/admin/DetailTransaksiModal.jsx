// File: src/components/ukt/admin/DetailTransaksiModal.js
import React, { useState, useEffect } from 'react';
import { 
  X, FileText, User, BookOpen, CreditCard, 
  RefreshCw, CircleCheck, Clock, CircleX 
} from 'lucide-react';

export default function DetailTransaksiModal({ isOpen, onClose, data, onSync }) {
  const [isSyncing, setIsSyncing] = useState(false);

  // --- EFEK UNTUK MENCEGAH SCROLL HALAMAN BELAKANG ---
  useEffect(() => {
    if (isOpen) {
      // Mengunci scroll body saat modal terbuka
      document.body.style.overflow = 'hidden';
    } else {
      // Mengembalikan scroll body saat modal tertutup
      document.body.style.overflow = 'unset';
    }

    // Cleanup function: pastikan scroll dikembalikan jika komponen di-unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  // ----------------------------------------------------

  // Jika modal tidak terbuka atau data kosong, jangan render komponen ini
  if (!isOpen || !data) return null;

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    if (onSync) await onSync(data.orderId);
    setIsSyncing(false);
  };

  // Render Status Badge
  const renderStatusBadge = () => {
    const status = data.status?.toLowerCase() || '';
    if (status === 'lunas' || status === 'verified') {
      return (
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-200 font-bold text-sm w-max">
          <CircleCheck className="w-5 h-5" /> LUNAS
        </div>
      );
    }
    if (status === 'pending' || status === 'menunggu') {
      return (
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200 font-bold text-sm w-max">
          <Clock className="w-5 h-5" /> MENUNGGU PEMBAYARAN
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-200 font-bold text-sm w-max">
        <CircleX className="w-5 h-5" /> GAGAL / KEDALUWARSA
      </div>
    );
  };

  const DataItem = ({ label, value }) => (
    <div className="flex flex-col gap-1 mb-4 last:mb-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-urbanist">
      {/* Backdrop Gelap */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Kontainer Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3 text-[#015023]">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Rincian Transaksi UKT</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal (Bisa di-scroll jika kepanjangan) */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-sm font-semibold text-gray-600">Status Saat Ini:</span>
            {renderStatusBadge()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Kolom Kiri */}
            <div className="flex flex-col gap-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50 text-[#015023]">
                  <User className="w-5 h-5" />
                  <h3 className="font-bold">Informasi Mahasiswa</h3>
                </div>
                <DataItem label="Nama Lengkap" value={data.mahasiswaName} />
                <DataItem label="NIM" value={data.nim} />
                <DataItem label="Program Studi" value={data.prodi} />
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-green-50 rounded-full blur-2xl pointer-events-none"></div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50 text-[#015023]">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-bold">Detail Akademik</h3>
                </div>
                <DataItem label="Semester" value={`${data.semester || ''} ${data.tahunAjaran || ''}`} />
                <DataItem label="Golongan UKT" value={`Tingkat ${data.tingkatUkt}`} />
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="h-full">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50 text-[#015023]">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="font-bold">Detail Transaksi (Gateway)</h3>
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                  <DataItem label="Order ID / Reference" value={data.orderId} />
                  <DataItem label="Metode Pembayaran" value={data.metode} />
                  
                  {data.vaNumber && (
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4">
                      <DataItem label="Nomor Virtual Account" value={
                        <span className="font-mono text-base font-bold text-blue-700 tracking-wider">{data.vaNumber}</span>
                      } />
                    </div>
                  )}

                  <div className="mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Nominal Tagihan</span>
                    <span className="text-lg font-bold text-green-600">{formatRupiah(data.nominal)}</span>
                  </div>

                  <DataItem label="Waktu Tagihan Dibuat" value={data.waktuDibuat} />
                  {(data.status === 'verified' || data.status === 'lunas') && (
                    <DataItem label="Waktu Berhasil Terbayar" value={data.waktuTerbayar} />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-white border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end items-center gap-3 rounded-b-2xl shrink-0">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Tutup
          </button>
          
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#015023] hover:bg-[#013d1b] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Status'}
          </button>
        </div>

      </div>
    </div>
  );
}