import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu.tsx';

interface EntityActionsMenuProps {
  entityId: string;
  entityText: string;
  instanceCount: number;
  onDeleteOne: (id: string) => void;
  onDeleteAll: (text: string) => void;
}

export function EntityActionsMenu({
  entityId,
  entityText,
  instanceCount,
  onDeleteOne,
  onDeleteAll,
}: EntityActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span
          role="button"
          aria-label="Actions sur l'entité"
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          className="absolute -top-4 right-0 w-5 h-5 flex items-center justify-center rounded-md
                     bg-card border border-border-theme shadow-sm text-fg-muted
                     opacity-0 group-hover/ent:opacity-100 hover:text-fg hover:bg-surface-subtle
                     transition-all duration-200 cursor-pointer z-20"
        >
          <MoreHorizontal size={11} />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={6}>
        <DropdownMenuItem
          destructive
          onSelect={() => onDeleteOne(entityId)}
        >
          <Trash2 size={13} />
          Supprimer cette occurrence
        </DropdownMenuItem>

        {instanceCount > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => onDeleteAll(entityText)}
            >
              <Trash2 size={13} />
              <span>
                Tout supprimer
                <span className="ml-1.5 text-xs opacity-60">×{instanceCount}</span>
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
