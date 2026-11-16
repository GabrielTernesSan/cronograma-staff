"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { laboratorios } from "@/lib/data/blocos";
import { agrupar, assuntoById, feita, idsDaTarefa, idsParaMarcar, metaMes, minutosRestantes, MODULOS_NA_FILA, sessoesFeitas, planoAte, previsaoCursos, previsaoMes, TAREFAS, tarefaById, type Tarefa, type TipoTarefa } from "@/lib/data/agenda";
import { diaDeEstudo, diasDaSemana, DESTINOS, DESTINOS_NOTA, INICIO, inicioMes, materiais, MERCADO_DADOS, MERCADO_FONTES, MERCADO_LEITURA, META_SEMANA, periodo, PILARES, RITMO_NOTA, ROTA, SEMANA, trimestres } from "@/lib/data/cronograma";
import { cursoDe, fonteDe, FORMACOES, MODULOS } from "@/lib/data/cursos";
import { assuntos, assuntosDoMes, horasPratica, horasTeoria, minLeitura, obrigatorias, opcionais } from "@/lib/data/trilha";
import { diasEntre, fmtDia, fmtDiaSemana, fmtMesAno, hojeIso, paraData, paraIso } from "@/lib/datas";
import { addDias, DIA, dataDoDia, diaId, fase, horasDia, mesDoPlano, parteFeita, parteId, segunda } from "@/lib/grade";
import { useHoje, type DiaHoje } from "@/lib/useHoje";
import { atrasados, montarResgate, totalItens, type DiaAtrasado, type Resgate } from "@/lib/atrasos";
import { doAssunto, fmtIntervalo, isoDia, NOTAS, novoCard, pendentes, previa, sequencia } from "@/lib/revisao";
import { ALL_ACTIVITY_IDS, ALL_ASSUNTO_IDS, ALL_CURSO_IDS, ALL_EVIDENCE_IDS, ALL_MARCO_IDS, assuntoDone, assuntoIds, countDone, countValues, labComplete, labsComplete, pct, progressoCursos } from "@/lib/stats";
import type { Assunto, Leitura, Pilar } from "@/lib/types";

const title = (p: Pilar) => PILARES[p].titulo;
const DOT: Record<Pilar, string> = { arquitetura: "bg-accent", ia: "bg-measure", cloud: "bg-ok", ingles: "bg-decisao", carreira: "bg-warn" };
const ANOS = [
  { n: 1, nome: "Base sênior com IA", meses: periodo(1, 12) },
  { n: 2, nome: "Contrato remoto internacional", meses: periodo(13, 24) },
  { n: 3, nome: "Mudança com visto", meses: periodo(25, 36) },
];
type Sel = { kind: "assunto"; id: string } | { kind: "mes"; mes: number } | { kind: "tri"; id: string } | { kind: "revisao" } | { kind: "atrasos" } | null;

const ABAS = [{ id: "hoje", t: "Hoje" }, { id: "semana", t: "Semana" }, { id: "trilha", t: "Trilha" }, { id: "cursos", t: "Cursos" }, { id: "mercado", t: "Mercado" }] as const;
type Aba = (typeof ABAS)[number]["id"];
// Data do navegador só depois de montar (o HTML estático não sabe que dia é).
const useAgora = () => { const [d, setD] = useState<Date | null>(null); useEffect(() => setD(new Date()), []); return d; };

export function Roadmap() {
  const hojeApi = useHoje(); const agora = useAgora();
  const [sel, setSel] = useState<Sel>(null); const [aba, setAbaState] = useState<Aba>("hoje");
  // A aba fica no hash (#trilha), então dá para voltar nela e mandar o link; a query (?hoje=) é mantida.
  useEffect(() => { const ler = () => { const x = window.location.hash.slice(1); if (ABAS.some(a => a.id === x)) setAbaState(x as Aba); }; ler(); window.addEventListener("hashchange", ler); return () => window.removeEventListener("hashchange", ler); }, []);
  const setAba = (x: Aba) => { setAbaState(x); history.replaceState(null, "", `#${x}`); window.scrollTo(0, 0); };
  return <div className="min-h-screen pb-24">
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <span className="hidden font-display text-[15px] font-bold tracking-tight sm:inline">Senior Abroad</span>
        <nav aria-label="Seções" className="flex min-w-0 gap-1 overflow-x-auto">{ABAS.map(x => <button key={x.id} type="button" onClick={() => setAba(x.id)} aria-current={aba === x.id ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-1.5 text-[14px] font-medium transition ${aba === x.id ? "bg-surface text-text shadow-sm ring-1 ring-line" : "text-muted hover:text-text"}`}>{x.t}</button>)}</nav>
        <div className="ml-auto flex shrink-0 items-center gap-2"><SyncStatus /><Menu /></div>
      </div>
    </header>
    <main className="mx-auto mt-6 max-w-[1180px] px-4 sm:mt-8 sm:px-6">
      {aba === "hoje" && <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Hoje h={hojeApi} onSelect={setSel} />
        {agora && <aside className="grid gap-4"><RevisaoHoje hoje={agora} onSelect={setSel} /><AtrasosHoje hoje={agora} onSelect={setSel} /><SemanaResumo hoje={agora} onAbrir={() => setAba("semana")} /></aside>}
      </div>}
      {aba === "semana" && <Semana h={hojeApi} onSelect={setSel} />}
      {aba === "trilha" && <Trilha onSelect={setSel} />}
      {aba === "cursos" && <Cursos onSelect={setSel} />}
      {aba === "mercado" && <Mercado />}
    </main>
    <Drawer sel={sel} h={hojeApi} onClose={() => setSel(null)} onSelect={setSel} />
  </div>;
}

function SyncStatus() {
  const { sync } = useApp();
  const [cor, texto] = sync === "erro" ? ["bg-warn", "erro ao salvar"] : sync === "salvo" ? ["bg-ok", "salvo na nuvem"] : sync === "salvando" ? ["bg-measure", "salvando…"] : ["bg-muted", "só local"];
  return <span className="flex items-center gap-1.5 text-[12.5px] text-muted" title={texto}><span className={`inline-block size-2 rounded-full ${cor}`} /><span className="hidden md:inline">{texto}</span></span>;
}

// Exportar, importar, token e zerar ficam fora do caminho, num menu.
function Menu() {
  const app = useApp(); const file = useRef<HTMLInputElement>(null); const box = useRef<HTMLDetailsElement>(null);
  const [msg, setMsg] = useState(""); const [tok, setTok] = useState(""); const [confirm, setConfirm] = useState(false);
  const salvarToken = () => { app.setToken(tok); setTok(""); setMsg("Token salvo."); };
  useEffect(() => { const fechar = (e: MouseEvent) => { if (box.current?.open && !box.current.contains(e.target as Node)) box.current.open = false; }; document.addEventListener("click", fechar); return () => document.removeEventListener("click", fechar); }, []);
  const item = "block w-full rounded-md px-3 py-2 text-left text-[14px] hover:bg-surface2";
  return <details ref={box} className="relative">
    <summary aria-label="Mais opções" className="flex size-9 items-center justify-center rounded-lg text-[18px] text-muted hover:bg-surface hover:text-text">⋯</summary>
    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-lg">
      <button type="button" className={item} onClick={app.exportJson}>Exportar progresso</button>
      <button type="button" className={item} onClick={() => file.current?.click()}>Importar progresso</button>
      <input ref={file} className="hidden" type="file" accept="application/json,.json" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) setMsg((await app.importJson(f)).message); }} />
      <form className="flex gap-1.5 px-1.5 py-1.5" onSubmit={e => { e.preventDefault(); salvarToken(); }}><input aria-label="Token da nuvem" className="medicao min-w-0 flex-1" type="password" autoComplete="off" placeholder="token da nuvem" value={tok} onChange={e => setTok(e.target.value)} /><Btn onClick={salvarToken}>salvar</Btn></form>
      <div className="my-1 border-t border-line-soft" />
      {confirm ? <div className="flex gap-1.5 px-1.5 py-1.5"><Btn danger onClick={() => { app.reset(); setConfirm(false); setMsg("Progresso zerado."); }}>confirmar zerar</Btn><Btn onClick={() => setConfirm(false)}>cancelar</Btn></div>
        : <button type="button" className={`${item} text-warn`} onClick={() => setConfirm(true)}>Zerar progresso…</button>}
      {msg && <p className="px-3 py-2 text-[12.5px] text-accent" role="status">{msg}</p>}
    </div>
  </details>;
}

function Mercado() {
  const app = useApp();
  return <div className="grid gap-6">
    <section className="card p-5 sm:p-6"><h2 className="text-xl font-bold">Mercado, futuro e destino</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2"><div className="min-w-0"><p className="label mb-2">O que o mercado pede em 2026</p><ul className="list-disc space-y-2 pl-5 leading-relaxed">{MERCADO_DADOS.map(x => <li key={x}>{x}</li>)}</ul></div><div className="min-w-0"><p className="label mb-2">Leitura do futuro (2027–2029)</p><ul className="list-disc space-y-2 pl-5 leading-relaxed">{MERCADO_LEITURA.map(x => <li key={x}>{x}</li>)}</ul></div></div>
      <p className="label mb-2 mt-8">Destinos e régua de salário para visto</p><p className="mb-3 max-w-[70ch] text-[14px] text-muted">{DESTINOS_NOTA}</p>
      <div className="overflow-x-auto rounded-lg border border-line"><table className="doc-table min-w-[640px] text-[14px]"><thead><tr><th>Destino</th><th>Via</th><th>Mínimo 2026</th><th>Prós</th><th>Contras</th></tr></thead><tbody>{DESTINOS.map(d => <tr key={d.pais}><td className="font-semibold">{d.pais}</td><td>{d.via}</td><td className="whitespace-nowrap font-mono text-[13px]">{d.minimo}</td><td className="text-muted">{d.pros}</td><td className="text-muted">{d.contras}</td></tr>)}</tbody></table></div>
      <p className="mt-4 text-[12px] text-muted">Fontes: {MERCADO_FONTES.map(([t, u], i) => <span key={u}>{i > 0 && " · "}<a className="text-accent hover:underline" href={u} target="_blank" rel="noreferrer">{t}</a></span>)}</p>
    </section>
    <section><h2 className="text-xl font-bold">Materiais e hábitos</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{materiais.map(m => <label key={m.id} className="card block cursor-pointer p-5"><div className="flex gap-3"><input className="mt-1 size-4" type="checkbox" checked={app.done.has(m.id)} onChange={() => app.toggle(m.id)} /><div><p className="label mb-1">{m.tipo}</p><p className={app.done.has(m.id) ? "font-semibold text-muted line-through" : "font-semibold"}>{m.titulo}</p><p className="mt-2 text-[14px] leading-relaxed text-muted">{m.descricao}</p>{m.url && <a className="mt-2 inline-block text-[12.5px] text-accent hover:underline" href={m.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>fonte pública ↗</a>}</div></div></label>)}</div></section>
  </div>;
}

const TIPOS: Record<TipoTarefa, string> = { leitura: "leitura", pratica: "prática", lab: "laboratório", evidencia: "evidência" };
const NOMES_DIA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const fmtDiaLongo = (iso: string) => `${NOMES_DIA[paraData(iso).getDay()]}, ${fmtDia(iso)}`;
const minutosFeitos = (ts: Tarefa[], done: Set<string>, valores: Record<string, string>) => ts.filter(t => feita(t, done, valores)).reduce((s, t) => s + t.minutos, 0);
const minutosTotal = (ts: Tarefa[]) => ts.reduce((s, t) => s + t.minutos, 0);
// "sessão 1/6" ou, com várias sessões seguidas, "sessões 1–2/6".
const fmtSessoes = (g: Tarefa[]) => { const [i, n] = g[0].sessao ?? [1, 1], j = g[g.length - 1].sessao?.[0] ?? i; return j > i ? `sessões ${i}–${j}/${n}` : `sessão ${i}/${n}`; };

type HojeApi = ReturnType<typeof useHoje>;
/** Ids já fixados no painel Hoje: o dia de hoje com as adiantadas, ou a prévia do próximo dia em dia livre. */
const idsFixos = (hoje: DiaHoje | null, proximo: DiaHoje | null, extra: Tarefa[]) => { const d = hoje ?? proximo; return d ? [...d.partes.flatMap(p => p.tarefas.map(t => t.id)), ...(hoje ? extra : []).map(t => t.id)] : []; };
function Hoje({ h, onSelect }: { h: HojeApi; onSelect: (s: Sel) => void }) {
  const a = useApp(); const { data, hoje, extra, proximo, antesDoInicio, adiantar } = h;
  if (!data) return <section className="card p-5 sm:p-6"><p className="label">Hoje</p><p className="mt-3 text-muted">Carregando as tarefas…</p></section>;
  const dia = hoje ?? proximo; const seg = dia ? segunda(paraData(dia.data)) : null;
  const tarefas = dia ? [...dia.partes.flatMap(p => p.tarefas), ...(hoje ? extra : [])] : [];
  const mes = tarefas[0]?.mes ?? mesDoPlano(paraData(data)) ?? undefined;
  const previsao = mes ? previsaoMes(mes, a.done, a.valores, data) : null;
  const atraso = mes && previsao ? diasEntre(metaMes(mes), previsao) : 0;
  const doMes = mes ? TAREFAS.filter(t => t.mes === mes) : [];
  const pctMes = pct(minutosFeitos(doMes, a.done, a.valores), minutosTotal(doMes));
  const concluido = !!hoje && !!seg && hoje.partes.every(p => parteFeita(seg, hoje.dia, p.indice, a.done));
  const rotulo = hoje ? "Hoje" : antesDoInicio ? "O plano começa em" : "Dia livre · próximo estudo";
  return <section aria-labelledby="hoje-h" className="card p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="label">{rotulo}</p>
        <h1 id="hoje-h" className="mt-1 text-[28px] font-bold leading-tight tracking-tight">{fmtDiaLongo(dia?.data ?? data)}</h1>
        {dia && <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted"><span className="font-mono">{fmtH(dia.dia.horas)}</span>{dia.dia.pilares.map(p => <span key={p} className="flex items-center gap-1.5"><span className={`inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</span>)}</p>}
      </div>
      {mes && <button type="button" onClick={() => onSelect({ kind: "mes", mes })} className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-left transition hover:border-accent sm:w-64">
        <span className="flex items-baseline justify-between gap-2"><span className="text-[13.5px] font-semibold">Mês {mes}</span><span className="font-mono text-[12.5px] text-muted">{pctMes}%</span></span>
        <span className="mt-0.5 block truncate text-[12.5px] text-muted">{laboratorios[mes - 1].titulo}</span>
        <Bar n={pctMes} total={100} />
        <span className={`mt-2 block text-[12.5px] ${previsao && atraso > 0 ? "text-warn" : "text-ok"}`}>{previsao ? `Fecha por volta de ${fmtDia(previsao)} · ${atraso > 0 ? `${atraso} dias após a meta (${fmtDia(metaMes(mes))})` : "dentro da meta"}` : "Mês concluído"}</span>
      </button>}
    </div>
    {!hoje && proximo && <p className="mt-4 rounded-lg bg-surface2 px-4 py-2.5 text-[14px] text-muted">{antesDoInicio ? `Segunda e terça são livres; o primeiro estudo é ${fmtDiaSemana(proximo.data)}.` : `Hoje é dia livre. Abaixo, a prévia de ${fmtDiaSemana(proximo.data)}.`}</p>}
    {dia && seg && <PartesDoDia dia={dia} seg={seg} ativo={!!hoje} onSelect={onSelect} />}
    {hoje && extra.length > 0 && <div className="mt-4 rounded-xl border border-line"><p className="label border-b border-line-soft px-4 py-2.5">Adiantadas</p><ul className="divide-y divide-line-soft">{agrupar(extra).map(g => <TarefaItem key={g[0].id} g={g} onSelect={onSelect} />)}</ul></div>}
    {concluido && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ok/10 px-4 py-3"><p className="font-semibold text-ok" role="status">✓ Dia concluído</p><Btn onClick={adiantar}>adiantar a próxima tarefa</Btn></div>}
    <p className="mt-4 text-[12.5px] text-muted">Dia perdido não vira atraso: o próximo dia de estudo começa da tarefa que ainda não foi feita.</p>
  </section>;
}

// Cada parte da grade é um bloco com as tarefas da trilha que cabem nela; a mesma caixa marca a parte na grade semanal.
function PartesDoDia({ dia, seg, ativo, onSelect }: { dia: DiaHoje; seg: Date; ativo: boolean; onSelect: (s: Sel) => void }) {
  const a = useApp();
  return <ol className="mt-5 grid gap-3">{dia.partes.map(p => {
    const id = parteId(seg, dia.dia.dow, p.indice), f = parteFeita(seg, dia.dia, p.indice, a.done), base = dia.dia.partes[p.indice];
    // Marcar a última tarefa da parte marca a parte; desmarcar uma tarefa desmarca a parte.
    const aoMarcar = (g: Tarefa[], valor: boolean) => { const resto = p.tarefas.filter(x => !g.includes(x)).every(x => feita(x, a.done, a.valores)); a.setMany([...g.flatMap(t => idsParaMarcar(t, valor)), ...(valor ? (resto ? [id] : []) : [id])], valor); };
    return <li key={p.indice} className={`overflow-hidden rounded-xl border ${ativo && f ? "border-ok/40 bg-ok/5" : "border-line bg-surface"}`}>
      <label className={`flex items-start gap-3 bg-surface2/60 px-4 py-3 ${ativo ? "cursor-pointer" : ""}`}>
        <span className={`mt-1.5 inline-block size-2 shrink-0 rounded-full ${base?.pilar ? DOT[base.pilar] : "bg-muted"}`} />
        <span className={`min-w-0 flex-1 text-[14px] font-semibold leading-snug ${ativo && f ? "text-muted line-through" : ""}`}>{p.texto}</span>
        <span className="shrink-0 font-mono text-[12.5px] text-muted">{fmtH(p.horas)}</span>
        {ativo && <input aria-label={`Marcar parte: ${p.texto}`} type="checkbox" className="mt-0.5 size-4 shrink-0" checked={f} onChange={() => a.setMany([id], !f)} />}
      </label>
      {p.tarefas.length > 0 ? <ul className="divide-y divide-line-soft">{agrupar(p.tarefas).map(g => <TarefaItem key={g[0].id} g={g} onSelect={onSelect} aoMarcar={ativo ? aoMarcar : undefined} />)}</ul>
        : <p className="px-4 py-3 text-[13px] text-muted">{base?.fonte === "fixo" ? "Atividade fixa: siga o texto acima." : "Nada da fila cabe aqui hoje."}</p>}
    </li>;
  })}</ol>;
}

function Chip({ children, tom }: { children: React.ReactNode; tom?: "accent" | "measure" }) {
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11.5px] font-medium ${tom === "accent" ? "bg-accent/10 text-accent" : tom === "measure" ? "bg-measure/10 text-measure" : "bg-surface2 text-muted"}`}>{children}</span>;
}

// Um item por tarefa; sessões seguidas da mesma tarefa (g) aparecem juntas e são marcadas juntas.
function TarefaItem({ g, onSelect, aoMarcar }: { g: Tarefa[]; onSelect: (s: Sel) => void; aoMarcar?: (g: Tarefa[], valor: boolean) => void }) {
  const a = useApp(); const t = g[0], c = g.every(x => feita(x, a.done, a.valores)); const assunto = t.assuntoId ? assuntoById.get(t.assuntoId) : undefined;
  const titulo = t.titulo ?? t.texto, tipo = t.curso && t.formato === "vídeo" ? "curso" : t.formato === "vídeo" ? "vídeo" : t.formato === "curso" ? "curso" : TIPOS[t.tipo];
  const marcar = aoMarcar ?? ((xs: Tarefa[], v: boolean) => a.setMany(xs.flatMap(x => idsParaMarcar(x, v)), v));
  return <li className="flex items-start gap-3 px-4 py-3">
    <input aria-label={titulo} type="checkbox" className="mt-0.5 size-4 shrink-0" checked={c} onChange={() => marcar(g, !c)} />
    <div className="min-w-0 flex-1">
      <p className={`text-[14.5px] leading-snug ${c ? "text-muted line-through" : ""}`}>{t.url ? <a href={t.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">{titulo} <span aria-hidden className="text-muted">↗</span></a> : titulo}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
        <Chip tom={t.tipo === "pratica" || t.tipo === "lab" ? "measure" : "accent"}>{tipo}</Chip>
        {t.sessao && <Chip>{fmtSessoes(g)}</Chip>}
        <span className="font-mono">{minutosTotal(g)} min</span>
        {t.fonte && <span>· {t.fonte}</span>}
        {assunto && <button type="button" onClick={() => onSelect({ kind: "assunto", id: assunto.id })} className="text-left hover:text-accent hover:underline">· {assunto.titulo} →</button>}
        {t.tipo === "evidencia" && <button type="button" onClick={() => onSelect({ kind: "mes", mes: t.mes })} className="hover:text-accent hover:underline">· abrir o mês →</button>}
      </div>
    </div>
  </li>;
}

/* ───────── Semana (grade fixa, checkbox por dia e ofensiva) ───────── */
const iso = paraIso;
const horasSemana = (seg: Date, done: Set<string>) => diasDaSemana(iso(seg)).reduce((t, d) => t + horasDia(seg, d, done), 0);
const fmtH = (h: number) => { const m = Math.round((h % 1) * 60); return `${Math.floor(h)}h${m ? String(m).padStart(2, "0") : ""}`; };
const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// Semanas fechadas contam para trás; a atual só soma quando já bateu a meta, nunca quebra a sequência.
function ofensiva(hoje: Date, done: Set<string>) {
  const atual = segunda(hoje); let n = horasSemana(atual, done) >= META_SEMANA ? 1 : 0;
  for (let s = addDias(atual, -7); horasSemana(s, done) >= META_SEMANA; s = addDias(s, -7)) n++;
  return n;
}
function recorde(done: Set<string>) {
  const semanas = [...new Set([...done].filter(id => id.startsWith("sem-")).map(id => id.slice(4, 14)))]
    .map(x => { const [y, m, d] = x.split("-").map(Number); return new Date(y, m - 1, d); })
    .filter(s => horasSemana(s, done) >= META_SEMANA).sort((a, b) => a.getTime() - b.getTime());
  let best = 0, run = 0; semanas.forEach((s, i) => { run = i > 0 && Math.round((s.getTime() - semanas[i - 1].getTime()) / DIA) === 7 ? run + 1 : 1; best = Math.max(best, run); });
  return best;
}
// Cada dia conta para o mês da própria data, mesmo quando a semana cruza meses.
function horasMes(ano: number, mes: number, done: Set<string>) {
  let feitas = 0, planejadas = 0;
  for (let d = new Date(ano, mes, 1); d.getMonth() === mes; d = addDias(d, 1)) { const x = diaDeEstudo(iso(d)); if (!x) continue; planejadas += x.horas; feitas += horasDia(segunda(d), x, done); }
  return { feitas, planejadas };
}
function Plano({ data, pilares, onSelect }: { data: Date; pilares: Pilar[]; onSelect: (s: Sel) => void }) {
  const a = useApp(); const m = mesDoPlano(data);
  if (!m) return <span className="mt-1 block font-mono text-[11px] text-muted">{paraIso(data) < INICIO ? `o plano começa em ${fmtDiaSemana(INICIO)}` : "fora do plano"}</span>;
  const completo = (x: Assunto) => assuntoDone(x, a.done) === assuntoIds(x).length;
  // Pilar sem assunto no mês: continua o mais antigo pendente ou adianta o próximo, para o horário do dia nunca ficar vazio.
  const xs = pilares.flatMap(p => {
    const doMes = assuntosDoMes(m).filter(x => x.pilar === p); if (doMes.length) return doMes.map(x => ({ x, tag: "" }));
    const doPilar = assuntos.filter(x => x.pilar === p).sort((u, v) => u.mes - v.mes);
    const antes = doPilar.find(x => x.mes < m && !completo(x)); if (antes) return [{ x: antes, tag: `continuar M${String(antes.mes).padStart(2, "0")}` }];
    const depois = doPilar.find(x => x.mes > m); return depois ? [{ x: depois, tag: `adiantar M${String(depois.mes).padStart(2, "0")}` }] : [];
  });
  const prox = xs.find(({ x }) => !completo(x))?.x;
  return <span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[11px]">
    <span className="text-muted">M{String(m).padStart(2, "0")} · {fase(data)}:</span>
    {xs.length ? xs.map(({ x, tag }) => { const ok = completo(x); return <button key={x.id} type="button" onClick={e => { e.preventDefault(); onSelect({ kind: "assunto", id: x.id }); }} className={`hover:underline ${ok ? "text-muted line-through" : x === prox ? "font-bold text-accent" : "text-text"}`}>{tag && <span className="font-normal text-muted">{tag}: </span>}{x.titulo}</button>; })
      : <span className="text-muted">sem assunto deste pilar no mês; revisar ou adiantar o</span>}
    {(pilares.includes("arquitetura") || !xs.length) && <button type="button" onClick={e => { e.preventDefault(); onSelect({ kind: "mes", mes: m }); }} className="text-measure hover:underline">laboratório M{String(m).padStart(2, "0")}</button>}
  </span>;
}

function Semana({ h, onSelect }: { h: HojeApi; onSelect: (s: Sel) => void }) {
  const a = useApp(); const [hoje, setHoje] = useState<Date | null>(null); const [desloc, setDesloc] = useState(0);
  useEffect(() => setHoje(new Date()), []);
  const total = SEMANA.reduce((t, d) => t + d.horas, 0);
  // Tarefas de cada dia da semana exibida: hoje (ou a prévia do próximo dia, em dia livre) vem da lista congelada
  // do painel Hoje; os dias seguintes, da projeção da fila.
  const domingo = hoje ? paraIso(addDias(segunda(hoje), desloc * 7 + 6)) : null;
  const fixo = h.hoje ?? h.proximo;
  const projecao = useMemo(() => h.data && domingo ? planoAte(idsFixos(h.hoje, h.proximo, h.extra), fixo?.data ?? null, h.data, domingo, a.done, a.valores) : null,
    [h.data, h.hoje, h.proximo, h.extra, fixo, domingo, a.done, a.valores]);
  const tarefasDoDia = (iso: string): Tarefa[][] | null => {
    if (fixo && iso === fixo.data) return fixo.partes.map(p => p.tarefas);
    const ids = projecao && iso >= projecao.de ? projecao.dias.get(iso) : undefined;
    return ids ? ids.map(xs => xs.map(id => tarefaById.get(id)).filter((t): t is Tarefa => !!t)) : null;
  };
  if (!hoje) return <section className="mb-14"><p className="label">Semana · {fmtH(total)} (qua a dom)</p></section>;
  const seg = addDias(segunda(hoje), desloc * 7), ref = dataDoDia(seg, 4), mes = horasMes(ref.getFullYear(), ref.getMonth(), a.done);
  const feitas = horasSemana(seg, a.done), atual = desloc === 0, n = ofensiva(hoje, a.done), rec = Math.max(recorde(a.done), n);
  const dias = diasDaSemana(iso(seg)), totalSem = dias.reduce((t, d) => t + d.horas, 0); // inclui dias extras da semana
  return <section aria-labelledby="semana-h">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="label">Semana · {fmtH(total)} (qua a dom)</p><h2 id="semana-h" className="mt-1 text-2xl font-bold">Ofensiva: {n} {n === 1 ? "semana" : "semanas"} <span className="font-mono text-[13px] font-normal text-muted">· recorde {rec}</span></h2></div>
      <div className="flex items-center gap-2"><Btn onClick={() => setDesloc(x => x - 1)}>← anterior</Btn>{!atual && <Btn onClick={() => setDesloc(0)}>esta semana</Btn>}<Btn onClick={() => setDesloc(x => x + 1)}>próxima →</Btn></div>
    </div>
    <div className="card mt-4 overflow-hidden">
      <p className="flex justify-between gap-3 border-b border-line px-4 py-2 font-mono text-[11px] text-muted"><span>{ddmm(dataDoDia(seg, dias[0]?.dow ?? 3))} → {ddmm(dataDoDia(seg, 0))}{atual && " · esta semana"}{totalSem > total && ` · ${fmtH(totalSem - total)} extras`}</span><span className={feitas >= META_SEMANA ? "text-ok" : ""}>{fmtH(feitas)}/{fmtH(totalSem)} · meta {fmtH(META_SEMANA)}</span></p>
      {dias.map(d => {
        const id = diaId(seg, d.dow), partes = d.partes.map((_, i) => parteId(seg, d.dow, i)), h = horasDia(seg, d, a.done), c = h === d.horas, parcial = h > 0 && !c;
        const marcarDia = () => c ? a.setMany([id, ...partes], false) : a.setMany(partes, true);
        const marcarParte = (i: number) => { if (!a.done.has(id)) return a.toggle(partes[i]); a.setMany([id, partes[i]], false); a.setMany(partes.filter((_, j) => j !== i), true); };
        const doDia = tarefasDoDia(paraIso(dataDoDia(seg, d.dow)));
        return <div key={d.dow} className="flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-0">
          <input aria-label={`Marcar ${d.dia} inteiro`} className="mt-1 size-4 shrink-0 cursor-pointer" type="checkbox" checked={c} ref={el => { if (el) el.indeterminate = parcial; }} onChange={marcarDia} />
          <span className="w-12 shrink-0 font-mono text-[12px]"><span className="block font-bold">{d.dia}</span><span className="text-muted">{ddmm(dataDoDia(seg, d.dow))}</span></span>
          <span className="min-w-0 flex-1"><span className={`flex flex-wrap items-center gap-x-3 font-semibold ${c ? "text-muted line-through" : ""}`}>{d.pilares.map(p => <span key={p} className="flex items-center gap-1.5"><span className={`inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</span>)}</span>
            {d.partes.map((p, i) => { const f = parteFeita(seg, d, i, a.done); return <label key={i} className="mt-1 flex cursor-pointer items-start gap-2 text-[13.5px] leading-snug">
              <input className="mt-0.5 size-3.5 shrink-0" type="checkbox" checked={f} onChange={() => marcarParte(i)} />
              <span className="flex-1"><span className={`${f ? "text-muted line-through" : "text-muted"}`}>{p.texto}</span>
                {doDia?.[i]?.length ? <ul className="mt-1 space-y-0.5">{agrupar(doDia[i]).map(g => { const t = g[0], ok = g.every(x => feita(x, a.done, a.valores)); return <li key={t.id} className={`flex gap-1.5 text-[13px] ${ok ? "text-muted line-through" : "text-text"}`}><span aria-hidden className="text-muted">·</span><span>{t.url ? <a href={t.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="hover:text-accent hover:underline">{t.titulo ?? t.texto} ↗</a> : t.titulo ?? t.texto}{t.sessao ? ` · ${fmtSessoes(g)}` : ""} <span className="font-mono text-[11px] text-muted">{minutosTotal(g)} min</span></span></li>; })}</ul> : null}
              </span><span className="shrink-0 font-mono text-[11px] text-muted">{fmtH(p.horas)}</span>
            </label>; })}
            <Plano data={dataDoDia(seg, d.dow)} pilares={d.pilares} onSelect={onSelect} /></span>
          <span className="shrink-0 font-mono font-bold text-accent">{parcial ? `${fmtH(h)}/` : ""}{fmtH(d.horas)}</span>
        </div>; })}
    </div>
    <div className="mt-4 max-w-[36rem]"><p className="font-mono text-[12px]">Horas em {MESES[ref.getMonth()]}: <strong>{fmtH(mes.feitas)}</strong> de {fmtH(mes.planejadas)}</p><Bar n={mes.feitas} total={mes.planejadas} /></div>
    <p className="mt-4 max-w-[70ch] text-[14.5px] leading-relaxed text-muted">{RITMO_NOTA}</p>
  </section>;
}

/* ───────── Revisão espaçada (fora das horas da semana) ───────── */
function RevisaoHoje({ hoje, onSelect }: { hoje: Date; onSelect: (s: Sel) => void }) {
  const a = useApp(); const dia = isoDia(hoje), n = pendentes(a.cards, dia).length, total = Object.keys(a.cards).length, seq = sequencia(dia, a.done);
  return <div className="card p-4">
    <div className="flex items-center justify-between gap-3"><p className="label">Revisão</p>{n > 0 && <Btn onClick={() => onSelect({ kind: "revisao" })}>revisar</Btn>}</div>
    {total === 0 ? <p className="mt-2 text-[14px] text-muted">Nenhum card ainda. Crie perguntas no painel de um assunto.</p>
      : <p className={`mt-2 text-[20px] font-bold ${n ? "" : "text-ok"}`}>{n ? `${n} ${n === 1 ? "card" : "cards"} hoje` : "Em dia"}</p>}
    {total > 0 && <p className="mt-1 font-mono text-[12px] text-muted">sequência {seq} {seq === 1 ? "dia" : "dias"} · {total} no total</p>}
  </div>;
}

function SemanaResumo({ hoje, onAbrir }: { hoje: Date; onAbrir: () => void }) {
  const a = useApp(); const seg = segunda(hoje), feitas = horasSemana(seg, a.done), total = diasDaSemana(iso(seg)).reduce((t, d) => t + d.horas, 0), n = ofensiva(hoje, a.done);
  return <div className="card p-4">
    <div className="flex items-center justify-between gap-3"><p className="label">Esta semana</p><Btn onClick={onAbrir}>abrir</Btn></div>
    <p className="mt-2 text-[20px] font-bold"><span className="font-mono">{fmtH(feitas)}</span> <span className="text-[14px] font-normal text-muted">de {fmtH(total)} · meta {fmtH(META_SEMANA)}</span></p>
    <Bar n={feitas} total={total} />
    <p className="mt-2 text-[12.5px] text-muted">Ofensiva: {n} {n === 1 ? "semana" : "semanas"} com {fmtH(META_SEMANA)} ou mais</p>
  </div>;
}

function RevisaoPanel() {
  const a = useApp(); const [fila] = useState(() => pendentes(a.cards, isoDia(new Date())).map(c => c.id)); const [i, setI] = useState(0); const [ver, setVer] = useState(false); const [erros, setErros] = useState(0);
  const c = a.cards[fila[i]];
  if (!c) return <article><p className="label">Revisão</p><h2 className="mt-2 text-2xl font-bold">{fila.length ? "Fila de hoje concluída" : "Nada para revisar hoje"}</h2>{fila.length > 0 && <p className="mt-3 text-[15px] text-muted">{fila.length} {fila.length === 1 ? "card revisado" : "cards revisados"} · {fila.length - erros} lembrados · {erros} para rever amanhã.</p>}</article>;
  const x = assuntos.find(s => s.id === c.assunto);
  return <article>
    <p className="label">Revisão · {i + 1}/{fila.length}{x && ` · ${x.titulo}`}</p>
    <Bar n={i} total={fila.length} />
    <p className="mt-6 whitespace-pre-wrap text-xl font-semibold leading-snug">{c.pergunta}</p>
    {ver ? <>
      <p className="mt-5 whitespace-pre-wrap border-t border-line pt-4 text-[16px] leading-relaxed">{c.resposta}</p>
      <p className="label mt-7 mb-2">Quão bem você lembrou?</p>
      <div className="flex flex-wrap gap-2">{NOTAS.map(({ n, rotulo }) => <Btn key={n} danger={n === "errei"} onClick={() => { a.avaliarCard(c.id, n); if (n === "errei") setErros(e => e + 1); setVer(false); setI(j => j + 1); }}>{rotulo} · {previa(c, n)}</Btn>)}</div>
    </> : <div className="mt-6"><p className="mb-3 text-[14px] text-muted">Tente responder de cabeça antes de revelar.</p><Btn onClick={() => setVer(true)}>mostrar resposta</Btn></div>}
  </article>;
}

function CardsAssunto({ assunto }: { assunto: string }) {
  const a = useApp(); const [p, setP] = useState(""); const [r, setR] = useState(""); const [edit, setEdit] = useState<string | null>(null); const [erro, setErro] = useState("");
  const cs = doAssunto(a.cards, assunto), hoje = isoDia(new Date());
  const limpar = () => { setP(""); setR(""); setEdit(null); setErro(""); };
  const salvar = () => { if (!p.trim() || !r.trim()) return setErro("Preencha pergunta e resposta."); const atual = edit ? a.cards[edit] : null; a.salvarCard(atual ? { ...atual, pergunta: p.trim(), resposta: r.trim() } : novoCard(assunto, p, r, hoje)); limpar(); };
  return <div>
    <p className="mb-2 text-[13.5px] text-muted">Uma ideia por card, com a pergunta escrita por você. Os cards entram na revisão de hoje e voltam em intervalos cada vez maiores.</p>
    <ul>{cs.map(c => <li key={c.id} className="flex items-start justify-between gap-3 border-t border-line-soft py-2 first:border-t-0"><span className="min-w-0"><span className="block text-[15px]">{c.pergunta}</span><span className="font-mono text-[11px] text-muted">{c.due <= hoje ? "revisar hoje" : `próxima ${c.due.split("-").reverse().slice(0, 2).join("/")}`}{c.repeticoes > 0 && ` · intervalo ${fmtIntervalo(c.intervalo)}`}</span></span><span className="flex shrink-0 gap-1"><Btn onClick={() => { setEdit(c.id); setP(c.pergunta); setR(c.resposta); setErro(""); }}>editar</Btn><Btn danger onClick={() => { a.removerCard(c.id); if (edit === c.id) limpar(); }}>remover</Btn></span></li>)}</ul>
    <div className="mt-3 grid gap-2">
      <textarea className="nota w-full" rows={2} value={p} placeholder="pergunta" onChange={e => { setP(e.target.value); setErro(""); }} />
      <textarea className="nota w-full" rows={3} value={r} placeholder="resposta" onChange={e => { setR(e.target.value); setErro(""); }} />
      <div className="flex items-center gap-2"><Btn onClick={salvar}>{edit ? "salvar card" : "adicionar card"}</Btn>{edit && <Btn onClick={limpar}>cancelar</Btn>}{erro && <span className="text-[13px] text-warn">{erro}</span>}</div>
    </div>
  </div>;
}

/* ───────── Atrasados (o que ficou para trás até ontem) ───────── */
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
function AtrasosHoje({ hoje, onSelect }: { hoje: Date; onSelect: (s: Sel) => void }) {
  const a = useApp(); const x = atrasados(hoje, a.done, a.valores), itens = totalItens(x);
  const partes = [x.dias.length && plural(x.dias.length, "dia", "dias"), itens && plural(itens, "item", "itens"), x.labs.length && plural(x.labs.length, "laboratório", "laboratórios")].filter(Boolean);
  return <div className={`card p-4 ${partes.length ? "border-warn/40" : ""}`}>
    <div className="flex items-center justify-between gap-3"><p className="label">Ficou pra trás</p>{partes.length > 0 && <Btn onClick={() => onSelect({ kind: "atrasos" })}>resgatar</Btn>}</div>
    <p className={`mt-2 font-semibold ${partes.length ? "text-[15px] text-warn" : "text-[20px] text-ok"}`}>{partes.length ? partes.join(" · ") : "Em dia"}</p>
  </div>;
}

// O material de cada dia resgatado é montado uma vez e guardado, para não mudar enquanto você marca.
const RESGATE_KEY = "cronograma-staff:resgate:v1";
const lerResgate = (): Resgate => { try { const v = JSON.parse(localStorage.getItem(RESGATE_KEY) ?? "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch { return {}; } };
function AtrasosPanel({ h, onSelect }: { h: HojeApi; onSelect: (s: Sel) => void }) {
  const a = useApp(); const [hoje] = useState(() => new Date()); const x = atrasados(hoje, a.done, a.valores);
  const [material] = useState(() => {
    // O resgate só recebe o que vem depois do plano desta semana (hoje ou a prévia + a projeção até domingo),
    // para a mesma tarefa não aparecer aqui e no painel Hoje ou na grade da semana.
    const fixas = idsFixos(h.hoje, h.proximo, h.extra), base = h.hoje ?? h.proximo, domingo = paraIso(addDias(segunda(paraData(h.data ?? paraIso(hoje))), 6));
    const plano = h.data ? planoAte(fixas, base?.data ?? null, h.data, domingo, a.done, a.valores) : null;
    const reservadas = [...fixas, ...(plano ? [...plano.dias.values()].flat(2) : [])];
    const r = montarResgate(x.dias, lerResgate(), a.done, a.valores, reservadas);
    try { localStorage.setItem(RESGATE_KEY, JSON.stringify(r)); } catch {}
    return r;
  });
  // No resgate a parte de curso não pega módulo (a fila de cursos anda em ordem pelo Hoje): pega o trabalho do pilar.
  const textoResgate = (p: DiaAtrasado["dia"]["partes"][number]) => p.fonte === "curso" && p.pilar ? `Resgate · ${title(p.pilar)}: tarefas do pilar (o curso segue em ordem pelo Hoje)` : p.texto;
  const doDia = (d: DiaAtrasado): DiaHoje => ({ data: d.iso, dia: d.dia, partes: d.partes.map(i => ({ indice: i, texto: textoResgate(d.dia.partes[i]), horas: d.dia.partes[i].horas, tarefas: (material[d.iso]?.[i] ?? []).map(id => tarefaById.get(id)).filter((t): t is Tarefa => !!t) })) });
  const texto = (s: Assunto, id: string) => s.subtopicos.find(t => t.id === id)?.texto ?? s.leituras.find(l => l.id === id)?.titulo ?? (s.pratica.id === id ? `Prática: ${s.pratica.texto}` : id);
  const vazio = !x.dias.length && !x.assuntos.length && !x.labs.length;
  return <article>
    <p className="label">Resgate</p>
    <h2 className="mt-2 text-2xl font-bold">{vazio ? "Nada ficou pra trás" : "O que ficou pra trás"}</h2>
    {!vazio && <p className="mt-2 text-[14.5px] text-muted">Tudo o que não foi marcado até ontem. Cada dia perdido traz as próximas tarefas da fila (sem repetir as de hoje); marcar a última tarefa de uma parte marca a parte no dia original.</p>}
    {x.dias.length > 0 && <><h3 className="label mt-7 mb-1">Dias não marcados · {x.dias.length}</h3>
      {x.dias.map(d => { const { iso: dIso, data, seg, dia, partes } = d, ids = dia.partes.map((_, i) => parteId(seg, dia.dow, i)), falta = partes.reduce((t, i) => t + dia.partes[i].horas, 0); return <div key={dIso} className="mt-3 rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <input aria-label={`Marcar ${dia.dia} ${ddmm(data)} inteiro`} className="size-4 shrink-0 cursor-pointer" type="checkbox" checked={false} onChange={() => a.setMany(ids, true)} />
          <span className="font-mono text-[12px] font-bold">{dia.dia} {ddmm(data)}</span>
          <span className="flex flex-1 flex-wrap items-center gap-x-3 text-[14px] font-semibold">{dia.pilares.map(p => <span key={p} className="flex items-center gap-1.5"><span className={`inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</span>)}</span>
          <span className="shrink-0 font-mono font-bold text-accent">{fmtH(falta)}</span>
        </div>
        <PartesDoDia dia={doDia(d)} seg={seg} ativo onSelect={onSelect} />
      </div>; })}</>}
    {x.assuntos.length > 0 && <><h3 className="label mt-7 mb-1">Itens de assunto vencidos · {totalItens(x)}</h3>
      {x.assuntos.map(({ x: s, ids }) => <div key={s.id} className="mt-3 rounded-xl border border-line bg-surface px-4 py-2">
        <button type="button" onClick={() => onSelect({ kind: "assunto", id: s.id })} className="flex items-center gap-2 py-1 text-left font-semibold hover:text-accent hover:underline"><span className={`inline-block size-2 rounded-full ${DOT[s.pilar]}`} />M{String(s.mes).padStart(2, "0")} · {s.titulo}</button>
        {ids.map(id => <Check key={id} id={id} text={texto(s, id)} />)}
      </div>)}</>}
    {x.labs.length > 0 && <><h3 className="label mt-7 mb-1">Laboratórios incompletos · {x.labs.length}</h3>
      {x.labs.map(({ lab, atividades, evidencias }) => <div key={lab.id} className="mt-3 rounded-xl border border-line bg-surface px-4 py-2">
        <button type="button" onClick={() => onSelect({ kind: "mes", mes: lab.mes })} className="py-1 text-left font-semibold hover:text-accent hover:underline">M{String(lab.mes).padStart(2, "0")} · {lab.titulo}</button>
        {atividades.map(id => <Check key={id} id={id} text={lab.atividades.find(t => t.id === id)?.texto ?? id} />)}
        {evidencias.length > 0 && <p className="mt-1 font-mono text-[11px] text-muted">{plural(evidencias.length, "evidência sem registro", "evidências sem registro")}; registre no painel do laboratório.</p>}
      </div>)}</>}
  </article>;
}

/* ───────── Trilha (visão geral + grade de meses) ───────── */
function Trilha({ onSelect }: { onSelect: (s: Sel) => void }) {
  const app = useApp(); const agora = useAgora(); const { done, valores, filters } = app;
  const flip = (p: Pilar) => app.setFilters(f => ({ ...f, pillars: f.pillars.includes(p) ? f.pillars.filter(x => x !== p) : [...f.pillars, p] }));
  const activities = countDone(ALL_ACTIVITY_IDS, done), evidence = countValues(ALL_EVIDENCE_IDS, valores), topicItems = countDone(ALL_ASSUNTO_IDS, done);
  const topicsDone = assuntos.filter(x => assuntoDone(x, done) === assuntoIds(x).length).length;
  const total = ALL_ACTIVITY_IDS.length + ALL_EVIDENCE_IDS.length + ALL_ASSUNTO_IDS.length;
  const mesAtual = agora ? mesDoPlano(agora) : null;
  const stats: [string, string][] = [["progresso", `${app.loaded ? pct(activities + evidence + topicItems, total) : 0}%`], ["assuntos", `${topicsDone}/${assuntos.length}`], ["módulos de curso", `${countDone(ALL_CURSO_IDS, done)}/${ALL_CURSO_IDS.length}`], ["laboratórios", `${labsComplete(done, valores)}/${laboratorios.length}`], ["marcos", `${countDone(ALL_MARCO_IDS, done)}/${ALL_MARCO_IDS.length}`]];
  return <section aria-labelledby="trilha-h">
    <div className="card p-5 sm:p-6">
      <p className="label">36 meses do plano · {fmtMesAno(INICIO)} → {fmtMesAno(metaMes(36))} · 8h por semana</p>
      <h1 id="trilha-h" className="mt-1 max-w-[30ch] text-[26px] font-bold leading-tight tracking-tight">Senior Abroad: Architecture, AI Engineering &amp; Cloud</h1>
      <p className="mt-2 max-w-[75ch] text-[14.5px] leading-relaxed text-muted">Sênior de .NET e Azure que constrói e opera sistemas com IA em produção. A saída do Brasil vem em dois passos: um contrato remoto internacional e, depois, a mudança com visto patrocinado.</p>
      <ol className="mt-4 flex flex-wrap gap-2">{ROTA.map(r => <li key={r.codigo} className="rounded-lg bg-surface2 px-3 py-2"><span className="block font-display text-[15px] font-bold">{r.codigo}</span><span className="text-[12px] text-muted">{r.quando} · {r.texto}</span></li>)}</ol>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{stats.map(([l, v]) => <div key={l} className="rounded-lg border border-line-soft px-3 py-2"><dt className="text-[12px] text-muted">{l}</dt><dd className="font-mono text-[18px] font-bold">{v}</dd></div>)}</dl>
      {app.legacy && <p className="mt-4 rounded-lg bg-warn/10 px-4 py-2 text-[13.5px] text-muted">O progresso do cronograma anterior está preservado no exportável como histórico ({app.legacy.done.length} marcações). Ele não conta como avanço novo.</p>}
    </div>
    <div className="no-print mt-6 flex flex-wrap items-center gap-2">
      <Btn active={filters.onlyPending} onClick={() => app.setFilters(f => ({ ...f, onlyPending: !f.onlyPending }))}>só pendentes</Btn>
      {(Object.keys(PILARES) as Pilar[]).map(p => <Btn key={p} active={filters.pillars.includes(p)} onClick={() => flip(p)}><span className={`mr-1.5 inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</Btn>)}
    </div>
    {ANOS.map(ano => <div key={ano.n} className="mt-10">
      <div className="flex flex-wrap items-baseline gap-x-3"><h2 className="text-xl font-bold">Ano {ano.n} · {ano.nome}</h2><span className="text-[13px] text-muted">{ano.meses}</span></div>
      {trimestres.filter(t => Math.ceil(t.meses[0] / 12) === ano.n).map(t => { const nm = countDone(t.marcos.map(m => m.id), done); return <div key={t.id} className="mt-5">
        <button type="button" onClick={() => onSelect({ kind: "tri", id: t.id })} className="flex flex-wrap items-baseline gap-x-2 text-left hover:text-accent">
          <span className="font-mono text-[12.5px] font-bold">{t.rotulo}</span><span className="text-[14px] font-semibold">{t.tema}</span>{t.marco && <span className="text-[13px] text-measure">· {t.marco}</span>}<span className="text-[12.5px] text-muted">· marcos {nm}/{t.marcos.length}</span>
        </button>
        <div className="mt-3 grid gap-3 md:grid-cols-3">{t.meses.map(m => <MesCard key={m} mes={m} atual={m === mesAtual} onSelect={onSelect} />)}</div>
      </div>; })}
    </div>)}
  </section>;
}

function MesCard({ mes, atual, onSelect }: { mes: number; atual: boolean; onSelect: (s: Sel) => void }) {
  const a = useApp(); const lab = laboratorios[mes - 1]; const xs = assuntosDoMes(mes); const ts = TAREFAS.filter(t => t.mes === mes);
  const p = pct(minutosFeitos(ts, a.done, a.valores), minutosTotal(ts)), completo = labComplete(lab, a.done, a.valores) && p === 100;
  const fora = (x: Assunto) => a.filters.pillars.length > 0 && !a.filters.pillars.includes(x.pilar);
  const dimMes = (a.filters.pillars.length > 0 && !lab.pilares.some(q => a.filters.pillars.includes(q)) && xs.every(fora)) || (a.filters.onlyPending && completo);
  return <div className={`card flex flex-col overflow-hidden transition ${atual ? "ring-2 ring-accent" : ""} ${completo ? "border-ok/50" : ""} ${dimMes ? "opacity-40" : ""}`}>
    <button type="button" onClick={() => onSelect({ kind: "mes", mes })} className="px-4 pb-3 pt-4 text-left hover:bg-surface2/60">
      <span className="flex items-center justify-between gap-2 text-[12px] text-muted"><span className="font-mono font-bold text-text">M{String(mes).padStart(2, "0")}</span><span>{atual ? <span className="font-semibold text-accent">mês atual</span> : completo ? <span className="text-ok">✓ concluído</span> : `${fmtMesAno(inicioMes(mes))}`}</span></span>
      <span className="mt-1 block font-display text-[15px] font-bold leading-snug">{lab.titulo}</span>
      <span className="mt-2 flex items-center gap-2"><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2"><span className={`block h-full rounded-full ${completo ? "bg-ok" : "bg-accent"}`} style={{ width: `${p}%` }} /></span><span className="font-mono text-[11.5px] text-muted">{p}%</span></span>
    </button>
    <ul className="divide-y divide-line-soft border-t border-line-soft">{xs.map(x => { const ids = assuntoIds(x), n = assuntoDone(x, a.done), ok = n === ids.length, dim = fora(x) || (a.filters.onlyPending && ok); return <li key={x.id}>
      <button type="button" onClick={() => onSelect({ kind: "assunto", id: x.id })} className={`flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-surface2/60 ${dim ? "opacity-40" : ""}`}>
        <span className={`inline-block size-2 shrink-0 rounded-full ${DOT[x.pilar]}`} />
        <span className={`min-w-0 flex-1 truncate text-[13.5px] ${ok ? "text-muted line-through" : ""}`}>{x.titulo}</span>
        <span className={`shrink-0 font-mono text-[11.5px] ${ok ? "text-ok" : n > 0 ? "text-accent" : "text-muted"}`}>{ok ? "✓" : `${n}/${ids.length}`}</span>
      </button></li>; })}</ul>
  </div>;
}


/* ───────── Painel lateral ───────── */
function Drawer({ sel, h, onClose, onSelect }: { sel: Sel; h: HojeApi; onClose: () => void; onSelect: (s: Sel) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!sel) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); panel.current?.focus(); panel.current?.scrollTo(0, 0); return () => window.removeEventListener("keydown", k); }, [sel, onClose]);
  if (!sel) return null;
  return <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
    <button type="button" aria-label="Fechar" className="flex-1 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
    <div ref={panel} tabIndex={-1} className="h-full w-full max-w-[38rem] overflow-y-auto border-l border-line bg-bg px-5 pb-16 pt-4 shadow-2xl outline-none sm:px-7">
      <div className="sticky top-0 z-10 -mx-5 mb-4 flex justify-end bg-bg/90 px-5 py-2 backdrop-blur sm:-mx-7 sm:px-7"><Btn onClick={onClose}>fechar · esc</Btn></div>
      {sel.kind === "assunto" && <AssuntoPanel id={sel.id} onSelect={onSelect} />}
      {sel.kind === "mes" && <MesPanel mes={sel.mes} onSelect={onSelect} />}
      {sel.kind === "tri" && <TriPanel id={sel.id} />}
      {sel.kind === "revisao" && <RevisaoPanel />}
      {sel.kind === "atrasos" && <AtrasosPanel h={h} onSelect={onSelect} />}
    </div>
  </div>;
}

function AssuntoPanel({ id, onSelect }: { id: string; onSelect: (s: Sel) => void }) {
  const a = useApp(); const i = assuntos.findIndex(x => x.id === id); const x = assuntos[i]; if (!x) return null;
  const ids = assuntoIds(x); const n = assuntoDone(x, a.done); const prev = assuntos[i - 1], next = assuntos[i + 1], nota = `nota-${x.id}`;
  return <article>
    <p className="label flex items-center gap-2"><span className={`inline-block size-2 rounded-full ${DOT[x.pilar]}`} />M{String(x.mes).padStart(2, "0")} · {title(x.pilar)}</p>
    <h2 className="mt-2 text-2xl font-bold">{x.titulo}</h2>
    <p className="mt-2 text-[16px] leading-relaxed text-muted">{x.resumo}</p>
    <Bar n={n} total={ids.length} /><p className="mt-1 font-mono text-[11px] text-muted">{n}/{ids.length} itens</p>
    <div className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-[14.5px]"><p><strong>Ordem:</strong> primeiro a teoria (~{horasTeoria(x)}h), depois a prática (~{horasPratica(x)}h). {obrigatorias(x).length ? `A prática libera quando ${({ Cursos: "os cursos do assunto estiverem marcados", Leituras: "as leituras do assunto estiverem marcadas", "Cursos e leituras": "os cursos e as leituras do assunto estiverem marcados" } as const)[rotuloTeoria(x)]}.` : "Este assunto não tem curso: a prática já está liberada."}</p></div><h3 className="mt-7 text-lg font-bold">Passo 1 · Teoria <span className="font-mono text-[12px] font-normal text-muted">~{horasTeoria(x)}h</span></h3><h3 className="label mt-3 mb-1">O que o assunto cobre</h3><ul className="list-disc pl-5 text-[14.5px] text-muted">{x.subtopicos.map(s => <li key={s.id}>{s.texto}</li>)}</ul>
    {obrigatorias(x).length > 0 && <><h3 className="label mt-7 mb-1">{rotuloTeoria(x)}</h3><Leituras ls={obrigatorias(x)} /></>}
    {opcionais(x).length > 0 && <><h3 className="label mt-7 mb-1">Aprofundamento <span className="normal-case tracking-normal text-muted">(opcional, fora da fila)</span></h3><Leituras ls={opcionais(x)} /></>}
    <h3 className="label mt-7 mb-1">Anotações <span className="normal-case tracking-normal text-muted">(opcional)</span></h3>
    <textarea className="nota w-full" rows={4} value={a.valorDe(nota)} placeholder="o que vale guardar deste assunto" onChange={e => a.setValor(nota, e.target.value)} />
    <h3 className="label mt-7 mb-1">Perguntas de revisão</h3><CardsAssunto assunto={x.id} />
    <h3 className="mt-8 text-lg font-bold">Passo 2 · Prática <span className="font-mono text-[12px] font-normal text-muted">~{horasPratica(x)}h</span></h3><Check id={x.pratica.id} text={x.pratica.texto} />
    <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
      {prev ? <Btn onClick={() => onSelect({ kind: "assunto", id: prev.id })}>← {prev.titulo}</Btn> : <span />}
      <Btn onClick={() => onSelect({ kind: "mes", mes: x.mes })}>laboratório do mês</Btn>
      {next ? <Btn onClick={() => onSelect({ kind: "assunto", id: next.id })}>{next.titulo} →</Btn> : <span />}
    </div>
  </article>;
}

function Leituras({ ls }: { ls: Leitura[] }) {
  const a = useApp();
  return <ul>{ls.map(l => <li key={l.id} className="flex items-start gap-3 border-t border-line-soft py-3 first:border-t-0">
    <input aria-label={`Marcar como feita: ${l.titulo}`} className="mt-1.5 size-4 shrink-0" type="checkbox" checked={a.done.has(l.id)} onChange={() => a.setMany(idsDaTarefa(l.id), !a.done.has(l.id))} />
    <div className="min-w-0"><a href={l.url} target="_blank" rel="noreferrer" className={`font-medium hover:text-accent hover:underline ${a.done.has(l.id) ? "text-muted line-through" : ""}`}>{l.titulo} ↗</a><p className="font-mono text-[11px] text-muted">{l.fonte} · {l.curso && l.tipo === "vídeo" ? "curso" : l.tipo} · ~{minLeitura(l)} min</p></div>
  </li>)}</ul>;
}

/* ───────── Cursos (Branas e Alura): fila própria ───────── */
function Cursos({ onSelect }: { onSelect: (s: Sel) => void }) {
  const app = useApp(); const agora = useAgora();
  const cursos = useMemo(() => progressoCursos(app.done), [app.done]);
  const restante = cursos.reduce((s, c) => s + c.minutosRestantes, 0), total = cursos.reduce((s, c) => s + c.minutosTotal, 0);
  const fim = agora ? previsaoCursos(app.done, app.valores, paraIso(agora)) : null;
  const horasSemana = SEMANA.reduce((s, d) => s + d.partes.reduce((t, p) => t + (p.fonte === "curso" ? p.horas : 0), 0), 0);
  const h = (min: number) => `${Math.round(min / 6) / 10}h`;
  const grupos: [string, typeof cursos][] = [["Rodrigo Branas", cursos.filter(c => c.formacao === "ia" || c.formacao === "arq")], ["Alura", cursos.filter(c => c.formacao === "alura")], ["Leituras em português", cursos.filter(c => c.formacao === "leitura")]];
  // Módulos na ordem da fila (a ordem de TAREFAS), com as sessões já feitas de cada um.
  // ok: o id original marcado (o useProgress o completa quando todas as sessões estão feitas); resto: minutos das sessões que faltam.
  const fila = useMemo(() => MODULOS_NA_FILA.map(m => { const s = sessoesFeitas(m.id, app.done, app.valores); return { m, ...s, ok: app.done.has(m.id), resto: minutosRestantes(m.id, app.done, app.valores) }; }), [app.done, app.valores]);
  const proximo = fila.find(x => !x.ok);
  // Assunto do primeiro módulo pendente de cada curso, para abrir no painel.
  const assuntoPendente = (curso: string) => (fila.find(x => cursoDe(x.m) === curso && !x.ok) ?? fila.find(x => cursoDe(x.m) === curso))?.m.assunto;
  return <section aria-labelledby="cursos-h" className="grid gap-6">
    <div className="card p-5 sm:p-6">
      <p className="label">Fila própria · {horasSemana}h por semana</p>
      <h1 id="cursos-h" className="mt-1 text-[26px] font-bold leading-tight tracking-tight">Cursos</h1>
      <p className="mt-2 max-w-[75ch] text-[14.5px] leading-relaxed text-muted">Os módulos do Branas, os cursos da Alura e as leituras em português (no lugar dos módulos da Formação IA que você já fez) são a teoria dos assuntos técnicos e andam toda semana, na ordem da trilha, sem esperar o mês do assunto. Os outros artigos de cada assunto ficam como aprofundamento opcional. Nos cursos da Alura, a duração é 40% da carga anunciada (a carga inclui exercícios) até ser conferida na plataforma.</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line-soft px-3 py-2"><dt className="text-[12px] text-muted">feito</dt><dd className="font-mono text-[18px] font-bold">{pct(total - restante, total)}%</dd></div>
        <div className="rounded-lg border border-line-soft px-3 py-2"><dt className="text-[12px] text-muted">faltam</dt><dd className="font-mono text-[18px] font-bold">{h(restante)} de {h(total)}</dd></div>
        <div className="rounded-lg border border-line-soft px-3 py-2"><dt className="text-[12px] text-muted">previsão de término</dt><dd className="font-mono text-[18px] font-bold">{!agora ? "…" : fim ? fmtDia(fim) : "concluído"}</dd></div>
      </dl>
    </div>
    {proximo && <div className="card border-accent/50 p-5"><p className="label">Próximo na fila</p>
      <a href={proximo.m.url ?? FORMACOES[proximo.m.formacao].url} target="_blank" rel="noreferrer" className="mt-1 block font-display text-[17px] font-bold leading-snug hover:text-accent hover:underline">{proximo.m.titulo} ↗</a>
      <p className="mt-1 font-mono text-[11.5px] text-muted">{fonteDe(proximo.m)} · {proximo.feitas > 0 ? `${proximo.feitas}/${proximo.total} sessões feitas · ` : ""}faltam ~{h(proximo.resto)}</p></div>}
    <section><h2 className="text-xl font-bold">Na ordem da fila</h2>
      <p className="mt-1 text-[13.5px] text-muted">A ordem em que o painel Hoje puxa os cursos (se um item não cabe no horário do dia, o Hoje adianta o seguinte e volta nele depois). Marque aqui o que já fez fora do app: o módulo inteiro (com as sessões) fica feito e a fila pula para o próximo.</p>
      <ul className="card mt-3 divide-y divide-line-soft">{fila.map(({ m, feitas, total, ok }) => { return <li key={m.id} className={`flex items-start gap-3 px-4 py-2.5 ${m.id === proximo?.m.id ? "bg-accent/5" : ""}`}>
        <input aria-label={`Marcar como feito: ${m.titulo}`} className="mt-1 size-4 shrink-0" type="checkbox" checked={ok} onChange={() => app.setMany(idsDaTarefa(m.id), !ok)} />
        <div className="min-w-0 flex-1"><a href={m.url ?? FORMACOES[m.formacao].url} target="_blank" rel="noreferrer" className={`text-[14px] font-medium hover:text-accent hover:underline ${ok ? "text-muted line-through" : ""}`}>{m.titulo}</a>
          <p className="font-mono text-[11px] text-muted">{m.fonte ?? FORMACOES[m.formacao].curto} · ~{h(m.minutos ?? 0)}{!ok && feitas > 0 ? ` · ${feitas}/${total} sessões` : ""}</p></div>
        <Btn onClick={() => onSelect({ kind: "assunto", id: m.assunto })}>assunto</Btn>
      </li>; })}</ul>
    </section>
    {grupos.map(([nome, cs]) => <section key={nome}><h2 className="text-xl font-bold">Resumo · {nome}</h2>
      <ul className="card mt-3 divide-y divide-line-soft">{cs.map(c => { const ok = c.feitos === c.total, x = assuntoPendente(c.curso); return <li key={c.curso} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
        <div className="min-w-0 flex-1">{c.url ? <a href={c.url} target="_blank" rel="noreferrer" className={`font-medium hover:text-accent hover:underline ${ok ? "text-muted line-through" : ""}`}>{c.curso} ↗</a> : <span className={`font-medium ${ok ? "text-muted line-through" : ""}`}>{c.curso}</span>}
          <p className="font-mono text-[11px] text-muted">{c.total > 1 ? `${c.feitos}/${c.total} ${c.formacao === "leitura" ? "leituras" : "módulos"} · ` : ""}{ok ? "concluído" : `faltam ${h(c.minutosRestantes)} de ${h(c.minutosTotal)}`}</p></div>
        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-surface2"><span className={`block h-full rounded-full ${ok ? "bg-ok" : "bg-accent"}`} style={{ width: `${pct(c.minutosTotal - c.minutosRestantes, c.minutosTotal)}%` }} /></span>
        {x && <Btn onClick={() => onSelect({ kind: "assunto", id: x })}>assunto</Btn>}
      </li>; })}</ul>
    </section>)}
  </section>;
}

/** Título da teoria obrigatória do assunto: cursos, leituras ou os dois. */
const rotuloTeoria = (x: Assunto) => { const ls = obrigatorias(x), v = ls.some(l => l.curso && l.tipo === "vídeo"), a = ls.some(l => !(l.curso && l.tipo === "vídeo")); return v && a ? "Cursos e leituras" as const : v ? "Cursos" as const : "Leituras" as const; };

function MesPanel({ mes, onSelect }: { mes: number; onSelect: (s: Sel) => void }) {
  const a = useApp(); const l = laboratorios[mes - 1]; if (!l) return null;
  const ids = l.atividades.map(x => x.id);
  const previsao = previsaoMes(mes, a.done, a.valores, hojeIso());
  return <article>
    <p className="label">M{String(l.mes).padStart(2, "0")} · {l.fase} · {l.tipo === "projeto-integrador" ? "projeto integrador" : "laboratório"}</p>
    <h2 className="mt-2 text-2xl font-bold">{l.titulo}</h2>
    <div className="mt-3 flex flex-wrap gap-2">{l.pilares.map(p => <span key={p} className={`rounded-md border border-line px-2 py-0.5 text-[11.5px] ${PILARES[p].cor}`}>{title(p)}</span>)}</div>
    <p className="mt-4"><strong>Problema real: </strong>{l.problema}</p>
    <p className="mt-2 text-muted"><strong className="text-text">Objetivo: </strong>{l.objetivo}</p>
    <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">Meta do calendário: {fmtDia(inicioMes(mes))} → {fmtDia(metaMes(mes))} · previsão no ritmo atual: {previsao ? fmtDia(previsao) : "concluído"}</p>
    <div className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-[14.5px]"><p><strong>Teoria:</strong> os cursos e as leituras dos assuntos abaixo (andam na fila de cursos, sem esperar o mês; os outros artigos são aprofundamento opcional) (~{assuntosDoMes(mes).reduce((t, x) => t + horasTeoria(x), 0)}h).</p><p className="mt-1"><strong>Prática:</strong> a prática de cada assunto e as atividades do laboratório (~{assuntosDoMes(mes).reduce((t, x) => t + horasPratica(x), 0)}h).</p></div><h3 className="label mt-7 mb-2">Assuntos deste mês</h3>
    <div className="flex flex-col gap-2">{assuntosDoMes(mes).map(x => <button key={x.id} type="button" onClick={() => onSelect({ kind: "assunto", id: x.id })} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left hover:border-accent"><span className="flex items-center gap-2"><span className={`inline-block size-2 rounded-full ${DOT[x.pilar]}`} />{x.titulo}</span><span className="font-mono text-[11px] text-muted">{assuntoDone(x, a.done)}/{assuntoIds(x).length}</span></button>)}</div>
    <div className="mt-7 flex items-center gap-3"><h3 className="label">Atividades do laboratório</h3><button type="button" className="ml-auto rounded-md border border-line px-2 py-1 text-[12px] text-muted hover:border-accent hover:text-accent" onClick={() => a.setMany(ids, countDone(ids, a.done) !== ids.length)}>{countDone(ids, a.done) === ids.length ? "desmarcar" : "marcar todas"}</button></div>
    {l.atividades.map(x => <Check key={x.id} id={x.id} text={x.texto} />)}
    <h3 className="label mt-7 mb-2">Evidências</h3>
    {l.evidencias.map(x => <label key={x.id} className="grid gap-2 border-t border-line-soft py-3 first:border-t-0"><span><span className="block font-medium">{x.label}</span><span className="text-[13px] text-muted">{x.prova}</span></span><input className="medicao w-full" value={a.valorDe(x.id)} placeholder="registrar evidência real" onChange={e => a.setValor(x.id, e.target.value)} /></label>)}
    <details className="mt-7 rounded-xl border border-line bg-surface"><summary className="px-4 py-3 font-medium">Plano completo e critérios</summary><div className="grid gap-5 border-t border-line p-4"><Info h="Contexto" x={[l.contexto]} /><Info h="Pré-requisitos" x={l.preRequisitos} /><Info h="Requisitos funcionais" x={l.requisitosFuncionais} /><Info h="Requisitos não funcionais" x={l.requisitosNaoFuncionais} /><Info h="Tecnologias sugeridas" x={l.tecnologias} /><Info h="Alternativas" x={l.alternativas} /><Info h="Como usar IA" x={[l.usoIa]} /><Info h="Como validar a IA" x={[l.validacaoIa]} /><Info h="Critérios de conclusão" x={l.criterios} /><Info h="Entregáveis" x={l.entregaveis} /></div></details>
  </article>;
}

function TriPanel({ id }: { id: string }) {
  const t = trimestres.find(x => x.id === id); if (!t) return null;
  return <article>
    <p className="label">{t.rotulo} · {t.periodo}{t.marco ? ` · ${t.marco}` : ""}</p>
    <h2 className="mt-2 text-2xl font-bold">{t.tema}</h2>
    <p className="mt-3 text-muted"><strong className="text-text">Dependências: </strong>{t.dependencias}</p>
    <h3 className="label mt-7 mb-1">Marcos do trimestre</h3>{t.marcos.map(m => <Check key={m.id} id={m.id} text={m.texto} />)}
  </article>;
}

function Info({ h, x }: { h: string; x: string[] }) { return <div><p className="label mb-2">{h}</p><ul className="space-y-1.5 text-[14.5px] leading-relaxed text-muted">{x.map(y => <li key={y}>{y}</li>)}</ul></div>; }
function Check({ id, text, disabled }: { id: string; text: string; disabled?: boolean }) { const a = useApp(); const c = a.isDone(id); return <label className={`flex items-start gap-2 border-t border-line-soft py-2 first:border-t-0 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><input className="mt-1 size-4 shrink-0" type="checkbox" checked={c} disabled={disabled} onChange={() => a.setMany(idsDaTarefa(id), !c)} /><span className={c ? "text-[14.5px] text-muted line-through" : "text-[14.5px]"}>{text}</span></label>; }
function Bar({ n, total }: { n: number; total: number }) { const p = pct(n, total); return <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface2"><div className={`h-full rounded-full ${p >= 100 ? "bg-ok" : "bg-accent"}`} style={{ width: `${p}%` }} /></div>; }
function Btn({ children, onClick, active, danger }: { children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`inline-flex shrink-0 items-center rounded-lg border px-2.5 py-1 text-[12.5px] font-medium transition ${danger ? "border-warn/60 text-warn hover:bg-warn/10" : active ? "border-accent bg-accent/10 text-accent" : "border-line bg-surface text-muted hover:border-accent hover:text-accent"}`}>{children}</button>; }
