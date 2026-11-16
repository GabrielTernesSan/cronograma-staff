"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
// Adiantadas em dia livre (segunda e terça): não há dia montado, então ficam numa lista própria do dia.
const KEY_LIVRE = "cronograma-staff:adiantadas-livre:v1";
type Livre = { data: string; ids: string[] };
const lerLivre = (): Livre | null => { try { const v = JSON.parse(localStorage.getItem(KEY_LIVRE) ?? "null"); return v && typeof v.data === "string" && Array.isArray(v.ids) ? v : null; } catch { return null; } };
const gravarLivre = (s: Livre) => { try { localStorage.setItem(KEY_LIVRE, JSON.stringify(s)); } catch {} };
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
  const [previa, setPrevia] = useState<{ data: string; partes: string[][] } | null>(null);
  const [livre, setLivre] = useState<Livre | null>(null);
  useEffect(() => {
    if (!app.loaded || montado.current) return; montado.current = true;
    const hoje = dataAtual(); setData(hoje);
    // Prévia montada uma vez só (não grava): marcar uma tarefa risca o item em vez de trocá-lo pela próxima.
    // O dia de verdade é montado quando ele chegar, a partir do que estiver pendente.
    if (hoje < INICIO || !diaDaSemana(hoje)) {
      const l = lerLivre(); setLivre(l && l.data === hoje ? { data: hoje, ids: l.ids.filter(id => tarefaById.has(id)) } : { data: hoje, ids: [] });
      const prox = proximoDiaDeEstudo(hoje); setPrevia({ data: prox, partes: montarDia(prox, app.done, app.valores) ?? [] }); return;
    }
    // Lista salva com tarefa que saiu da trilha (ex.: conteúdo reorganizado) é remontada.
    const s = ler(); if (s && s.data === hoje && [...s.partes.flat(), ...s.extra].every(id => tarefaById.has(id))) { setSalvo(s); return; }
    const novo = { data: hoje, partes: montarDia(hoje, app.done, app.valores) ?? [], extra: [] }; gravar(novo); setSalvo(novo);
  }, [app.loaded, app.done, app.valores]);
  const adiantar = useCallback(() => setSalvo(s => {
    if (!s) return s; const usadas = new Set([...s.partes.flat(), ...s.extra]);
    const prox = proximaTarefa(app.done, app.valores, usadas); if (!prox) return s;
    const novo = { ...s, extra: [...s.extra, prox.id] }; gravar(novo); return novo;
  }), [app.done, app.valores]);
  /** Adianta uma tarefa escolhida (ex.: a próxima sessão de um curso, pela aba Cursos), em dia de estudo ou livre. */
  const adiantarTarefa = useCallback((id: string) => {
    if (!tarefaById.has(id)) return;
    if (salvo) { if (salvo.partes.flat().includes(id) || salvo.extra.includes(id)) return; const novo = { ...salvo, extra: [...salvo.extra, id] }; gravar(novo); setSalvo(novo); return; }
    if (livre && !livre.ids.includes(id)) { const novo = { ...livre, ids: [...livre.ids, id] }; gravarLivre(novo); setLivre(novo); }
  }, [salvo, livre]);
  // Memorizados: quem depende deles (projeção da semana) só recalcula quando a lista muda.
  const hoje = useMemo(() => salvo ? expandir(salvo.data, salvo.partes) : null, [salvo]);
  const proximo = useMemo(() => previa && !hoje ? expandir(previa.data, previa.partes) : null, [previa, hoje]);
  const extra = useMemo(() => salvo ? tarefas(salvo.extra) : livre ? tarefas(livre.ids) : [], [salvo, livre]);
  // Ids que já estão na lista de hoje (partes e adiantadas), para a aba Cursos mostrar "no Hoje".
  const naLista = useMemo(() => new Set([...(salvo ? salvo.partes.flat() : []), ...extra.map(t => t.id)]), [salvo, extra]);
  return { data, hoje, extra, proximo, antesDoInicio: !!data && data < INICIO, adiantar, adiantarTarefa, naLista };
}
