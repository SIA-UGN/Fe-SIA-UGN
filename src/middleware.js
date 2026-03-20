import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('roles')?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = {
    '/adminpage': ['admin', 'manager'],
    '/adminpage/tambahmanager': ['admin'],
    '/dashboard': ['mahasiswa', 'dosen'],
    '/hasil-studi': ['mahasiswa', 'dosen'],
    '/hasil-studi/input-nilai-mahasiswa': ['dosen'],
    '/akademik': ['mahasiswa', 'dosen'],
    '/akademik/detailkelas/[kode]/pengumuman': ['dosen'],
    '/kehadiran': ['mahasiswa', 'dosen'],
    '/kehadiran/[kode]/pertemuan': ['dosen'],
    '/notif': ['mahasiswa', 'dosen'],
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