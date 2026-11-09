"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "./app-context";
import { diaDaSemana, montarDia, proximaTarefa, proximoDiaDeEstudo, tarefaById, type Tarefa } from "./data/agenda";
import { INICIO, type DiaSemana } from "./data/cronograma";
import { hojeIso } from "./datas";

// O dia é "congelado": as tarefas são escolhidas na primeira abertura do dia e não mudam
// quando você marca algo. Num dia novo, recomeça da próxima pendente (dia perdido empurra tudo).
const KEY = "cronograma-staff:hoje:v2";
type Salvo = { data: string; partes: string[][]; extra: string[] };

const ler = (): Salvo | null => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "null"); return v && typeof v.data === "string" && Array.isArray(v.partes) && Array.isArray(v.extra) ? v : null; } catch { return null; } };
const gravar = (s: Salvo) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
// Em dev, ?hoje=2026-11-12 simula outra data.
const dataAtual = () => { if (process.env.NODE_ENV !== "production") { const q = new URLSearchParams(window.location.search).get("hoje"); if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return q; } return hojeIso(); };
const tarefas = (ids: string[]) => ids.map(id => tarefaById.get(id)).filter((t): t is Tarefa => !!t);

export type ParteHoje = { indice: number; texto: string; horas: number; tarefas: Tarefa[] };
export type DiaHoje = { data: string; dia: DiaSemana; partes: ParteHoje[] };
const expandir = (data: string, ids: string[][]): DiaHoje | null => {
  const dia = diaDaSemana(data); if (!dia) return null;
  return { data, dia, partes: dia.partes.map((p, i) => ({ indice: i, texto: p.texto, horas: p.horas, tarefas: tarefas(ids[i] ?? []) })) };
};

/**
 * hoje: o dia de estudo de hoje (null em dia livre ou antes do início).
 * proximo: prévia do próximo dia de estudo quando hoje não tem estudo.
 */
export function useHoje() {
  const app = useApp(); const montado = useRef(false);
  const [data, setData] = useState<string | null>(null); const [salvo, setSalvo] = useState<Salvo | null>(null);
  useEffect(() => {
    if (!app.loaded || montado.current) return; montado.current = true;
    const hoje = dataAtual(); setData(hoje);
    if (hoje < INICIO || !diaDaSemana(hoje)) return;
    const s = ler(); if (s && s.data === hoje) { setSalvo(s); return; }
    const novo = { data: hoje, partes: montarDia(hoje, app.done, app.valores) ?? [], extra: [] }; gravar(novo); setSalvo(novo);
  }, [app.loaded, app.done, app.valores]);
  const adiantar = useCallback(() => setSalvo(s => {
    if (!s) return s; const usadas = new Set([...s.partes.flat(), ...s.extra]);
    const prox = proximaTarefa(app.done, app.valores, usadas); if (!prox) return s;
    const novo = { ...s, extra: [...s.extra, prox.id] }; gravar(novo); return novo;
  }), [app.done, app.valores]);
  const hoje = salvo ? expandir(salvo.data, salvo.partes) : null;
  // Prévia calculada na hora (não grava): o dia de verdade é montado quando ele chegar.
  const proxData = data && !hoje ? proximoDiaDeEstudo(data) : null;
  const proximo = proxData ? expandir(proxData, montarDia(proxData, app.done, app.valores) ?? []) : null;
  return { data, hoje, extra: salvo ? tarefas(salvo.extra) : [], proximo, antesDoInicio: !!data && data < INICIO, adiantar };
}
