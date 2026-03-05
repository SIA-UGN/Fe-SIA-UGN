'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import Link from 'next/link';
import { CircleCheckBig } from 'lucide-react';
import { Button, OutlineButton } from '@/components/ui/button';

export default function SuccessPage() {
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

            {/* Main — vertically centred card */}
            <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-16">
                <div
                    className="bg-white shadow-xl w-full max-w-md text-center px-8 py-12 sm:px-12"
                    style={{
                        borderRadius: '16px',
                        fontFamily: 'Urbanist, sans-serif',
                    }}
                >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                backgroundColor: '#E6EEE9',
                            }}
                        >
                            <CircleCheckBig size={44} strokeWidth={1.8} style={{ color: '#16874B' }} />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#015023',
                            marginBottom: '12px',
                        }}
                    >
                        Pengajuan Berhasil!
                    </h1>

                    {/* Description */}
                    <p
                        style={{
                            fontSize: '15px',
                            color: '#6B7280',
                            lineHeight: 1.6,
                            marginBottom: '32px',
                        }}
                    >
                        Surat permohonan Anda telah berhasil dikirim. Anda dapat memantau
                        status pengajuan melalui menu <strong style={{ color: '#015023' }}>Status Persuratan</strong>.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/persuratan/status" className="w-full sm:w-auto">
                            <OutlineButton type="button" className="w-full">
                                Lihat Status
                            </OutlineButton>
                        </Link>

                        <Link href="/persuratan/ajukan" className="w-full sm:w-auto">
                            <Button type="button" variant="primary" className="w-full">
                                Buat Baru
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
