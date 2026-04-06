'use client';

import { useState, useMemo } from 'react';
import { useBudgets, useCategories, useTransactions } from '@/hooks/useDB';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, getMonthKey } from '@/lib/utils';
import { CURRENCIES } from '@/types';
import type { Budget } from '@/types';

export default function BudgetsPage() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');

  const currentMonth = getMonthKey(new Date());
  const monthExpenses = useMemo(() => {
    return transactions.filter(t =>
      t.type === 'expense' && getMonthKey(new Date(t.date)) === currentMonth
    );
  }, [transactions, currentMonth]);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const budgetData = budgets.map(b => {
    const cat = categories.find(c => c.id === b.categoryId);
    const spent = monthExpenses.filter(t => t.category === b.categoryId).reduce((s, t) => s + t.amount, 0);
    const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    const remaining = b.amount - spent;
    return { ...b, cat, spent, pct, remaining };
  });

  const openCreate = () => {
    setEditingBudget(null);
    setCategoryId('');
    setAmount('');
    setCurrency('EUR');
    setShowForm(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setCategoryId(b.categoryId);
    setAmount(String(b.amount));
    setCurrency(b.currency);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;
    if (editingBudget) {
      await updateBudget(editingBudget.id, {
        categoryId,
        amount: parseFloat(amount),
        currency,
      });
    } else {
      await addBudget({ categoryId, amount: parseFloat(amount), currency, period: 'monthly', startDate: new Date() });
    }
    handleClose();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Budgets</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            Suivi mensuel par catégorie
          </p>
        </div>
        <Button onClick={openCreate}>+ Nouveau budget</Button>
      </div>

      {budgetData.length > 0 ? (
        <div className="space-y-3">
          {budgetData.map((b, i) => (
            <Card key={b.id} animate stagger={Math.min(i + 1, 5)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ background: b.cat?.color ? b.cat.color + '15' : 'var(--surface-elevated)' }}
                  >
                    {b.cat?.icon ?? ''}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{b.cat?.name ?? 'Catégorie'}</h3>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatCurrency(b.spent, b.currency)} sur {formatCurrency(b.amount, b.currency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="badge stat-value"
                    style={{
                      background: b.pct > 100 ? 'var(--color-danger-subtle)' : b.pct > 80 ? 'var(--color-warning-subtle)' : 'var(--accent-primary-subtle)',
                      color: b.pct > 100 ? 'var(--color-danger)' : b.pct > 80 ? 'var(--color-warning)' : 'var(--accent-primary)',
                    }}
                  >
                    {b.pct}%
                  </span>
                  <button
                    onClick={() => openEdit(b)}
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--accent-primary)';
                      e.currentTarget.style.background = 'var(--accent-primary-subtle)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--color-danger)';
                      e.currentTarget.style.background = 'var(--color-danger-subtle)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 3.5h10M5.25 3.5V2.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75V3.5M3.5 3.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8" />
                    </svg>
                  </button>
                </div>
              </div>
              <ProgressBar percent={b.pct} />
              {b.remaining < 0 && (
                <p className="text-xs font-medium mt-2" style={{ color: 'var(--color-danger)' }}>
                  Dépassement de {formatCurrency(Math.abs(b.remaining), b.currency)}
                </p>
              )}
              {b.remaining > 0 && b.pct > 80 && (
                <p className="text-xs mt-2" style={{ color: 'var(--color-warning)' }}>
                  {formatCurrency(b.remaining, b.currency)} restant
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12" animate>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Aucun budget défini</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Créez un budget pour suivre vos dépenses par catégorie</p>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={handleClose} title={editingBudget ? 'Modifier le budget' : 'Nouveau budget mensuel'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input" required>
              <option value="">Sélectionner...</option>
              {expenseCategories.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Montant mensuel</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="form-input" required />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Devise</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="form-input">
                {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.code}</option>))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" type="button" onClick={handleClose}>Annuler</Button>
            <Button type="submit">{editingBudget ? 'Enregistrer' : 'Créer le budget'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
