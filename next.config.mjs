/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      {
        source: '/bimbingan',
        destination: '/bimbingan-ta/mahasiswa/pengajuan',
        permanent: false,
      },
      {
        source: '/bimbingan/pengajuan-ta',
        destination: '/bimbingan-ta/mahasiswa/pengajuan',
        permanent: false,
      },
      {
        source: '/bimbingan/galeri-judul/:id',
        destination: '/bimbingan-ta/mahasiswa/topik/:id',
        permanent: false,
      },
      {
        source: '/bimbingan/galeri-judul',
        destination: '/bimbingan-ta/mahasiswa/topik',
        permanent: false,
      },
      {
        source: '/bimbingan/monitoring',
        destination: '/bimbingan-ta/mahasiswa/monitoring',
        permanent: false,
      },
      {
        source: '/admin/bimbingan/kelola-data-user',
        destination: '/adminpage/thesis/users',
        permanent: false,
      },
      {
        source: '/admin/bimbingan/monitoring-pengajuan/:id',
        destination: '/adminpage/thesis/students/:id',
        permanent: false,
      },
      {
        source: '/admin/bimbingan/monitoring-pengajuan',
        destination: '/adminpage/thesis/students',
        permanent: false,
      },
      {
        source: '/admin/bimbingan/semua-pengajuan',
        destination: '/adminpage/thesis/students',
        permanent: false,
      },
      {
        source: '/admin/bimbingan',
        destination: '/adminpage/thesis',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
