import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('roles')?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = {
    '/admin/bimbingan': ['admin', 'manager'],
    '/admin/library': ['admin', 'manager'],
    '/admin/ukt': ['admin', 'manager'],
    '/adminpage': ['admin', 'manager'],
    '/adminpage/tambahmanager': ['admin'],
    '/dashboard/ukt': ['mahasiswa'],
    '/dashboard': ['mahasiswa', 'dosen'],
    '/hasil-studi': ['mahasiswa', 'dosen'],
    '/hasil-studi/input-nilai-mahasiswa': ['dosen'],
    '/akademik': ['mahasiswa', 'dosen'],
    '/akademik/detailkelas/[kode]/pengumuman': ['dosen'],
    '/kehadiran': ['mahasiswa', 'dosen'],
    '/kehadiran/[kode]/pertemuan': ['dosen'],
    '/bimbingan': ['mahasiswa'],
    '/bimbingan-ta': ['mahasiswa', 'dosen'],
    '/notif': ['mahasiswa', 'dosen'],
    '/library': ['mahasiswa', 'dosen', 'admin', 'manager'],
    '/persuratan/ajukan': ['mahasiswa', 'dosen'],
    '/persuratan/status': ['mahasiswa', 'dosen'],
    '/adminpage/persuratan': ['admin', 'manager'],
    '/adminpage/thesis': ['admin', 'manager'],
    '/profilpage': ['mahasiswa', 'dosen', 'admin', 'manager']
  };

  // Urutkan path dari paling panjang ke pendek
  const sortedPaths = Object.keys(protectedRoutes).sort(
    (a, b) => b.length - a.length
  );

  for (const path of sortedPaths) {
    const allowedRoles = protectedRoutes[path];
    if (pathname.startsWith(path)) {
      if (!token) {
        return NextResponse.redirect(new URL('/loginpage', req.url));
      }
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}
