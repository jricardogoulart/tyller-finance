type StatusBadgeVariant = 'brand' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantClass: Record<StatusBadgeVariant, string> = {
  brand: 'ds-badge ds-badge-brand',
  success: 'ds-badge ds-badge-success',
  warning: 'ds-badge ds-badge-warning',
  error: 'ds-badge ds-badge-error',
  info: 'ds-badge ds-badge-info',
  neutral: 'ds-badge ds-badge-neutral',
};

export function StatusBadge({
  label,
  variant = 'brand',
  className = '',
}: {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
}) {
  return <span className={`${variantClass[variant]} ${className}`.trim()}>{label}</span>;
}

export function accuracyBadgeVariant(score: number): StatusBadgeVariant {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}
