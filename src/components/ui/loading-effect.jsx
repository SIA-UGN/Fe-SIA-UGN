"use client"

export default function LoadingEffect({
    message,
}) {
    return (
        <div className="min-h-screen bg-brand-light-sage flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: '#015023' }}></div>
                <p className="text-lg font-semibold" style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}>
                    {message || 'Memuat...'}
                </p>
            </div>
        </div>
    );
}