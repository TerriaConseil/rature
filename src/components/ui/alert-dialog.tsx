import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils.ts';
import type { ComponentProps } from 'react';

export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;
export const AlertDialogAction = RadixAlertDialog.Action;
export const AlertDialogCancel = RadixAlertDialog.Cancel;

export function AlertDialogOverlay({ className, ...props }: ComponentProps<typeof RadixAlertDialog.Overlay>) {
  return (
    <RadixAlertDialog.Overlay
      className={cn(
        'fixed inset-0 bg-black/30 backdrop-blur-sm z-50',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'duration-200',
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogContent({ className, children, ...props }: ComponentProps<typeof RadixAlertDialog.Content>) {
  return (
    <RadixAlertDialog.Portal>
      <AlertDialogOverlay />
      <RadixAlertDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full max-w-sm bg-card border border-border-theme rounded-xl shadow-xl p-6',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'duration-200 ease-out',
          className,
        )}
        {...props}
      >
        {children}
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  );
}

export function AlertDialogTitle({ className, ...props }: ComponentProps<typeof RadixAlertDialog.Title>) {
  return (
    <RadixAlertDialog.Title
      className={cn('text-sm font-semibold text-fg', className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }: ComponentProps<typeof RadixAlertDialog.Description>) {
  return (
    <RadixAlertDialog.Description
      className={cn('text-xs text-fg-muted', className)}
      {...props}
    />
  );
}
