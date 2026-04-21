import { ArrowRight, Pencil } from 'lucide-react';
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

interface UpdateEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityText: string;
  entityUpdates: string;
  instanceCount: number;
  onUpdateOne: () => void;
  onUpdateAll: () => void;
}

export function UpdateEntityDialog({
  open,
  onOpenChange,
  entityText,
  entityUpdates,
  instanceCount,
  onUpdateOne,
  onUpdateAll,
}: UpdateEntityDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{t('edit.title')}</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="flex items-center gap-2 mt-2 mb-5">
            <span className="inline-block px-2 py-0.5 rounded-md bg-surface-subtle border border-border-theme text-fg font-medium text-xs max-w-full truncate">
              {entityText}
            </span>
            <ArrowRight size={16} />
            <span className="inline-block px-2 py-0.5 rounded-md bg-surface-subtle border border-border-theme text-fg font-medium text-xs max-w-full truncate">
              {entityUpdates}
            </span>
          </div>
        </AlertDialogDescription>

        <div className="flex flex-col gap-2">
          <AlertDialogAction asChild>
            <Button variant="secondary" size="sm" className="w-full justify-start gap-2" onClick={onUpdateOne}>
              <Pencil size={13} />
              {t('edit.updateOne')}
            </Button>
          </AlertDialogAction>

          {instanceCount > 1 && (
            <AlertDialogAction asChild>
              <Button variant="primary" size="sm" className="w-full justify-start gap-2" onClick={onUpdateAll}>
                <Pencil size={13} />
                {t('edit.updateAll')}
                <span className="ml-auto opacity-70 font-normal">×{instanceCount}</span>
              </Button>
            </AlertDialogAction>
          )}

          <AlertDialogCancel asChild>
            <Button variant="ghost" size="sm" className="w-full text-fg-muted">
              {t('edit.cancel')}
            </Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
