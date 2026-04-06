'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAccounts, useTransactions, useCategories } from '@/hooks/useDB';

export default function ExportPage() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exported, setExported] = useState(false);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? 'Inconnu';
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name ?? 'Inconnu';

  const exportData = () => {
    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === 'csv') {
      const header = 'Date,Compte,Type,Catégorie,Description,Montant,Devise,Notes';
      const rows = transactions.map(t => {
        const date = new Date(t.date).toLocaleDateString('fr-FR');
        const account = getAccountName(t.accountId);
        const type = t.type === 'expense' ? 'Dépense' : t.type === 'income' ? 'Revenu' : 'Transfert';
        const category = getCategoryName(t.category);
        const desc = `"${t.description.replace(/"/g, '""')}"`;
        const amount = t.type === 'expense' ? -t.amount : t.amount;
        const notes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '';
        return `${date},${account},${type},${category},${desc},${amount},${t.currency},${notes}`;
      });
      content = [header, ...rows].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    } else {
      const data = transactions.map(t => ({
        date: new Date(t.date).toISOString().split('T')[0],
        account: getAccountName(t.accountId),
        type: t.type,
        category: getCategoryName(t.category),
        description: t.description,
        amount: t.type === 'expense' ? -t.amount : t.amount,
        currency: t.currency,
        notes: t.notes ?? null,
      }));
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    }

    const blob = new Blob(['\ufeff' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `okane-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const formats = [
    { key: 'csv' as const, label: 'CSV', desc: 'Compatible Excel, Google Sheets' },
    { key: 'json' as const, label: 'JSON', desc: 'Pour développeurs, APIs' },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Export</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          Exportez vos données
        </p>
      </div>

      <Card animate stagger={1}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Format d&apos;export</h2>

        <div className="space-y-4">
          <div className="flex gap-2">
            {formats.map(f => (
              <button
                key={f.key}
                onClick={() => setFormat(f.key)}
                className="flex-1 p-4 rounded-lg text-left transition-all duration-150"
                style={{
                  border: `1.5px solid ${format === f.key ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  background: format === f.key ? 'var(--accent-primary-subtle)' : 'var(--surface-card)',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</p>
              </button>
            ))}
          </div>

          <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-elevated)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{transactions.length}</span> transactions sur{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{accounts.length}</span> compte(s)
            </p>
          </div>

          <Button onClick={exportData} disabled={transactions.length === 0}>
            {exported ? 'Téléchargé !' : `Exporter en ${format.toUpperCase()}`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
