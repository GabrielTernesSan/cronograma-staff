import type { Valores } from "../useProgress";
import { addDias, paraData } from "../datas";
import type { Pilar } from "../types";
import { laboratorios } from "./blocos";
import { fimMes, INICIO, SEMANA, SESSAO_MIN, type DiaSemana, type Parte } from "./cronograma";
import { assuntos, assuntosDoMes, horasPratica, MIN_LEITURA } from "./trilha";

// Fila única com todas as tarefas dos 36 meses, na ordem em que devem ser feitas.
// Reaproveita os IDs da trilha e dos laboratórios: marcar aqui marca no mapa e vice-versa.
export type TipoTarefa = "leitura" | "estudo" | "pratica" | "lab" | "evidencia";
export type Tarefa = {
  id: string; baseId: string; ultima: boolean; sessao?: [number, number];
  mes: number; assuntoId?: string; texto: string; minutos: number; tipo: TipoTarefa; url?: string;
};
type Base = Omit<Tarefa, "id" | "baseId" | "ultima" | "sessao">;

// Tarefa de mais de 1h vira sessões de ~30 min (id~s1, id~s2...); até 1h fica inteira.
// A última sessão também marca o id original.
const fatiar = (baseId: string, b: Base): Tarefa[] => {
  const n = b.minutos <= 60 ? 1 : Math.ceil(b.minutos / SESSAO_MIN);
  if (n === 1) return [{ ...b, id: baseId, baseId, ultima: true }];
  const minutos = Math.floor(b.minutos / n);
  return Array.from({ length: n }, (_, i) => ({ ...b, minutos: minutos + (i < b.minutos % n ? 1 : 0), id: `${baseId}~s${i + 1}`, baseId, ultima: i === n - 1, sessao: [i + 1, n] as [number, number] }));
};

const doMes = (mes: number): Tarefa[] => {
  const xs = assuntosDoMes(mes), lab = laboratorios[mes - 1];
  const teoria = xs.flatMap(x => [
    ...x.leituras.map(l => fatiar(l.id, { mes, assuntoId: x.id, tipo: "leitura", texto: `Ler: ${l.titulo} (${l.fonte})`, minutos: MIN_LEITURA[l.tipo], url: l.url })),
    ...x.subtopicos.map(s => fatiar(s.id, { mes, assuntoId: x.id, tipo: "estudo", texto: `Estudar e explicar em voz alta, sem consultar: ${s.texto}`, minutos: 20 })),
  ]).flat();
  const pratica = xs.flatMap(x => fatiar(x.pratica.id, { mes, assuntoId: x.id, tipo: "pratica", texto: `Prática: ${x.pratica.texto}`, minutos: horasPratica(x) * 60 }));
  const atividades = lab ? lab.atividades.flatMap(a => fatiar(a.id, { mes, tipo: "lab", texto: `Laboratório M${String(mes).padStart(2, "0")}: ${a.texto}`, minutos: 120 })) : [];
  const evid = lab ? [{ id: `${lab.id}-evid`, baseId: `${lab.id}-evid`, ultima: true, mes, tipo: "evidencia" as const, texto: `Registrar as evidências do laboratório M${String(mes).padStart(2, "0")} (abrir o mês e preencher)`, minutos: 20 }] : [];
  return [...teoria, ...pratica, ...atividades, ...evid];
};

export const TAREFAS: Tarefa[] = Array.from({ length: 36 }, (_, i) => doMes(i + 1)).flat();
export const tarefaById = new Map(TAREFAS.map(t => [t.id, t]));
export const assuntoById = new Map(assuntos.map(x => [x.id, x]));
export const pilarDe = (t: Tarefa): Pilar | undefined => t.assuntoId ? assuntoById.get(t.assuntoId)?.pilar : undefined;
const teoriaDe = new Map<string, Tarefa[]>();
TAREFAS.forEach(t => { if (t.assuntoId && (t.tipo === "leitura" || t.tipo === "estudo")) teoriaDe.set(t.assuntoId, [...(teoriaDe.get(t.assuntoId) ?? []), t]); });

export const feita = (t: Tarefa, done: Set<string>, valores: Valores) => {
  if (done.has(t.id) || done.has(t.baseId)) return true;
  if (t.tipo !== "evidencia") return false;
  const ev = laboratorios[t.mes - 1]?.evidencias ?? [];
  return ev.length > 0 && ev.every(e => e.id in valores);
};
/** IDs a marcar/desmarcar. Desmarcar uma sessão desfaz também o id original. */
export const idsParaMarcar = (t: Tarefa, valor: boolean) => valor ? (t.ultima && t.baseId !== t.id ? [t.id, t.baseId] : [t.id]) : [...new Set([t.id, t.baseId])];

export const pendentes = (done: Set<string>, valores: Valores) => TAREFAS.filter(t => !feita(t, done, valores));

/* ───────── Dia de estudo: a grade de qua a dom define quanto tempo e de qual pilar ───────── */

export const diaDaSemana = (iso: string): DiaSemana | undefined => SEMANA.find(d => d.dow === paraData(iso).getDay());
/** Primeiro dia com estudo a partir de iso (nunca antes do início do plano). */
export const proximoDiaDeEstudo = (iso: string) => { let d = iso < INICIO ? INICIO : iso; while (!diaDaSemana(d)) d = addDias(d, 1); return d; };

const ehTeoria = (t: Tarefa) => t.tipo === "leitura" || t.tipo === "estudo";
const ehLab = (t: Tarefa) => t.tipo === "lab" || t.tipo === "evidencia";
// Prática só depois de terminar a teoria do mesmo assunto.
const pronta = (t: Tarefa, done: Set<string>, valores: Valores) => t.tipo !== "pratica" || !t.assuntoId || (teoriaDe.get(t.assuntoId) ?? []).every(x => feita(x, done, valores));

// Em ordem de preferência: se a primeira lista estiver vazia, a parte usa a seguinte (o horário nunca fica vazio à toa).
const filtros = (p: Parte): ((t: Tarefa) => boolean)[] => {
  const doPilar = (t: Tarefa) => pilarDe(t) === p.pilar;
  const lab = (t: Tarefa) => ehLab(t) || (t.tipo === "pratica" && pilarDe(t) === "arquitetura");
  switch (p.fonte) {
    case "teoria": return [t => doPilar(t) && ehTeoria(t), t => doPilar(t), lab, () => true];
    case "pratica": return [t => doPilar(t) && t.tipo === "pratica", t => doPilar(t), lab, () => true];
    case "lab": return [lab, () => true];
    case "tudo": return [doPilar]; // inglês e carreira: sem tarefa do pilar, vale o texto da parte
    case "fixo": return [];
  }
};

const encher = (xs: Tarefa[], minutos: number) => {
  const out: Tarefa[] = []; let soma = 0;
  for (const t of xs) {
    if (out.length && soma + t.minutos > minutos + 10) break;
    out.push(t); soma += t.minutos;
    if (soma >= minutos - 10) break;
  }
  return out;
};

/**
 * Tarefas de cada parte do dia (uma lista de ids por parte), ou null em dia livre.
 * Sempre parte do que está pendente agora: dia perdido não gera atraso, só empurra a fila.
 * Só pega tarefas até um mês à frente do mês mais atrasado, para os pilares não dispararem.
 */
export const montarDia = (iso: string, done: Set<string>, valores: Valores): string[][] | null => {
  const d = diaDaSemana(iso); if (!d) return null;
  const pend = pendentes(done, valores).filter(t => pronta(t, done, valores));
  const teto = (pendentes(done, valores)[0]?.mes ?? 36) + 1;
  const usadas = new Set<string>();
  return d.partes.map(p => {
    const livres = pend.filter(t => t.mes <= teto && !usadas.has(t.id));
    const xs = filtros(p).map(f => livres.filter(f)).find(l => l.length) ?? [];
    const escolhidas = encher(xs, p.horas * 60); escolhidas.forEach(t => usadas.add(t.id));
    return escolhidas.map(t => t.id);
  });
};

/** Próxima pendente fora da lista de hoje, para o botão "adiantar". */
export const proximaTarefa = (done: Set<string>, valores: Valores, excluir: Set<string>) =>
  pendentes(done, valores).find(t => !excluir.has(t.id) && pronta(t, done, valores));

// Minutos de trilha por dia da semana (partes "fixo" não consomem a fila).
const capacidade = (iso: string) => (diaDaSemana(iso)?.partes ?? []).reduce((s, p) => s + (p.fonte === "fixo" ? 0 : p.horas * 60), 0);

/** Data aproximada em que o mês fecha seguindo a grade a partir de hoje; null se já fechou. */
export const previsaoMes = (mes: number, done: Set<string>, valores: Valores, hoje: string) => {
  if (!TAREFAS.some(t => t.mes === mes && !feita(t, done, valores))) return null;
  const resto = TAREFAS.filter(t => t.mes <= mes && !feita(t, done, valores)).reduce((s, t) => s + t.minutos, 0);
  let d = hoje < INICIO ? INICIO : hoje, soma = capacidade(d);
  for (let i = 0; soma < resto && i < 5000; i++) { d = addDias(d, 1); soma += capacidade(d); }
  return d;
};
export const metaMes = fimMes;
