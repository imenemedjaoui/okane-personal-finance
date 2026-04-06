'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import DemoBanner from './DemoBanner';
import { useRecurringTransactions } from '@/hooks/useDB';

function RecurringProcessor() {
  const { processRecurrings } = useRecurringTransactions();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    processRecurrings();
  }, [processRecurrings]);

  return null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <RecurringProcessor />
      <DemoBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-auto" style={{ background: 'var(--surface-bg)' }}>
          <div key={pathname} className="animate-fade-in max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
