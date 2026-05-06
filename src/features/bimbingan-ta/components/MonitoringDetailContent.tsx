'use client';

import React from 'react';
import { CalendarDays, FileText, GraduationCap, MapPin } from 'lucide-react';
import type { MonitoringJadwalStatus, MonitoringMahasiswa } from '@/features/bimbingan-ta/hooks/useMonitoringDosen';

interface MonitoringDetailContentProps {
  student: MonitoringMahasiswa | null;
  onOpenCatatanModal: () => void;
  onOpenJadwalModal: () => void;
  onUpdateStatus: (id: number, status: 'finished') => void;
}

const statusBadge: Record<MonitoringJadwalStatus, string> = {
  'Akan Datang': 'border-amber-300 bg-amber-50 text-amber-700',
  Selesai: 'border-green-300 bg-green-50 text-green-700',
};

export default function MonitoringDetailContent({
  student,
  onOpenCatatanModal,
  onOpenJadwalModal,
  onUpdateStatus,
}: MonitoringDetailContentProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  if (!student) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center" style={font}>
        <h3 className="text-lg font-semibold text-[#015023]">Belum ada mahasiswa dipilih</h3>
        <p className="mt-2 text-sm text-gray-500">Pilih mahasiswa pada panel kiri untuk melihat detail monitoring bimbingan.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4" style={font}>
      <div className="rounded-2xl border-2 border-[#015023]/70 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#015023] text-white">
            <GraduationCap size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-[#015023]">{student.nama}</p>
            <p className="text-sm text-gray-500">{student.nim} - {student.semester}</p>

            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                <div className="h-1.5 rounded-full bg-[#015023]" style={{ width: `${student.progress}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-500">{student.progress}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-[#FAFAFA] px-3 py-2.5">
          <p className="text-xs text-gray-500">Judul Tugas Akhir:</p>
          <p className="mt-1 text-sm font-semibold text-[#015023]">{student.judulTA}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onOpenCatatanModal}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#015023] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          + Tambah Catatan
        </button>
        <button
          type="button"
          onClick={onOpenJadwalModal}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D4B54D] px-4 text-sm font-semibold text-[#015023] transition-opacity hover:opacity-90"
        >
          <CalendarDays size={16} />
          Atur Jadwal
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-[#015023]">Riwayat Catatan Bimbingan</h3>

        {student.catatan.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">Belum ada catatan bimbingan.</p>
        ) : (
          <div className="relative mt-4 space-y-6 border-l-2 border-gray-200">
            {student.catatan.map((item) => (
              <div key={item.id} className="relative pl-6">
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#015023]" />

                <p className="text-xs text-gray-400">{item.tanggal}</p>
                <h4 className="mt-1 text-base font-semibold text-[#015023]">{item.topik}</h4>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.catatan}</p>

                <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#F4F9F5] px-3 py-2">
                  <FileText size={15} className="mt-0.5 shrink-0 text-[#015023]" />
                  <p className="text-sm text-[#015023]">
                    Tugas selanjutnya: {item.tugasSelanjutnya}
                  </p>
                </div>

                <p className="mt-1.5 text-xs text-[#D4B54D]">Oleh: {item.penulis}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-[#015023] px-4 py-3">
          <CalendarDays size={16} className="text-white" />
          <h3 className="text-base font-semibold text-white">Jadwal Bimbingan</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Tempat</th>
                <th className="px-4 py-3 font-semibold">Topik</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {student.jadwal.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                    Belum ada jadwal bimbingan.
                  </td>
                </tr>
              ) : (
                student.jadwal.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 text-gray-700">{item.tanggal}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.waktuMulai} - {item.waktuSelesai}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="shrink-0 text-gray-400" />
                        {item.lokasi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.topik}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'Akan Datang' && (
                        <button
                          onClick={() => onUpdateStatus(item.id, 'finished')}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                        >
                          Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
