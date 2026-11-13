// Datas da grade semanal e do plano, sempre no fuso local.
import { DURACAO_MESES, INICIO_PLANO } from "./data/cronograma";
import { isoDia } from "./revisao";

export const DIA = 86400000;
export const addDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const segunda = (d: Date) => addDias(d, -((d.getDay() + 6) % 7));
export const diaId = (seg: Date, dow: number) => `sem-${isoDia(seg)}-d${dow}`;
export const dataDoDia = (seg: Date, dow: number) => addDias(seg, (dow + 6) % 7);
export const inicioPlano = () => new Date(INICIO_PLANO.ano, INICIO_PLANO.mes, 1);
// Mês do plano pela data do dia (M01 = INICIO_PLANO); fora do plano devolve null. Dias 1–14 são teoria, 15 em diante prática.
export const mesDoPlano = (d: Date) => { const m = (d.getFullYear() - INICIO_PLANO.ano) * 12 + d.getMonth() - INICIO_PLANO.mes + 1; return m >= 1 && m <= DURACAO_MESES ? m : null; };
export const fase = (d: Date) => d.getDate() <= 14 ? "teoria" : "prática";
