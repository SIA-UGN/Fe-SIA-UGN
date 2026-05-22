'use client';

import { useEffect, useState } from 'react';
// Hapus import { Save } dari lucide-react karena di desain referensi tidak pakai icon

const initialForm = {
    name: '',
};

export default function AdminCategoryModal({
    open,
    onClose,
    onSubmit,
    saving = false,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (!open) {
            setForm(initialForm);
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form.name.trim());
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm font-urbanist"
            onClick={(event) => {
                // Menutup modal jika klik di luar area modal (backdrop)
                if (event.target === event.currentTarget && !saving) onClose();
            }}
        >
            <form
                onSubmit={handleSubmit}
                // max-w-md membatasi lebarnya agar kecil dan rapi
                className="w-full max-w-md rounded-2xl bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-200"
            >
                <h2 className="text-[#2d3748] text-xl font-bold mb-6">
                    Tambah Kategori Baru
                </h2>

                <div className="mb-8">
                    <label htmlFor="library-category-name" className="sr-only">
                        Nama Kategori
                    </label>
                    <input
                        id="library-category-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Masukkan nama kategori baru (Contoh: Ekonomi)"
                        className="w-full h-[50px] rounded-xl border border-[#d1d5dc] px-4 text-[15px] outline-none transition-colors focus:border-[#015023] focus:ring-2 focus:ring-[#015023]/20 text-gray-800 placeholder-gray-400"
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl font-semibold text-[#4a5568] bg-[#e2e8f0] hover:bg-[#cbd5e1] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={saving || !form.name.trim()}
                        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#015023] hover:bg-[#013d1c] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
}