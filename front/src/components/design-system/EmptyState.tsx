import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ds-empty-state">
      <div className="ds-empty-state-icon">{icon}</div>
      <p className="ds-empty-state-title">{title}</p>
      {description && <p className="ds-empty-state-desc">{description}</p>}
      {action}
    </div>
  );
}
