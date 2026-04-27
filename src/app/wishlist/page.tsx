'use client';

import { useState } from 'react';
import { useWishlist, useCategories, useAccounts } from '@/hooks/useDB';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import { CURRENCIES, PRIORITY_LABELS } from '@/types';
import type { WishlistItem, WishlistPriority } from '@/types';

const PRIORITY_COLORS: Record<WishlistPriority, { bg: string; text: string }> = {
  high: { bg: 'var(--color-danger-subtle)', text: 'var(--color-danger)' },
  medium: { bg: 'var(--color-warning-subtle)', text: 'var(--color-warning)' },
  low: { bg: 'var(--accent-primary-subtle)', text: 'var(--accent-primary)' },
};

export default function WishlistPage() {
  const { items, addItem, updateItem, deleteItem, purchaseItem } = useWishlist();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasingItem, setPurchasingItem] = useState<WishlistItem | null>(null);
  const [purchaseAccountId, setPurchaseAccountId] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<WishlistPriority>('medium');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');

  // Filter
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.purchased;
    if (filter === 'purchased') return item.purchased;
    return true;
  });

  const pendingItems = items.filter(i => !i.purchased);
  const totalPending = pendingItems.reduce((sum, i) => sum + i.price, 0);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCurrency('EUR');
    setCategoryId('');
    setPriority('medium');
    setNotes('');
    setUrl('');
  };

  const openCreate = () => {
    setEditingItem(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item: WishlistItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(String(item.price));
    setCurrency(item.currency);
    setCategoryId(item.categoryId);
    setPriority(item.priority);
    setNotes(item.notes ?? '');
    setUrl(item.url ?? '');
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    const data = {
      name,
      price: parseFloat(price),
      currency,
      categoryId,
      priority,
      notes: notes || undefined,
      url: url || undefined,
    };
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await addItem(data);
    }
    handleClose();
  };

  const openPurchase = (item: WishlistItem) => {
    setPurchasingItem(item);
    setPurchaseAccountId(accounts.length > 0 ? accounts[0].id : '');
    setShowPurchaseModal(true);
  };

  const handlePurchase = async () => {
    if (!purchasingItem || !purchaseAccountId) return;
    await purchaseItem(purchasingItem.id, purchaseAccountId);
    setShowPurchaseModal(false);
    setPurchasingItem(null);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Liste de souhaits</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {pendingItems.length} souhait{pendingItems.length !== 1 ? 's' : ''} en attente
            {pendingItems.length > 0 && <> &middot; Total : {formatCurrency(totalPending, 'EUR')}</>}
          </p>
        </div>
        <Button onClick={openCreate}>+ Nouveau souhait</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 animate-slide-up stagger-1">
        {(['all', 'pending', 'purchased'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
            style={{
              background: filter === f ? 'var(--accent-primary)' : 'var(--surface-elevated)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
            }}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Achetés'}
          </button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item, i) => {
            const cat = categories.find(c => c.id === item.categoryId);
            const priorityStyle = PRIORITY_COLORS[item.priority];
            const purchasedAccount = item.purchasedAccountId
              ? accounts.find(a => a.id === item.purchasedAccountId)
              : null;

            return (
              <Card key={item.id} animate stagger={Math.min(i + 2, 6)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                      style={{ background: cat?.color ? cat.color + '15' : 'var(--surface-elevated)' }}
                    >
                      {cat?.icon ?? ''}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-sm font-medium truncate"
                          style={{
                            color: 'var(--text-primary)',
                            textDecoration: item.purchased ? 'line-through' : 'none',
                            opacity: item.purchased ? 0.6 : 1,
                          }}
                        >
                          {item.name}
                        </h3>
                        <span
                          className="badge shrink-0"
                          style={{ background: priorityStyle.bg, color: priorityStyle.text }}
                        >
                          {PRIORITY_LABELS[item.priority]}
                        </span>
                        {item.purchased && (
                          <span
                            className="badge shrink-0"
                            style={{ background: 'var(--color-success-subtle)', color: 'var(--color-success)' }}
                          >
                            Acheté
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {cat?.name ?? 'Catégorie'}
                        {item.notes && <> &middot; {item.notes}</>}
                      </p>
                      {item.purchased && purchasedAccount && (
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          Acheté le {new Date(item.purchasedAt!).toLocaleDateString('fr-FR')} via {purchasedAccount.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(item.price, item.currency)}
                    </span>
                    {!item.purchased && (
                      <button
                        onClick={() => openPurchase(item)}
                        className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Confirmer l'achat"
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--color-success)';
                          e.currentTarget.style.background = 'var(--color-success-subtle)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2.5 7 5.5 10 11.5 4" />
                        </svg>
                      </button>
                    )}
                    {!item.purchased && (
                      <button
                        onClick={() => openEdit(item)}
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
                    )}
                    <button
                      onClick={() => deleteItem(item.id)}
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
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12" animate>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Aucun souhait</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Ajoutez des objets ou services que vous aimeriez acheter
          </p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={handleClose} title={editingItem ? 'Modifier le souhait' : 'Nouveau souhait'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: MacBook Pro, Abonnement gym..."
              className="form-input"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Prix</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="form-input"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Devise</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="form-input">
                {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.code}</option>))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Catégorie</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input" required>
                <option value="">Sélectionner...</option>
                {expenseCategories.map(c => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Priorité</label>
              <select value={priority} onChange={e => setPriority(e.target.value as WishlistPriority)} className="form-input">
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Lien (optionnel)</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes (optionnel)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Détails supplémentaires..."
              className="form-input"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" type="button" onClick={handleClose}>Annuler</Button>
            <Button type="submit">{editingItem ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Confirmer l'achat" size="sm">
        {purchasingItem && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{purchasingItem.name}</p>
              <p className="text-lg font-semibold mt-1" style={{ color: 'var(--accent-primary)' }}>
                {formatCurrency(purchasingItem.price, purchasingItem.currency)}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Compte de paiement
              </label>
              <select
                value={purchaseAccountId}
                onChange={e => setPurchaseAccountId(e.target.value)}
                className="form-input"
                required
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} ({formatCurrency(a.balance, a.currency)})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Une transaction de dépense sera créée automatiquement sur le compte sélectionné.
            </p>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="secondary" type="button" onClick={() => setShowPurchaseModal(false)}>Annuler</Button>
              <Button onClick={handlePurchase}>Confirmer l'achat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
