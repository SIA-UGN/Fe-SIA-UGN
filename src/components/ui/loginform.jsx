'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { SecondaryButton } from './button';
import sessionApi from '@/lib/sessionApi';
import Cookies from 'js-cookie';
import { ErrorMessageBox } from './message-box';
import LoadingEffect from './loading-effect';
import { useAuth } from '@/lib/auth-context';

export default function LoginForm() {
const router = useRouter();
// Panggil hook di level atas komponen, bukan di dalam fungsi event
const { refreshUser } = useAuth();
const [showPassword, setShowPassword] = useState(false);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

//cek sudah login blm
const checkLoggedIn = async () => {
  setIsLoading(true);
  try {
    const token = Cookies.get('token'); 
    const roles = Cookies.get('roles');
    if (token && roles) {
      setIsLoggedIn(true);
      if (roles == 'admin' || roles == 'manager') {
      router.push('/adminpage');
      } else if (roles == 'mahasiswa' || roles == 'dosen') {
        router.push('/dashboard');
      }
    }
  } finally {
    setIsLoading(false);
  }
};

// Panggil cek login saat komponen dimount
useEffect(() => {
  checkLoggedIn();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    setError(null);
    // Pastikan tidak ada token lama yang nyangkut sebelum login
    Cookies.remove('token');
    Cookies.remove('roles');
    // Panggil sessionApi.login
    const response = await sessionApi.login(email, password);

    if (response.status === 'success') {
      // Simpan token, roles, dan user_id ke cookies
      const token = response.data.access_token;
      const roles = response.data.user.roles;
      const userId = response.data.user.id;
      
      Cookies.set('token', token, { expires: 3 }); // expires in 3 days
      Cookies.set('roles', roles, { expires: 3 });
      Cookies.set('user_id', userId, { expires: 3 }); // PRIORITY: Save user ID to cookies
      console.log('[Login] Token, roles, and user_id saved to cookies');

      // FALLBACK: Simpan user data ke localStorage untuk WebSocket
      const userData = {
        id_user_si: userId,
        name: response.data.user.name,
        email: response.data.user.email,
        roles: response.data.user.roles,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('[Login] User data saved to localStorage (fallback)');

      // Refresh data user di context
      await refreshUser();

      setIsLoggedIn(true);

      // redirect sesuai role
      if (roles == 'admin' || roles == 'manager') {
        router.push('/adminpage');
      } else if (roles == 'mahasiswa' || roles == 'dosen') {
        router.push('/dashboard');
      }
    } else {
      setError(response.message);
    }
  } catch (error) {
    // Tangani error (bisa berupa JSON dari server atau AxiosError)
    const msg = error?.message || error?.error || error?.response?.data?.message || 'Mohon maaf, terjadi kesalahan saat login.';
    setError(msg);
    console.error('error di login:', error);
  } finally {
    // Hentikan loading
    setIsSubmitting(false);
  }
};

if (isLoading) {
  return <LoadingEffect />;
}

if (isLoggedIn) {
  return <LoadingEffect message="Redirecting..." />;
}

return (
<main className="min-h-screen flex items-center justify-center py-12 px-4 font-urbanist">
<article className="w-full max-w-5xl flex rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden bg-white/95 backdrop-blur-sm">

{/* Left Side - Logo & Branding */}
<aside className="hidden md:flex md:w-1/2 p-12 flex-col items-center justify-center" style={{backgroundColor: '#015023'}}>
{/* University Logo */}
<figure className="flex flex-col items-center">
<div className="w-full h-full flex items-center justify-center p-2 mb-4">
        <Image 
        src="/Logo.png"
        alt="UGN Logo"
        width={500}
        height={500}
        />
</div>

<figcaption className="text-center">
<h1 className="font-bold text-3xl mb-2 font-urbanist" style={{color: '#DABC4E'}}>
    Universitas Global Nusantara
</h1>
<p className="text-white/90 text-lg font-urbanist">
    Sistem Informasi Akademik
</p>
</figcaption>
</figure>
</aside>

{/* Right Side - Login Form */}
<section className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
<div className="w-full max-w-md mx-auto">
    <header className="mb-8">
    <h2 className="text-3xl font-bold mb-2 font-urbanist" style={{color: '#015023'}}>Sign In</h2>
    <p className="text-gray-600 font-urbanist">Welcome back! Please enter your details.</p>
    </header>

    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 font-urbanist" style={{color: '#015023'}}>
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
        <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border-2 bg-white font-urbanist focus:outline-none"
        style={{
        borderColor: '#DABC4E',
        borderRadius: '12px'
        }}
        onFocus={(e) => {
        e.target.style.borderColor = '#015023';
        e.target.style.boxShadow = '0 0 0 3px rgba(1, 80, 35, 0.1)';
        }}
        onBlur={(e) => {
        e.target.style.borderColor = '#DABC4E';
        e.target.style.boxShadow = 'none';
        }}
        placeholder="Enter your email"
        required
        aria-required="true"
    />
    </div>
</div>

{/* Password Input */}
<div>
    <label htmlFor="password" className="block text-sm font-medium mb-2 font-urbanist" style={{color: '#015023'}}>
    Password
    </label>
    <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
        <Lock className="h-5 w-5 text-gray-400" />
    </div>
    <input
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full pl-12 pr-12 py-3 border-2 bg-white font-urbanist focus:outline-none"
        style={{
        borderColor: '#DABC4E',
        borderRadius: '12px'
        }}
        onFocus={(e) => {
        e.target.style.borderColor = '#015023';
        e.target.style.boxShadow = '0 0 0 3px rgba(1, 80, 35, 0.1)';
        }}
        onBlur={(e) => {
        e.target.style.borderColor = '#DABC4E';
        e.target.style.boxShadow = 'none';
        }}
        placeholder="Enter your password"
        required
        aria-required="true"
    />
    <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
        {showPassword ? (
        <EyeOff className="h-5 w-5" />
        ) : (
        <Eye className="h-5 w-5" />
        )}
    </button>
    </div>
</div>

        {/* Sign In Button */}
        <SecondaryButton
          type="submit"
          disabled={isSubmitting}
          className="text-lg w-full py-3 px-4 shadow-md font-urbanist"
        >
          {isSubmitting ? (
            <>
                <span className="animate-spin mr-2">⏳</span>
                Signing in...
            </>
            ) : (
            <>
                Sign In
            </>
            )}
        </SecondaryButton>
</form>
    {/* Error Message */}
    {error && (
      <ErrorMessageBox message={error} />
    )}
</div>
</section>
</article>
</main>
);
}