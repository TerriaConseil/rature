import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils.ts';
import type { ComponentProps } from 'react';

export const DropdownMenu = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;
export const DropdownMenuPortal = RadixDropdownMenu.Portal;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.Content>) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[160px] bg-card border border-border-theme rounded-lg shadow-lg p-1 outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
          'duration-150 ease-out origin-[var(--radix-dropdown-menu-content-transform-origin)]',
          className,
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
}

interface DropdownMenuItemProps extends ComponentProps<typeof RadixDropdownMenu.Item> {
  destructive?: boolean;
}

export function DropdownMenuItem({ className, destructive, ...props }: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 text-sm text-fg rounded-md',
        'transition-colors duration-100 cursor-pointer outline-none select-none',
        destructive
          ? 'hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-400'
          : 'hover:bg-surface-subtle focus:bg-surface-subtle',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof RadixDropdownMenu.Separator>) {
  return (
    <RadixDropdownMenu.Separator
      className={cn('my-1 border-t border-border-theme', className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof RadixDropdownMenu.Label>) {
  return (
    <RadixDropdownMenu.Label
      className={cn('px-3 py-1.5 text-xs font-medium text-fg-subtle uppercase tracking-wider', className)}
      {...props}
    />
  );
}
