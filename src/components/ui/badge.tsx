import { cn } from '@/lib/utils.ts';
import type { ComponentProps } from 'react';

interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'default' | 'accent' | 'muted'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-surface-subtle text-fg-muted border border-border-theme',
        variant === 'accent' && 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800',
        variant === 'muted' && 'bg-surface-subtle text-fg-subtle',
        className,
      )}
      {...props}
    />
  );
}
