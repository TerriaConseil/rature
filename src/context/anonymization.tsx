import { createContext } from "react";

import type { GroupedEntity } from "@/types/index.ts";
import { NER_MODELS_NAMES, type NERModel } from "@/models/utils.ts";

interface AnonymizationContextValue {
  modelName: NERModel;
  modelTokens: string[];
  nerEntities: GroupedEntity[];
  addEntity: (entity: GroupedEntity) => void;
  removeEntity: (entityId: GroupedEntity["id"]) => void;
  reset: () => void;
  setModelTokens: (tokens: string[]) => void;
  setNerEntities: (entities: GroupedEntity[]) => void;
};

export const AnonymizationContext = createContext<AnonymizationContextValue>({
  modelName: NER_MODELS_NAMES[0],
  modelTokens: [],
  nerEntities: [],
  addEntity: () => {},
  removeEntity: () => {},
  reset: () => {},
  setModelTokens: () => {},
  setNerEntities: () => {},
});
