"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { useProgress, type ProgressApi } from "./useProgress";
import type { Pilar } from "./types";
export type Filters = { onlyPending: boolean; pillars: Pilar[] };
type Ctx = ProgressApi & { filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>> };
const Context = createContext<Ctx | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) { const progress = useProgress(); const [filters, setFilters] = useState<Filters>({ onlyPending: false, pillars: [] }); const value = useMemo<Ctx>(() => ({ ...progress, filters, setFilters }), [progress, filters]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useApp() { const c = useContext(Context); if (!c) throw new Error("useApp precisa estar dentro de AppProvider"); return c; }
