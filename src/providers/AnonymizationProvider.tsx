import { AnonymizationContext } from "@/context/anonymization.tsx";
import { type GroupedEntity } from "@/models/token-classification-model.ts";
import { useState, type ReactNode } from "react";

type AnonymizationProviderProps = {
  children: ReactNode;
};

export function AnonymizationProvider({ children }: AnonymizationProviderProps) {
  const [nerEntities, setNerEntities] = useState<GroupedEntity[]>([]);

  const addEntity = (entity: GroupedEntity) => {
    setNerEntities((prev) => [...prev, entity].sort((a, b) => a.start - b.start));
  };

  const removeEntity = (entityId: GroupedEntity["id"]) => {
    setNerEntities((prev) => prev.filter((entity) => entity.id !== entityId));
  };

  return (
    <AnonymizationContext value={{
        nerEntities,
        addEntity,
        removeEntity,
        setNerEntities,
      }}
    >
      {children}
    </AnonymizationContext>
  );
}