// Grade semanal e mês do plano a partir de Date, sempre no fuso local.
import { DURACAO_MESES, inicioMes, INICIO, type DiaSemana } from "./data/cronograma";
import { metaMes } from "./data/agenda";
import { diasEntre, paraIso } from "./datas";

export const DIA = 86400000;
export const addDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const segunda = (d: Date) => addDias(d, -((d.getDay() + 6) % 7));
export const diaId = (seg: Date, dow: number) => `sem-${paraIso(seg)}-d${dow}`;
export const parteId = (seg: Date, dow: number, i: number) => `${diaId(seg, dow)}-p${i}`;
export const dataDoDia = (seg: Date, dow: number) => addDias(seg, (dow + 6) % 7);
// O id do dia inteiro vem de antes das partes e continua valendo como todas marcadas.
export const parteFeita = (seg: Date, d: DiaSemana, i: number, done: Set<string>) => done.has(diaId(seg, d.dow)) || done.has(parteId(seg, d.dow, i));
export const horasDia = (seg: Date, d: DiaSemana, done: Set<string>) => d.partes.reduce((t, p, i) => t + (parteFeita(seg, d, i, done) ? p.horas : 0), 0);
// Mês do plano pela data do dia (M01 começa em INICIO); fora do plano devolve null. Primeiros 14 dias do mês são teoria, depois prática.
export const mesDoPlano = (d: Date) => { const x = paraIso(d); if (x < INICIO) return null; let m = 1; while (m < DURACAO_MESES && inicioMes(m + 1) <= x) m++; return x <= metaMes(DURACAO_MESES) ? m : null; };
export const fase = (d: Date) => { const m = mesDoPlano(d); return m && diasEntre(inicioMes(m), paraIso(d)) < 14 ? "teoria" : "prática"; };
