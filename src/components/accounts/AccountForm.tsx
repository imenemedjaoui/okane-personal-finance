'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { CURRENCIES } from '@/types';
import type { Account } from '@/types';

const ACCOUNT_ICONS = ['🏦', '💳', '💰', '🐖', '📈', '🏠', '🎓', '✈️'];
const ACCOUNT_COLORS = ['#6366F1', '#059669', '#D97706', '#DC2626', '#7C3AED', '#2563EB', '#DB2777', '#0891B2'];

interface AccountFormProps {
  initialData?: Account | null;
  onSubmit: (data: { name: string; currency: string; balance: number; color: string; icon: string }) => void;
  onCancel: () => void;
}

export default function AccountForm({ initialData, onSubmit, onCancel }: AccountFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [currency, setCurrency] = useState(initialData?.currency ?? 'EUR');
  const [balance, setBalance] = useState(String(initialData?.balance ?? '0'));
  const [icon, setIcon] = useState(initialData?.icon ?? '🏦');
  const [color, setColor] = useState(initialData?.color ?? '#6366F1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, currency, balance: parseFloat(balance) || 0, color, icon });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom du compte</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Compte courant" className="form-input" required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Devise</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)} className="form-input">
          {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          {initialData ? 'Solde actuel' : 'Solde initial'}
        </label>
        <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} className="form-input" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Icône</label>
        <div className="flex gap-2 flex-wrap">
          {ACCOUNT_ICONS.map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                border: `2px solid ${icon === i ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                background: icon === i ? 'var(--accent-primary-subtle)' : 'transparent',
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Couleur</label>
        <div className="flex gap-2 flex-wrap">
          {ACCOUNT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
              style={{
                backgroundColor: c,
                border: color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                boxShadow: color === c ? `0 0 0 2px var(--surface-bg), 0 0 12px ${c}40` : 'none',
              }}
            >
              {color === c && <span className="text-white text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" type="button" onClick={onCancel}>Annuler</Button>
        <Button type="submit">{initialData ? 'Enregistrer' : 'Créer le compte'}</Button>
      </div>
    </form>
  );
}
