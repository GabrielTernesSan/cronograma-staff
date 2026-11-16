import type { Valores } from "../useProgress";
import { addDias, paraData } from "../datas";
import type { Pilar, TipoLeitura } from "../types";
import { laboratorios } from "./blocos";
import { diaDeEstudo, fimMes, INICIO, SESSAO_MIN, type DiaSemana, type Parte } from "./cronograma";
import { MODULOS, type Modulo } from "./cursos";
import { assuntos, assuntosDoMes, horasPratica, minLeitura, obrigatorias } from "./trilha";

// Fila única com todas as tarefas dos 36 meses, na ordem em que devem ser feitas.
// Reaproveita os IDs da trilha e dos laboratórios: marcar aqui marca no mapa e vice-versa.
export type TipoTarefa = "leitura" | "pratica" | "lab" | "evidencia";
export type Tarefa = {
  id: string; baseId: string; ultima: boolean; sessao?: [number, number];
  mes: number; assuntoId?: string; texto: string; minutos: number; tipo: TipoTarefa; url?: string;
  // Módulo de curso (Branas ou Alura): tem fila própria nas partes com fonte "curso".
  curso?: boolean;
  // Para a interface: título sem o prefixo do texto, de onde vem e o formato da leitura.
  titulo?: string; fonte?: string; formato?: TipoLeitura;
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
    // Leitura opcional (aprofundamento) não entra na fila nem segura a prática.
    ...obrigatorias(x).map(l => fatiar(l.id, { mes, assuntoId: x.id, tipo: "leitura", texto: `${l.tipo === "vídeo" ? "Assistir" : "Ler"}: ${l.titulo} (${l.fonte})`, minutos: minLeitura(l), url: l.url, titulo: l.titulo, fonte: l.fonte, formato: l.tipo, ...(l.curso ? { curso: true } : {}) })),
  ]).flat();
  const pratica = xs.flatMap(x => fatiar(x.pratica.id, { mes, assuntoId: x.id, tipo: "pratica", texto: `Prática: ${x.pratica.texto}`, titulo: x.pratica.texto, minutos: horasPratica(x) * 60 }));
  const atividades = lab ? lab.atividades.flatMap(a => fatiar(a.id, { mes, tipo: "lab", texto: `Laboratório M${String(mes).padStart(2, "0")}: ${a.texto}`, titulo: a.texto, minutos: 120 })) : [];
  const evid = lab ? [{ id: `${lab.id}-evid`, baseId: `${lab.id}-evid`, ultima: true, mes, tipo: "evidencia" as const, texto: `Registrar as evidências do laboratório M${String(mes).padStart(2, "0")} (abrir o mês e preencher)`, minutos: 20 }] : [];
  return [...teoria, ...pratica, ...atividades, ...evid];
};

export const TAREFAS: Tarefa[] = Array.from({ length: 36 }, (_, i) => doMes(i + 1)).flat();
export const tarefaById = new Map(TAREFAS.map(t => [t.id, t]));
export const assuntoById = new Map(assuntos.map(x => [x.id, x]));
export const pilarDe = (t: Tarefa): Pilar | undefined => t.assuntoId ? assuntoById.get(t.assuntoId)?.pilar : undefined;
const teoriaDe = new Map<string, Tarefa[]>();
TAREFAS.forEach(t => { if (t.assuntoId && t.tipo === "leitura") teoriaDe.set(t.assuntoId, [...(teoriaDe.get(t.assuntoId) ?? []), t]); });

export const feita = (t: Tarefa, done: Set<string>, valores: Valores) => {
  if (done.has(t.id) || done.has(t.baseId)) return true;
  if (t.tipo !== "evidencia") return false;
  const ev = laboratorios[t.mes - 1]?.evidencias ?? [];
  return ev.length > 0 && ev.every(e => e.id in valores);
};
/** IDs a marcar/desmarcar. Desmarcar uma sessão desfaz também o id original. */
export const idsParaMarcar = (t: Tarefa, valor: boolean) => valor ? (t.ultima && t.baseId !== t.id ? [t.id, t.baseId] : [t.id]) : [...new Set([t.id, t.baseId])];

// Sessões de cada tarefa (baseId → tarefas), montado uma vez.
const sessoesDe = new Map<string, Tarefa[]>();
TAREFAS.forEach(t => { const ss = sessoesDe.get(t.baseId); if (ss) ss.push(t); else sessoesDe.set(t.baseId, [t]); });
// Tarefas divididas em sessões (baseId → ids das sessões).
const SESSOES = [...sessoesDe].filter(([, ss]) => ss.length > 1).map(([b, ss]) => [b, ss.map(s => s.id)] as const);
/**
 * Regra única de "feito": o id original. Toda tarefa cujas sessões estão todas em `done` ganha o id original,
 * em qualquer ordem de marcação (idsParaMarcar só o põe quando a sessão marcada é a última). O useProgress aplica
 * isto ao carregar e a cada gravação, então o progresso salvo de antes também fica certo. Devolve o mesmo Set se nada muda.
 */
export const completarSessoes = (done: Set<string>) => {
  const faltam = SESSOES.filter(([b, ids]) => !done.has(b) && ids.every(id => done.has(id))).map(([b]) => b);
  return faltam.length ? new Set([...done, ...faltam]) : done;
};
/** Todos os ids de uma tarefa da trilha (o original e as sessões), para marcar ou desmarcar fora do painel Hoje. */
export const idsDaTarefa = (baseId: string) => [baseId, ...(sessoesDe.get(baseId) ?? []).filter(t => t.id !== baseId).map(t => t.id)];
/** Sessões feitas e total de uma tarefa (módulo de curso de 4h = 8 sessões). */
export const sessoesFeitas = (baseId: string, done: Set<string>, valores: Valores) => {
  const ss = sessoesDe.get(baseId) ?? []; return { feitas: ss.filter(t => feita(t, done, valores)).length, total: ss.length };
};
/** Minutos que faltam de uma tarefa: a soma das sessões ainda não feitas (0 se concluída). */
export const minutosRestantes = (baseId: string, done: Set<string>, valores: Valores) =>
  done.has(baseId) ? 0 : (sessoesDe.get(baseId) ?? []).reduce((s, t) => s + (feita(t, done, valores) ? 0 : t.minutos), 0);
/** Módulos de curso na ordem da fila (a ordem das tarefas). */
const moduloById = new Map(MODULOS.map(m => [m.id, m]));
export const MODULOS_NA_FILA: Modulo[] = [...new Set(TAREFAS.filter(t => t.curso).map(t => t.baseId))].map(id => moduloById.get(id)).filter((m): m is Modulo => !!m);
/** Prática ainda presa à teoria do assunto (módulo de curso pendente): não pode virar atraso. */
export const praticaBloqueada = (assuntoId: string, done: Set<string>, valores: Valores) => (teoriaDe.get(assuntoId) ?? []).some(x => x.curso && !feita(x, done, valores));

/** Junta sessões seguidas da mesma tarefa (mesmo baseId) num grupo, para a interface mostrar um item só. */
export const agrupar = (ts: Tarefa[]): Tarefa[][] => ts.reduce<Tarefa[][]>((gs, t) => {
  const ult = gs[gs.length - 1]; if (ult && ult[0].baseId === t.baseId) ult.push(t); else gs.push([t]); return gs;
}, []);

export const pendentes = (done: Set<string>, valores: Valores) => TAREFAS.filter(t => !feita(t, done, valores));

/* ───────── Dia de estudo: a grade de qua a dom define quanto tempo e de qual pilar ───────── */

export const diaDaSemana = (iso: string): DiaSemana | undefined => diaDeEstudo(iso);
/** Primeiro dia com estudo a partir de iso (nunca antes do início do plano). */
export const proximoDiaDeEstudo = (iso: string) => { let d = iso < INICIO ? INICIO : iso; while (!diaDaSemana(d)) d = addDias(d, 1); return d; };

const ehTeoria = (t: Tarefa) => t.tipo === "leitura";
export const ehCurso = (t: Tarefa) => !!t.curso;
const ehLab = (t: Tarefa) => t.tipo === "lab" || t.tipo === "evidencia";
// Prática só depois de terminar a teoria do mesmo assunto.
const pronta = (t: Tarefa, done: Set<string>, valores: Valores) => t.tipo !== "pratica" || !t.assuntoId || (teoriaDe.get(t.assuntoId) ?? []).every(x => feita(x, done, valores));

// Em ordem de preferência: se a primeira lista estiver vazia, a parte usa a seguinte (o horário nunca fica vazio à toa).
const filtros = (p: Parte): ((t: Tarefa) => boolean)[] => {
  const doPilar = (t: Tarefa) => pilarDe(t) === p.pilar;
  const lab = (t: Tarefa) => ehLab(t) || (t.tipo === "pratica" && pilarDe(t) === "arquitetura");
  switch (p.fonte) {
    // Próximo módulo de curso de qualquer pilar; sem curso pendente, a parte volta ao pilar dela (ex.: carreira na quinta).
    case "curso": return [ehCurso, t => doPilar(t), lab, () => true];
    case "teoria": return [t => doPilar(t) && ehTeoria(t), t => doPilar(t), lab, () => true];
    case "pratica": return [t => doPilar(t) && t.tipo === "pratica", t => doPilar(t), lab, () => true];
    case "lab": return [lab, () => true];
    case "tudo": return [t => doPilar(t) || (!!p.tambem && pilarDe(t) === p.tambem)]; // inglês e carreira: sem tarefa do pilar, vale o texto da parte
    case "fixo": return [];
  }
};

// Enche a parte na ordem da fila; se a próxima não cabe, procura adiante uma que caiba no que sobrou
// (ex.: 1h = leitura de 40 min + estudo de 20 min), em vez de deixar o resto do horário vazio.
const encher = (xs: Tarefa[], minutos: number) => {
  const out: Tarefa[] = []; let soma = 0;
  for (const t of xs) {
    if (soma >= minutos - 10) break;
    if (out.length && soma + t.minutos > minutos + 10) continue;
    out.push(t); soma += t.minutos;
  }
  return out;
};

/**
 * Tarefas de cada parte do dia (uma lista de ids por parte), ou null em dia livre.
 * Sempre parte do que está pendente agora: dia perdido não gera atraso, só empurra a fila.
 * Só pega tarefas até um mês à frente do mês mais atrasado, para os pilares não dispararem.
 * Exceção: nas partes de curso, o módulo de curso não tem teto (os cursos andam na frente dos meses).
 */
export const montarDia = (iso: string, done: Set<string>, valores: Valores, opts: { semCurso?: boolean } = {}): string[][] | null => {
  const d = diaDaSemana(iso); if (!d) return null;
  // semCurso: dia de resgate. A fila de cursos é uma sequência só e quem anda com ela é o Hoje;
  // o resgate não pega módulo (seria um módulo à frente, fora de ordem) e a parte de curso cai no trabalho do pilar.
  const todas = pendentes(done, valores), pend = todas.filter(t => pronta(t, done, valores) && !(opts.semCurso && t.curso));
  const teto = (todas.find(t => !t.curso)?.mes ?? 36) + 1;
  const usadas = new Set<string>();
  return d.partes.map(p => {
    const livres = pend.filter(t => (t.mes <= teto || (p.fonte === "curso" && t.curso)) && !usadas.has(t.id));
    const xs = filtros(p).map(f => livres.filter(f)).find(l => l.length) ?? [];
    const escolhidas = encher(xs, p.horas * 60); escolhidas.forEach(t => usadas.add(t.id));
    return escolhidas.map(t => t.id);
  });
};

/**
 * Distribui a fila pelos dias de estudo de `de` até `ate`, supondo que cada dia é cumprido.
 * É só previsão: se um dia não for feito, tudo anda um dia de estudo para a frente.
 */
export const projetarDias = (de: string, ate: string, done: Set<string>, valores: Valores) => {
  const sim = new Set(done); const out = new Map<string, string[][]>();
  for (let d = de < INICIO ? INICIO : de; d <= ate; d = addDias(d, 1)) {
    const partes = montarDia(d, sim, valores); if (!partes) continue;
    out.set(d, partes);
    partes.flat().forEach(id => { const t = tarefaById.get(id); if (t) idsParaMarcar(t, true).forEach(x => sim.add(x)); });
  }
  return out;
};

/**
 * Plano até `ate`: as tarefas já fixadas no painel Hoje (`fixas`, do dia `dataFixa`: hoje ou a prévia do próximo
 * dia de estudo) contam como feitas e a projeção começa no dia seguinte a elas (ou em `de`, se não há dia fixo).
 * A grade da semana e o resgate usam esta mesma função, para nunca discordarem.
 */
export const planoAte = (fixas: string[], dataFixa: string | null, de: string, ate: string, done: Set<string>, valores: Valores) => {
  const sim = new Set(done); fixas.forEach(id => { const t = tarefaById.get(id); if (t) idsParaMarcar(t, true).forEach(x => sim.add(x)); });
  const inicio = dataFixa ? addDias(dataFixa, 1) : de;
  return { de: inicio, dias: inicio <= ate ? projetarDias(inicio, ate, sim, valores) : new Map<string, string[][]>() };
};

/** Próxima pendente fora da lista de hoje, para o botão "adiantar". */
export const proximaTarefa = (done: Set<string>, valores: Valores, excluir: Set<string>) =>
  pendentes(done, valores).find(t => !excluir.has(t.id) && pronta(t, done, valores));

// Minutos por dia das partes que passam no filtro (partes "fixo" nunca consomem a fila).
const minutosDoDia = (iso: string, conta: (p: Parte) => boolean) => (diaDaSemana(iso)?.partes ?? []).reduce((s, p) => s + (p.fonte !== "fixo" && conta(p) ? p.horas * 60 : 0), 0);
/** Primeiro dia, a partir de hoje, em que a capacidade acumulada cobre `minutos`. */
const andar = (hoje: string, minutos: number, capacidade: (iso: string) => number) => {
  let d = hoje < INICIO ? INICIO : hoje, soma = capacidade(d);
  for (let i = 0; soma < minutos && i < 5000; i++) { d = addDias(d, 1); soma += capacidade(d); }
  return d;
};
const restante = (done: Set<string>, valores: Valores, f: (t: Tarefa) => boolean) => TAREFAS.filter(t => f(t) && !feita(t, done, valores)).reduce((s, t) => s + t.minutos, 0);

/** Data aproximada em que a fila de cursos acaba seguindo a grade a partir de hoje; null se já acabou. */
export const previsaoCursos = (done: Set<string>, valores: Valores, hoje: string) => {
  const resto = restante(done, valores, ehCurso);
  return resto ? andar(hoje, resto, iso => minutosDoDia(iso, p => p.fonte === "curso")) : null;
};

/**
 * Data em que o mês fecha seguindo a grade a partir de hoje; null se já fechou.
 * Simula a própria fila dia a dia (como projetarDias), então respeita o pilar e a fonte de cada parte:
 * as horas de curso só contam para o mês quando a parte de curso cai numa tarefa dele.
 */
export const previsaoMes = (mes: number, done: Set<string>, valores: Valores, hoje: string) => {
  const sim = new Set(done), falta = () => TAREFAS.some(t => t.mes === mes && !feita(t, sim, valores));
  if (!falta()) return null;
  let d = hoje < INICIO ? INICIO : hoje;
  for (let i = 0; i < 5000; i++, d = addDias(d, 1)) {
    const partes = montarDia(d, sim, valores); if (!partes) continue;
    partes.flat().forEach(id => { const t = tarefaById.get(id); if (t) idsParaMarcar(t, true).forEach(x => sim.add(x)); });
    if (!falta()) return d;
  }
  return d;
};
export const metaMes = fimMes;
