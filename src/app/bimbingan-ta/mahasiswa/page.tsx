'use client';

import React from 'react';
import { 
  Home, ChevronRight, Calendar, MapPin, 
  Clock, CheckCircle, FileText, User 
} from 'lucide-react';

export default function MonitoringBimbinganPage() {
  // --- DUMMY DATA ---
  const dosenInfo = {
    name: 'Dr. Ahmad Santoso, M.Kom',
    judulTA: 'Implementasi Deep Learning untuk Deteksi Penyakit Tanaman',
    email: 'ahmad.santoso@ugn.ac.id'
  };

  const jadwalBimbingan = [
    {
      id: 1,
      tanggal: '15 Mar 2026',
      waktu: '09:00 - 10:00',
      tempat: 'Ruang Dosen Lt.3',
      topik: 'Review BAB I - Pendahuluan',
      status: 'Akan Datang'
    },
    {
      id: 2,
      tanggal: '28 Feb 2026',
      waktu: '09:00 - 10:00',
      tempat: 'Ruang Dosen Lt.3',
      topik: 'Review BAB I - Pendahuluan',
      status: 'Selesai'
    },
    {
      id: 3,
      tanggal: '28 Feb 2026',
      waktu: '09:00 - 10:00',
      tempat: 'Ruang Dosen Lt.3',
      topik: 'Review BAB I - Pendahuluan',
      status: 'Selesai'
    }
  ];

  const riwayatCatatan = [
    {
      id: 1,
      tanggal: '5 Maret 2026',
      topik: 'Diskusi Metodologi Penelitian',
      catatan: 'Mahasiswa sudah mengumpulkan dataset. Preprocessing perlu diperbaiki, terutama pada augmentasi gambar.',
      tugasSelanjutnya: 'Perbaiki pipeline augmentasi dan mulai training model baseline.',
      oleh: 'Dosen'
    },
    {
      id: 2,
      tanggal: '28 Februari 2026',
      topik: 'Review Proposal Awal',
      catatan: 'Proposal disetujui dengan catatan minor. Perlu tambahkan referensi jurnal internasional terbaru.',
      tugasSelanjutnya: 'Kumpulkan dataset dan setup environment development.',
      oleh: 'Dosen'
    }
  ];

  // --- RENDER HELPERS ---
  const renderStatusBadge = (status) => {
    if (status === 'Selesai') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" /> Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-200 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" /> Akan Datang
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] p-6 md:p-10 font-urbanist">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8">
          <Home className="w-4 h-4" />
          <span className="hover:text-[#015023] cursor-pointer transition-colors">Beranda</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-[#015023] cursor-pointer transition-colors">Bimbingan</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-[#015023]">Monitoring</span>
        </div>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#015023] mb-2">
            Monitoring Bimbingan Tugas Akhir
          </h1>
          <p className="text-gray-500 text-sm">
            Pantau progress bimbingan dan jadwal pertemuan dengan dosen pembimbing
          </p>
        </div>

        {/* --- SECTION 1: Dosen Pembimbing --- */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-[#015023] mb-6">Dosen Pembimbing</h2>
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-[#015023] text-white flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            {/* Info */}
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-gray-800">{dosenInfo.name}</h3>
              <p className="text-sm text-gray-600">
                Judul TA: <span className="font-medium">{dosenInfo.judulTA}</span>
              </p>
              <a href={`mailto:${dosenInfo.email}`} className="text-sm font-medium text-[#cda02f] hover:underline mt-1">
                {dosenInfo.email}
              </a>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: Jadwal Bimbingan --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          {/* Header Card Hijau */}
          <div className="bg-[#015023] px-6 py-4 flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5" />
            <h2 className="font-bold">Jadwal Bimbingan</h2>
          </div>
          
          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Tanggal</th>
                  <th className="py-4 px-6 font-semibold">Waktu</th>
                  <th className="py-4 px-6 font-semibold">Tempat</th>
                  <th className="py-4 px-6 font-semibold">Topik</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {jadwalBimbingan.map((jadwal) => (
                  <tr key={jadwal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">{jadwal.tanggal}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{jadwal.waktu}</td>
                    <td className="py-4 px-6 whitespace-nowrap flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {jadwal.tempat}
                    </td>
                    <td className="py-4 px-6">{jadwal.topik}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {renderStatusBadge(jadwal.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SECTION 3: Riwayat Catatan Bimbingan (Timeline) --- */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#015023] mb-8">Riwayat Catatan Bimbingan</h2>
          
          <div className="pl-2">
            {/* Garis vertikal timeline */}
            <div className="border-l-[3px] border-[#d8e3dc] ml-3.5 space-y-10 pb-4">
              {riwayatCatatan.map((catatan) => (
                <div key={catatan.id} className="relative pl-8 sm:pl-10">
                  {/* Titik indikator */}
                  <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-sm bg-[#015023] border-4 border-white shadow-sm flex items-center justify-center">
                     <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>

                  {/* Konten Catatan */}
                  <div className="flex flex-col gap-2">
                    {/* Tanggal */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {catatan.tanggal}
                    </div>
                    
                    {/* Topik & Deskripsi */}
                    <h3 className="text-base font-bold text-[#015023] mt-1">{catatan.topik}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {catatan.catatan}
                    </p>

                    {/* Box Tugas Selanjutnya */}
                    <div className="mt-3 bg-[#f0f5f2] border border-[#e1ece5] rounded-xl p-4 flex gap-3 items-start">
                      <FileText className="w-5 h-5 text-[#015023] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Tugas Selanjutnya:
                        </span>
                        <p className="text-sm font-medium text-gray-800">
                          {catatan.tugasSelanjutnya}
                        </p>
                      </div>
                    </div>

                    {/* Oleh */}
                    <p className="text-xs font-medium text-[#cda02f] mt-2">
                      Oleh: {catatan.oleh}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
  }