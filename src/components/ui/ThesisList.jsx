import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle, Circle } from 'lucide-react';

export default function RecentThesisList({ data = [] }) {
    // Fungsi bantu untuk mengambil 2 huruf awal dari nama (Contoh: "Hasan Fahrezi" -> "HF")
    const getInitials = (name) => {
        if (!name) return 'UN';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Fungsi bantu untuk merender badge status beserta warna dan ikonnya
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]">
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                        <span className="text-xs font-semibold">Approved</span>
                    </div>
                );
            case 'ditolak':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fecaca] bg-[#fef2f2] text-[#991b1b]">
                        <XCircle size={14} strokeWidth={2.5} />
                        <span className="text-xs font-semibold">Ditolak</span>
                    </div>
                );
            case 'pending':
            default:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#fef08a] bg-[#fefce8] text-[#a16207]">
                        <Circle size={10} className="fill-[#eab308] text-[#eab308]" />
                        <span className="text-xs font-semibold">Menunggu Approval</span>
                    </div>
                );
        }
    };

    return (
        <div className="mt-8 font-urbanist">
            {/* Bagian Header: Judul dan Link Lihat Semua */}
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl font-bold text-[#015023]">Pengajuan TA Terbaru</h2>
                <Link 
                    href="/adminpage/thesis/students" 
                    className="flex items-center text-sm font-semibold text-[#015023] hover:text-[#013d1c] transition-colors group"
                >
                    Lihat semua 
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Bagian Container List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                {data.map((item, index) => (
                    <div 
                        key={item.id} 
                        // Tambahkan garis bawah kecuali untuk item terakhir
                        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                            index !== data.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                    >
                        {/* Kiri: Avatar & Info */}
                        <div className="flex items-start gap-4">
                            {/* Avatar Lingkaran */}
                            <div className="w-10 h-10 rounded-full bg-[#015023] text-white flex items-center justify-center font-bold shrink-0 text-sm">
                                {getInitials(item.name)}
                            </div>

                            {/* Teks Info */}
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm mb-0.5">{item.name}</h4>
                                <p className="text-xs text-gray-400 mb-2">{item.nim} · {item.date}</p>
                                <p className="text-sm text-gray-600 mb-1.5">{item.title}</p>
                                
                                {item.supervisor ? (
                                    <p className="text-xs text-[#015023] font-medium">Pembimbing: {item.supervisor}</p>
                                ) : (
                                    <p className="text-xs text-gray-400">Belum ada pembimbing</p>
                                )}
                            </div>
                        </div>

                        {/* Kanan: Badge Status & Panah Kanan */}
                        <div className="flex items-center justify-end sm:justify-start gap-4 pl-14 sm:pl-0 shrink-0">
                            {renderStatusBadge(item.status)}
                            <ArrowRight size={20} className="text-[#015023]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}