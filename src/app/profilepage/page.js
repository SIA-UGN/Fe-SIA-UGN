'use client';


import Navbar from '@/components/ui/navigation-menu';
import AdminNavbar from '@/components/ui/admin-navbar';
import Footer from '@/components/ui/footer';
import ProfileMahasiswa from '@/components/ui/profilemahasiswa';
import ProfileDMA from '@/components/ui/profileDMA';
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const userRole = Cookies.get('roles');

  // Function to render appropriate profile component based on role
  const renderProfileComponent = () => {
    switch (userRole) {
      case 'mahasiswa':
        return <ProfileMahasiswa />;
      
      case 'dosen':
      case 'manager':
      case 'admin':
        return <ProfileDMA />;
    }
  };

  return (
    <>
      {(userRole === 'mahasiswa' || userRole === 'dosen') && <Navbar />}
      {(userRole === 'admin' || userRole === 'manager') && <AdminNavbar title="Dashboard Admin - Profil" />}
      {renderProfileComponent()}
      <Footer />
    </>
  );
}