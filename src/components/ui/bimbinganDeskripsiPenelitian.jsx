'use client';

import React from 'react';

/**
 * Komponen untuk menampilkan Deskripsi Penelitian
 * @param {string} text - Isi deskripsi
 */
export default function DeskripsiPenelitian({ text }) {
    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-urbanist w-full">
            <h3 className="text-gray-800 text-lg font-bold mb-4">Deskripsi Penelitian</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
                {text || "Belum ada deskripsi penelitian yang ditambahkan."}
            </p>
        </div>
    );
}