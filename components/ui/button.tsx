import * as React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm font-medium',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    outline: 'border border-border bg-card/50 text-foreground hover:bg-secondary hover:text-foreground',
    ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6 text-sm',
    icon: 'h-9 w-9',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };
