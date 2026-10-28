"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parse, quando, saved, type State, type Valores } from "./progresso";
export type { Valores };
export type Sync = "sem-token" | "salvando" | "salvo" | "erro";
const STORAGE_KEY = "cronograma-staff:v4", LEGACY_KEY = "cronograma-staff:v3", TOKEN_KEY = "cronograma-staff:token", API = "/api/progresso";
const EMPTY: State = { done: new Set(), valores: {} };
const write = (s: State, at?: string) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved(s, at))); } catch {} return s; };
const lerToken = () => { try { return localStorage.getItem(TOKEN_KEY) ?? ""; } catch { return ""; } };
const gravarToken = (t: string) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} };
const localAt = () => { try { return quando(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")); } catch { return ""; } };
function read(): State { try { const now = localStorage.getItem(STORAGE_KEY); const s = now && parse(JSON.parse(now)); if (s) return s; const old = localStorage.getItem(LEGACY_KEY); const legacy = old && parse(JSON.parse(old)); if (legacy) return { ...EMPTY, legacy: { done: [...legacy.done], valores: legacy.valores } }; } catch {} return EMPTY; }
export function useProgress() {
  const [state, setState] = useState<State>(EMPTY); const [loaded, setLoaded] = useState(false); const [sync, setSync] = useState<Sync>("sem-token");
  const token = useRef(""), sujo = useRef(false), timer = useRef<ReturnType<typeof setTimeout>>(undefined), atual = useRef(state); atual.current = state;
  const enviar = useCallback(async (s: State) => { if (!token.current) return setSync("sem-token"); setSync("salvando"); try { const r = await fetch(API, { method: "PUT", headers: { authorization: `Bearer ${token.current}`, "content-type": "application/json" }, body: JSON.stringify(saved(s, localAt() || undefined)) }); if (r.status === 401) { token.current = ""; gravarToken(""); setSync("erro"); } else setSync(r.ok ? "salvo" : "erro"); } catch { setSync("erro"); } }, []);
  useEffect(() => { token.current = lerToken(); const local = read(); setState(local); setLoaded(true); if (!token.current) setSync("sem-token"); const at = localAt(); fetch(API, { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(j => { if (sujo.current || !j?.dados) return void (at && token.current && enviar(local)); const s = parse(j.dados), sAt = quando(j.dados); if (s && sAt >= at) { setState(write(s, sAt || undefined)); if (token.current) setSync("salvo"); } else if (token.current) enviar(local); }).catch(() => token.current && setSync("erro")); }, [enviar]);
  useEffect(() => { if (!sujo.current) return; sujo.current = false; clearTimeout(timer.current); timer.current = setTimeout(() => enviar(atual.current), 800); }, [state, enviar]);
  const gravar = useCallback((s: State) => { sujo.current = true; return write(s); }, []);
  const commit = useCallback((s: State) => setState(gravar(s)), [gravar]);
  const toggle = useCallback((id: string) => setState(p => { const done = new Set(p.done); done.has(id) ? done.delete(id) : done.add(id); return gravar({ ...p, done }); }), [gravar]);
  const setMany = useCallback((ids: string[], value: boolean) => setState(p => { const done = new Set(p.done); ids.forEach(id => value ? done.add(id) : done.delete(id)); return gravar({ ...p, done }); }), [gravar]);
  const setValor = useCallback((id: string, value: string) => setState(p => { const next = { ...p.valores }; value.trim() ? next[id] = value : delete next[id]; return gravar({ ...p, valores: next }); }), [gravar]);
  const setToken = useCallback((t: string) => { token.current = t.trim(); gravarToken(token.current); if (token.current) enviar(atual.current); else setSync("sem-token"); }, [enviar]);
  const exportJson = useCallback(() => { const url = URL.createObjectURL(new Blob([JSON.stringify(saved(state), null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `progresso-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); }, [state]);
  const importJson = useCallback(async (file: File) => { try { const next = parse(JSON.parse(await file.text())); if (!next) return { ok: false, message: "Arquivo inválido: falta a lista done." }; commit(next); return { ok: true, message: `${next.done.size} itens e ${Object.keys(next.valores).length} evidências importados.` }; } catch { return { ok: false, message: "Não consegui ler esse arquivo como JSON." }; } }, [commit]);
  const reset = useCallback(() => commit({ ...EMPTY, legacy: state.legacy }), [commit, state.legacy]);
  return useMemo(() => ({ ...state, loaded, sync, setToken, toggle, setMany, setValor, exportJson, importJson, reset, isDone: (id: string) => state.done.has(id), valorDe: (id: string) => state.valores[id] ?? "", temValor: (id: string) => id in state.valores }), [state, loaded, sync, setToken, toggle, setMany, setValor, exportJson, importJson, reset]);
}
export type ProgressApi = ReturnType<typeof useProgress>;
