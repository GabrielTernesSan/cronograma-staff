// O que ficou para trás até hoje: dias da grade sem marcação, itens de assunto vencidos e laboratórios de meses fechados.
import { addDias, diaId, fase, inicioPlano, mesDoPlano, segunda } from "./agenda";
import { laboratorios } from "./data/blocos";
import { DURACAO_MESES, SEMANA } from "./data/cronograma";
import { assuntos } from "./data/trilha";
import { assuntoIds, labComplete } from "./stats";
import type { Assunto, Laboratorio } from "./types";
import type { Valores } from "./progresso";

export type DiaAtrasado = { id: string; data: Date; dia: (typeof SEMANA)[number] };
export type AssuntoAtrasado = { x: Assunto; ids: string[] };
export type LabAtrasado = { lab: Laboratorio; atividades: string[]; evidencias: string[] };
export type Atrasados = { dias: DiaAtrasado[]; assuntos: AssuntoAtrasado[]; labs: LabAtrasado[] };

export function atrasados(hoje: Date, done: Set<string>, valores: Valores): Atrasados {
  const inicio = inicioPlano(), zero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (zero <= inicio) return { dias: [], assuntos: [], labs: [] };
  // Depois do fim do plano tudo conta como mês fechado.
  const mes = mesDoPlano(zero) ?? DURACAO_MESES + 1, teoriaVencida = mesDoPlano(zero) !== null && fase(zero) === "prática";
  const dias: DiaAtrasado[] = [];
  for (let d = inicio; d < zero; d = addDias(d, 1)) { const dia = SEMANA.find(s => s.dow === d.getDay()); if (!dia) continue; const id = diaId(segunda(d), dia.dow); if (!done.has(id)) dias.push({ id, data: d, dia }); }
  const lista = assuntos.flatMap(x => {
    const vencidos = x.mes < mes ? assuntoIds(x) : x.mes === mes && teoriaVencida ? [...x.subtopicos.map(s => s.id), ...x.leituras.map(l => l.id)] : [];
    const ids = vencidos.filter(id => !done.has(id));
    return ids.length ? [{ x, ids }] : [];
  });
  const labs = laboratorios.filter(l => l.mes < mes && !labComplete(l, done, valores)).map(lab => ({ lab, atividades: lab.atividades.map(a => a.id).filter(id => !done.has(id)), evidencias: lab.evidencias.map(e => e.id).filter(id => !(id in valores)) }));
  return { dias, assuntos: lista, labs };
}

export const totalItens = (a: Atrasados) => a.assuntos.reduce((t, x) => t + x.ids.length, 0);
