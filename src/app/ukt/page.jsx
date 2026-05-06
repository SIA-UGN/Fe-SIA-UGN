'use client';

import React, { useState, useEffect } from 'react';
import { 
  Copy, Check, RefreshCw, XCircle, Download, 
  ChevronDown, ChevronUp, AlertCircle, Clock, CircleCheck, Wallet
} from 'lucide-react';
import { toast } from 'sonner'; // Asumsi Anda menggunakan sonner untuk notifikasi

export default function StudentUktPage() {
  // --- STATE MANAGEMENT ---
  // Simulasi status: 'pending' (menunggu bayar), 'unpaid' (belum buat VA), 'paid' (lunas)
  const [billStatus, setBillStatus] = useState('pending'); 
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('23:59:05'); // Simulasi countdown

  // --- DATA DUMMY MAHASISWA & TAGIHAN ---
  const student = {
    name: 'Ahmad Fauzi',
    nim: '2021010001',
    prodi: 'Informatika'
  };

  const currentBill = {
    semester: 'Genap 2025/2026',
    tingkatUkt: 3,
    nominal: 3500000,
    metode: 'Transfer Bank BNI (Virtual Account)',
    vaNumber: '80012021010001',
    expiryDate: '15 September 2025, 10:00 WIB'
  };

  const historyBills = [
    { id: 1, semester: 'Ganjil 2025/2026', nominal: 3500000, status: 'Lunas' },
    { id: 2, semester: 'Genap 2024/2025', nominal: 3500000, status: 'Lunas' },
  ];

  // --- FUNGSI-FUNGSI UTAMA ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(currentBill.vaNumber);
    setIsCopied(true);
    toast.success('Nomor Virtual Account berhasil disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSyncStatus = async () => {
    setIsSyncing(true);
    // Simulasi hit API ke backend untuk cek status Gateway
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info('Status pembayaran masih menunggu. Jika Anda sudah transfer, mohon tunggu 1-5 menit.');
    setIsSyncing(false);
  };

  const handleCancelTransaction = () => {
    const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan VA ini? Anda harus membuat kode VA baru setelahnya.");
    if (confirmCancel) {
      toast.success('Transaksi dibatalkan. Silakan buat ulang tagihan.');
      setBillStatus('unpaid');
    }
  };

  // --- RENDER COMPONENT ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-urbanist">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header Profil Singkat */}
        <div className="bg-[#015023] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Pembayaran UKT</h1>
            <p className="text-green-100 text-sm">
              Halo, <span className="font-semibold">{student.name}</span> ({student.nim})
            </p>
            <p className="text-green-100 text-sm">Program Studi: {student.prodi}</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-sm font-semibold tracking-wide">PORTAL MAHASISWA</span>
          </div>
        </div>

        {/* Card Tagihan Utama */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Judul & Badge Status */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tagihan Semester {currentBill.semester}</h2>
              <p className="text-sm text-gray-500 mt-1">Golongan UKT Tingkat {currentBill.tingkatUkt}</p>
            </div>
            
            {/* Status Badge Dinamis */}
            {billStatus === 'pending' && (
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold text-sm">
                <Clock className="w-4 h-4" /> MENUNGGU PEMBAYARAN
              </div>
            )}
            {billStatus === 'paid' && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-sm">
                <CircleCheck className="w-4 h-4" /> LUNAS
              </div>
            )}
            {billStatus === 'unpaid' && (
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm">
                <AlertCircle className="w-4 h-4" /> BELUM DIBAYAR
              </div>
            )}
          </div>

          {/* Konten Tagihan */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-600 font-medium">Total Tagihan</span>
              <span className="text-2xl font-bold text-[#015023]">{formatRupiah(currentBill.nominal)}</span>
            </div>

            <hr className="border-dashed border-gray-200 mb-6" />

            {/* SEKSI JIKA STATUS MENUNGGU (MENAMPILKAN VA) */}
            {billStatus === 'pending' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    Silakan lakukan pembayaran melalui Virtual Account berikut sebelum batas waktu berakhir.
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Metode Pembayaran</span>
                  <span className="text-sm font-semibold text-gray-800">{currentBill.metode}</span>
                </div>

                {/* Box VA Number dengan tombol copy */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Virtual Account</span>
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-[#015023] tracking-widest">
                      {currentBill.vaNumber}
                    </span>
                  </div>
                  <button 
                    onClick={handleCopyVA}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      isCopied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Tersalin!' : 'Salin Kode'}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Sisa Waktu: <span className="font-bold text-orange-500">{timeLeft}</span> 
                  <span className="hidden sm:inline">(Kadaluarsa pada {currentBill.expiryDate})</span>
                </div>

                {/* Accordion Cara Pembayaran */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
                  <button 
                    onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-800">📖 Cara Pembayaran</span>
                    {isInstructionsOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  {isInstructionsOpen && (
                    <div className="p-4 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-200">
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>Buka aplikasi <strong>BNI Mobile Banking</strong>.</li>
                        <li>Pilih menu <strong>Transfer</strong>, lalu pilih <strong>Virtual Account Billing</strong>.</li>
                        <li>Pilih menu <strong>Input Baru</strong>.</li>
                        <li>Masukkan nomor VA <strong className="text-[#015023]">{currentBill.vaNumber}</strong>.</li>
                        <li>Pastikan nama yang muncul adalah <strong>{student.name}</strong> dan nominalnya sesuai.</li>
                        <li>Lanjutkan proses pembayaran dan simpan bukti transaksi.</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                  <button 
                    onClick={handleSyncStatus}
                    disabled={isSyncing}
                    className="w-full sm:flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white bg-[#015023] hover:bg-[#013d1b] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Mengecek...' : 'Cek Status Pembayaran'}
                  </button>
                  <button 
                    onClick={handleCancelTransaction}
                    className="w-full sm:flex-1 px-5 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Batalkan Transaksi
                  </button>
                </div>
              </div>
            )}

            {/* SEKSI JIKA BELUM BAYAR SAMA SEKALI */}
            {billStatus === 'unpaid' && (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm max-w-md">
                  Anda belum membuat tagihan. Silakan pilih metode pembayaran untuk mendapatkan Nomor Virtual Account.
                </p>
                <button 
                  onClick={() => setBillStatus('pending')} // Simulasi hit API create order
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#DABC4E] hover:bg-[#c9aa3f] transition-all shadow-sm text-[#015023]"
                >
                  Pilih Metode Pembayaran
                </button>
              </div>
            )}
            
          </div>
        </div>

        {/* Card Riwayat Tagihan Sebelumnya */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Riwayat Tagihan Sebelumnya</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                  <th className="p-4 font-bold">Semester</th>
                  <th className="p-4 font-bold">Nominal</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyBills.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{row.semester}</td>
                    <td className="p-4 font-semibold text-gray-800">{formatRupiah(row.nominal)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold w-max">
                        <CircleCheck className="w-3.5 h-3.5" /> {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#015023] hover:bg-green-50 transition-colors border border-[#015023]/20">
                        <Download className="w-3.5 h-3.5" /> Kwitansi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}