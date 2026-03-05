'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import { Container, SectionTitle } from '@/components/ui/container-dashboard';
import StatusTable from '@/features/persuratan/components/StatusTable';
import { useStatusPersuratan } from '@/features/persuratan/hooks/useStatusPersuratan';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StatusPersuratanPage() {
    const { data, isLoading, error, refetch } = useStatusPersuratan();

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
                        <span style={{ color: '#015023', fontWeight: 600 }}>
                            Status Persuratan
                        </span>
                    </nav>

                    {/* Title row with action button */}
                    <div className="flex items-center justify-between mb-6">
                        <SectionTitle className="!mb-0">Status Persuratan</SectionTitle>
                        <Link href="/persuratan/ajukan">
                            <Button variant="primary" className="gap-2">
                                <Plus size={18} />
                                Ajukan Surat
                            </Button>
                        </Link>
                    </div>

                    {/* Status table */}
                    <StatusTable
                        data={data}
                        isLoading={isLoading}
                        error={error}
                        refetch={refetch}
                    />
                </Container>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
