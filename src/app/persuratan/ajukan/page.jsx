'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container, SectionTitle } from '@/components/ui/container-dashboard';
import AjukanForm from '@/features/persuratan/components/AjukanForm';
import { useAjukanSurat } from '@/features/persuratan/hooks/useAjukanSurat';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AjukanSuratPage() {
    const {
        categories,
        recipients,
        isLoading,
        isSubmitting,
        error,
        submitError,
        onSubmit,
    } = useAjukanSurat();

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{ backgroundColor: '#E6EEE9' }}
        >
            {/* Background Decorations — same as dashboard */}
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
                            href="/persuratan/status"
                            className="hover:underline"
                            style={{ color: '#6B7280' }}
                        >
                            Persuratan
                        </Link>
                        <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                        <span style={{ color: '#015023', fontWeight: 600 }}>
                            Ajukan Surat
                        </span>
                    </nav>

                    {/* Page title */}
                    <SectionTitle>Ajukan Surat</SectionTitle>

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

                    {/* Form card */}
                    <AjukanForm
                        categories={categories}
                        recipients={recipients}
                        isLoading={isLoading}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        onSubmit={onSubmit}
                    />
                </Container>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
