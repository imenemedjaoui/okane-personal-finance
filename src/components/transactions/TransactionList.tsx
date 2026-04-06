'use client';

import type { Transaction, Category, Account } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, categories, accounts, onEdit, onDelete }: TransactionListProps) {
  const getCategoryInfo = (id: string) => categories.find(c => c.id === id);
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name ?? 'Inconnu';

  if (transactions.length === 0) {
    return (
      <div className="text-center py-14 px-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Aucune transaction</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Ajoutez votre première transaction ou importez un CSV</p>
      </div>
    );
  }

  return (
    <div>
      {/* Table header - desktop */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_auto_56px] gap-4 items-center px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider border-b"
        style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-default)', background: 'var(--surface-elevated)' }}
      >
        <span>Transaction</span>
        <span className="w-24 text-right">Montant</span>
        <span className="w-20 text-right">Date</span>
        <span></span>
      </div>

      {transactions.map((tx, i) => {
        const cat = getCategoryInfo(tx.category);
        const isExpense = tx.type === 'expense';
        const isTransfer = tx.type === 'transfer';

        return (
          <div
            key={tx.id}
            className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_56px] gap-2 sm:gap-4 items-center px-4 py-3 group transition-colors duration-100 animate-slide-up border-b last:border-b-0"
            style={{
              animationDelay: `${Math.min(i, 15) * 20}ms`,
              borderColor: 'var(--border-subtle)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Left: icon + details */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ background: cat?.color ? cat.color + '12' : 'var(--surface-elevated)' }}
              >
                {cat?.icon ?? ''}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {tx.description}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {getAccountName(tx.accountId)}
                  {isTransfer && tx.toAccountId && ` → ${getAccountName(tx.toAccountId)}`}
                  {' · '}
                  {cat?.name ?? 'Sans catégorie'}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="text-sm font-medium stat-value" style={{
                color: isExpense ? 'var(--color-danger)' : isTransfer ? 'var(--color-info)' : 'var(--color-success)'
              }}>
                {isExpense ? '-' : isTransfer ? '' : '+'}{formatCurrency(tx.amount, tx.currency)}
              </p>
              <p className="text-[11px] sm:hidden" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Date - desktop */}
            <span className="hidden sm:block w-20 text-right text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>

            {/* Actions */}
            <div className="hidden sm:flex opacity-0 group-hover:opacity-100 gap-0.5 justify-end transition-opacity duration-150">
              <button
                onClick={() => onEdit(tx)}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--accent-primary)';
                  e.currentTarget.style.background = 'var(--accent-primary-subtle)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Modifier"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(tx.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-danger)';
                  e.currentTarget.style.background = 'var(--color-danger-subtle)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Supprimer"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 3.5h10M5.25 3.5V2.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75V3.5M3.5 3.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
