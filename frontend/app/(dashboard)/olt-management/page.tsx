'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OltManagementPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to OLTs page - this is the main OLT management section
    router.replace('/olts');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-slate-500">Loading OLT Management...</div>
    </div>
  );
}
