'use client';

import { useState } from 'react';
import { useAccounts } from '@/hooks/useDB';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AccountForm from '@/components/accounts/AccountForm';
import { formatCurrency } from '@/lib/utils';
import type { Account } from '@/types';

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const totalByCurrency = accounts.reduce<Record<string, number>>((acc, a) => {
    acc[a.currency] = (acc[a.currency] ?? 0) + a.balance;
    return acc;
  }, {});

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Comptes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {accounts.length} compte{accounts.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditingAccount(null); setShowForm(true); }}>+ Nouveau compte</Button>
      </div>

      {/* Totals */}
      {Object.entries(totalByCurrency).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(totalByCurrency).map(([currency, total], i) => (
            <Card key={currency} className="flex-1 min-w-36" animate stagger={i + 1}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Total {currency}</p>
              <p className="text-lg font-semibold stat-value mt-0.5" style={{ color: total >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {formatCurrency(total, currency)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Accounts */}
      <div className="space-y-2">
        {accounts.map((account, i) => (
          <Card key={account.id} animate stagger={Math.min(i + 1, 5)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: account.color + '15', color: account.color }}
                >
                  {account.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{account.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{account.currency}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-base font-semibold stat-value" style={{ color: account.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(account)}
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
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer le compte "${account.name}" et toutes ses transactions ?`)) {
                        deleteAccount(account.id);
                      }
                    }}
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
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 3.5h10M5.25 3.5V2.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75V3.5M3.5 3.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card className="text-center py-12" animate>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Aucun compte</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Créez votre premier compte pour commencer</p>
        </Card>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={editingAccount ? 'Modifier le compte' : 'Nouveau compte'}
      >
        <AccountForm
          initialData={editingAccount}
          onSubmit={async (data) => {
            if (editingAccount) {
              await updateAccount(editingAccount.id, data);
            } else {
              await addAccount(data);
            }
            handleClose();
          }}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
