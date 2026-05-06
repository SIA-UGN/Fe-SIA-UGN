'use client';

import React from 'react';

/**
 * Komponen Timeline/Stepper untuk Progress Bimbingan
 * @param {number} currentStep - Langkah yang sedang aktif (1-5)
 */
export default function ProgressBimbingan({ currentStep = 1 }) {
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
                {/* Garis Latar Belakang (Connecting Line) */}
                {/* Karena ada 5 item, titik tengah item pertama ada di 10%, dan terakhir di 90%. Jadi lebarnya 80% */}
                <div className="absolute top-4 left-[10%] w-[80%] h-[2px] bg-gray-200 -z-10"></div>

                {steps.map((step) => {
                    // Logika Status: Aktif, Selesai (Past), atau Belum (Future)
                    const isActive = step.id === currentStep;
                    const isPast = step.id < currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center w-1/5 text-center">
                            
                            {/* Lingkaran / Dot */}
                            <div className="bg-white px-2 mb-3">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                                    isActive || isPast ? 'border-[#015023]' : 'border-gray-200'
                                }`}>
                                    <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                        isActive || isPast ? 'bg-[#015023]' : 'bg-gray-200'
                                    }`}></div>
                                </div>
                            </div>

                            {/* Teks Judul */}
                            <h4 className={`text-sm font-bold mb-1 transition-colors duration-300 ${
                                isActive ? 'text-[#015023]' : isPast ? 'text-gray-800' : 'text-gray-300'
                            }`}>
                                {step.title}
                            </h4>

                            {/* Teks Deskripsi */}
                            <p className={`text-xs px-1 md:px-4 leading-relaxed transition-colors duration-300 hidden sm:block ${
                                isActive || isPast ? 'text-gray-400' : 'text-gray-300'
                            }`}>
                                {step.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}