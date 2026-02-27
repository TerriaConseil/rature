import type { GroupedEntity } from "@/models/token-classification-model.ts";
import { createContext } from "react";

interface AnonymizationContextValue {
  nerEntities: GroupedEntity[];
  addEntity: (entity: GroupedEntity) => void;
  removeEntity: (entityId: GroupedEntity["id"]) => void;
  reset: () => void;
  setNerEntities: (entities: GroupedEntity[]) => void;
};

export const AnonymizationContext = createContext<AnonymizationContextValue>({
  nerEntities: [],
  addEntity: () => {},
  removeEntity: () => {},
  reset: () => {},
  setNerEntities: () => {},
});
