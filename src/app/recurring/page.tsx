'use client';

import { useState } from 'react';
import { useAccounts, useCategories, useRecurringTransactions } from '@/hooks/useDB';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DatePicker from '@/components/ui/DatePicker';
import { formatCurrency } from '@/lib/utils';
import { CURRENCIES, FREQUENCY_LABELS } from '@/types';
import type { RecurringTransaction, RecurringFrequency, TransactionType } from '@/types';

export default function RecurringPage() {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { recurrings, addRecurring, updateRecurring, deleteRecurring } = useRecurringTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  // Form state
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const openCreate = () => {
    setEditing(null);
    setType('expense');
    setAccountId(accounts[0]?.id ?? '');
    setAmount('');
    setCurrency(accounts[0]?.currency ?? 'EUR');
    setCategoryId('');
    setDescription('');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setShowForm(true);
  };

  const openEdit = (rec: RecurringTransaction) => {
    setEditing(rec);
    setType(rec.type);
    setAccountId(rec.accountId);
    setAmount(String(rec.amount));
    setCurrency(rec.currency);
    setCategoryId(rec.category);
    setDescription(rec.description);
    setFrequency(rec.frequency);
    setStartDate(new Date(rec.startDate).toISOString().split('T')[0]);
    setEndDate(rec.endDate ? new Date(rec.endDate).toISOString().split('T')[0] : '');
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount || !categoryId || !description) return;
    const data = {
      accountId,
      type,
      amount: parseFloat(amount),
      currency,
      category: categoryId,
      description,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: true,
    };
    if (editing) {
      await updateRecurring(editing.id, { ...data, nextDate: editing.nextDate });
    } else {
      await addRecurring(data);
    }
    handleClose();
  };

  const handleToggle = async (rec: RecurringTransaction) => {
    await updateRecurring(rec.id, { isActive: !rec.isActive });
  };

  const handleDelete = async (rec: RecurringTransaction) => {
    if (confirm(`Supprimer la transaction récurrente "${rec.description}" ?`)) {
      await deleteRecurring(rec.id);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);
  const activeCount = recurrings.filter(r => r.isActive).length;
  const monthlyTotal = recurrings
    .filter(r => r.isActive)
    .reduce((total, r) => {
      let multiplier = 1;
      switch (r.frequency) {
        case 'daily': multiplier = 30; break;
        case 'weekly': multiplier = 4.33; break;
        case 'monthly': multiplier = 1; break;
        case 'quarterly': multiplier = 1 / 3; break;
        case 'semi-annually': multiplier = 1 / 6; break;
        case 'annually': multiplier = 1 / 12; break;
      }
      const amount = r.amount * multiplier;
      return {
        income: total.income + (r.type === 'income' ? amount : 0),
        expense: total.expense + (r.type === 'expense' ? amount : 0),
      };
    }, { income: 0, expense: 0 });

  const frequencies: { key: RecurringFrequency; label: string }[] = [
    { key: 'daily', label: 'Quotidien' },
    { key: 'weekly', label: 'Hebdo' },
    { key: 'monthly', label: 'Mensuel' },
    { key: 'quarterly', label: 'Trimestriel' },
    { key: 'semi-annually', label: 'Semestriel' },
    { key: 'annually', label: 'Annuel' },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Transactions récurrentes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {activeCount} active{activeCount > 1 ? 's' : ''} sur {recurrings.length}
          </p>
        </div>
        <Button onClick={openCreate} disabled={accounts.length === 0}>+ Nouvelle</Button>
      </div>

      {/* Monthly summary */}
      {recurrings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up stagger-1">
          <Card>
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Revenus mensuels</p>
            <p className="text-lg font-bold stat-value mt-1" style={{ color: 'var(--color-success)' }}>
              +{formatCurrency(Math.round(monthlyTotal.income), 'EUR')}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>estimation / mois</p>
          </Card>
          <Card>
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Dépenses mensuelles</p>
            <p className="text-lg font-bold stat-value mt-1" style={{ color: 'var(--color-danger)' }}>
              -{formatCurrency(Math.round(monthlyTotal.expense), 'EUR')}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>estimation / mois</p>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Solde net mensuel</p>
            <p className="text-lg font-bold stat-value mt-1" style={{
              color: monthlyTotal.income - monthlyTotal.expense >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
            }}>
              {formatCurrency(Math.round(monthlyTotal.income - monthlyTotal.expense), 'EUR')}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>estimation / mois</p>
          </Card>
        </div>
      )}

      {/* Recurring list */}
      {recurrings.length > 0 ? (
        <div className="space-y-2">
          {recurrings.map((rec, i) => {
            const cat = categories.find(c => c.id === rec.category);
            const account = accounts.find(a => a.id === rec.accountId);
            const nextDate = new Date(rec.nextDate);
            const isExpense = rec.type === 'expense';

            return (
              <Card key={rec.id} animate stagger={Math.min(i + 1, 5)}>
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{
                      background: cat?.color ? cat.color + '15' : 'var(--surface-elevated)',
                      opacity: rec.isActive ? 1 : 0.5,
                    }}
                  >
                    {cat?.icon ?? ''}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0" style={{ opacity: rec.isActive ? 1 : 0.5 }}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{rec.description}</p>
                      <span className="badge shrink-0" style={{
                        background: isExpense ? 'var(--color-danger-subtle)' : 'var(--color-success-subtle)',
                        color: isExpense ? 'var(--color-danger)' : 'var(--color-success)',
                      }}>
                        {isExpense ? 'Dépense' : 'Revenu'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
                      <span>{account?.name ?? ''}</span>
                      <span>·</span>
                      <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{FREQUENCY_LABELS[rec.frequency]}</span>
                      <span>·</span>
                      <span>Prochaine : {nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {!rec.isActive && (
                        <>
                          <span>·</span>
                          <span className="font-medium" style={{ color: 'var(--color-warning)' }}>En pause</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-bold stat-value shrink-0" style={{
                    color: isExpense ? 'var(--color-danger)' : 'var(--color-success)',
                    opacity: rec.isActive ? 1 : 0.5,
                  }}>
                    {isExpense ? '-' : '+'}{formatCurrency(rec.amount, rec.currency)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-0.5 shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(rec)}
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                      style={{ color: rec.isActive ? 'var(--color-success)' : 'var(--text-tertiary)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      title={rec.isActive ? 'Mettre en pause' : 'Réactiver'}
                    >
                      {rec.isActive ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="2" width="3" height="10" rx="0.5"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="4,2 12,7 4,12"/></svg>
                      )}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => openEdit(rec)}
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'var(--accent-primary-subtle)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(rec)}
                      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-subtle)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 3.5h10M5.25 3.5V2.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75V3.5M3.5 3.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12" animate>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Aucune transaction récurrente</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Programmez des dépenses ou revenus automatiques
          </p>
        </Card>
      )}

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={handleClose} title={editing ? 'Modifier la récurrence' : 'Nouvelle transaction récurrente'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--surface-elevated)' }}>
            {([
              { key: 'expense' as const, label: 'Dépense' },
              { key: 'income' as const, label: 'Revenu' },
            ]).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setType(t.key); setCategoryId(''); }}
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

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Loyer, Salaire, Netflix..." className="form-input" required />
          </div>

          {/* Amount + Currency */}
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

          {/* Account */}
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
              required
            >
              <option value="">Sélectionner...</option>
              {accounts.map(a => (<option key={a.id} value={a.id}>{a.name} ({a.currency})</option>))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input" required>
              <option value="">Sélectionner...</option>
              {filteredCategories.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Fréquence</label>
            <div className="grid grid-cols-3 gap-1.5">
              {frequencies.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFrequency(f.key)}
                  className="py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 text-center"
                  style={{
                    border: `1.5px solid ${frequency === f.key ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    background: frequency === f.key ? 'var(--accent-primary-subtle)' : 'var(--surface-card)',
                    color: frequency === f.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date de début</label>
              <DatePicker value={startDate} onChange={setStartDate} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date de fin (optionnel)</label>
              <DatePicker value={endDate} onChange={setEndDate} placeholder="Aucune" />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" type="button" onClick={handleClose}>Annuler</Button>
            <Button type="submit">{editing ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
