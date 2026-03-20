"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PrimaryButton } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const handleRedirect = () => {
    if (!user || !user.roles) {
      router.push('/loginpage');
      return;
    }

    // Check role and redirect accordingly
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    
    if (roles.includes('admin') || roles.includes('manager')) {
      router.push('/adminpage');
    } else if (roles.includes('dosen') || roles.includes('mahasiswa')) {
      router.push('/dashboard');
    } else {
      router.push('/loginpage');
    }
  };

  const handleManualRedirect = () => {
    handleRedirect();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        fontFamily: 'Urbanist',
        backgroundColor: '#E6EEE9'
      }}
    >
      <div 
        className="max-w-md w-full mx-4 p-8 text-center"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="rounded-full flex items-center justify-center"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#FEE2E2'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="#BE0414"
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-2xl font-bold mb-3"
          style={{ color: '#015023' }}
        >
          Akses Ditolak
        </h1>

        {/* Message */}
        <p 
          className="mb-6"
          style={{ color: '#6B7280', fontSize: '15px', lineHeight: '1.6' }}
        >
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
          Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>

        {/* Countdown */}
        <div 
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: '#E6EEE9',
            border: '1px solid #D9E5DE'
          }}
        >
          <p 
            className="text-sm mb-2"
            style={{ color: '#6B7280' }}
          >
            Anda akan dialihkan dalam
          </p>
          <p 
            className="text-4xl font-bold"
            style={{ color: '#015023' }}
          >
            {countdown}
          </p>
          <p 
            className="text-sm mt-1"
            style={{ color: '#6B7280' }}
          >
            detik
          </p>
        </div>

        {/* Button */}
        <PrimaryButton 
          onClick={handleManualRedirect}
          className="w-full"
        >
          Kembali Sekarang
        </PrimaryButton>
      </div>
    </div>
  );
}
