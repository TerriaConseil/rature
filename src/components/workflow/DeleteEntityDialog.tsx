import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';

interface DeleteEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityText: string;
  instanceCount: number;
  onDeleteOne: () => void;
  onDeleteAll: () => void;
}

export function DeleteEntityDialog({
  open,
  onOpenChange,
  entityText,
  instanceCount,
  onDeleteOne,
  onDeleteAll,
}: DeleteEntityDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="mt-2 mb-5">
            <span className="inline-block px-2 py-0.5 rounded-md bg-surface-subtle border border-border-theme text-fg font-medium text-xs max-w-full truncate">
              {entityText}
            </span>
          </div>
        </AlertDialogDescription>

        <div className="flex flex-col gap-2">
          <AlertDialogAction asChild>
            <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={onDeleteOne}>
              <Trash2 size={13} />
              {t('delete.deleteOne')}
            </Button>
          </AlertDialogAction>

          {instanceCount > 1 && (
            <AlertDialogAction asChild>
              <Button variant="destructive" size="sm" className="w-full justify-start gap-2" onClick={onDeleteAll}>
                <Trash2 size={13} />
                {t('delete.deleteAll')}
                <span className="ml-auto opacity-70 font-normal">×{instanceCount}</span>
              </Button>
            </AlertDialogAction>
          )}

          <AlertDialogCancel asChild>
            <Button variant="ghost" size="sm" className="w-full text-fg-muted">
              {t('delete.cancel')}
            </Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
