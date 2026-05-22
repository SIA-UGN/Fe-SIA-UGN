'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingEffect from '@/components/ui/loading-effect';

export default function BimbinganIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bimbingan-ta/mahasiswa/pengajuan');
  }, [router]);

  return <LoadingEffect message="Mengarahkan ke modul bimbingan..." />;
}
