import { minutosRestantes } from "./data/agenda";
import { laboratorios } from "./data/blocos";
import { materiais, trimestres } from "./data/cronograma";
import { cursoDe, FORMACOES, MODULOS } from "./data/cursos";
import { assuntos, obrigatorias } from "./data/trilha";
import type { Assunto, Laboratorio, Trimestre } from "./types";
import type { Valores } from "./useProgress";
export const ALL_ACTIVITY_IDS = laboratorios.flatMap((l) => l.atividades.map((a) => a.id));
export const ALL_EVIDENCE_IDS = laboratorios.flatMap((l) => l.evidencias.map((e) => e.id));
export const ALL_MARCO_IDS = trimestres.flatMap((t) => t.marcos.map((m) => m.id));
export const ALL_MATERIAL_IDS = materiais.map((m) => m.id);
export const countDone = (ids: string[], done: Set<string>) => ids.filter((id) => done.has(id)).length;
export const countValues = (ids: string[], valores: Valores) => ids.filter((id) => id in valores).length;
export const labComplete = (l: Laboratorio, done: Set<string>, valores: Valores) => countDone(l.atividades.map((a) => a.id), done) === l.atividades.length && countValues(l.evidencias.map((e) => e.id), valores) === l.evidencias.length;
export const labsComplete = (done: Set<string>, valores: Valores) => laboratorios.filter((l) => labComplete(l, done, valores)).length;
export const quarterLabs = (t: Trimestre) => laboratorios.filter((l) => t.meses.includes(l.mes));
export const quarterIds = (t: Trimestre) => [...quarterLabs(t).flatMap((l) => [...l.atividades.map((a) => a.id), ...l.evidencias.map((e) => e.id)]), ...t.marcos.map((m) => m.id)];
export const quarterDone = (t: Trimestre, done: Set<string>, valores: Valores) => countDone([...quarterLabs(t).flatMap((l) => l.atividades.map((a) => a.id)), ...t.marcos.map((m) => m.id)], done) + countValues(quarterLabs(t).flatMap((l) => l.evidencias.map((e) => e.id)), valores);
export const pct = (part: number, total: number) => total === 0 ? 0 : Math.round((part / total) * 100);
// Subtópicos e leituras opcionais (aprofundamento) não contam: o assunto fecha com os cursos, as leituras obrigatórias e a prática.
export const assuntoIds = (x: Assunto) => [...obrigatorias(x).map((l) => l.id), x.pratica.id];
export const ALL_ASSUNTO_IDS = assuntos.flatMap(assuntoIds);
// Módulos de curso de verdade (Branas e Alura); as leituras em português ficam de fora do contador.
export const ALL_CURSO_IDS = MODULOS.filter((m) => m.formacao !== "leitura").map((m) => m.id);

export type ProgressoCurso = { curso: string; url: string; formacao: keyof typeof FORMACOES; feitos: number; total: number; minutosRestantes: number; minutosTotal: number };
/** Progresso por curso: cada formação do Branas é um curso, cada curso da Alura é um, e as leituras em português são um grupo. Na ordem do catálogo. */
export const progressoCursos = (done: Set<string>): ProgressoCurso[] => {
  const out = new Map<string, ProgressoCurso>();
  for (const m of MODULOS) {
    // Feito = id do módulo marcado (o useProgress o completa quando todas as sessões estão feitas). Curso não tem evidência,
    // então valores não entram na conta. Módulo começado: falta só o das sessões não feitas.
    const nome = cursoDe(m), feito = done.has(m.id);
    const p = out.get(nome) ?? { curso: nome, url: m.formacao === "alura" ? m.url ?? FORMACOES.alura.url : FORMACOES[m.formacao].url, // leituras: "" (cada uma tem o seu link)
      formacao: m.formacao, feitos: 0, total: 0, minutosRestantes: 0, minutosTotal: 0 };
    p.total++; p.minutosTotal += m.minutos ?? 0; if (feito) p.feitos++; else p.minutosRestantes += minutosRestantes(m.id, done, {});
    out.set(nome, p);
  }
  return [...out.values()];
};
export const assuntoDone = (x: Assunto, done: Set<string>) => countDone(assuntoIds(x), done);
