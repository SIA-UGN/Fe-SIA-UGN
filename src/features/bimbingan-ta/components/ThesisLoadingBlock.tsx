'use client';

export default function ThesisLoadingBlock({ message = 'Memuat data bimbingan TA...' }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-medium text-[#015023]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
        {message}
      </p>
    </div>
  );
}
