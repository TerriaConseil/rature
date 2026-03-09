import { cn } from "@/lib/utils.ts";

interface RatureLogoProps {
  size?: 'sm' | 'lg' | 'xl';
};

export function RatureLogo({ size = 'sm' }: RatureLogoProps) {
  return (
    <span className={cn(
      "font-bold tracking-tight [font-variant:small-caps]",
      "bg-neutral-800 text-neutral-100",
      "dark:bg-neutral-200 dark:text-neutral-800",
      size === 'xl' && "text-4xl",
      size === 'lg' && "text-lg",
      size === 'sm' && "text-sm",
      size === 'xl' ? "px-4 pt-0.5 pb-1.5" : 'px-2 py-1',
    )}>
      rature
    </span>
  );
}
