import * as React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white shadow-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>option]:bg-zinc-800',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';

export { Select };
