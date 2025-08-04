import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function AdminHeader({
  title,
  description,
  children,
  className
}: AdminHeaderProps) {
  return (
    <div className={cn('mb-8 flex items-center justify-between gap-4', className)}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-lg text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  );
}
