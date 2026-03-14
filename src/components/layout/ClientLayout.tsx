'use client';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Routes where sidebar isn't needed
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-[#FAFBFF]">
        {!isAuthRoute && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
