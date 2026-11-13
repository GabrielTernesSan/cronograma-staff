// Repetição espaçada (SM-2 simplificado): funções puras, datas como yyyy-mm-dd no fuso local.
export type Card = { id: string; assunto: string; pergunta: string; resposta: string; criado: string; due: string; intervalo: number; facilidade: number; repeticoes: number; lapsos: number };
export type Cards = Record<string, Card>;
export type Nota = "errei" | "dificil" | "bom" | "facil";
export const NOTAS: { n: Nota; rotulo: string }[] = [{ n: "errei", rotulo: "errei" }, { n: "dificil", rotulo: "difícil" }, { n: "bom", rotulo: "bom" }, { n: "facil", rotulo: "fácil" }];
export const isoDia = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const somar = (dia: string, n: number) => { const [y, m, d] = dia.split("-").map(Number); return isoDia(new Date(y, m - 1, d + n)); };
const FAC_MIN = 1.3, FAC_INICIAL = 2.5;
const proximo = (c: Card, nota: Nota) => {
  if (nota === "errei") return { intervalo: 1, facilidade: Math.max(FAC_MIN, c.facilidade - 0.2), repeticoes: 0, lapsos: c.lapsos + 1 };
  if (nota === "dificil") return { intervalo: Math.max(1, Math.round(c.intervalo * 1.2)), facilidade: Math.max(FAC_MIN, c.facilidade - 0.15), repeticoes: c.repeticoes + 1, lapsos: c.lapsos };
  const base = c.repeticoes === 0 ? 1 : c.repeticoes === 1 ? 3 : Math.round(c.intervalo * c.facilidade);
  return nota === "bom" ? { intervalo: base, facilidade: c.facilidade, repeticoes: c.repeticoes + 1, lapsos: c.lapsos } : { intervalo: Math.max(base + 1, Math.round(base * 1.3)), facilidade: c.facilidade + 0.15, repeticoes: c.repeticoes + 1, lapsos: c.lapsos };
};
export const avaliar = (c: Card, nota: Nota, hoje: string): Card => { const p = proximo(c, nota); return { ...c, ...p, due: somar(hoje, p.intervalo) }; };
export const fmtIntervalo = (dias: number) => dias < 7 ? `${dias}d` : dias < 30 ? `${Math.round(dias / 7)}sem` : dias < 365 ? `${Math.round(dias / 30)}m` : `${(dias / 365).toFixed(1)}a`;
export const previa = (c: Card, nota: Nota) => fmtIntervalo(proximo(c, nota).intervalo);
export const pendentes = (cs: Cards, hoje: string) => Object.values(cs).filter(c => c.due <= hoje).sort((a, b) => a.due.localeCompare(b.due) || a.criado.localeCompare(b.criado));
export const doAssunto = (cs: Cards, assunto: string) => Object.values(cs).filter(c => c.assunto === assunto).sort((a, b) => a.criado.localeCompare(b.criado));
export const novoCard = (assunto: string, pergunta: string, resposta: string, hoje: string): Card => ({ id: `card-${assunto}-${Date.now().toString(36)}`, assunto, pergunta: pergunta.trim(), resposta: resposta.trim(), criado: new Date().toISOString(), due: hoje, intervalo: 0, facilidade: FAC_INICIAL, repeticoes: 0, lapsos: 0 });
// Sequência de dias com a fila zerada (ids rev-yyyy-mm-dd em done); hoje ainda sem revisão não quebra a sequência.
export const revId = (dia: string) => `rev-${dia}`;
export const sequencia = (hoje: string, done: Set<string>) => { let n = done.has(revId(hoje)) ? 1 : 0; for (let d = somar(hoje, -1); done.has(revId(d)); d = somar(d, -1)) n++; return n; };
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const num = (x: unknown, min: number) => typeof x === "number" && Number.isFinite(x) && x >= min;
const ehCard = (x: unknown): x is Card => { if (typeof x !== "object" || x === null) return false; const c = x as Record<string, unknown>; return ["id", "assunto", "pergunta", "resposta", "criado"].every(k => typeof c[k] === "string" && c[k] !== "") && typeof c.due === "string" && DIA_RE.test(c.due) && num(c.intervalo, 0) && num(c.facilidade, FAC_MIN) && num(c.repeticoes, 0) && num(c.lapsos, 0); };
export const cards = (v: unknown): Cards => typeof v !== "object" || v === null || Array.isArray(v) ? {} : Object.fromEntries(Object.values(v as Record<string, unknown>).filter(ehCard).map(c => [c.id, c]));
