'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container, SectionTitle } from '@/components/ui/container-dashboard';
import RiwayatTATable from '@/features/bimbingan-ta/components/RiwayatTATable';
import { useRiwayatTA } from '@/features/bimbingan-ta/hooks/useRiwayatTA';
import { ChevronRight, Plus, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PengajuanTAPage() {
    const { thesis, isLoading, error, refetch, isDeleting, deleteSubmission } = useRiwayatTA();
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
                            className="hover:underline flex items-center gap-1"
                            style={{ color: '#6B7280' }}
                        >
                            <Home size={14} />
                            Beranda
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
                            Status Pengajuan TA
                        </span>
                    </nav>

                    {/* Title row with action button */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <SectionTitle className="!mb-0">Layanan Bimbingan TA</SectionTitle>
                            <p
                                style={{
                                    fontFamily: 'Urbanist, sans-serif',
                                    fontSize: '15px',
                                    color: '#6B7280',
                                    marginTop: '4px',
                                }}
                            >
                                Pantau status pengajuan tugas akhir yang telah Anda ajukan
                            </p>
                        </div>
                        {hasSubmittedTA ? (
                            <Button
                                variant="primary"
                                size="default"
                                style={{}}
                                className="gap-2 opacity-60 cursor-not-allowed"
                                disabled
                                title="Anda sudah mengajukan TA. Satu mahasiswa hanya dapat mengajukan satu judul TA."
                            >
                                <Plus size={18} />
                                Ajukan TA Baru
                            </Button>
                        ) : (
                            <Link href="/bimbingan/pengajuan/buat">
                                <Button variant="primary" size="default" style={{}} className="gap-2" disabled={isLoading}>
                                    <Plus size={18} />
                                    Ajukan TA Baru
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                            <button
                                onClick={refetch}
                                className="ml-3 font-semibold underline hover:text-red-900"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {/* TA submissions table */}
                    <RiwayatTATable thesis={thesis} isLoading={isLoading} isDeleting={isDeleting} onDelete={deleteSubmission} />
                </Container>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
