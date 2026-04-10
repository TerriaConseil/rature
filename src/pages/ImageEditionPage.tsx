import { ActionsIsland } from '@/components/workflow/ActionsIsland.tsx';
import { ImageEditionPage as ImageEditionComponent } from '@/components/workflow/ImageEditionPage.tsx';
import { useDocument } from '@/hooks/useDocument.ts';

export function ImageEditionPage() {
  const { imageMethod, setImageMethod, handleModeChange } = useDocument();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ImageEditionComponent imageMethod={imageMethod} onImageMethodChange={setImageMethod} />
      <ActionsIsland mode="image-edition" onModeChange={handleModeChange} />
    </div>
  );
}
