// O que ficou para trás até ontem: dias da grade com parte sem marcar, itens de assunto vencidos e laboratórios de meses fechados.
import { idsParaMarcar, montarDia, tarefaById } from "./data/agenda";
import { laboratorios } from "./data/blocos";
import { diaDeEstudo, DURACAO_MESES, INICIO, type DiaSemana } from "./data/cronograma";
import { assuntos } from "./data/trilha";
import { addDias, paraData, paraIso } from "./datas";
import { fase, mesDoPlano, parteFeita, segunda } from "./grade";
import { assuntoIds, labComplete } from "./stats";
import type { Assunto, Laboratorio } from "./types";
import type { Valores } from "./progresso";

export type DiaAtrasado = { iso: string; data: Date; seg: Date; dia: DiaSemana; partes: number[] };
export type AssuntoAtrasado = { x: Assunto; ids: string[] };
export type LabAtrasado = { lab: Laboratorio; atividades: string[]; evidencias: string[] };
export type Atrasados = { dias: DiaAtrasado[]; assuntos: AssuntoAtrasado[]; labs: LabAtrasado[] };

export function atrasados(hoje: Date, done: Set<string>, valores: Valores): Atrasados {
  const hojeIso = paraIso(hoje);
  if (hojeIso <= INICIO) return { dias: [], assuntos: [], labs: [] };
  const dias: DiaAtrasado[] = [];
  for (let iso = INICIO; iso < hojeIso; iso = addDias(iso, 1)) {
    const dia = diaDeEstudo(iso); if (!dia) continue;
    const data = paraData(iso), seg = segunda(data), partes = dia.partes.map((_, i) => i).filter(i => !parteFeita(seg, dia, i, done));
    if (partes.length) dias.push({ iso, data, seg, dia, partes });
  }
  // Depois do fim do plano tudo conta como mês fechado.
  const mesHoje = mesDoPlano(hoje), mes = mesHoje ?? DURACAO_MESES + 1, teoriaVencida = mesHoje !== null && fase(hoje) === "prática";
  const lista = assuntos.flatMap(x => {
    const vencidos = x.mes < mes ? assuntoIds(x) : x.mes === mes && teoriaVencida ? [...x.subtopicos.map(s => s.id), ...x.leituras.map(l => l.id)] : [];
    const ids = vencidos.filter(id => !done.has(id));
    return ids.length ? [{ x, ids }] : [];
  });
  const labs = laboratorios.filter(l => l.mes < mes && !labComplete(l, done, valores)).map(lab => ({ lab, atividades: lab.atividades.map(a => a.id).filter(id => !done.has(id)), evidencias: lab.evidencias.map(e => e.id).filter(id => !(id in valores)) }));
  return { dias, assuntos: lista, labs };
}

export const totalItens = (a: Atrasados) => a.assuntos.reduce((t, x) => t + x.ids.length, 0);

/** Tarefas por parte de cada dia resgatado (ids), por data. */
export type Resgate = Record<string, string[][]>;
/**
 * Material de cada dia perdido: as próximas tarefas pendentes da fila, como o painel Hoje faria.
 * Dias já montados (salvos) ficam como estão; as tarefas de hoje (reservadas) e as de outros dias resgatados
 * não se repetem. Parte já marcada não recebe tarefa.
 */
export function montarResgate(dias: DiaAtrasado[], salvos: Resgate, done: Set<string>, valores: Valores, reservadas: string[]): Resgate {
  const sim = new Set(done), out: Resgate = {};
  const usar = (id: string) => { const t = tarefaById.get(id); if (t) idsParaMarcar(t, true).forEach(x => sim.add(x)); };
  reservadas.forEach(usar);
  dias.forEach(d => { const s = salvos[d.iso]; if (Array.isArray(s) && s.length === d.dia.partes.length) { out[d.iso] = s; s.flat().forEach(usar); } });
  dias.forEach(d => {
    if (out[d.iso]) return;
    const p = (montarDia(d.iso, sim, valores) ?? []).map((ids, i) => d.partes.includes(i) ? ids : []);
    out[d.iso] = p; p.flat().forEach(usar);
  });
  return out;
}
