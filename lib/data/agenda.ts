import type { Valores } from "../useProgress";
import { addDias } from "../datas";
import { laboratorios } from "./blocos";
import { fimMes, INICIO, MIN_POR_DIA } from "./cronograma";
import { assuntos, assuntosDoMes, horasPratica, MIN_LEITURA } from "./trilha";

// Fila única com todas as tarefas dos 36 meses, na ordem em que devem ser feitas.
// Reaproveita os IDs da trilha e dos laboratórios: marcar aqui marca no mapa e vice-versa.
export type TipoTarefa = "leitura" | "estudo" | "pratica" | "lab" | "evidencia";
export type Tarefa = {
  id: string; baseId: string; ultima: boolean; sessao?: [number, number];
  mes: number; assuntoId?: string; texto: string; minutos: number; tipo: TipoTarefa; url?: string;
};
type Base = Omit<Tarefa, "id" | "baseId" | "ultima" | "sessao">;

// Tarefa maior que um dia vira sessões (id~s1, id~s2...). A última sessão também marca o id original.
const fatiar = (baseId: string, b: Base): Tarefa[] => {
  const n = Math.max(1, Math.ceil(b.minutos / MIN_POR_DIA));
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

export const feita = (t: Tarefa, done: Set<string>, valores: Valores) => {
  if (done.has(t.id) || done.has(t.baseId)) return true;
  if (t.tipo !== "evidencia") return false;
  const ev = laboratorios[t.mes - 1]?.evidencias ?? [];
  return ev.length > 0 && ev.every(e => e.id in valores);
};
/** IDs a marcar/desmarcar. Desmarcar uma sessão desfaz também o id original. */
export const idsParaMarcar = (t: Tarefa, valor: boolean) => valor ? (t.ultima && t.baseId !== t.id ? [t.id, t.baseId] : [t.id]) : [...new Set([t.id, t.baseId])];

export const pendentes = (done: Set<string>, valores: Valores) => TAREFAS.filter(t => !feita(t, done, valores));

/** Próximas tarefas pendentes até encher ~MIN_POR_DIA (sempre pelo menos uma). */
export const montarDia = (done: Set<string>, valores: Valores, excluir: Set<string> = new Set(), budget = MIN_POR_DIA) => {
  const out: Tarefa[] = []; let soma = 0;
  for (const t of pendentes(done, valores)) {
    if (excluir.has(t.id)) continue;
    if (out.length && soma + t.minutos > budget + 15) break;
    out.push(t); soma += t.minutos;
    if (soma >= budget - 10) break;
  }
  return out;
};

/** Data em que o mês fecha mantendo ~MIN_POR_DIA por dia a partir de hoje; null se já fechou. */
export const previsaoMes = (mes: number, done: Set<string>, valores: Valores, hoje: string) => {
  const resto = TAREFAS.filter(t => t.mes <= mes && !feita(t, done, valores)).reduce((s, t) => s + t.minutos, 0);
  if (!TAREFAS.some(t => t.mes === mes && !feita(t, done, valores))) return null;
  return addDias(hoje < INICIO ? INICIO : hoje, Math.max(1, Math.ceil(resto / MIN_POR_DIA)) - 1);
};
export const metaMes = fimMes;
