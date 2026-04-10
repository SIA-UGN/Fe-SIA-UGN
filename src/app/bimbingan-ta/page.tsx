'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingEffect from '@/components/ui/loading-effect';
import { getCurrentRole, getThesisHomePath } from '@/features/bimbingan-ta/utils';

export default function ThesisRootPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getCurrentRole();
    router.replace(getThesisHomePath(role));
  }, [router]);

  return <LoadingEffect message="Mengarahkan ke modul Bimbingan TA..." />;
}
