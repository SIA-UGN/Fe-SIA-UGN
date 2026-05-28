'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminThesisApi } from '@/features/bimbingan-ta/api/admin';
import {
  ArrowLeft, MessageSquare, FileText, GraduationCap,
  Calendar, BookOpen, User, CalendarDays,
  Loader2, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch {
    return value;
  }
};

const mapStatus = (item) => {
  if (!item) return 'Menunggu Approval';
  const request = item.thesis_lecturers?.[0];
  if (request) {
    if (request.status === 'accepted') return 'Approved';
    if (request.status === 'rejected') return 'Ditolak';
    return 'Menunggu Approval';
  }
  const s = (item.status || '').toLowerCase();
  if (s === 'on_progress' || s === 'revision' || s === 'finished') return 'Approved';
  return 'Menunggu Approval';
};

const getProgressStep = (item) => {
  if (!item) return 1;
  const s = (item.status || '').toLowerCase();
  if (s === 'finished') return 5;
  if (s === 'on_progress') {
    const hasConsultations = (item.supervisors?.[0]?.consultations?.length ?? 0) > 0;
    return hasConsultations ? 4 : 3;
  }
  if (s === 'revision') return 4;
  const hasSupervisor = (item.supervisors?.length ?? 0) > 0;
  if (hasSupervisor) return 3;
  const request = item.thesis_lecturers?.[0];
  if (request?.status === 'accepted') return 3;
  if (request?.status === 'pending') return 2;
  return 1;
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function StudentThesisCard({ data }) {
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const statusLabel = mapStatus(data);
  const statusColor =
    statusLabel === 'Approved' ? 'text-green-600' :
    statusLabel === 'Ditolak' ? 'text-red-600' :
    'text-amber-600';
  const dotColor =
    statusLabel === 'Approved' ? 'bg-green-500' :
    statusLabel === 'Ditolak' ? 'bg-red-500' :
    'bg-amber-500';

  const name = data?.student?.name ?? '-';
  const nim = data?.student?.username ?? '-';
  const prodi = data?.program?.name ?? '-';
  const judulId = data?.title_ind ?? '-';
  const judulEn = data?.title_eng ?? '';

  return (
    <div
      className="w-full rounded-2xl p-6 shadow-lg flex flex-col"
      style={{ backgroundColor: '#015023', fontFamily: 'Urbanist, sans-serif' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-inner"
            style={{ backgroundColor: '#DABC4E' }}
          >
            {getInitials(name)}
          </div>
          <div className="flex flex-col">
            <h3 className="text-white text-xl font-bold tracking-wide">{name}</h3>
            <div className="text-sm text-white/70 mt-0.5">
              <span>{nim}</span>
              <span className="mx-1.5">·</span>
              <span>{prodi}</span>
            </div>
            <div className="text-sm text-white/60 mt-0.5">{data?.student?.email ?? ''}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span className={`text-xs font-bold ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 my-5" />

      <div className="flex flex-col gap-1">
        <span className="text-xs text-white/50 tracking-wider uppercase font-semibold mb-1">
          Judul Tugas Akhir
        </span>
        <h4 className="text-white text-lg font-bold leading-snug">{judulId}</h4>
        {judulEn && <p className="text-white/60 text-sm italic leading-snug">{judulEn}</p>}
      </div>
    </div>
  );
}

function ProgressBimbingan({ currentStep = 1 }) {
  const steps = [
    { id: 1, title: 'Pengajuan', desc: 'Mahasiswa mengajukan judul' },
    { id: 2, title: 'Review Dosen', desc: 'Dosen meninjau pengajuan' },
    { id: 3, title: 'Penetapan Pembimbing', desc: 'Dosen pembimbing ditetapkan' },
    { id: 4, title: 'Bimbingan Aktif', desc: 'Proses bimbingan berlangsung' },
    { id: 5, title: 'Sidang TA', desc: 'Siap untuk sidang' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
      <h3 className="text-gray-800 text-lg font-bold mb-8">Progress Bimbingan</h3>
      <div className="relative flex justify-between items-start w-full z-0">
        <div className="absolute top-4 left-[10%] w-[80%] h-[2px] bg-gray-200 -z-10" />
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isPast = step.id < currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center w-1/5 text-center">
              <div className="bg-white px-2 mb-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isActive || isPast ? 'border-[#015023]' : 'border-gray-200'}`}>
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isActive || isPast ? 'bg-[#015023]' : 'bg-gray-200'}`} />
                </div>
              </div>
              <h4 className={`text-sm font-bold mb-1 transition-colors duration-300 ${isActive ? 'text-[#015023]' : isPast ? 'text-gray-800' : 'text-gray-300'}`}>
                {step.title}
              </h4>
              <p className={`text-[11px] px-1 md:px-4 leading-relaxed transition-colors duration-300 hidden sm:block ${isActive || isPast ? 'text-gray-400' : 'text-gray-300'}`}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeskripsiPenelitian({ text }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
      <h3 className="text-gray-800 text-lg font-bold mb-4">Deskripsi Penelitian</h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {text || 'Belum ada deskripsi penelitian yang ditambahkan.'}
      </p>
    </div>
  );
}

function CatatanBimbingan({ consultations = [] }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-gray-700" />
        <h3 className="text-gray-800 text-lg font-bold">Catatan Bimbingan</h3>
        {consultations.length > 0 && (
          <span className="ml-auto text-xs bg-[#015023] text-white px-2.5 py-1 rounded-full font-bold">
            {consultations.length}
          </span>
        )}
      </div>
      {consultations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-300">
          <MessageSquare className="w-10 h-10 mb-3 opacity-50" strokeWidth={1.5} />
          <p className="text-sm font-medium">Belum ada catatan bimbingan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {consultations.map((c, idx) => (
            <div key={c.id_consultation ?? idx} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-gray-800">{c.subject}</span>
                <span className="text-xs text-gray-400">{formatDate(c.consultation_date)}</span>
              </div>
              {c.lecturer_notes && (
                <p className="text-sm text-gray-500 leading-relaxed">{c.lecturer_notes}</p>
              )}
              {c.next_task && (
                <p className="text-xs text-[#015023] font-semibold mt-2">
                  Tugas Selanjutnya: {c.next_task}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoPengajuan({ data }) {
  const idPengajuan = data?.id_student_thesis
    ? `TA-${String(data.id_student_thesis).padStart(4, '0')}`
    : '-';
  const prodi = data?.program?.name ?? '-';
  const tgl = formatDate(data?.created_at);
  const proposal = data?.attachment_proposal;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
      <h3 className="text-gray-800 text-lg font-bold mb-6">Info Pengajuan</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">ID Pengajuan</p>
            <p className="text-sm font-medium text-gray-800">{idPengajuan}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Program Studi</p>
            <p className="text-sm font-medium text-gray-800">{prodi}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tanggal Pengajuan</p>
            <p className="text-sm font-medium text-gray-800">{tgl}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Topik</p>
            <p className="text-sm font-medium text-gray-800">{data?.topic ?? data?.thesis_topic?.topic ?? '-'}</p>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 my-6" />

      <div>
        <p className="text-xs text-gray-400 mb-3">Dokumen Proposal</p>
        {proposal ? (
          <a
            href={proposal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0">
              <FileText className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Proposal.pdf</p>
              <p className="text-xs text-gray-400 mt-0.5">Klik untuk membuka</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        ) : (
          <div className="flex items-center gap-4 p-3 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
            <div className="p-3 bg-gray-100 text-gray-300 rounded-xl shrink-0">
              <FileText className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-sm text-gray-400">Belum ada dokumen proposal</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DosenPembimbingInfo({ data }) {
  const supervisors = data?.supervisors ?? [];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
      <h3 className="text-gray-800 text-lg font-bold mb-6">Dosen Pembimbing</h3>
      {supervisors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <User className="w-10 h-10 text-gray-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-400 font-medium">Belum ada dosen pembimbing</p>
          <p className="text-xs text-gray-300 mt-1">Menunggu approval pengajuan</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {supervisors.map((sup, idx) => (
            <div key={sup.id_supervisor ?? idx} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#015023] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {(sup.lecturer?.name ?? '-').split(' ').map((n) => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{sup.lecturer?.name ?? '-'}</p>
                <p className="text-xs text-gray-400">{sup.lecturer?.email ?? ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JadwalBimbingan({ data }) {
  const consultations = data?.supervisors?.[0]?.consultations ?? [];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="w-5 h-5 text-[#015023]" />
        <h3 className="text-[#015023] text-lg font-bold">Jadwal Bimbingan</h3>
      </div>
      {consultations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-300">
          <Calendar className="w-10 h-10 mb-3 opacity-50" strokeWidth={1.5} />
          <p className="text-sm font-medium">Belum ada jadwal</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {consultations.slice().sort((a, b) =>
            new Date(b.consultation_date) - new Date(a.consultation_date)
          ).map((c, idx) => (
            <div key={c.id_consultation ?? idx} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="p-2 bg-green-50 rounded-lg text-green-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{c.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(c.consultation_date)}
                  {c.location && ` · ${c.location}`}
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                c.status === 'finished'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-yellow-50 text-yellow-600'
              }`}>
                {c.status === 'finished' ? 'Selesai' : 'Berlangsung'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DetailPengajuanPage() {
  const params = useParams();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminThesisApi.getStudentDetail(Number(id));
      setData(result);
    } catch (err) {
      setError(
        err?.userMessage ?? err?.message ?? 'Gagal memuat detail pengajuan TA.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f6f4] font-urbanist flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-[#015023]" />
          <p className="text-sm font-medium">Memuat detail pengajuan...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f3f6f4] font-urbanist flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h3 className="text-lg font-bold text-gray-800">Gagal Memuat Data</h3>
          <p className="text-sm text-gray-500">{error ?? 'Data tidak ditemukan.'}</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 bg-[#015023] hover:bg-[#013d1b] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
            <Link
              href="/adminpage/thesis/consultations"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const consultations = data?.supervisors?.[0]?.consultations ?? [];
  const progressStep = getProgressStep(data);

  return (
    <div className="min-h-screen bg-[#f3f6f4] font-urbanist pb-12">

      {/* Navigasi / Header */}
      <div className="pt-6 px-6 max-w-6xl mx-auto">
        <Link
          href="/adminpage/thesis/consultations"
          className="inline-flex items-center gap-2 text-[#015023] font-semibold text-sm mb-4 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={16} />
          Monitoring Pengajuan TA
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#015023]">Detail Pengajuan TA</h1>
          <p className="text-gray-500 text-sm mt-1">
            ID: TA-{String(data.id_student_thesis).padStart(4, '0')} · {data?.student?.name ?? ''}
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-6xl mx-auto px-6 space-y-5">

        {/* 1. Kartu Mahasiswa */}
        <StudentThesisCard data={data} />

        {/* 2. Stepper Progress */}
        <ProgressBimbingan currentStep={progressStep} />

        {/* 3. Deskripsi Penelitian */}
        <DeskripsiPenelitian text={data?.description} />

        {/* 4. Catatan Bimbingan */}
        <CatatanBimbingan consultations={consultations} />

        {/* 5. Info Pengajuan */}
        <InfoPengajuan data={data} />

        {/* 6. Dosen Pembimbing */}
        <DosenPembimbingInfo data={data} />

        {/* 7. Jadwal Bimbingan */}
        <JadwalBimbingan data={data} />

      </div>
    </div>
  );
}