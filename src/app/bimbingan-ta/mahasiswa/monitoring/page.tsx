'use client';

import React, { useEffect, useState } from 'react';
import { 
  Home, ChevronRight, Calendar, MapPin, 
  Clock, CheckCircle, FileText, User, Loader2 
} from 'lucide-react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { getThesisMonitoringData } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function MonitoringBimbinganPage() {
  const { user } = useAuth();
  const [dosenInfo, setDosenInfo] = useState(null);
  const [jadwalBimbingan, setJadwalBimbingan] = useState([]);
  const [riwayatCatatan, setRiwayatCatatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.username && !user?.name) {
        // still allow attempt, but avoid unnecessary calls if not logged
      }
      try {
        setLoading(true);
        const resp = await getThesisMonitoringData();
        if (resp && resp.status === 'success' && resp.data) {
          const data = resp.data;
          setDosenInfo({
            name: data.lecturer?.name || 'Tidak tersedia',
            judulTA: data.thesis_title || 'Belum terdaftar',
            email: data.lecturer?.email || ''
          });

          const sortedSchedules = (data.schedules || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setJadwalBimbingan(sortedSchedules.map(item => ({
            id: item.id_schedule || item.id || Math.random(),
            tanggal: formatDate(item.date, 'short'),
            waktu: item.time_display || (() => {
              // Fallback: use start_time/end_time if available
              const start = item.start_time ? String(item.start_time).slice(0, 5) : null;
              const end = item.end_time ? String(item.end_time).slice(0, 5) : null;
              if (start && end) return `${start} - ${end}`;
              if (start) return `${start} - Selesai`;
              return '-';
            })(),
            tempat: item.location || item.place || '-',
            topik: item.topic || item.title || '-',
            status: new Date(item.date) > new Date() ? 'Akan Datang' : 'Selesai'
          })));

          const sortedLogs = (data.logs || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRiwayatCatatan(sortedLogs.map(item => ({
            id: item.id_log || item.id || Math.random(),
            tanggal: formatDate(item.date, 'long'),
            topik: item.topic || item.title || '-',
            catatan: item.notes || item.content || '-',
            tugasSelanjutnya: item.next_task || '-',
            oleh: item.author_name || item.author_role || item.author || 'Dosen'
          })));
        } else {
          setError({
            message: resp?.message || 'Gagal memuat data monitoring.',
            httpStatus: resp?.httpStatus || null,
            serverData: resp?.data || null
          });
        }
      } catch (err) {
        console.error('Fetch monitoring error', err);
        setError({
          message: err?.message || 'Terjadi kesalahan saat mengambil data.',
          httpStatus: err?.response?.status || null,
          serverData: err?.response?.data || null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, retryToken]);

  // helpers
  const formatDate = (dateString, type = 'short') => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (type === 'short') return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-10 h-10 text-[#015023] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-red-600 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-700 mb-4">{error?.message || 'Terjadi kesalahan.'}</p>
          {error?.httpStatus && (
            <p className="text-sm text-gray-500 mb-2">Status HTTP: <span className="font-medium">{error.httpStatus}</span></p>
          )}
          {error?.serverData && (
            <div className="mt-3 bg-gray-50 border border-gray-100 rounded-md p-3 text-xs text-gray-700 overflow-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(error.serverData, null, 2)}</pre>
            </div>
          )}
          <div className="mt-4 text-right">
            <button onClick={() => { setError(null); setRetryToken((value) => value + 1); }} className="px-4 py-2 bg-[#015023] text-white rounded-md">Coba lagi</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7f5] font-urbanist">
      <Navbar />
      <main className="flex-grow p-6 md:p-10">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#015023] mb-2">Monitoring Bimbingan Tugas Akhir</h1>
            <p className="text-gray-500 text-sm">Pantau progress bimbingan dan jadwal pertemuan dengan dosen pembimbing</p>
          </div>

          {/* Dosen */}
          {dosenInfo && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-bold text-[#015023] mb-6">Dosen Pembimbing</h2>
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[#015023] text-white flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-gray-800">{dosenInfo.name}</h3>
                  <p className="text-sm text-gray-600">Judul TA: <span className="font-medium">{dosenInfo.judulTA}</span></p>
                  {dosenInfo.email && <a href={`mailto:${dosenInfo.email}`} className="text-sm font-medium text-[#cda02f] hover:underline mt-1">{dosenInfo.email}</a>}
                </div>
              </div>
            </div>
          )}

          {/* Schedules */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="bg-[#015023] px-6 py-4 flex items-center gap-2 text-white"><Calendar className="w-5 h-5" /><h2 className="font-bold">Jadwal Bimbingan</h2></div>
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
                  {jadwalBimbingan.length > 0 ? jadwalBimbingan.map(jadwal => (
                    <tr key={jadwal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">{jadwal.tanggal}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{jadwal.waktu}</td>
                      <td className="py-4 px-6 whitespace-nowrap flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{jadwal.tempat}</td>
                      <td className="py-4 px-6">{jadwal.topik}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{renderStatusBadge(jadwal.status)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">Belum ada jadwal bimbingan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#015023] mb-8">Riwayat Catatan Bimbingan</h2>
            {riwayatCatatan.length > 0 ? (
              <div className="pl-2">
                <div className="border-l-[3px] border-[#d8e3dc] ml-3.5 space-y-10 pb-4">
                  {riwayatCatatan.map(catatan => (
                    <div key={catatan.id} className="relative pl-8 sm:pl-10">
                      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-sm bg-[#015023] border-4 border-white shadow-sm flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><Calendar className="w-3.5 h-3.5" />{catatan.tanggal}</div>
                        <h3 className="text-base font-bold text-[#015023] mt-1">{catatan.topik}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{catatan.catatan}</p>
                        <div className="mt-3 bg-[#f0f5f2] border border-[#e1ece5] rounded-xl p-4 flex gap-3 items-start"><FileText className="w-5 h-5 text-[#015023] shrink-0 mt-0.5" /><div><span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tugas Selanjutnya:</span><p className="text-sm font-medium text-gray-800">{catatan.tugasSelanjutnya}</p></div></div>
                        <p className="text-xs font-medium text-[#cda02f] mt-2">Oleh: {catatan.oleh}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">Belum ada riwayat catatan bimbingan.</div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}