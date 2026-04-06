'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAccounts, useTransactions, useCategories, useBudgets } from '@/hooks/useDB';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency, getMonthKey, getMonthLabel } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';

function ClientOnly({ children, fallbackHeight }: { children: React.ReactNode; fallbackHeight?: number | string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height: fallbackHeight ?? 200 }} />;
  return <>{children}</>;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#84CC16', '#F97316'];

/* ─── Custom Tooltips ─── */

function AreaTooltip({ active, payload, label, isDark }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string; isDark: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-xs" style={{
      background: isDark ? '#1E293B' : '#FFFFFF',
      border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
    }}>
      <p className="font-semibold mb-1.5" style={{ color: isDark ? '#F1F5F9' : '#111827' }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>{entry.dataKey}</span>
          <span className="ml-auto font-semibold stat-value" style={{ color: isDark ? '#F1F5F9' : '#111827' }}>
            {formatCurrency(entry.value, 'EUR')}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label, isDark }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; isDark: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{
      background: isDark ? '#1E293B' : '#FFFFFF',
      border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
      boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p className="font-medium" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>{label}</p>
      <p className="font-bold stat-value" style={{ color: isDark ? '#F1F5F9' : '#111827' }}>
        {formatCurrency(payload[0].value, 'EUR')}
      </p>
    </div>
  );
}

function PieTooltip({ active, payload, isDark }: { active?: boolean; payload?: Array<{ name: string; value: number }>; isDark: boolean }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{
      background: isDark ? '#1E293B' : '#FFFFFF',
      border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
      boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p className="font-medium" style={{ color: isDark ? '#94A3B8' : '#6B7280' }}>{item.name}</p>
      <p className="font-bold stat-value" style={{ color: isDark ? '#F1F5F9' : '#111827' }}>
        {formatCurrency(item.value, 'EUR')}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets } = useBudgets();
  const { theme } = useTheme();

  /* ─── Stats ─── */

  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const prevMonthKey = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1));

  const stats = useMemo(() => {
    const monthTxs = transactions.filter(t => getMonthKey(new Date(t.date)) === currentMonthKey);
    const prevTxs = transactions.filter(t => getMonthKey(new Date(t.date)) === prevMonthKey);
    const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, monthTxs, prevIncome, prevExpense, prevBalance: prevIncome - prevExpense };
  }, [transactions, currentMonthKey, prevMonthKey]);

  const pctChange = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  /* ─── Expenses by category ─── */

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    stats.monthTxs.filter(t => t.type === 'expense').forEach(t => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });
    return Array.from(map.entries()).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return { name: cat?.name ?? 'Autre', value: amount, icon: cat?.icon ?? '' };
    }).sort((a, b) => b.value - a.value);
  }, [stats.monthTxs, categories]);

  const totalExpensesMonth = useMemo(() =>
    expensesByCategory.reduce((s, c) => s + c.value, 0),
    [expensesByCategory]
  );

  /* ─── Monthly trend (6 months) ─── */

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedTxs.forEach(t => {
      const key = getMonthKey(new Date(t.date));
      const entry = map.get(key) ?? { income: 0, expense: 0 };
      if (t.type === 'income') entry.income += t.amount;
      if (t.type === 'expense') entry.expense += t.amount;
      map.set(key, entry);
    });
    return Array.from(map.entries()).slice(-6).map(([key, data]) => ({
      month: getMonthLabel(key),
      Revenus: Math.round(data.income),
      Dépenses: Math.round(data.expense),
    }));
  }, [transactions]);

  /* ─── Daily spending (current month) ─── */

  const dailySpending = useMemo(() => {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const days: { day: string; amount: number; label: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(now.getFullYear(), now.getMonth(), d);
      const dayTxs = stats.monthTxs.filter(t => {
        const td = new Date(t.date);
        return td.getDate() === d && t.type === 'expense';
      });
      const total = dayTxs.reduce((s, t) => s + t.amount, 0);
      days.push({
        day: String(d),
        amount: Math.round(total * 100) / 100,
        label: dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [stats.monthTxs, now]);

  /* ─── Balance evolution ─── */

  const balanceEvolution = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sorted.length === 0) return [];
    const monthMap = new Map<string, number>();
    let running = 0;
    sorted.forEach(t => {
      const key = getMonthKey(new Date(t.date));
      running += t.type === 'income' ? t.amount : -t.amount;
      monthMap.set(key, running);
    });
    return Array.from(monthMap.entries()).slice(-6).map(([key, balance]) => ({
      month: getMonthLabel(key),
      Solde: Math.round(balance),
    }));
  }, [transactions]);

  /* ─── Savings rate ─── */

  const savingsRate = stats.totalIncome > 0 ? Math.round((stats.balance / stats.totalIncome) * 100) : 0;
  const savingsRadial = [{ name: 'Épargne', value: Math.max(0, Math.min(100, savingsRate)), fill: savingsRate >= 0 ? '#10B981' : '#EF4444' }];

  /* ─── Top expenses ─── */

  const topExpenses = useMemo(() => {
    return stats.monthTxs
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(t => {
        const cat = categories.find(c => c.id === t.category);
        return { ...t, catName: cat?.name ?? '', catIcon: cat?.icon ?? '', catColor: cat?.color ?? '#6B7280' };
      });
  }, [stats.monthTxs, categories]);

  /* ─── Budget status ─── */

  const budgetStatus = useMemo(() => {
    return budgets.map(b => {
      const cat = categories.find(c => c.id === b.categoryId);
      const spent = stats.monthTxs
        .filter(t => t.type === 'expense' && t.category === b.categoryId)
        .reduce((s, t) => s + t.amount, 0);
      const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return { ...b, catName: cat?.name ?? '?', catIcon: cat?.icon ?? '', spent, pct };
    });
  }, [budgets, categories, stats.monthTxs]);

  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#475569' : '#D1D5DB';
  const gridColor = isDark ? 'rgba(51,65,85,0.4)' : 'rgba(0,0,0,0.05)';
  const cardBg = isDark ? '#151D2E' : '#FFFFFF';

  function TrendBadge({ value }: { value: number }) {
    const positive = value >= 0;
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{
        background: positive ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
        color: positive ? 'var(--color-success)' : 'var(--color-danger)',
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {positive ? <polyline points="1 7 5 3 9 7" /> : <polyline points="1 3 5 7 9 3" />}
        </svg>
        {Math.abs(value)}%
      </span>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Vue d&apos;ensemble de vos finances</p>
      </div>

      {/* ══════ KPI ROW ══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card animate stagger={1}>
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Solde total</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M2 7h12"/></svg>
            </div>
          </div>
          <p className="text-2xl font-bold stat-value mt-2" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalBalance, 'EUR')}</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{accounts.length} compte{accounts.length > 1 ? 's' : ''}</p>
        </Card>
        <Card animate stagger={2}>
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Revenus</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-success-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round"><path d="M8 12V4M5 7l3-3 3 3"/></svg>
            </div>
          </div>
          <p className="text-2xl font-bold stat-value mt-2" style={{ color: 'var(--color-success)' }}>+{formatCurrency(stats.totalIncome, 'EUR')}</p>
          <div className="flex items-center gap-2 mt-1">
            <TrendBadge value={pctChange(stats.totalIncome, stats.prevIncome)} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>vs mois dernier</span>
          </div>
        </Card>
        <Card animate stagger={3}>
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Dépenses</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-danger-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round"><path d="M8 4v8M5 9l3 3 3-3"/></svg>
            </div>
          </div>
          <p className="text-2xl font-bold stat-value mt-2" style={{ color: 'var(--color-danger)' }}>-{formatCurrency(stats.totalExpense, 'EUR')}</p>
          <div className="flex items-center gap-2 mt-1">
            <TrendBadge value={-pctChange(stats.totalExpense, stats.prevExpense)} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>vs mois dernier</span>
          </div>
        </Card>
        <Card animate stagger={4}>
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Épargne</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stats.balance >= 0 ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={stats.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v6M6 7.5h4"/></svg>
            </div>
          </div>
          <p className="text-2xl font-bold stat-value mt-2" style={{ color: stats.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {stats.balance >= 0 ? '+' : ''}{formatCurrency(stats.balance, 'EUR')}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <TrendBadge value={pctChange(stats.balance, stats.prevBalance)} />
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>vs mois dernier</span>
          </div>
        </Card>
      </div>

      {/* ══════ ROW 2: Area Chart + Donut ══════ */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Area chart */}
        <Card className="lg:col-span-3" animate stagger={1}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tendance mensuelle</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Revenus et dépenses sur 6 mois</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-3 h-[3px] rounded-full" style={{ background: '#10B981' }} /> Revenus
              </div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-3 h-[3px] rounded-full" style={{ background: '#EF4444' }} /> Dépenses
              </div>
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <ClientOnly fallbackHeight={isMobile ? 200 : 260}>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
              <AreaChart data={monthlyData} margin={isMobile ? { left: -15, right: 5, top: 5, bottom: 5 } : { left: -5, right: 5, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} width={isMobile ? 35 : 48} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<AreaTooltip isDark={isDark} />} />
                <Area type="monotone" dataKey="Revenus" stroke="#10B981" strokeWidth={2.5} fill="url(#gIncome)"
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2.5, stroke: cardBg }}
                  activeDot={{ r: 6, strokeWidth: 2.5, stroke: cardBg, fill: '#10B981' }}
                />
                <Area type="monotone" dataKey="Dépenses" stroke="#EF4444" strokeWidth={2.5} fill="url(#gExpense)"
                  dot={{ r: 4, fill: '#EF4444', strokeWidth: 2.5, stroke: cardBg }}
                  activeDot={{ r: 6, strokeWidth: 2.5, stroke: cardBg, fill: '#EF4444' }}
                />
              </AreaChart>
            </ResponsiveContainer>
            </ClientOnly>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Aucune donnée</p>
            </div>
          )}
        </Card>

        {/* Donut */}
        <Card className="lg:col-span-2" animate stagger={2}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Répartition des dépenses</h2>
          <p className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>Par catégorie ce mois</p>
          {expensesByCategory.length > 0 ? (
            <>
              <div className="relative">
                <ClientOnly fallbackHeight={isMobile ? 190 : 220}>
                <ResponsiveContainer width="100%" height={isMobile ? 190 : 220}>
                  <PieChart>
                    <defs>
                      {CHART_COLORS.map((color, i) => (
                        <linearGradient key={i} id={`pg${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                      <filter id="donutShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                      </filter>
                    </defs>
                    <Pie
                      data={expensesByCategory}
                      cx="50%" cy="50%"
                      innerRadius={isMobile ? 45 : 58}
                      outerRadius={isMobile ? 72 : 90}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                      cornerRadius={6}
                      onMouseEnter={(_, index) => setHoveredSlice(index)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      style={{ filter: 'url(#donutShadow)' }}
                    >
                      {expensesByCategory.map((_, i) => (
                        <Cell
                          key={i}
                          fill={`url(#pg${i % CHART_COLORS.length})`}
                          style={{
                            filter: hoveredSlice === i ? 'brightness(1.2) drop-shadow(0 0 6px rgba(0,0,0,0.2))' : undefined,
                            transform: hoveredSlice === i ? 'scale(1.06)' : 'scale(1)',
                            transformOrigin: 'center',
                            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip isDark={isDark} />} />
                  </PieChart>
                </ResponsiveContainer>
                </ClientOnly>
                {/* Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Total</p>
                  <p className="text-base font-bold stat-value" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalExpensesMonth, 'EUR')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{expensesByCategory.length} catégories</p>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-0.5">
                {expensesByCategory.slice(0, 6).map((cat, i) => {
                  const pct = totalExpensesMonth > 0 ? Math.round((cat.value / totalExpensesMonth) * 100) : 0;
                  const isHovered = hoveredSlice === i;
                  return (
                    <div key={i}
                      className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all duration-150 cursor-default"
                      style={{ background: isHovered ? 'var(--surface-elevated)' : 'transparent' }}
                      onMouseEnter={() => setHoveredSlice(i)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    >
                      <div className="w-3 h-3 rounded shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="truncate flex-1 font-medium" style={{ color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{cat.icon} {cat.name}</span>
                      <div className="w-16 h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: 'var(--surface-elevated)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                      <span className="font-semibold stat-value w-14 text-right" style={{ color: 'var(--text-primary)' }}>{formatCurrency(cat.value, 'EUR')}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Aucune dépense ce mois</p>
            </div>
          )}
        </Card>
      </div>

      {/* ══════ ROW 3: Daily Spending + Savings Gauge + Top Expenses ══════ */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Daily spending */}
        <Card className="lg:col-span-2" animate stagger={1}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dépenses journalières</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Mois en cours, jour par jour</p>
            </div>
          </div>
          <ClientOnly fallbackHeight={isMobile ? 160 : 200}>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <BarChart data={dailySpending} margin={isMobile ? { left: -20, right: 0 } : { left: -10, right: 0 }}>
              <defs>
                <linearGradient id="gDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: axisColor }}
                axisLine={false} tickLine={false}
                interval={isMobile ? 4 : 2}
              />
              <YAxis tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} width={isMobile ? 30 : 40} />
              <Tooltip content={<BarTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', radius: 4 }} />
              <Bar dataKey="amount" fill="url(#gDaily)" radius={[4, 4, 0, 0]} maxBarSize={isMobile ? 10 : 16} />
            </BarChart>
          </ResponsiveContainer>
          </ClientOnly>
        </Card>

        {/* Savings gauge + top expenses */}
        <div className="space-y-4">
          {/* Savings rate gauge */}
          <Card animate stagger={2}>
            <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Taux d&apos;épargne</h2>
            <div className="flex items-center gap-4">
              <div className="relative" style={{ width: 80, height: 80 }}>
                <ClientOnly fallbackHeight={80}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={savingsRadial} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={10} background={{ fill: isDark ? '#1E293B' : '#F3F4F6' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                </ClientOnly>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold stat-value" style={{ color: savingsRate >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {savingsRate}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {savingsRate > 20 ? 'Excellent !' : savingsRate > 0 ? 'Positif' : 'Attention'}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {formatCurrency(Math.abs(stats.balance), 'EUR')} {stats.balance >= 0 ? 'épargnes' : 'de déficit'}
                </p>
              </div>
            </div>
          </Card>

          {/* Top expenses */}
          <Card animate stagger={3}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Top dépenses</h2>
            {topExpenses.length > 0 ? (
              <div className="space-y-2.5">
                {topExpenses.map((tx, i) => (
                  <div key={tx.id} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold w-4 text-center" style={{ color: 'var(--text-tertiary)' }}>{i + 1}</span>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0" style={{ background: tx.catColor + '15' }}>
                      {tx.catIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <span className="text-xs font-semibold stat-value shrink-0" style={{ color: 'var(--color-danger)' }}>
                      -{formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>Aucune dépense</p>
            )}
          </Card>
        </div>
      </div>

      {/* ══════ ROW 4: Balance Evolution + Budgets ══════ */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Balance evolution */}
        <Card animate stagger={1}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Évolution du solde</h2>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Solde cumulé sur 6 mois</p>
          </div>
          {balanceEvolution.length > 0 ? (
            <ClientOnly fallbackHeight={isMobile ? 160 : 200}>
            <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
              <AreaChart data={balanceEvolution} margin={isMobile ? { left: -15, right: 5, top: 5, bottom: 5 } : { left: -5, right: 5, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} width={isMobile ? 35 : 48} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<AreaTooltip isDark={isDark} />} />
                <Area type="monotone" dataKey="Solde" stroke="#6366F1" strokeWidth={2.5} fill="url(#gBalance)"
                  dot={{ r: 4, fill: '#6366F1', strokeWidth: 2.5, stroke: cardBg }}
                  activeDot={{ r: 6, strokeWidth: 2.5, stroke: cardBg, fill: '#6366F1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
            </ClientOnly>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Aucune donnée</p>
            </div>
          )}
        </Card>

        {/* Budgets */}
        <Card animate stagger={2}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Budgets</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Suivi mensuel</p>
            </div>
            {budgetStatus.some(b => b.pct > 80) && (
              <span className="badge" style={{ background: 'var(--color-warning-subtle)', color: 'var(--color-warning)' }}>
                Attention
              </span>
            )}
          </div>
          {budgetStatus.length > 0 ? (
            <div className="space-y-3.5">
              {budgetStatus.map(b => (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span>{b.catIcon}</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{b.catName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="stat-value" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(b.spent, b.currency)}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)' }}>/</span>
                      <span className="stat-value" style={{ color: 'var(--text-tertiary)' }}>
                        {formatCurrency(b.amount, b.currency)}
                      </span>
                      <span className="badge text-[10px] ml-1" style={{
                        background: b.pct > 100 ? 'var(--color-danger-subtle)' : b.pct > 80 ? 'var(--color-warning-subtle)' : 'var(--accent-primary-subtle)',
                        color: b.pct > 100 ? 'var(--color-danger)' : b.pct > 80 ? 'var(--color-warning)' : 'var(--accent-primary)',
                      }}>
                        {b.pct}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar percent={b.pct} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs py-8 text-center" style={{ color: 'var(--text-tertiary)' }}>Aucun budget défini</p>
          )}
        </Card>
      </div>

      {/* ══════ ROW 5: Accounts ══════ */}
      {accounts.length > 0 && (
        <Card animate>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Vos comptes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {accounts.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-3 px-3.5 rounded-lg transition-colors duration-150"
                style={{ background: 'var(--surface-elevated)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: a.color + '15', color: a.color }}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{a.currency}</p>
                </div>
                <p className="text-sm font-bold stat-value" style={{ color: a.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {formatCurrency(a.balance, a.currency)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {accounts.length === 0 && (
        <Card className="text-center py-12" animate>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Bienvenue sur Okane</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Commencez par créer un compte dans l&apos;onglet &quot;Comptes&quot;
          </p>
        </Card>
      )}
    </div>
  );
}
