'use client';

import { Navbar } from '@/components/ui/navigation-menu';

export default function ThesisConsultationsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#015023' }}>
            Konsultasi Thesis
          </h1>
          <p className="text-gray-600 mb-6">
            Kelola konsultasi thesis mahasiswa
          </p>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Halaman sedang dalam pengembangan</p>
          </div>
        </div>
      </div>
    </>
  );
}
