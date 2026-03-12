'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ClipboardList, Upload, ChevronDown } from 'lucide-react';
import type { Dosen, CreateTAPayload } from '@/services/taService';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PengajuanTAFormProps {
  dosenList: Dosen[];
  isLoadingDosen?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (payload: CreateTAPayload) => void | Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PengajuanTAForm({
  dosenList,
  isLoadingDosen,
  isSubmitting,
  error,
  onSubmit,
}: PengajuanTAFormProps) {
  /* ── Local state ─────────────────────────────────────────── */
  const [judul, setJudul] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [selectedDosen, setSelectedDosen] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Drag & drop handlers ────────────────────────────────── */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !ringkasan.trim() || selectedDosen === '') return;
    onSubmit({
      judul: judul.trim(),
      ringkasan: ringkasan.trim(),
      id_dosen: Number(selectedDosen),
      file,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
        {/* ── Dark-green header ──────────────────────────────── */}
        <div
          className="flex items-center gap-2 px-5 py-3.5 rounded-t-lg"
          style={{ backgroundColor: '#015023' }}
        >
          <ClipboardList className="h-5 w-5 text-white" />
          <h2
            className="text-white font-semibold text-base"
            style={{ fontFamily: 'Urbanist, sans-serif' }}
          >
            Formulir Pengajuan Baru
          </h2>
        </div>

        {/* ── Form body ─────────────────────────────────────── */}
        <div
          className="bg-white p-6 sm:p-8 space-y-6"
          style={{ fontFamily: 'Urbanist, sans-serif' }}
        >
          {/* Error banner */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Judul TA ─────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Judul Tugas Akhir <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul tugas akhir Anda"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#015023] focus:ring-1 focus:ring-[#015023]"
            />
          </div>

          {/* ── Ringkasan / Deskripsi ────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ringkasan/Deskripsi Proposal <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              placeholder="Jelaskan ringkasan proposal tugas akhir Anda..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none transition-colors focus:border-[#015023] focus:ring-1 focus:ring-[#015023]"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {ringkasan.length} karakter
            </p>
          </div>

          {/* ── Dosen Pembimbing ─────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Calon Dosen Pembimbing <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={selectedDosen}
                onChange={(e) => setSelectedDosen(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isLoadingDosen}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 outline-none transition-colors focus:border-[#015023] focus:ring-1 focus:ring-[#015023] disabled:opacity-50"
              >
                <option value="" disabled>
                  {isLoadingDosen ? 'Memuat dosen...' : 'Pilih Dosen Pembimbing'}
                </option>
                {dosenList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* ── File Upload ──────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Upload Proposal (PDF/DOC)
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-10 flex flex-col items-center justify-center transition-colors ${
                dragActive
                  ? 'border-[#015023] bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              {/* Circle icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full mb-3"
                style={{ backgroundColor: '#E6EEE9' }}
              >
                <Upload className="h-5 w-5" style={{ color: '#015023' }} />
              </div>

              {file ? (
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    Seret &amp; lepas file di sini
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    atau klik untuk memilih file PDF, DOC, DOCX hingga 10MB
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* ── Submit button ────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#015023' }}
          >
            {isSubmitting ? 'Mengirim...' : 'Submit Pengajuan'}
          </button>
        </div>
      </div>
    </form>
  );
}
