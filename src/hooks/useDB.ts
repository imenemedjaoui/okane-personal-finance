'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Account, Transaction, Category, Budget, AppSettings, RecurringTransaction } from '@/types';
import { DEFAULT_CATEGORIES } from '@/types';
import type { RecurringFrequency } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export function useAccounts() {
  const accounts = useLiveQuery(() => db.accounts.toArray()) ?? [];

  const addAccount = useCallback(async (account: Omit<Account, 'id' | 'createdAt'>) => {
    const id = generateId();
    await db.accounts.add({ ...account, id, createdAt: new Date() });
    return id;
  }, []);

  const updateAccount = useCallback(async (id: string, data: Partial<Account>) => {
    await db.accounts.update(id, data);
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    await db.transaction('rw', [db.accounts, db.transactions], async () => {
      await db.accounts.delete(id);
      await db.transactions.where('accountId').equals(id).delete();
    });
  }, []);

  return { accounts, addAccount, updateAccount, deleteAccount };
}

export function useTransactions(filters?: {
  accountId?: string;
  type?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}) {
  const transactions = useLiveQuery(async () => {
    let collection = db.transactions.orderBy('date');
    let results = await collection.reverse().toArray();

    if (filters?.accountId) {
      results = results.filter(t => t.accountId === filters.accountId);
    }
    if (filters?.type) {
      results = results.filter(t => t.type === filters.type);
    }
    if (filters?.category) {
      results = results.filter(t => t.category === filters.category);
    }
    if (filters?.startDate) {
      results = results.filter(t => new Date(t.date) >= filters.startDate!);
    }
    if (filters?.endDate) {
      results = results.filter(t => new Date(t.date) <= filters.endDate!);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(t =>
        t.description.toLowerCase().includes(s) ||
        t.category.toLowerCase().includes(s) ||
        t.notes?.toLowerCase().includes(s)
      );
    }
    return results;
  }, [filters?.accountId, filters?.type, filters?.category, filters?.startDate, filters?.endDate, filters?.search]) ?? [];

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = generateId();
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      await db.transactions.add({ ...tx, id, createdAt: new Date() });
      // Update account balance
      const delta = tx.type === 'income' ? tx.amount : -tx.amount;
      const account = await db.accounts.get(tx.accountId);
      if (account) {
        await db.accounts.update(tx.accountId, { balance: account.balance + delta });
      }
      // For transfers, update the target account too
      if (tx.type === 'transfer' && tx.toAccountId) {
        const toAccount = await db.accounts.get(tx.toAccountId);
        if (toAccount) {
          await db.accounts.update(tx.toAccountId, { balance: toAccount.balance + tx.amount });
        }
      }
    });
    return id;
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      const old = await db.transactions.get(id);
      if (!old) return;
      // Reverse old balance impact
      const oldDelta = old.type === 'income' ? -old.amount : old.amount;
      const oldAccount = await db.accounts.get(old.accountId);
      if (oldAccount) await db.accounts.update(old.accountId, { balance: oldAccount.balance + oldDelta });
      if (old.type === 'transfer' && old.toAccountId) {
        const oldTo = await db.accounts.get(old.toAccountId);
        if (oldTo) await db.accounts.update(old.toAccountId, { balance: oldTo.balance - old.amount });
      }
      // Apply update
      const updated = { ...old, ...data };
      await db.transactions.update(id, data);
      // Apply new balance impact
      const newDelta = updated.type === 'income' ? updated.amount : -updated.amount;
      const newAccount = await db.accounts.get(updated.accountId);
      if (newAccount) await db.accounts.update(updated.accountId, { balance: newAccount.balance + newDelta });
      if (updated.type === 'transfer' && updated.toAccountId) {
        const newTo = await db.accounts.get(updated.toAccountId);
        if (newTo) await db.accounts.update(updated.toAccountId, { balance: newTo.balance + updated.amount });
      }
    });
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      const tx = await db.transactions.get(id);
      if (tx) {
        const delta = tx.type === 'income' ? -tx.amount : tx.amount;
        const account = await db.accounts.get(tx.accountId);
        if (account) {
          await db.accounts.update(tx.accountId, { balance: account.balance + delta });
        }
        if (tx.type === 'transfer' && tx.toAccountId) {
          const toAccount = await db.accounts.get(tx.toAccountId);
          if (toAccount) {
            await db.accounts.update(tx.toAccountId, { balance: toAccount.balance - tx.amount });
          }
        }
        await db.transactions.delete(id);
      }
    });
  }, []);

  return { transactions, addTransaction, updateTransaction, deleteTransaction };
}

export function useCategories() {
  const [initialized, setInitialized] = useState(false);
  const categories = useLiveQuery(() => db.categories.toArray()) ?? [];

  useEffect(() => {
    if (initialized) return;
    db.categories.count().then(count => {
      if (count === 0) {
        const cats = DEFAULT_CATEGORIES.map(c => ({ ...c, id: generateId() }));
        db.categories.bulkAdd(cats);
      }
      setInitialized(true);
    });
  }, [initialized]);

  const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
    const id = generateId();
    await db.categories.add({ ...cat, id });
    return id;
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    await db.categories.update(id, data);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await db.categories.delete(id);
  }, []);

  return { categories, addCategory, updateCategory, deleteCategory };
}

export function useBudgets() {
  const budgets = useLiveQuery(() => db.budgets.toArray()) ?? [];

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    const id = generateId();
    await db.budgets.add({ ...budget, id });
    return id;
  }, []);

  const updateBudget = useCallback(async (id: string, data: Partial<Budget>) => {
    await db.budgets.update(id, data);
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    await db.budgets.delete(id);
  }, []);

  return { budgets, addBudget, updateBudget, deleteBudget };
}

/* ─── Recurring Transactions ─── */

function computeNextDate(from: Date, frequency: RecurringFrequency): Date {
  const d = new Date(from);
  switch (frequency) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'quarterly': d.setMonth(d.getMonth() + 3); break;
    case 'semi-annually': d.setMonth(d.getMonth() + 6); break;
    case 'annually': d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

export function useRecurringTransactions() {
  const recurrings = useLiveQuery(() => db.recurringTransactions.toArray()) ?? [];

  const addRecurring = useCallback(async (data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'nextDate'>) => {
    const id = generateId();
    await db.recurringTransactions.add({
      ...data,
      id,
      nextDate: new Date(data.startDate),
      createdAt: new Date(),
    });
    return id;
  }, []);

  const updateRecurring = useCallback(async (id: string, data: Partial<RecurringTransaction>) => {
    await db.recurringTransactions.update(id, data);
  }, []);

  const deleteRecurring = useCallback(async (id: string) => {
    await db.recurringTransactions.delete(id);
  }, []);

  const processRecurrings = useCallback(async () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const all = await db.recurringTransactions.toArray();
    const active = all.filter(r => r.isActive);

    for (const rec of active) {
      if (rec.endDate && new Date(rec.endDate) < new Date()) {
        await db.recurringTransactions.update(rec.id, { isActive: false });
        continue;
      }

      let nextDate = new Date(rec.nextDate);
      while (nextDate <= today) {
        if (rec.endDate && nextDate > new Date(rec.endDate)) break;

        const txId = generateId();
        await db.transaction('rw', [db.transactions, db.accounts, db.recurringTransactions], async () => {
          await db.transactions.add({
            id: txId,
            accountId: rec.accountId,
            type: rec.type,
            amount: rec.amount,
            currency: rec.currency,
            category: rec.category,
            description: rec.description,
            date: new Date(nextDate),
            categorySource: 'auto',
            createdAt: new Date(),
          });
          const delta = rec.type === 'income' ? rec.amount : -rec.amount;
          const account = await db.accounts.get(rec.accountId);
          if (account) {
            await db.accounts.update(rec.accountId, { balance: account.balance + delta });
          }
        });

        nextDate = computeNextDate(nextDate, rec.frequency);
      }

      await db.recurringTransactions.update(rec.id, { nextDate });
    }
  }, []);

  return { recurrings, addRecurring, updateRecurring, deleteRecurring, processRecurrings };
}

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('main')) ?? null;

  const updateSettings = useCallback(async (data: Partial<AppSettings>) => {
    const existing = await db.settings.get('main');
    if (existing) {
      await db.settings.update('main', data);
    } else {
      await db.settings.add({
        id: 'main',
        defaultCurrency: 'EUR',
        locale: 'fr-FR',
        theme: 'light',
        csvMappings: {},
        ...data,
      });
    }
  }, []);

  return { settings, updateSettings };
}
