'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAccounts, useTransactions, useCategories } from '@/hooks/useDB';
import { autoCategorize, formatCurrency } from '@/lib/utils';

type CsvRow = Record<string, string>;

export default function ImportPage() {
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();

  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [dateCol, setDateCol] = useState('');
  const [amountCol, setAmountCol] = useState('');
  const [descCol, setDescCol] = useState('');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        setCsvData(results.data);
        const cols = results.meta.fields ?? [];
        setHeaders(cols);
        for (const col of cols) {
          const lower = col.toLowerCase();
          if (!dateCol && (lower.includes('date') || lower.includes('jour'))) setDateCol(col);
          if (!amountCol && (lower.includes('montant') || lower.includes('amount') || lower.includes('somme') || lower.includes('debit'))) setAmountCol(col);
          if (!descCol && (lower.includes('desc') || lower.includes('libel') || lower.includes('label') || lower.includes('wording'))) setDescCol(col);
        }
      }
    });
  }, [dateCol, amountCol, descCol]);

  const parseDate = (str: string): Date | null => {
    try {
      if (dateFormat === 'DD/MM/YYYY') { const [d, m, y] = str.split('/'); return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)); }
      if (dateFormat === 'MM/DD/YYYY') { const [m, d, y] = str.split('/'); return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)); }
      if (dateFormat === 'YYYY-MM-DD') { const [y, m, d] = str.split('-'); return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)); }
      return new Date(str);
    } catch { return null; }
  };

  const parseAmount = (str: string): number | null => {
    const cleaned = str.replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const handleImport = async () => {
    if (!accountId || !dateCol || !amountCol || !descCol) return;
    setImporting(true);
    let success = 0;
    let errors = 0;
    const account = accounts.find(a => a.id === accountId);
    const currency = account?.currency ?? 'EUR';

    for (const row of csvData) {
      try {
        const date = parseDate(row[dateCol]);
        const amount = parseAmount(row[amountCol]);
        const description = row[descCol]?.trim();
        if (!date || amount === null || !description) { errors++; continue; }
        const isExpense = amount < 0;
        const absAmount = Math.abs(amount);
        const categoryId = autoCategorize(description, categories) ??
          categories.find(c => c.name === (isExpense ? 'Autre dépense' : 'Autre revenu'))?.id ?? '';
        await addTransaction({ accountId, type: isExpense ? 'expense' : 'income', amount: absAmount, currency, category: categoryId, description, date, categorySource: 'import' });
        success++;
      } catch { errors++; }
    }
    setResult({ success, errors });
    setImporting(false);
  };

  const handleReset = () => {
    setCsvData([]); setHeaders([]); setFileName(''); setAccountId('');
    setDateCol(''); setAmountCol(''); setDescCol(''); setResult(null);
  };

  // Success screen
  if (result) {
    return (
      <div className="space-y-5 max-w-4xl">
        <h1 className="text-xl font-semibold animate-slide-up" style={{ color: 'var(--text-primary)' }}>Import CSV</h1>
        <Card className="text-center py-12" animate>
          <div className="animate-scale-in">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-success-subtle)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Import terminé
            </h2>
            <p className="text-sm mb-1" style={{ color: 'var(--color-success)' }}>
              <span className="font-semibold">{result.success}</span> transaction{result.success > 1 ? 's' : ''} importée{result.success > 1 ? 's' : ''}
            </p>
            {result.errors > 0 && (
              <p className="text-xs mb-3" style={{ color: 'var(--color-danger)' }}>
                {result.errors} ligne{result.errors > 1 ? 's' : ''} en erreur
              </p>
            )}
            <p className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>
              Depuis {fileName}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleReset} variant="secondary">
                Importer un autre fichier
              </Button>
              <Button onClick={() => window.location.href = '/transactions'}>
                Voir les transactions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Fichier', done: csvData.length > 0 },
    { num: 2, label: 'Mapping', done: !!(dateCol && amountCol && descCol && accountId) },
    { num: 3, label: 'Import', done: false },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="animate-slide-up">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Import CSV</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          Importez vos transactions depuis un fichier CSV
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 animate-slide-up stagger-1">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all duration-200"
              style={{
                background: step.done ? 'var(--accent-primary)' : 'var(--surface-elevated)',
                color: step.done ? 'white' : 'var(--text-tertiary)',
              }}
            >
              {step.done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2.5 6 5 8.5 9.5 3.5" /></svg>
              ) : step.num}
            </div>
            <span className="text-xs hidden sm:inline" style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-1" style={{ background: step.done ? 'var(--accent-primary)' : 'var(--border-default)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      <Card animate stagger={2}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Sélectionner le fichier</h2>
        <div
          className="border border-dashed rounded-lg p-6 text-center transition-colors duration-150"
          style={{ borderColor: 'var(--border-default)', background: 'var(--surface-elevated)' }}
        >
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              {fileName ? `${fileName} (${csvData.length} lignes)` : 'Cliquez pour sélectionner un CSV'}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>CSV avec en-têtes</p>
          </label>
        </div>
      </Card>

      {/* Step 2: Mapping */}
      {headers.length > 0 && (
        <Card animate>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Mapper les colonnes</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Compte cible</label>
              <select value={accountId} onChange={e => setAccountId(e.target.value)} className="form-input" required>
                <option value="">Sélectionner...</option>
                {accounts.map(a => (<option key={a.id} value={a.id}>{a.name} ({a.currency})</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Format de date</label>
              <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="form-input">
                <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Colonne Date</label>
              <select value={dateCol} onChange={e => setDateCol(e.target.value)} className="form-input">
                <option value="">Sélectionner...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Colonne Montant</label>
              <select value={amountCol} onChange={e => setAmountCol(e.target.value)} className="form-input">
                <option value="">Sélectionner...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Colonne Description</label>
              <select value={descCol} onChange={e => setDescCol(e.target.value)} className="form-input">
                <option value="">Sélectionner...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Preview */}
      {csvData.length > 0 && dateCol && amountCol && descCol && (
        <Card padding={false} animate>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Aperçu (5 premières lignes)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--surface-elevated)' }}>
                  <th className="px-4 py-2.5 text-left font-medium" style={{ color: 'var(--text-tertiary)' }}>Date</th>
                  <th className="px-4 py-2.5 text-left font-medium" style={{ color: 'var(--text-tertiary)' }}>Description</th>
                  <th className="px-4 py-2.5 text-right font-medium" style={{ color: 'var(--text-tertiary)' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, i) => {
                  const amt = parseAmount(row[amountCol]);
                  return (
                    <tr key={i} className="border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="px-4 py-2.5" style={{ color: 'var(--text-primary)' }}>{row[dateCol]}</td>
                      <td className="px-4 py-2.5" style={{ color: 'var(--text-primary)' }}>{row[descCol]}</td>
                      <td className="px-4 py-2.5 text-right font-medium stat-value" style={{
                        color: amt !== null && amt < 0 ? 'var(--color-danger)' : 'var(--color-success)'
                      }}>
                        {amt !== null ? formatCurrency(amt, accounts.find(a => a.id === accountId)?.currency ?? 'EUR') : row[amountCol]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Import button */}
      {csvData.length > 0 && accountId && dateCol && amountCol && descCol && (
        <div className="animate-slide-up">
          <Button onClick={handleImport} loading={importing} size="lg">
            {importing ? 'Import en cours...' : `Importer ${csvData.length} transactions`}
          </Button>
        </div>
      )}

      {accounts.length === 0 && (
        <Card className="text-center py-8" animate>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Créez d&apos;abord un compte pour importer des transactions.</p>
        </Card>
      )}
    </div>
  );
}
