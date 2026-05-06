'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, FileText, GraduationCap, Calendar, BookOpen, User, CalendarDays } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. KOMPONEN KARTU DETAIL MAHASISWA (Hijau Gelap)
// ----------------------------------------------------------------------
function StudentThesisCard({ 
    name = "Hasan Fahrezi",
    nim = "2022010001",
    programStudi = "Teknik Informatika",
    semester = "8",
    email = "hasan@student.ugn.ac.id",
    status = "Menunggu Approval",
    ipk = "3.72",
    judulId = "Implementasi Deep Learning untuk Klasifikasi Citra Medis",
    judulEn = "Implementation of Deep Learning for Medical Image Classification"
}) {
    const getInitials = (name) => {
        if (!name) return 'UN';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

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
                            <span>{programStudi}</span>
                            <span className="mx-1.5">·</span>
                            <span>Semester {semester}</span>
                        </div>
                        <div className="text-sm text-white/60 mt-0.5">{email}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-bold text-amber-600">{status}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full border border-white/20 bg-black/10">
                        <span className="text-xs font-medium text-white/90 tracking-wide">IPK {ipk}</span>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-white/10 my-5"></div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-white/50 tracking-wider uppercase font-semibold mb-1">
                    Judul Tugas Akhir
                </span>
                <h4 className="text-white text-lg font-bold leading-snug">{judulId}</h4>
                <p className="text-white/60 text-sm italic leading-snug">{judulEn}</p>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 2. KOMPONEN PROGRESS BIMBINGAN
// ----------------------------------------------------------------------
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
                <div className="absolute top-4 left-[10%] w-[80%] h-[2px] bg-gray-200 -z-10"></div>
                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isPast = step.id < currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center w-1/5 text-center">
                            <div className="bg-white px-2 mb-3">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isActive || isPast ? 'border-[#015023]' : 'border-gray-200'}`}>
                                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isActive || isPast ? 'bg-[#015023]' : 'bg-gray-200'}`}></div>
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

// ----------------------------------------------------------------------
// 3. KOMPONEN DESKRIPSI PENELITIAN
// ----------------------------------------------------------------------
function DeskripsiPenelitian({ text }) {
    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
            <h3 className="text-gray-800 text-lg font-bold mb-4">Deskripsi Penelitian</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
                {text || "Belum ada deskripsi penelitian yang ditambahkan."}
            </p>
        </div>
    );
}

// ----------------------------------------------------------------------
// 4. KOMPONEN CATATAN BIMBINGAN
// ----------------------------------------------------------------------
function CatatanBimbingan() {
    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-gray-700" />
                <h3 className="text-gray-800 text-lg font-bold">Catatan Bimbingan</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                <MessageSquare className="w-10 h-10 mb-3 opacity-50" strokeWidth={1.5} />
                <p className="text-sm font-medium">Belum ada catatan bimbingan</p>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 5. KOMPONEN INFO PENGAJUAN (BARU)
// ----------------------------------------------------------------------
function InfoPengajuan() {
    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
            <h3 className="text-gray-800 text-lg font-bold mb-6">Info Pengajuan</h3>
            
            {/* Grid Informasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">ID Pengajuan</p>
                        <p className="text-sm font-medium text-gray-800">TA-2026-001</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Program Studi</p>
                        <p className="text-sm font-medium text-gray-800">Teknik Informatika</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Tanggal Pengajuan</p>
                        <p className="text-sm font-medium text-gray-800">08 Mar 2026</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Semester</p>
                        <p className="text-sm font-medium text-gray-800">Semester 8</p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100 my-6"></div>

            {/* Dokumen Proposal */}
            <div>
                <p className="text-xs text-gray-400 mb-3">Dokumen Proposal</p>
                <div className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0">
                        <FileText className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Proposal_Hasan_TA.pdf</p>
                        <p className="text-xs text-gray-400 mt-0.5">2.4 MB</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 6. KOMPONEN DOSEN PEMBIMBING (BARU)
// ----------------------------------------------------------------------
function DosenPembimbingInfo() {
    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
            <h3 className="text-gray-800 text-lg font-bold mb-6">Dosen Pembimbing</h3>
            <div className="flex flex-col items-center justify-center py-8">
                <User className="w-10 h-10 text-gray-300 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-gray-400 font-medium">Belum ada dosen pembimbing</p>
                <p className="text-xs text-gray-300 mt-1">Menunggu approval pengajuan</p>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 7. KOMPONEN JADWAL BIMBINGAN (BARU)
// ----------------------------------------------------------------------
function JadwalBimbingan() {
    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
            <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-[#015023]" />
                <h3 className="text-[#015023] text-lg font-bold">Jadwal Bimbingan</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                <Calendar className="w-10 h-10 mb-3 opacity-50" strokeWidth={1.5} />
                <p className="text-sm font-medium">Belum ada jadwal</p>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// HALAMAN UTAMA (Hanya ada 1 Export Default)
// ----------------------------------------------------------------------
export default function DetailPengajuanPage() {
    return (
        <div className="min-h-screen bg-[#f3f6f4] font-urbanist pb-12">
            
            {/* Navigasi / Header */}
            <div className="pt-6 px-6 max-w-6xl mx-auto">
                <Link 
                    href="/adminpage/thesis" 
                    className="inline-flex items-center gap-2 text-[#015023] font-semibold text-sm mb-4 hover:opacity-80 transition-opacity"
                >
                    <ArrowLeft size={16} />
                    Monitoring Pengajuan TA
                </Link>
                
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#015023]">Monitoring Pengajuan TA</h1>
                    <p className="text-gray-500 text-sm mt-1">Pantau status pengajuan judul tugas akhir seluruh mahasiswa</p>
                </div>
            </div>

            {/* Container Konten Utama */}
            <div className="max-w-6xl mx-auto px-6 space-y-5">
                
                {/* 1. Kartu Mahasiswa (Hijau Gelap) */}
                <StudentThesisCard />

                {/* 2. Stepper Progress */}
                <ProgressBimbingan currentStep={1} />

                {/* 3. Deskripsi Penelitian */}
                <DeskripsiPenelitian 
                    text="Penelitian ini bertujuan untuk mengembangkan sistem klasifikasi citra medis menggunakan Convolutional Neural Network (CNN) untuk membantu diagnosis penyakit. Sistem akan dilatih menggunakan dataset citra X-Ray dan CT Scan dengan akurasi target minimal 90%." 
                />

                {/* 4. Catatan Bimbingan */}
                <CatatanBimbingan />

                {/* 5. Info Pengajuan (BARU) */}
                <InfoPengajuan />


                {/* 6. Dosen Pembimbing (BARU) */}
                <DosenPembimbingInfo />

                {/* 7. Jadwal Bimbingan (BARU) */}
                <JadwalBimbingan />



            </div>
        </div>
    );
}