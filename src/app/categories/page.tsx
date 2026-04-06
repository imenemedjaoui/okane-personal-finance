'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useDB';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import type { Category, TransactionType } from '@/types';

const ICONS = ['🛒','🍽️','☕','🏠','💡','🛋️','🚗','🚇','🚕','🔧','👕','📱','📦','🏥','🏋️','💆','🎮','🎉','📺','📖','✈️','🏨','📚','✏️','📡','🛡️','☁️','🏦','📋','💳','👶','🐾','🎁','❤️','💰','💻','📈','🏛️','🔑','🏷️','🔄','⚡','🎵','🍺','🏪','💊','🎨','🏕️','🎭','💎'];
const COLORS = ['#4CAF50','#FF9800','#795548','#9C27B0','#AB47BC','#8D6E63','#2196F3','#1976D2','#42A5F5','#0D47A1','#E91E63','#FF5722','#FF7043','#F44336','#E53935','#EC407A','#7C4DFF','#AA00FF','#D500F9','#6200EA','#00BCD4','#0097A7','#3F51B5','#5C6BC0','#009688','#546E7A','#26A69A','#78909C','#455A64','#37474F','#F48FB1','#A1887F','#F06292','#EF5350'];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [color, setColor] = useState('#4CAF50');
  const [type, setType] = useState<TransactionType>('expense');
  const [keywords, setKeywords] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName(''); setIcon('📦'); setColor('#4CAF50'); setType('expense'); setKeywords('');
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name); setIcon(cat.icon); setColor(cat.color); setType(cat.type); setKeywords(cat.keywords.join(', '));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const kw = keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (editing) {
      await updateCategory(editing.id, { name, icon, color, type, keywords: kw });
    } else {
      await addCategory({ name, icon, color, type, keywords: kw });
    }
    setShowForm(false);
  };

  const handleDelete = async (cat: Category) => {
    if (confirm(`Supprimer la catégorie "${cat.name}" ?`)) {
      await deleteCategory(cat.id);
    }
  };

  const filtered = filterType === 'all' ? categories : categories.filter(c => c.type === filterType);
  const expenseCount = categories.filter(c => c.type === 'expense').length;
  const incomeCount = categories.filter(c => c.type === 'income').length;

  const tabs = [
    { key: 'all' as const, label: `Toutes (${categories.length})` },
    { key: 'expense' as const, label: `Dépenses (${expenseCount})` },
    { key: 'income' as const, label: `Revenus (${incomeCount})` },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Catégories</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate}>+ Nouvelle</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-lg animate-slide-up stagger-1" style={{ background: 'var(--surface-elevated)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className="tab-pill flex-1 text-center"
            style={{
              background: filterType === tab.key ? 'var(--surface-card)' : 'transparent',
              color: filterType === tab.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: filterType === tab.key ? 'var(--shadow-sm)' : 'none',
              fontWeight: filterType === tab.key ? 600 : 500,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((cat, i) => (
          <Card key={cat.id} animate stagger={Math.min(i % 6 + 1, 5)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: cat.color + '15' }}
                >
                  {cat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                  <span
                    className="badge mt-0.5"
                    style={{
                      background: cat.type === 'expense' ? 'var(--color-danger-subtle)' : 'var(--color-success-subtle)',
                      color: cat.type === 'expense' ? 'var(--color-danger)' : 'var(--color-success)',
                    }}
                  >
                    {cat.type === 'expense' ? 'Dépense' : 'Revenu'}
                  </span>
                </div>
              </div>
              <div className="flex gap-0.5">
                <button
                  onClick={() => openEdit(cat)}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'var(--accent-primary-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" /><line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              </div>
            </div>
            {cat.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {cat.keywords.slice(0, 3).map(kw => (
                  <span
                    key={kw}
                    className="text-[10px] px-1.5 py-0.5 rounded-md"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--text-tertiary)' }}
                  >
                    {kw}
                  </span>
                ))}
                {cat.keywords.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    +{cat.keywords.length - 3}
                  </span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Form modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Alimentation" className="form-input" required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type</label>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-elevated)' }}>
              {(['expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-2 rounded-md text-xs font-medium transition-all duration-150"
                  style={{
                    background: type === t ? 'var(--surface-card)' : 'transparent',
                    color: type === t ? (t === 'expense' ? 'var(--color-danger)' : 'var(--color-success)') : 'var(--text-tertiary)',
                    boxShadow: type === t ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {t === 'expense' ? 'Dépense' : 'Revenu'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Icône</label>
            <div className="flex gap-1 flex-wrap max-h-28 overflow-y-auto p-1">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all duration-150"
                  style={{
                    border: `2px solid ${icon === i ? 'var(--accent-primary)' : 'transparent'}`,
                    background: icon === i ? 'var(--accent-primary-subtle)' : 'var(--surface-elevated)',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Couleur</label>
            <div className="flex gap-1.5 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: c,
                    border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                    boxShadow: color === c ? `0 0 0 2px var(--surface-card), 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Mots-clés (séparés par des virgules)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="Ex: supermarché, carrefour, leclerc"
              className="form-input"
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Utilisés pour la catégorisation automatique lors de l&apos;import CSV
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit">{editing ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
