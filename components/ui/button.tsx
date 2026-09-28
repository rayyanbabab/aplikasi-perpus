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
    default: 'bg-white text-black hover:bg-zinc-100 active:bg-zinc-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800',
    ghost: 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
    link: 'text-zinc-300 underline-offset-4 hover:underline hover:text-white',
    secondary: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
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
