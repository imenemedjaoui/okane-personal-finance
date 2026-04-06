import { classNames } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variant === 'primary' && 'text-white focus:ring-accent-primary',
        variant === 'secondary' && 'text-text-primary border hover:bg-surface-elevated focus:ring-accent-primary',
        variant === 'danger' && 'bg-danger text-white hover:opacity-90 focus:ring-danger',
        variant === 'ghost' && 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary focus:ring-accent-primary',
        size === 'sm' && 'px-3 py-1.5 text-xs gap-1.5',
        size === 'md' && 'px-4 py-2 text-sm gap-2',
        size === 'lg' && 'px-5 py-2.5 text-sm gap-2',
        className
      )}
      style={variant === 'primary' ? {
        background: 'var(--accent-primary)',
      } : variant === 'secondary' ? {
        background: 'var(--surface-card)',
        borderColor: 'var(--border-default)',
      } : undefined}
      onMouseEnter={variant === 'primary' ? (e) => {
        e.currentTarget.style.background = 'var(--accent-primary-hover)';
      } : undefined}
      onMouseLeave={variant === 'primary' ? (e) => {
        e.currentTarget.style.background = 'var(--accent-primary)';
      } : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
