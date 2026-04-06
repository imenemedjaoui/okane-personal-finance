'use client';

import { useState } from 'react';
import { loadDemoData, clearAllData } from '@/data/demo';

export default function DemoBanner() {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleLoadDemo = async () => {
    setLoading(true);
    await loadDemoData();
    setLoading(false);
  };

  const handleClear = async () => {
    if (confirm('Supprimer toutes les donnees ? Cette action est irreversible.')) {
      setLoading(true);
      await clearAllData();
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <div
      className="px-4 py-2 text-center text-xs flex items-center justify-center gap-3 flex-wrap relative border-b"
      style={{
        background: 'var(--accent-primary-subtle)',
        borderColor: 'var(--border-default)',
        color: 'var(--accent-primary)',
      }}
    >
      <span className="font-medium">
        Mode demo — donnees stockees localement
      </span>
      <button
        onClick={handleLoadDemo}
        disabled={loading}
        className="font-medium px-2.5 py-0.5 rounded-md text-xs transition-colors duration-150 disabled:opacity-50"
        style={{
          background: 'var(--accent-primary)',
          color: 'white',
        }}
      >
        {loading ? '...' : 'Charger la demo'}
      </button>
      <button
        onClick={handleClear}
        disabled={loading}
        className="font-medium px-2.5 py-0.5 rounded-md text-xs transition-colors duration-150 disabled:opacity-50"
        style={{
          color: 'var(--text-secondary)',
          background: 'var(--surface-elevated)',
        }}
      >
        Tout effacer
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
        aria-label="Fermer"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="1" y1="1" x2="11" y2="11" />
          <line x1="11" y1="1" x2="1" y2="11" />
        </svg>
      </button>
    </div>
  );
}
