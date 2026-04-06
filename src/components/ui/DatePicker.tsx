'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseYMD(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function DatePicker({ value, onChange, required, placeholder }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseYMD(value);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Sync view when value changes externally
  useEffect(() => {
    const p = parseYMD(value);
    if (p) {
      setViewYear(p.getFullYear());
      setViewMonth(p.getMonth());
    }
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1);
  // Monday = 0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean; date: string }[] = [];
  // Previous month trailing days
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const dt = new Date(viewYear, viewMonth - 1, d);
    cells.push({ day: d, current: false, date: toYMD(dt) });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewYear, viewMonth, d);
    cells.push({ day: d, current: true, date: toYMD(dt) });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const dt = new Date(viewYear, viewMonth + 1, d);
    cells.push({ day: d, current: false, date: toYMD(dt) });
  }

  const today = toYMD(new Date());

  const displayValue = parsed
    ? parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="relative" ref={ref}>
      {/* Input trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="form-input text-left flex items-center gap-2 w-full"
        style={{ color: value ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>
          <rect x="1" y="2" width="12" height="11" rx="1.5" />
          <path d="M1 5.5h12" />
          <path d="M4 1v2M10 1v2" />
        </svg>
        <span className="flex-1 truncate text-sm">
          {displayValue || placeholder || 'Sélectionner une date'}
        </span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
            className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" />
            </svg>
          </span>
        )}
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}

      {/* Dropdown calendar */}
      {open && (
        <div
          className="absolute z-50 mb-1.5 rounded-xl border p-3 animate-scale-in w-[280px]"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            left: 0,
            bottom: '100%',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-100"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 3 5 7 9 11" />
              </svg>
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-100"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 3 9 7 5 11" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: 'var(--text-tertiary)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const isSelected = cell.date === value;
              const isToday = cell.date === today;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { onChange(cell.date); setOpen(false); }}
                  className="w-[36px] h-[34px] mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-100 relative"
                  style={{
                    color: isSelected
                      ? '#FFFFFF'
                      : cell.current
                        ? 'var(--text-primary)'
                        : 'var(--text-tertiary)',
                    background: isSelected
                      ? 'var(--accent-primary)'
                      : 'transparent',
                    fontWeight: isToday || isSelected ? 700 : 500,
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--surface-elevated)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {cell.day}
                  {isToday && !isSelected && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'var(--accent-primary)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t flex justify-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => { onChange(today); setOpen(false); }}
              className="text-xs font-medium px-3 py-1 rounded-md transition-colors duration-100"
              style={{ color: 'var(--accent-primary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary-subtle)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Aujourd&apos;hui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
