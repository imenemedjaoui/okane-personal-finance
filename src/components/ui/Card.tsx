import { classNames } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  animate?: boolean;
  stagger?: number;
  hover?: boolean;
}

export default function Card({
  children,
  className,
  padding = true,
  animate = false,
  stagger,
  hover = false,
}: CardProps) {
  return (
    <div
      className={classNames(
        'rounded-xl border transition-all duration-200',
        padding && 'p-5',
        hover && 'hover:shadow-md hover:border-border-accent/30 cursor-pointer',
        animate && 'animate-slide-up',
        stagger !== undefined && `stagger-${stagger}`,
        className
      )}
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {children}
    </div>
  );
}
