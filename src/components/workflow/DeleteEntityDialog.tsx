import { Trash2 } from 'lucide-react';
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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Supprimer l&apos;entité ?</AlertDialogTitle>
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
              Supprimer cette occurrence
            </Button>
          </AlertDialogAction>

          {instanceCount > 1 && (
            <AlertDialogAction asChild>
              <Button variant="destructive" size="sm" className="w-full justify-start gap-2" onClick={onDeleteAll}>
                <Trash2 size={13} />
                Tout supprimer
                <span className="ml-auto opacity-70 font-normal">×{instanceCount}</span>
              </Button>
            </AlertDialogAction>
          )}

          <AlertDialogCancel asChild>
            <Button variant="ghost" size="sm" className="w-full text-fg-muted">
              Annuler
            </Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
