'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container, SectionTitle } from '@/components/ui/container-dashboard';
import PengajuanTAForm from '@/features/bimbingan-ta/components/PengajuanTAForm';
import { useAjukanTA } from '@/features/bimbingan-ta/hooks/useAjukanTA';
import { useRiwayatTA } from '@/features/bimbingan-ta/hooks/useRiwayatTA';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BuatPengajuanTAPage() {
    const { onSubmit, isLoading, isLoadingDosen, dosenList, error } = useAjukanTA();
    const { thesis, isLoading: isCheckingThesis } = useRiwayatTA();
    const hasSubmittedTA = Boolean(thesis);

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{ backgroundColor: '#E6EEE9' }}
        >
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
                    style={{ backgroundColor: '#015023' }}
                />
                <div
                    className="absolute top-40 -left-32 w-96 h-96 rounded-full opacity-5"
                    style={{ backgroundColor: '#015023' }}
                />
                <div
                    className="absolute -bottom-32 right-20 w-80 h-80 rounded-full opacity-8"
                    style={{ backgroundColor: '#015023' }}
                />
                <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: '#DABC4E' }} />
                <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full opacity-15" style={{ backgroundColor: '#DABC4E' }} />
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: '#DABC4E' }} />
                <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full opacity-15" style={{ backgroundColor: '#DABC4E' }} />
            </div>

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                <Container className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb */}
                    <nav
                        className="flex items-center gap-1 mb-1"
                        style={{ fontFamily: 'Urbanist, sans-serif', fontSize: '14px' }}
                    >
                        <Link
                            href="/dashboard"
                            className="hover:underline"
                            style={{ color: '#6B7280' }}
                        >
                            Dashboard
                        </Link>
                        <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                        <Link
                            href="/bimbingan/pengajuan"
                            className="hover:underline"
                            style={{ color: '#6B7280' }}
                        >
                            Bimbingan TA
                        </Link>
                        <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ color: '#015023', fontWeight: 600 }}>
                            Ajukan TA Baru
                        </span>
                    </nav>

                    {/* Page title */}
                    <SectionTitle>Ajukan TA Baru</SectionTitle>

                    {isCheckingThesis ? (
                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                            Memeriksa status pengajuan TA...
                        </div>
                    ) : hasSubmittedTA ? (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                            <p className="text-sm text-amber-800 font-medium">
                                Anda sudah mengajukan TA. Satu mahasiswa hanya dapat mengajukan satu judul TA.
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                                Silakan pantau prosesnya pada halaman status pengajuan.
                            </p>
                            <div className="mt-3">
                                <Link href="/bimbingan/pengajuan" className="text-sm font-semibold underline text-amber-800">
                                    Kembali ke Status Pengajuan TA
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <PengajuanTAForm
                            dosenList={dosenList}
                            isLoadingDosen={isLoadingDosen}
                            isSubmitting={isLoading}
                            error={error}
                            onSubmit={onSubmit}
                        />
                    )}
                </Container>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}



