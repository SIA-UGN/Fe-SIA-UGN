'use client';

import { useParams } from 'next/navigation';

export default function GaleriJudulDetailPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#015023' }}>
          Detail Judul TA
        </h1>
        <p className="text-gray-600 mb-6">
          ID: {id}
        </p>
        
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-500">Detail thesis sedang dalam pengembangan</p>
        </div>
      </div>
    </div>
  );
}
