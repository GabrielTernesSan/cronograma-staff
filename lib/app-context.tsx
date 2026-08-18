"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useProgress, type ProgressApi } from "./useProgress";

export type Filters = {
  onlyPending: boolean;
  hidePlanned: boolean;
};

type Ctx = ProgressApi & {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const progress = useProgress();
  const [filters, setFilters] = useState<Filters>({
    onlyPending: false,
    hidePlanned: false,
  });

  const value = useMemo<Ctx>(
    () => ({ ...progress, filters, setFilters }),
    [progress, filters],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
