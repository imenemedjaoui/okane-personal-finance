interface ProgressBarProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function ProgressBar({ percent, size = 'md', animated = true }: ProgressBarProps) {
  const height = { sm: 'h-1', md: 'h-2', lg: 'h-2.5' }[size];
  const clamped = Math.min(percent, 100);

  const getColor = () => {
    if (percent > 100) return 'var(--color-danger)';
    if (percent > 80) return 'var(--color-warning)';
    return 'var(--accent-primary)';
  };

  return (
    <div
      className={`w-full rounded-full ${height} overflow-hidden`}
      style={{ background: 'var(--surface-elevated)' }}
    >
      <div
        className={`${height} rounded-full transition-all duration-500 ${animated ? 'animate-progress-fill' : ''}`}
        style={{
          width: `${clamped}%`,
          background: getColor(),
        }}
      />
    </div>
  );
}
