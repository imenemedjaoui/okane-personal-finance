'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import type { Account, Category, Transaction, TransactionType } from '@/types';
import { CURRENCIES } from '@/types';

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  initialData?: Transaction | null;
  onSubmit: (data: {
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    category: string;
    description: string;
    date: Date;
    notes?: string;
    toAccountId?: string;
    categorySource: 'manual';
  }) => void;
  onCancel: () => void;
}

export default function TransactionForm({ accounts, categories, initialData, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense');
  const [accountId, setAccountId] = useState(initialData?.accountId ?? accounts[0]?.id ?? '');
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '');
  const [currency, setCurrency] = useState(initialData?.currency ?? accounts[0]?.currency ?? 'EUR');
  const [categoryId, setCategoryId] = useState(initialData?.category ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [date, setDate] = useState(
    initialData ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [toAccountId, setToAccountId] = useState(initialData?.toAccountId ?? '');

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount || !categoryId || !description) return;
    onSubmit({
      accountId, type,
      amount: parseFloat(amount), currency, category: categoryId,
      description, date: new Date(date),
      notes: notes || undefined,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categorySource: 'manual',
    });
  };

  const types: { key: TransactionType; label: string }[] = [
    { key: 'expense', label: 'Dépense' },
    { key: 'income', label: 'Revenu' },
    { key: 'transfer', label: 'Transfert' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--surface-elevated)' }}>
        {types.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className="flex-1 py-2 text-xs font-medium rounded-md transition-all duration-150"
            style={{
              background: type === t.key ? 'var(--surface-card)' : 'transparent',
              color: type === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: type === t.key ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Compte</label>
        <select
          value={accountId}
          onChange={e => {
            setAccountId(e.target.value);
            const acc = accounts.find(a => a.id === e.target.value);
            if (acc) setCurrency(acc.currency);
          }}
          className="form-input"
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
          ))}
        </select>
      </div>

      {type === 'transfer' && (
        <div className="animate-slide-up">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Vers le compte</label>
          <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="form-input">
            <option value="">Sélectionner...</option>
            {accounts.filter(a => a.id !== accountId).map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Montant</label>
          <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="form-input" required />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Devise</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="form-input">
            {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.code}</option>))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input" required>
          <option value="">Sélectionner...</option>
          {filteredCategories.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Courses Carrefour" className="form-input" required />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date</label>
        <DatePicker value={date} onChange={setDate} required />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes (optionnel)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="form-input" />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="secondary" type="button" onClick={onCancel}>Annuler</Button>
        <Button type="submit">{initialData ? 'Enregistrer' : 'Ajouter'}</Button>
      </div>
    </form>
  );
}
