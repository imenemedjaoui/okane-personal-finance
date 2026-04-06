'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';

const NAV_ITEMS = [
  {
    href: '/', label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="6" height="6" rx="1.5"/><rect x="10.5" y="1.5" width="6" height="6" rx="1.5"/><rect x="1.5" y="10.5" width="6" height="6" rx="1.5"/><rect x="10.5" y="10.5" width="6" height="6" rx="1.5"/></svg>,
  },
  {
    href: '/transactions', label: 'Transactions',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 5.25h15M1.5 9h15M1.5 12.75h15"/></svg>,
  },
  {
    href: '/accounts', label: 'Comptes',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.25" y="3.75" width="13.5" height="10.5" rx="2"/><path d="M2.25 7.5h13.5"/></svg>,
  },
  {
    href: '/categories', label: 'Catégories',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="1.5"/><path d="M14.25 9a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5h-1.19a.75.75 0 0 0-.65.38l-.6 1.03a1.5 1.5 0 0 1-1.3.75h0a1.5 1.5 0 0 1-1.3-.75l-.6-1.03a.75.75 0 0 0-.65-.38H6.75a1.5 1.5 0 0 1-1.5-1.5v0A1.5 1.5 0 0 1 6.75 9"/><path d="M3.75 9a1.5 1.5 0 0 1-1.5-1.5v0a1.5 1.5 0 0 1 1.5-1.5h1.19a.75.75 0 0 0 .65-.38l.6-1.03A1.5 1.5 0 0 1 7.49 3.84h0a1.5 1.5 0 0 1 1.3.75l.6 1.03a.75.75 0 0 0 .65.38h1.19a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5"/></svg>,
  },
  {
    href: '/recurring', label: 'Récurrents',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 9a7.5 7.5 0 0 1 13.1-5"/><path d="M16.5 9a7.5 7.5 0 0 1-13.1 5"/><polyline points="14.5 1 14.6 4 11.6 4"/><polyline points="3.5 17 3.4 14 6.4 14"/></svg>,
  },
  {
    href: '/budgets', label: 'Budgets',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7.5"/><path d="M9 4.5v9M11.25 6.75c0-.83-.67-1.5-1.5-1.5H8.25a1.5 1.5 0 0 0 0 3h1.5a1.5 1.5 0 0 1 0 3H7.5"/></svg>,
  },
  {
    href: '/import', label: 'Import',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12.75v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1.5M9 2.25v9M5.25 7.5L9 11.25l3.75-3.75"/></svg>,
  },
  {
    href: '/export', label: 'Export',
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12.75v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1.5M9 11.25v-9M5.25 6L9 2.25 12.75 6"/></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-default)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex justify-around py-1.5 px-1">
          {NAV_ITEMS.slice(0, 5).map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors duration-150 min-w-[3.5rem]',
                  active ? 'font-medium' : ''
                )}
                style={{
                  color: active ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="relative group">
            <button
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors duration-150 min-w-[3.5rem]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="3.75" r="0.75" fill="currentColor"/><circle cx="9" cy="9" r="0.75" fill="currentColor"/><circle cx="9" cy="14.25" r="0.75" fill="currentColor"/></svg>
              <span>Plus</span>
            </button>
            <div
              className="absolute bottom-full right-0 mb-2 rounded-lg p-1.5 hidden group-focus-within:block border min-w-[140px]"
              style={{
                background: 'var(--surface-card)',
                borderColor: 'var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {NAV_ITEMS.slice(5).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150"
                  style={{
                    color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col md:w-56 min-h-screen border-r shrink-0"
        style={{
          background: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
        }}
      >
        {/* Logo + Theme Toggle */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--accent-gradient)' }}
            >
              O
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Okane
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wider px-3 pt-2 pb-2" style={{ color: 'var(--text-tertiary)' }}>
            Menu
          </p>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150',
                )}
                style={{
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--sidebar-active)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'var(--surface-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Stockage local
          </p>
        </div>
      </aside>
    </>
  );
}
