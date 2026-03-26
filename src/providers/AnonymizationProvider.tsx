import { useState, type ReactNode } from "react";

import { AnonymizationContext } from "@/context/anonymization.tsx";
import type { GroupedEntity } from "@/types/index.ts";
import { type NERModel } from "@/models/utils.ts";

type AnonymizationProviderProps = {
  children: ReactNode;
};

export function AnonymizationProvider({ children }: AnonymizationProviderProps) {
  const [modelName, setModel] = useState<NERModel>('bertBaseNer');
  const [modelTokens, setModelTokens] = useState<string[]>([]);
  const [nerEntities, setNerEntities] = useState<GroupedEntity[]>([]);

  const addEntity = (entity: GroupedEntity) => {
    setNerEntities((prev) => [...prev, entity].sort((a, b) => a.start - b.start));
  };

  const removeEntity = (entityId: GroupedEntity["id"]) => {
    setNerEntities((prev) => prev.filter((entity) => entity.id !== entityId));
  };

  const reset = () => {
    setNerEntities([]);
    setModelTokens([]);
  };

  return (
    <AnonymizationContext value={{
        modelName,
        modelTokens,
        nerEntities,
        addEntity,
        removeEntity,
        reset,
        setModel,
        setNerEntities,
        setModelTokens,
      }}
    >
      {children}
    </AnonymizationContext>
  );
}