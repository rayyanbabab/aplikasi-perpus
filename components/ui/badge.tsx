import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'bg-secondary text-secondary-foreground border-border/80 font-medium',
    secondary: 'bg-muted text-muted-foreground border-border/60',
    destructive: 'bg-rose-950/40 text-rose-300 border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
    outline: 'border-border text-foreground bg-transparent',
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
    warning: 'bg-amber-950/40 text-amber-300 border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
    info: 'bg-slate-800/80 text-slate-200 border-slate-700',
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
