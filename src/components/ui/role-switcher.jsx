'use client';

import { useState, useEffect } from 'react';
import { User, GraduationCap } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';

export default function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState('mahasiswa');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'mahasiswa';
    setCurrentRole(role);
  }, []);

  const switchRole = (role) => {
    localStorage.setItem('userRole', role);
    setCurrentRole(role);
    // Reload page to apply changes
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className="bg-white rounded-2xl shadow-2xl p-4 border-2"
        style={{ borderColor: '#015023', borderRadius: '16px' }}
      >
        <p 
          className="text-xs font-semibold mb-3 text-center"
          style={{ color: '#015023', fontFamily: 'Urbanist, sans-serif' }}
        >
          Role Saat Ini: <span className="uppercase">{currentRole}</span>
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={() => switchRole('mahasiswa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              currentRole === 'mahasiswa' ? 'opacity-100' : 'opacity-50'
            }`}
            style={{
              backgroundColor: currentRole === 'mahasiswa' ? '#015023' : '#e5e7eb',
              color: currentRole === 'mahasiswa' ? 'white' : '#6b7280',
              fontFamily: 'Urbanist, sans-serif',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <GraduationCap className="w-4 h-4" />
            Mahasiswa
          </button>
          
          <button
            onClick={() => switchRole('dosen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              currentRole === 'dosen' ? 'opacity-100' : 'opacity-50'
            }`}
            style={{
              backgroundColor: currentRole === 'dosen' ? '#015023' : '#e5e7eb',
              color: currentRole === 'dosen' ? 'white' : '#6b7280',
              fontFamily: 'Urbanist, sans-serif',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <User className="w-4 h-4" />
            Dosen
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center" style={{ fontFamily: 'Urbanist, sans-serif' }}>
          Dev Mode - Role Switcher
        </p>
      </div>
    </div>
  );
}
