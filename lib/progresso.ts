import { cards, type Cards } from "./revisao";
export type Valores = Record<string, string>;
export type State = { done: Set<string>; valores: Valores; cards: Cards; legacy?: { done: string[]; valores: Valores } };
export const valores = (v: unknown): Valores => typeof v !== "object" || v === null || Array.isArray(v) ? {} : Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, x]) => typeof x === "string" && x.trim() !== "")) as Valores;
// v4 não tinha cards: ausente vira {}.
export const parse = (v: unknown): State | null => { if (typeof v !== "object" || v === null || !Array.isArray((v as { done?: unknown }).done)) return null; const p = v as { done: unknown[]; valores?: unknown; cards?: unknown; legacy?: { done?: unknown[]; valores?: unknown } }; return { done: new Set(p.done.filter((x): x is string => typeof x === "string")), valores: valores(p.valores), cards: cards(p.cards), legacy: p.legacy && Array.isArray(p.legacy.done) ? { done: p.legacy.done.filter((x): x is string => typeof x === "string"), valores: valores(p.legacy.valores) } : undefined }; };
export const saved = (s: State, savedAt = new Date().toISOString()) => ({ version: 5, savedAt, done: [...s.done].sort(), valores: s.valores, cards: s.cards, legacy: s.legacy });
export const quando = (v: unknown): string => typeof v === "object" && v !== null && typeof (v as { savedAt?: unknown }).savedAt === "string" ? (v as { savedAt: string }).savedAt : "";
