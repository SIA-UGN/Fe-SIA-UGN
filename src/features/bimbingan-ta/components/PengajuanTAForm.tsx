'use client';

import { useState, useRef, useCallback } from 'react';
import { FileText, Upload, X, FileIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Dosen, CreateTAPayload } from '@/services/taService';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PengajuanTAFormProps {
  dosenList: Dosen[];
  isLoadingDosen?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (payload: CreateTAPayload) => void | Promise<void>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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
  const [title_ind, setTitleInd] = useState('');
  const [title_eng, setTitleEng] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDosen, setSelectedDosen] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Shared styles (matching AjukanForm exactly) ───────────────────
  const font: React.CSSProperties = { fontFamily: 'Urbanist, sans-serif' };

  const labelStyle: React.CSSProperties = {
    ...font,
    fontWeight: 600,
    fontSize: '15px',
    color: '#015023',
  };

  const inputStyle: React.CSSProperties = {
    ...font,
    fontSize: '14px',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#fff',
  };

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#16874B';
    e.target.style.boxShadow = '0 0 0 3px rgba(22, 135, 75, 0.1)';
  };
  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow = 'none';
  };

  const errorStyle: React.CSSProperties = {
    ...font,
    fontSize: '13px',
    color: '#BE0414',
    marginTop: '4px',
  };

  // ── File handling ─────────────────────────────────────────────────
  const validateAndSetFile = useCallback((f: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError('Ukuran file melebihi batas 10MB.');
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  }, [validateAndSetFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title_ind.trim() || !title_eng.trim() || !description.trim() || selectedDosen === '') return;
    onSubmit({
      title_ind: title_ind.trim(),
      title_eng: title_eng.trim(),
      description: description.trim(),
      id_lecturer: Number(selectedDosen),
      attachment_proposal: file ?? undefined,
    });
  };

  // ── Skeleton ──────────────────────────────────────────────────────
  if (isLoadingDosen) {
    return (
      <div className="bg-white shadow-lg overflow-hidden" style={{ borderRadius: '12px', ...font }}>
        <div className="text-white px-6 py-4 flex items-center gap-3" style={{ backgroundColor: '#015023' }}>
          <FileText size={20} />
          <span className="font-semibold">Formulir Pengajuan TA</span>
        </div>
        <div className="p-8 space-y-7">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ))}
          <div className="flex items-center justify-between pt-4">
            <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────
  return (
    <div className="bg-white shadow-lg overflow-hidden" style={{ borderRadius: '12px', ...font }}>
      {/* Card header */}
      <div
        className="text-white px-6 py-4 flex items-center gap-3"
        style={{ backgroundColor: '#015023', borderRadius: '12px 12px 0 0' }}
      >
        <FileText size={20} />
        <span className="font-semibold text-base">Formulir Pengajuan TA</span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Submit error banner */}
        {error && (
          <div
            className="p-4 text-sm"
            style={{ backgroundColor: '#FEF2F2', color: '#BE0414', borderRadius: '12px', border: '1px solid #FECACA', ...font }}
          >
            {error}
          </div>
        )}

        {/* ── Judul TA (Bahasa Indonesia) ───────────────────── */}
        <div>
          <label style={labelStyle}>
            Judul Tugas Akhir (Bahasa Indonesia) <span style={{ color: '#BE0414' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={title_ind}
            onChange={(e) => setTitleInd(e.target.value)}
            placeholder="Masukkan judul tugas akhir dalam Bahasa Indonesia"
            style={{ ...inputStyle, marginTop: '8px' }}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          />
        </div>

        {/* ── Judul TA (Bahasa Inggris) ────────────────────── */}
        <div>
          <label style={labelStyle}>
            Judul Tugas Akhir (Bahasa Inggris) <span style={{ color: '#BE0414' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={title_eng}
            onChange={(e) => setTitleEng(e.target.value)}
            placeholder="Enter thesis title in English"
            style={{ ...inputStyle, marginTop: '8px' }}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          />
        </div>

        {/* ── Calon Dosen Pembimbing ────────────────────────── */}
        <div>
          <label style={labelStyle}>
            Calon Dosen Pembimbing <span style={{ color: '#BE0414' }}>*</span>
          </label>
          <select
            required
            value={selectedDosen}
            onChange={(e) => setSelectedDosen(e.target.value === '' ? '' : Number(e.target.value))}
            style={{
              ...inputStyle,
              marginTop: '8px',
              color: selectedDosen !== '' ? '#111' : '#9CA3AF',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              paddingRight: '40px',
            }}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          >
            <option value="" disabled>Pilih Dosen Pembimbing</option>
            {dosenList.map((d) => (
              <option key={d.id_user_si} value={d.id_user_si} style={{ color: '#111' }}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* ── Ringkasan / Deskripsi Proposal ───────────────── */}
        <div>
          <label style={labelStyle}>
            Ringkasan/Deskripsi Proposal <span style={{ color: '#BE0414' }}>*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan ringkasan proposal tugas akhir Anda..."
            style={{ ...inputStyle, marginTop: '8px', resize: 'vertical', minHeight: '120px' }}
            onFocus={inputFocusHandler}
            onBlur={inputBlurHandler}
          />
          <div className="flex justify-end" style={{ marginTop: '4px' }}>
            <span style={{ ...font, fontSize: '13px', color: '#9CA3AF' }}>
              {description.length} karakter
            </span>
          </div>
        </div>

        {/* ── Upload Proposal ──────────────────────────────── */}
        <div>
          <label style={labelStyle}>
            Upload Proposal{' '}
            <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(PDF/DOC)</span>
          </label>

          {file ? (
            <div
              className="flex items-center gap-3 p-4"
              style={{ marginTop: '8px', borderRadius: '12px', border: '1px solid #d1d5db', backgroundColor: '#F9FAFB' }}
            >
              <FileIcon size={20} style={{ color: '#16874B', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ ...font, fontSize: '14px', fontWeight: 500, color: '#015023' }}>
                  {file.name}
                </p>
                <p style={{ ...font, fontSize: '12px', color: '#9CA3AF' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FEE2E2', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                <X size={16} style={{ color: '#BE0414' }} />
              </button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-10"
              style={{
                marginTop: '8px',
                borderRadius: '12px',
                border: dragActive ? '2px dashed #16874B' : '2px dashed #d1d5db',
                backgroundColor: dragActive ? '#F0FDF4' : '#FAFAFA',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#E6EEE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={22} style={{ color: '#16874B' }} />
              </div>
              <p style={{ ...font, fontWeight: 600, fontSize: '14px', color: '#015023' }}>
                Seret &amp; lepas file di sini
              </p>
              <p style={{ ...font, fontSize: '13px', color: '#6b7280' }}>
                atau{' '}
                <span style={{ textDecoration: 'underline', color: '#015023', fontWeight: 500 }}>klik untuk memilih file</span>
              </p>
              <p style={{ ...font, fontSize: '12px', color: '#9CA3AF' }}>PDF, DOC, DOCX hingga 10MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileError && <p style={errorStyle}>{fileError}</p>}
        </div>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/bimbingan/pengajuan">
            <Button type="button" variant="outline" size="default" className="" style={{}}>Batal</Button>
          </Link>
          <Button type="submit" variant="primary" size="default" className="" style={{ minWidth: '160px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </Button>
        </div>
      </form>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Props                                                              */

