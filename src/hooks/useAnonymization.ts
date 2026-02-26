import { useContext } from "react";

import { AnonymizationContext } from "@/context/anonymization.tsx";

export function useAnonymization() {
  return useContext(AnonymizationContext);
}
