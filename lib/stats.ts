import { ALL_ETAPAS, ALL_MEDICOES, blocoById, blocos } from "./data/blocos";
import { quarters, trilhas } from "./data/cronograma";
import type { Bloco, Quarter, Trilha } from "./types";
import type { Valores } from "./useProgress";

export const ALL_ETAPA_IDS = ALL_ETAPAS.map((e) => e.id);
export const ALL_MEDICAO_IDS = ALL_MEDICOES.map((m) => m.id);
export const ALL_TASK_IDS = [
  ...quarters.flatMap((q) => q.tasks.map((t) => t.id)),
  ...trilhas.flatMap((t) => t.itens?.map((i) => i.id) ?? []),
];

export function etapaIds(b: Bloco) {
  return b.etapas.map((e) => e.id);
}

export function medicaoIds(b: Bloco) {
  return b.medicoes.map((m) => m.id);
}

export function countDone(ids: string[], done: Set<string>) {
  let n = 0;
  for (const id of ids) if (done.has(id)) n++;
  return n;
}

export function countPreenchidas(ids: string[], valores: Valores) {
  let n = 0;
  for (const id of ids) if (id in valores) n++;
  return n;
}

/**
 * A regra central da spec: um bloco só fecha quando todas as etapas estão
 * marcadas E todas as medições dele foram preenchidas. Header, card do bloco e
 * barra do trimestre chamam esta função — não reimplementam a regra.
 */
export function blocoCompleto(b: Bloco, done: Set<string>, valores: Valores) {
  const etapas = etapaIds(b);
  const medicoes = medicaoIds(b);
  if (etapas.length === 0 && medicoes.length === 0) return false;
  return (
    countDone(etapas, done) === etapas.length &&
    countPreenchidas(medicoes, valores) === medicoes.length
  );
}

export function blocosConcluidos(done: Set<string>, valores: Valores) {
  return blocos.filter((b) => blocoCompleto(b, done, valores)).length;
}

export function quarterBlocos(q: Quarter) {
  return q.blocoIds
    .map((id) => blocoById.get(id))
    .filter((b) => b !== undefined);
}

export function quarterTransbordos(q: Quarter) {
  return (q.transbordoIds ?? [])
    .map((id) => blocoById.get(id))
    .filter((b) => b !== undefined);
}

/** Itens que o trimestre conta na própria barra. Transbordo não reconta. */
export function quarterItemIds(q: Quarter): string[] {
  const bs = quarterBlocos(q);
  return [
    ...bs.flatMap(etapaIds),
    ...bs.flatMap(medicaoIds),
    ...q.tasks.map((t) => t.id),
  ];
}

export function quarterDone(q: Quarter, done: Set<string>, valores: Valores) {
  const bs = quarterBlocos(q);
  return (
    countDone([...bs.flatMap(etapaIds), ...q.tasks.map((t) => t.id)], done) +
    countPreenchidas(bs.flatMap(medicaoIds), valores)
  );
}

export function semanasLabel(b: Bloco) {
  const [min, max] = b.duracaoSemanas;
  const n = min === max ? `${min}` : `${min}–${max}`;
  return `${n} ${max === 1 ? "semana" : "semanas"}`;
}

/** "T2" ou "T2–T3" quando o bloco transborda. Deriva da grade, sem duplicar. */
export function trimestreDeBloco(blocoId: string) {
  const labels = quarters
    .filter(
      (q) =>
        q.blocoIds.includes(blocoId) ||
        (q.transbordoIds ?? []).includes(blocoId),
    )
    .map((q) => q.label);
  return labels.join("–");
}

/**
 * Trilha com `itens` conta os próprios; trilha com `kind` conta os marcos
 * daquele tipo espalhados pela grade — assim nenhum ID vive em dois lugares.
 */
export function trilhaItemIds(t: Trilha): string[] {
  if (t.itens) return t.itens.map((i) => i.id);
  if (t.kind) {
    return quarters.flatMap((q) =>
      q.tasks.filter((task) => task.kind === t.kind).map((task) => task.id),
    );
  }
  return [];
}

export function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}
