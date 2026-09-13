/* Quiet Atlas: every operational route starts as a bounded field record, not a generic admin title row. */
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="atlas-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
      <div className="min-w-0">
        <span className="atlas-page-marker">GSEM field record</span>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-text-muted leading-6">{subtitle}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
