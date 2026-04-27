import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { DEFAULT_CATEGORIES } from '@/types';

export async function loadDemoData() {
  // Clear existing data
  await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.budgets, db.recurringTransactions, db.wishlistItems], async () => {
    await db.accounts.clear();
    await db.transactions.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await db.recurringTransactions.clear();
    await db.wishlistItems.clear();
  });

  // Create categories
  const cats = DEFAULT_CATEGORIES.map(c => ({ ...c, id: generateId() }));
  await db.categories.bulkAdd(cats);

  const getCatId = (name: string) => cats.find(c => c.name === name)?.id ?? cats[0].id;

  // Create accounts
  const mainAccount = {
    id: generateId(),
    name: 'Compte courant',
    currency: 'EUR',
    balance: 2847.50,
    color: '#4F46E5',
    icon: '🏦',
    createdAt: new Date(),
  };

  const savingsAccount = {
    id: generateId(),
    name: 'Livret A',
    currency: 'EUR',
    balance: 8500.00,
    color: '#059669',
    icon: '💰',
    createdAt: new Date(),
  };

  const usdAccount = {
    id: generateId(),
    name: 'Compte USD (PayPal)',
    currency: 'USD',
    balance: 423.80,
    color: '#2563EB',
    icon: '💳',
    createdAt: new Date(),
  };

  await db.accounts.bulkAdd([mainAccount, savingsAccount, usdAccount]);

  // Create transactions (last 3 months)
  const now = new Date();
  const transactions = [
    // This month
    { accountId: mainAccount.id, type: 'income' as const, amount: 2800, currency: 'EUR', category: getCatId('Salaire'), description: 'Salaire Mars 2026', date: new Date(now.getFullYear(), now.getMonth(), 1), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 750, currency: 'EUR', category: getCatId('Logement'), description: 'Loyer Mars', date: new Date(now.getFullYear(), now.getMonth(), 3), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 85.40, currency: 'EUR', category: getCatId('Alimentation'), description: 'Courses Carrefour', date: new Date(now.getFullYear(), now.getMonth(), 5), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 32.50, currency: 'EUR', category: getCatId('Restaurant'), description: 'Déjeuner restaurant italien', date: new Date(now.getFullYear(), now.getMonth(), 7), categorySource: 'manual' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 45.00, currency: 'EUR', category: getCatId('Transport'), description: 'Essence Total', date: new Date(now.getFullYear(), now.getMonth(), 8), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 12.99, currency: 'EUR', category: getCatId('Loisirs'), description: 'Abonnement Netflix', date: new Date(now.getFullYear(), now.getMonth(), 10), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 67.20, currency: 'EUR', category: getCatId('Alimentation'), description: 'Courses Leclerc', date: new Date(now.getFullYear(), now.getMonth(), 12), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 19.99, currency: 'EUR', category: getCatId('Abonnements'), description: 'Forfait mobile Free', date: new Date(now.getFullYear(), now.getMonth(), 15), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 54.90, currency: 'EUR', category: getCatId('Shopping'), description: 'Amazon - Casque audio', date: new Date(now.getFullYear(), now.getMonth(), 18), categorySource: 'auto' as const },
    { accountId: usdAccount.id, type: 'income' as const, amount: 150, currency: 'USD', category: getCatId('Freelance'), description: 'Freelance - Logo design', date: new Date(now.getFullYear(), now.getMonth(), 14), categorySource: 'manual' as const },

    // Last month
    { accountId: mainAccount.id, type: 'income' as const, amount: 2800, currency: 'EUR', category: getCatId('Salaire'), description: 'Salaire Février 2026', date: new Date(now.getFullYear(), now.getMonth() - 1, 1), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 750, currency: 'EUR', category: getCatId('Logement'), description: 'Loyer Février', date: new Date(now.getFullYear(), now.getMonth() - 1, 3), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 120.30, currency: 'EUR', category: getCatId('Alimentation'), description: 'Courses Auchan', date: new Date(now.getFullYear(), now.getMonth() - 1, 6), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 89.00, currency: 'EUR', category: getCatId('Santé'), description: 'Consultation médecin + pharmacie', date: new Date(now.getFullYear(), now.getMonth() - 1, 10), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 42.00, currency: 'EUR', category: getCatId('Transport'), description: 'Plein essence', date: new Date(now.getFullYear(), now.getMonth() - 1, 12), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 25.50, currency: 'EUR', category: getCatId('Loisirs'), description: 'Cinéma + popcorn', date: new Date(now.getFullYear(), now.getMonth() - 1, 20), categorySource: 'manual' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 198.00, currency: 'EUR', category: getCatId('Shopping'), description: 'Zara - Vêtements', date: new Date(now.getFullYear(), now.getMonth() - 1, 22), categorySource: 'auto' as const },
    { accountId: usdAccount.id, type: 'income' as const, amount: 273.80, currency: 'USD', category: getCatId('Freelance'), description: 'Freelance - Web development', date: new Date(now.getFullYear(), now.getMonth() - 1, 18), categorySource: 'manual' as const },

    // 2 months ago
    { accountId: mainAccount.id, type: 'income' as const, amount: 2800, currency: 'EUR', category: getCatId('Salaire'), description: 'Salaire Janvier 2026', date: new Date(now.getFullYear(), now.getMonth() - 2, 1), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 750, currency: 'EUR', category: getCatId('Logement'), description: 'Loyer Janvier', date: new Date(now.getFullYear(), now.getMonth() - 2, 3), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 95.60, currency: 'EUR', category: getCatId('Alimentation'), description: 'Courses Lidl', date: new Date(now.getFullYear(), now.getMonth() - 2, 7), categorySource: 'auto' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 350.00, currency: 'EUR', category: getCatId('Éducation'), description: 'Formation Udemy - React avancé', date: new Date(now.getFullYear(), now.getMonth() - 2, 15), categorySource: 'manual' as const },
    { accountId: mainAccount.id, type: 'expense' as const, amount: 38.50, currency: 'EUR', category: getCatId('Restaurant'), description: 'Sushi restaurant', date: new Date(now.getFullYear(), now.getMonth() - 2, 20), categorySource: 'manual' as const },
  ];

  const txsToAdd = transactions.map(t => ({
    ...t,
    id: generateId(),
    createdAt: new Date(),
  }));
  await db.transactions.bulkAdd(txsToAdd);

  // Create wishlist items
  await db.wishlistItems.bulkAdd([
    { id: generateId(), name: 'AirPods Pro', price: 279, currency: 'EUR', categoryId: getCatId('Électronique'), priority: 'high' as const, notes: 'Modèle avec USB-C', purchased: false, createdAt: new Date() },
    { id: generateId(), name: 'Abonnement salle de sport', price: 29.99, currency: 'EUR', categoryId: getCatId('Sport & Fitness'), priority: 'medium' as const, notes: 'Basic Fit - forfait mensuel', purchased: false, createdAt: new Date() },
    { id: generateId(), name: 'Livre "Clean Code"', price: 35, currency: 'EUR', categoryId: getCatId('Livres & Presse'), priority: 'low' as const, purchased: false, createdAt: new Date() },
  ]);

  // Create budgets
  await db.budgets.bulkAdd([
    { id: generateId(), categoryId: getCatId('Alimentation'), amount: 300, currency: 'EUR', period: 'monthly' as const, startDate: new Date() },
    { id: generateId(), categoryId: getCatId('Restaurant'), amount: 100, currency: 'EUR', period: 'monthly' as const, startDate: new Date() },
    { id: generateId(), categoryId: getCatId('Transport'), amount: 120, currency: 'EUR', period: 'monthly' as const, startDate: new Date() },
    { id: generateId(), categoryId: getCatId('Loisirs'), amount: 80, currency: 'EUR', period: 'monthly' as const, startDate: new Date() },
    { id: generateId(), categoryId: getCatId('Shopping'), amount: 150, currency: 'EUR', period: 'monthly' as const, startDate: new Date() },
  ]);
}

export async function clearAllData() {
  await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.budgets, db.settings, db.recurringTransactions, db.wishlistItems], async () => {
    await db.accounts.clear();
    await db.transactions.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await db.settings.clear();
    await db.recurringTransactions.clear();
    await db.wishlistItems.clear();
  });
}
