'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AturJadwalPayload, TambahCatatanPayload } from '@/features/bimbingan-ta/hooks/useMonitoringDosen';

interface BaseModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

function BaseModal({ open, title, subtitle, onClose, children }: BaseModalProps) {
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl" style={font}>
          <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="text-lg font-bold text-[#015023]">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
            </div>

            <button type="button" onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </>
  );
}

interface TambahCatatanModalProps {
  open: boolean;
  studentName?: string;
  onClose: () => void;
  onSubmit: (payload: TambahCatatanPayload) => Promise<void>;
}

export function TambahCatatanModal({ open, studentName, onClose, onSubmit }: TambahCatatanModalProps) {
  const [topik, setTopik] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [tugasSelanjutnya, setTugasSelanjutnya] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Real-time clock state
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Capture startTime when modal opens; reset all state when it closes
  useEffect(() => {
    if (open) {
      const now = new Date();
      setStartTime(now);
      setCurrentTime(now);
    } else {
      setTopik('');
      setCatatan('');
      setTugasSelanjutnya('');
      setStartTime(null);
    }
  }, [open]);

  // Tick every second while modal is open and not yet submitting
  useEffect(() => {
    if (!open || isSubmitting) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [open, isSubmitting]);

  // Computed display values
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const displayStartTime = startTime ? formatTime(startTime) : '--:--:--';
  const endTimeDate = startTime ? new Date(startTime.getTime() + 60 * 60 * 1000) : null;
  const displayEndTime = endTimeDate ? formatTime(endTimeDate) : '--:--:--';
  const displayCurrentTime = formatTime(currentTime);

  // Helper to format a Date to "YYYY-MM-DD HH:MM:SS"
  const toDateTimeString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!topik.trim() || !catatan.trim() || !tugasSelanjutnya.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        topik: topik.trim(),
        catatan: catatan.trim(),
        tugasSelanjutnya: tugasSelanjutnya.trim(),
        startTime: startTime ? toDateTimeString(startTime) : undefined,
        endTime: endTimeDate ? toDateTimeString(endTimeDate) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      title="Tambah Catatan Bimbingan"
      subtitle={studentName ? `Tambahkan catatan hasil bimbingan untuk ${studentName}` : undefined}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Live Time Display */}
        <div className="rounded-lg border border-[#015023]/20 bg-[#E6F4EA] px-4 py-3">
          <p className="text-xs font-semibold text-[#015023] mb-2">⏱ Waktu Bimbingan (Real-time)</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Mulai</p>
              <p className="text-sm font-bold text-[#015023] tabular-nums">{displayStartTime}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sekarang</p>
              <p className="text-sm font-bold text-[#D4B54D] tabular-nums">{displayCurrentTime}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Selesai</p>
              <p className="text-sm font-bold text-[#015023] tabular-nums">{displayEndTime}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5 text-center">Waktu selesai = waktu mulai + 1 jam</p>
        </div>

        <div>
          <label className="text-sm font-medium text-[#015023]">Topik Pembahasan</label>
          <input
            type="text"
            value={topik}
            onChange={(event) => setTopik(event.target.value)}
            placeholder="Contoh: Review BAB 1"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#015023]">Catatan</label>
          <textarea
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            rows={4}
            placeholder="Tuliskan catatan, feedback, dan arahan untuk mahasiswa."
            className="mt-1 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#015023]">Tugas Selanjutnya</label>
          <textarea
            value={tugasSelanjutnya}
            onChange={(event) => setTugasSelanjutnya(event.target.value)}
            rows={3}
            placeholder="Tuliskan tugas selanjutnya untuk mahasiswa."
            className="mt-1 w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="default" className="" style={{}} onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="default" className="" style={{}} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}

interface AturJadwalModalProps {
  open: boolean;
  studentName?: string;
  onClose: () => void;
  onSubmit: (payload: AturJadwalPayload) => Promise<void>;
}

export function AturJadwalModal({ open, studentName, onClose, onSubmit }: AturJadwalModalProps) {
  const [tanggal, setTanggal] = useState<string>('');
  const [waktuMulai, setWaktuMulai] = useState<string>('');
  const [waktuSelesai, setWaktuSelesai] = useState<string>('');
  const [topik, setTopik] = useState<string>('');
  const [lokasi, setLokasi] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      setTanggal('');
      setWaktuMulai('');
      setWaktuSelesai('');
      setTopik('');
      setLokasi('');
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tanggal || !waktuMulai || !waktuSelesai || !topik.trim() || !lokasi.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        tanggal,
        waktuMulai,
        waktuSelesai,
        topik: topik.trim(),
        lokasi: lokasi.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={open}
      title="Atur Jadwal Bimbingan"
      subtitle={studentName ? `Buat jadwal bimbingan baru untuk ${studentName}` : undefined}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-[#015023]">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(event) => setTanggal(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#015023]">Waktu Mulai</label>
            <input
              type="time"
              value={waktuMulai}
              onChange={(event) => setWaktuMulai(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#015023]">Waktu Selesai</label>
            <input
              type="time"
              value={waktuSelesai}
              onChange={(event) => setWaktuSelesai(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#015023]">Topik Pembahasan</label>
          <input
            type="text"
            value={topik}
            onChange={(event) => setTopik(event.target.value)}
            placeholder="Contoh: Review BAB 3"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#015023]">Lokasi</label>
          <input
            type="text"
            value={lokasi}
            onChange={(event) => setLokasi(event.target.value)}
            placeholder="Contoh: Ruang Dosen A301"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/10"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="default" className="" style={{}} onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="default" className="" style={{}} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
