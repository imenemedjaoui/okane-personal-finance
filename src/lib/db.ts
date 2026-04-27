import Dexie, { type Table } from 'dexie';
import type { Account, Transaction, Category, Budget, AppSettings, RecurringTransaction, WishlistItem } from '@/types';

export class OkaneDB extends Dexie {
  accounts!: Table<Account>;
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  budgets!: Table<Budget>;
  settings!: Table<AppSettings>;
  recurringTransactions!: Table<RecurringTransaction>;
  wishlistItems!: Table<WishlistItem>;

  constructor() {
    super('okane-db');
    this.version(1).stores({
      accounts: 'id, name, currency, createdAt',
      transactions: 'id, accountId, type, category, date, currency, createdAt, toAccountId',
      categories: 'id, name, type, parentId',
      budgets: 'id, categoryId, period',
      settings: 'id',
    });
    this.version(2).stores({
      accounts: 'id, name, currency, createdAt',
      transactions: 'id, accountId, type, category, date, currency, createdAt, toAccountId',
      categories: 'id, name, type, parentId',
      budgets: 'id, categoryId, period',
      settings: 'id',
      recurringTransactions: 'id, accountId, type, frequency, nextDate, isActive',
    });
    this.version(3).stores({
      accounts: 'id, name, currency, createdAt',
      transactions: 'id, accountId, type, category, date, currency, createdAt, toAccountId',
      categories: 'id, name, type, parentId',
      budgets: 'id, categoryId, period',
      settings: 'id',
      recurringTransactions: 'id, accountId, type, frequency, nextDate, isActive',
      wishlistItems: 'id, categoryId, priority, purchased, createdAt',
    });
  }
}

export const db = new OkaneDB();
