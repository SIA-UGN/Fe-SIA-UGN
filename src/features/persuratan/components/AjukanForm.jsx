'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FileText, Upload, X, FileIcon } from 'lucide-react';
import { Button, OutlineButton } from '@/components/ui/button';

// ── Zod Validation Schema ──────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];

const ajukanSchema = z.object({
    title: z.string().min(1, 'Judul surat wajib diisi'),
    category_id: z.string().min(1, 'Kategori persuratan wajib dipilih'),
    recipient_id: z.string().min(1, 'Tujuan wajib dipilih'),
    body: z.string().min(1, 'Deskripsi surat wajib diisi'),
});

// ── Presentational Form Component ──────────────────────────────────
export default function AjukanForm({
    categories = [],
    recipients = [],
    isLoading = false,
    isSubmitting = false,
    submitError = null,
    onSubmit,
}) {
    const [attachment, setAttachment] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState(null);
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ajukanSchema),
        defaultValues: {
            title: '',
            category_id: '',
            recipient_id: '',
            body: '',
        },
    });

    const bodyValue = watch('body');

    // ── File handling ────────────────────────────────────────────────
    const validateAndSetFile = useCallback((file) => {
        setFileError(null);
        if (!file) return;

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setFileError('Format file tidak didukung. Gunakan PDF, DOC, JPG, atau PNG.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError('Ukuran file melebihi batas 10MB.');
            return;
        }
        setAttachment(file);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    }, [validateAndSetFile]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }, []);

    const handleFileChange = useCallback((e) => {
        if (e.target.files?.[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    }, [validateAndSetFile]);

    const removeFile = useCallback(() => {
        setAttachment(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    // ── Submit handler ───────────────────────────────────────────────
    const handleFormSubmit = handleSubmit((data) => {
        onSubmit({ ...data, attachment });
    });

    // ── Shared styles ────────────────────────────────────────────────
    const labelStyle = {
        fontFamily: 'Urbanist, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        color: '#015023',
    };

    const inputStyle = {
        fontFamily: 'Urbanist, sans-serif',
        fontSize: '14px',
        borderRadius: '12px',
        border: '1px solid #d1d5db',
        padding: '12px 16px',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: '#fff',
    };

    const inputFocusHandler = (e) => {
        e.target.style.borderColor = '#16874B';
        e.target.style.boxShadow = '0 0 0 3px rgba(22, 135, 75, 0.1)';
    };

    const inputBlurHandler = (e) => {
        e.target.style.borderColor = '#d1d5db';
        e.target.style.boxShadow = 'none';
    };

    const errorStyle = {
        fontFamily: 'Urbanist, sans-serif',
        fontSize: '13px',
        color: '#BE0414',
        marginTop: '4px',
    };

    // ── Loading skeleton ─────────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                className="bg-white shadow-lg overflow-hidden"
                style={{ borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
            >
                <div
                    className="text-white px-6 py-4 flex items-center gap-3"
                    style={{ backgroundColor: '#015023' }}
                >
                    <FileText size={20} />
                    <span className="font-semibold">Formulir Pengajuan Keluhan</span>
                </div>
                <div className="p-8 space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Main form ─────────────────────────────────────────────────────
    return (
        <div
            className="bg-white shadow-lg overflow-hidden"
            style={{ borderRadius: '12px', fontFamily: 'Urbanist, sans-serif' }}
        >
            {/* Card header */}
            <div
                className="text-white px-6 py-4 flex items-center gap-3"
                style={{ backgroundColor: '#015023', borderRadius: '12px 12px 0 0' }}
            >
                <FileText size={20} />
                <span className="font-semibold text-base">Formulir Pengajuan Keluhan</span>
            </div>

            {/* Form body */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
                {/* Submit error banner */}
                {submitError && (
                    <div
                        className="p-4 text-sm"
                        style={{
                            backgroundColor: '#FEF2F2',
                            color: '#BE0414',
                            borderRadius: '12px',
                            border: '1px solid #FECACA',
                            fontFamily: 'Urbanist, sans-serif',
                        }}
                    >
                        {submitError}
                    </div>
                )}

                {/* Judul Surat */}
                <div>
                    <label htmlFor="title" style={labelStyle}>
                        Judul Surat <span style={{ color: '#BE0414' }}>*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Masukkan judul surat Anda"
                        style={{ ...inputStyle, marginTop: '8px' }}
                        onFocus={inputFocusHandler}
                        onBlur={inputBlurHandler}
                        {...register('title')}
                    />
                    {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
                </div>

                {/* Kategori + Tujuan — side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Kategori Persuratan */}
                    <div>
                        <label htmlFor="category_id" style={labelStyle}>
                            Kategori Persuratan <span style={{ color: '#BE0414' }}>*</span>
                        </label>
                        <select
                            id="category_id"
                            style={{
                                ...inputStyle,
                                marginTop: '8px',
                                color: watch('category_id') ? '#111' : '#9CA3AF',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '40px',
                            }}
                            onFocus={inputFocusHandler}
                            onBlur={inputBlurHandler}
                            {...register('category_id')}
                        >
                            <option key="__default_category" value="" disabled>
                                Pilih Kategori Surat
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.id_category} value={cat.id_category} style={{ color: '#111' }}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p style={errorStyle}>{errors.category_id.message}</p>
                        )}
                    </div>

                    {/* Tujuan */}
                    <div>
                        <label htmlFor="recipient_id" style={labelStyle}>
                            Tujuan <span style={{ color: '#BE0414' }}>*</span>
                        </label>
                        <select
                            id="recipient_id"
                            style={{
                                ...inputStyle,
                                marginTop: '8px',
                                color: watch('recipient_id') ? '#111' : '#9CA3AF',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                paddingRight: '40px',
                            }}
                            onFocus={inputFocusHandler}
                            onBlur={inputBlurHandler}
                            {...register('recipient_id')}
                        >
                            <option key="__default_recipient" value="" disabled>
                                Pilih Tujuan
                            </option>
                            {recipients.map((rec) => (
                                <option key={rec.id_recipient} value={rec.id_recipient} style={{ color: '#111' }}>
                                    {rec.name}
                                </option>
                            ))}
                        </select>
                        {errors.recipient_id && (
                            <p style={errorStyle}>{errors.recipient_id.message}</p>
                        )}
                    </div>
                </div>

                {/* Deskripsi Surat */}
                <div>
                    <label htmlFor="body" style={labelStyle}>
                        Deskripsi Surat <span style={{ color: '#BE0414' }}>*</span>
                    </label>
                    <textarea
                        id="body"
                        rows={5}
                        placeholder="Jelaskan permohonan Anda secara rinci..."
                        style={{
                            ...inputStyle,
                            marginTop: '8px',
                            resize: 'vertical',
                            minHeight: '120px',
                        }}
                        onFocus={inputFocusHandler}
                        onBlur={inputBlurHandler}
                        {...register('body')}
                    />
                    <div
                        className="flex justify-between items-center"
                        style={{ marginTop: '4px' }}
                    >
                        {errors.body ? (
                            <p style={errorStyle}>{errors.body.message}</p>
                        ) : (
                            <span />
                        )}
                        <span
                            style={{
                                fontFamily: 'Urbanist, sans-serif',
                                fontSize: '13px',
                                color: '#9CA3AF',
                            }}
                        >
                            {bodyValue?.length || 0} karakter
                        </span>
                    </div>
                </div>

                {/* Lampiran (opsional) */}
                <div>
                    <label style={labelStyle}>
                        Lampiran <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(opsional)</span>
                    </label>

                    {!attachment ? (
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
                                border: dragActive
                                    ? '2px dashed #16874B'
                                    : '2px dashed #d1d5db',
                                backgroundColor: dragActive ? '#F0FDF4' : '#FAFAFA',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '50%',
                                    backgroundColor: '#E6EEE9',
                                }}
                            >
                                <Upload size={22} style={{ color: '#16874B' }} />
                            </div>
                            <p
                                style={{
                                    fontFamily: 'Urbanist, sans-serif',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    color: '#015023',
                                }}
                            >
                                Seret &amp; lepas file di sini
                            </p>
                            <p style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '13px', color: '#6b7280' }}>
                                atau{' '}
                                <span style={{ textDecoration: 'underline', color: '#015023', fontWeight: 500 }}>
                                    klik untuk memilih file
                                </span>
                            </p>
                            <p style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '12px', color: '#9CA3AF' }}>
                                PDF, DOC, JPG, PNG hingga 10MB
                            </p>
                        </div>
                    ) : (
                        <div
                            className="flex items-center gap-3 p-4"
                            style={{
                                marginTop: '8px',
                                borderRadius: '12px',
                                border: '1px solid #d1d5db',
                                backgroundColor: '#F9FAFB',
                            }}
                        >
                            <FileIcon size={20} style={{ color: '#16874B', flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="truncate"
                                    style={{
                                        fontFamily: 'Urbanist, sans-serif',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#015023',
                                    }}
                                >
                                    {attachment.name}
                                </p>
                                <p
                                    style={{
                                        fontFamily: 'Urbanist, sans-serif',
                                        fontSize: '12px',
                                        color: '#9CA3AF',
                                    }}
                                >
                                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="flex items-center justify-center hover:opacity-70 transition-opacity"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#FEE2E2',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <X size={16} style={{ color: '#BE0414' }} />
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {fileError && <p style={errorStyle}>{fileError}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    <Link href="/persuratan/status">
                        <OutlineButton type="button">Batal</OutlineButton>
                    </Link>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        style={{ minWidth: '160px' }}
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
