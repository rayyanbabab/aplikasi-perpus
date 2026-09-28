import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    secondary: 'bg-zinc-700 text-zinc-300 border-zinc-600',
    destructive: 'bg-red-950/60 text-red-400 border-red-900',
    outline: 'border-zinc-700 text-zinc-300 bg-transparent',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-900',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-900',
    info: 'bg-blue-950/60 text-blue-400 border-blue-900',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
