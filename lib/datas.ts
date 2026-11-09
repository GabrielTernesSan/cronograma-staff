// Datas como "YYYY-MM-DD" no fuso local; nada de UTC para não virar o dia à noite.
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const pad = (n: number) => String(n).padStart(2, "0");

export const paraData = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
export const paraIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hojeIso = () => paraIso(new Date());
export const addDias = (iso: string, n: number) => { const d = paraData(iso); d.setDate(d.getDate() + n); return paraIso(d); };
export const addMeses = (iso: string, n: number) => { const d = paraData(iso); d.setMonth(d.getMonth() + n); return paraIso(d); };
export const diasEntre = (de: string, ate: string) => Math.round((paraData(ate).getTime() - paraData(de).getTime()) / 86_400_000);

export const fmtMesAno = (iso: string) => { const d = paraData(iso); return `${MESES[d.getMonth()]}/${d.getFullYear()}`; };
export const fmtDia = (iso: string) => { const d = paraData(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
export const fmtDiaSemana = (iso: string) => `${SEMANA[paraData(iso).getDay()]} ${fmtDia(iso)}`;
