"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "./app-context";
import { montarDia, tarefaById, type Tarefa } from "./data/agenda";
import { INICIO } from "./data/cronograma";
import { hojeIso } from "./datas";

// O dia é "congelado": as tarefas são escolhidas na primeira abertura do dia e não mudam
// quando você marca algo. Num dia novo, recomeça da próxima pendente (dia perdido empurra tudo).
const KEY = "cronograma-staff:hoje";
type Dia = { data: string; ids: string[] };

const ler = (): Dia | null => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "null"); return v && typeof v.data === "string" && Array.isArray(v.ids) ? v : null; } catch { return null; } };
const gravar = (d: Dia) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
// Em dev, ?hoje=2026-11-12 simula outra data.
const dataAtual = () => { if (process.env.NODE_ENV !== "production") { const q = new URLSearchParams(window.location.search).get("hoje"); if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q; } return hojeIso(); };

export function useHoje() {
  const app = useApp(); const [dia, setDia] = useState<Dia | null>(null); const montado = useRef(false);
  const antesDoInicio = dia ? dia.data < INICIO : false;
  useEffect(() => {
    if (!app.loaded || montado.current) return; montado.current = true;
    const hoje = dataAtual(); const salvo = ler();
    if (salvo && salvo.data === hoje && salvo.ids.some(id => tarefaById.has(id))) { setDia(salvo); return; }
    const novo = { data: hoje, ids: montarDia(app.done, app.valores).map(t => t.id) };
    if (hoje >= INICIO) gravar(novo); // antes do início é só prévia; o dia 1 é montado em 10/11
    setDia(novo);
  }, [app.loaded, app.done, app.valores]);
  const adiantar = useCallback(() => setDia(d => {
    if (!d) return d; const prox = montarDia(app.done, app.valores, new Set(d.ids), 1)[0]; if (!prox) return d;
    const novo = { ...d, ids: [...d.ids, prox.id] }; if (d.data >= INICIO) gravar(novo); return novo;
  }), [app.done, app.valores]);
  const tarefas = (dia?.ids ?? []).map(id => tarefaById.get(id)).filter((t): t is Tarefa => !!t);
  return { data: dia?.data ?? null, tarefas, antesDoInicio, adiantar };
}
