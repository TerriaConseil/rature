import type { GroupedEntity } from "@/models/token-classification-model.ts";
import { createContext } from "react";

interface AnonymizationContextValue {
  nerEntities: GroupedEntity[];
  addEntity: (entity: GroupedEntity) => void;
  removeEntity: (entityId: GroupedEntity["id"]) => void;
  setNerEntities: (entities: GroupedEntity[]) => void;
};

export const AnonimzationContext = createContext<AnonymizationContextValue>({
  nerEntities: [],
  addEntity: () => {},
  removeEntity: () => {},
  setNerEntities: () => {},
});
