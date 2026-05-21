import type { ReactNode } from 'react';

export function SegmentTabs({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ds-segment-tabs ${className}`.trim()}>
      <div className="flex items-center gap-1 p-2">{children}</div>
    </div>
  );
}

export function SegmentTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ds-segment-tab flex-1 ${active ? 'ds-segment-tab-active' : ''}`}
    >
      {children}
    </button>
  );
}
