'use client';

import { useState } from 'react';
import { useAccounts, useTransactions, useCategories } from '@/hooks/useDB';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import type { Transaction } from '@/types';

export default function TransactionsPage() {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions({
    search: search || undefined,
    type: filterType || undefined,
    accountId: filterAccount || undefined,
  });

  const openCreate = () => {
    setEditingTx(null);
    setShowForm(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTx(null);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Transactions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} disabled={accounts.length === 0}>
          + Ajouter
        </Button>
      </div>

      {accounts.length === 0 && (
        <Card className="text-center py-8" animate>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Créez d&apos;abord un compte pour ajouter des transactions.</p>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 animate-slide-up stagger-1">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="form-input w-full sm:w-auto sm:min-w-[140px]"
        >
          <option value="">Tous les types</option>
          <option value="expense">Dépenses</option>
          <option value="income">Revenus</option>
          <option value="transfer">Transferts</option>
        </select>
        <select
          value={filterAccount}
          onChange={e => setFilterAccount(e.target.value)}
          className="form-input w-full sm:w-auto sm:min-w-[140px]"
        >
          <option value="">Tous les comptes</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <Card padding={false} animate stagger={2}>
        <TransactionList
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          onEdit={openEdit}
          onDelete={deleteTransaction}
        />
      </Card>

      <Modal isOpen={showForm} onClose={handleClose} title={editingTx ? 'Modifier la transaction' : 'Nouvelle transaction'}>
        <TransactionForm
          key={editingTx?.id ?? 'new'}
          accounts={accounts}
          categories={categories}
          initialData={editingTx}
          onSubmit={async (data) => {
            if (editingTx) {
              await updateTransaction(editingTx.id, data);
            } else {
              await addTransaction(data);
            }
            handleClose();
          }}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
