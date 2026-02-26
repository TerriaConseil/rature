import { useContext } from "react";

import { AnonimzationContext } from "@/context/anonymization.tsx";

export function useAnonymization() {
  return useContext(AnonimzationContext);
}
