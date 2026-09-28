import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm transition-colors',
        'placeholder:text-zinc-500 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
