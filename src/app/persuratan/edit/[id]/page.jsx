'use client';

import { use } from 'react';
import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container, SectionTitle } from '@/components/ui/container-dashboard';
import AjukanForm from '@/features/persuratan/components/AjukanForm';
import { useEditSurat } from '@/features/persuratan/hooks/useEditSurat';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function EditSuratPage({ params }) {
    // Next.js 15: params is a Promise, unwrap with React.use()
    const { id } = use(params);

    const {
        initialData,
        categories,
        recipients,
        isLoading,
        isSubmitting,
        error,
        submitError,
        onSubmit,
    } = useEditSurat(id);

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
                            href="/persuratan/status"
                            className="hover:underline"
                            style={{ color: '#6B7280' }}
                        >
                            Persuratan
                        </Link>
                        <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ color: '#015023', fontWeight: 600 }}>
                            Edit Surat
                        </span>
                    </nav>

                    {/* Page title */}
                    <div className="mb-6">
                        <SectionTitle className="!mb-0">Edit Surat</SectionTitle>
                        <p
                            style={{
                                fontFamily: 'Urbanist, sans-serif',
                                fontSize: '15px',
                                color: '#6B7280',
                                marginTop: '4px',
                            }}
                        >
                            Ubah detail pengajuan surat Anda
                        </p>
                    </div>

                    {/* Global fetch error */}
                    {error && (
                        <div
                            className="mb-6 p-4 text-sm"
                            style={{
                                backgroundColor: '#FEF2F2',
                                color: '#BE0414',
                                borderRadius: '12px',
                                border: '1px solid #FECACA',
                                fontFamily: 'Urbanist, sans-serif',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Form card — reused with edit mode */}
                    <AjukanForm
                        categories={categories}
                        recipients={recipients}
                        isLoading={isLoading}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        onSubmit={onSubmit}
                        initialData={initialData}
                        isEditMode
                    />
                </Container>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
