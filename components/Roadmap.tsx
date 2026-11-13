"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { laboratorios } from "@/lib/data/blocos";
import { DESTINOS, DESTINOS_NOTA, INICIO_PLANO, materiais, MERCADO_DADOS, MERCADO_FONTES, MERCADO_LEITURA, META_SEMANA, PILARES, RITMO_NOTA, ROTA, SEMANA, trimestres } from "@/lib/data/cronograma";
import { assuntos, assuntosDoMes, horasPratica, horasTeoria, MIN_LEITURA } from "@/lib/data/trilha";
import { addDias, DIA, dataDoDia, diaId, fase, inicioPlano, mesDoPlano, segunda } from "@/lib/agenda";
import { atrasados, totalItens } from "@/lib/atrasos";
import { doAssunto, fmtIntervalo, isoDia, NOTAS, novoCard, pendentes, previa, sequencia } from "@/lib/revisao";
import { ALL_ACTIVITY_IDS, ALL_ASSUNTO_IDS, ALL_EVIDENCE_IDS, ALL_LEITURA_IDS, ALL_MARCO_IDS, assuntoDone, assuntoIds, countDone, countValues, labComplete, labsComplete, pct } from "@/lib/stats";
import type { Assunto, Laboratorio, Pilar, Trimestre } from "@/lib/types";

const title = (p: Pilar) => PILARES[p].titulo;
const DOT: Record<Pilar, string> = { arquitetura: "bg-accent", ia: "bg-measure", cloud: "bg-ok", ingles: "bg-decisao", carreira: "bg-warn" };
const ANOS = [
  { n: 1, nome: "Base sênior com IA", meses: "nov/2026 – out/2027" },
  { n: 2, nome: "Contrato remoto internacional", meses: "nov/2027 – out/2028" },
  { n: 3, nome: "Mudança com visto", meses: "nov/2028 – out/2029" },
];
type Sel = { kind: "assunto"; id: string } | { kind: "mes"; mes: number } | { kind: "tri"; id: string } | { kind: "revisao" } | { kind: "atrasos" } | null;

export function Roadmap() {
  const app = useApp(); const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState(""); const [tok, setTok] = useState(""); const [pedirToken, setPedirToken] = useState(false); const [confirm, setConfirm] = useState(false); const [sel, setSel] = useState<Sel>(null);
  const { done, valores, filters } = app;
  const flip = (p: Pilar) => app.setFilters(f => ({ ...f, pillars: f.pillars.includes(p) ? f.pillars.filter(x => x !== p) : [...f.pillars, p] }));
  const activities = countDone(ALL_ACTIVITY_IDS, done), evidence = countValues(ALL_EVIDENCE_IDS, valores), topicItems = countDone(ALL_ASSUNTO_IDS, done);
  const topicsDone = assuntos.filter(x => assuntoDone(x, done) === assuntoIds(x).length).length;
  const total = ALL_ACTIVITY_IDS.length + ALL_EVIDENCE_IDS.length + ALL_ASSUNTO_IDS.length;
  return <div className="mx-auto max-w-[1180px] px-6 pb-24">
    <header className="border-b-2 border-text pb-6 pt-12">
      <p className="label mb-4">36 meses · nov/2026 → out/2029 · 8h/semana · decisões com evidência</p>
      <h1 className="max-w-[19ch] text-[clamp(2.1rem,6vw,3.7rem)] font-bold leading-[1.08] tracking-tight">Senior Abroad: Architecture, AI Engineering &amp; Cloud</h1>
      <p className="mt-4 max-w-[70ch] text-[18px] leading-relaxed">Engenheiro sênior de .NET e Azure que constrói e opera sistemas com IA em produção: agentes com limites, RAG com avaliação, plataforma e custo. A saída do Brasil acontece em dois passos: primeiro um contrato remoto internacional, que prova o nível e forma reserva; depois a mudança com visto patrocinado.</p>
      <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono">{ROTA.map((r, i) => <li key={r.codigo} className="flex items-center gap-3">{i > 0 && <span aria-hidden className="h-px w-8 border-t border-dashed border-muted sm:w-14" />}<span className="flex flex-col"><span className="font-display text-xl font-bold">{r.codigo}</span><span className="text-[11px] text-muted">{r.quando} · {r.texto}</span></span></li>)}</ol>
      <dl className="mt-6 flex flex-wrap gap-x-7 gap-y-2 font-mono text-xs text-muted">
        <Stat l="assuntos" v={`${topicsDone}/${assuntos.length}`} /><Stat l="leituras" v={`${countDone(ALL_LEITURA_IDS, done)}/${ALL_LEITURA_IDS.length}`} /><Stat l="laboratórios" v={`${labsComplete(done, valores)}/${laboratorios.length}`} /><Stat l="marcos" v={`${countDone(ALL_MARCO_IDS, done)}/${ALL_MARCO_IDS.length}`} /><Stat l="progresso real" v={`${app.loaded ? pct(activities + evidence + topicItems, total) : 0}%`} />
      </dl>
      <div className="no-print mt-5 flex flex-wrap gap-2">
        <Btn active={filters.onlyPending} onClick={() => app.setFilters(f => ({ ...f, onlyPending: !f.onlyPending }))}>só pendentes</Btn>
        {(Object.keys(PILARES) as Pilar[]).map(p => <Btn key={p} active={filters.pillars.includes(p)} onClick={() => flip(p)}><span className={`mr-1.5 inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</Btn>)}
        <span className="mx-1 h-4 w-px bg-line" />
        <Btn onClick={app.exportJson}>exportar</Btn><Btn onClick={() => file.current?.click()}>importar</Btn>
        <input ref={file} className="hidden" type="file" accept="application/json,.json" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) setMsg((await app.importJson(f)).message); }} />
        {confirm ? <><Btn danger onClick={() => { app.reset(); setConfirm(false); }}>confirmar zerar</Btn><Btn onClick={() => setConfirm(false)}>cancelar</Btn></> : <Btn onClick={() => setConfirm(true)}>zerar</Btn>}
        <span className={`font-mono text-[11px] ${app.sync === "erro" ? "text-warn" : app.sync === "salvo" ? "text-ok" : "text-muted"}`}>{app.sync === "sem-token" ? "só local" : app.sync === "salvando" ? "salvando…" : app.sync === "salvo" ? "salvo na nuvem" : "erro ao salvar"}</span>
        {pedirToken ? <form className="flex gap-2" onSubmit={e => { e.preventDefault(); app.setToken(tok); setTok(""); setPedirToken(false); }}><input className="border border-line bg-surface px-2 py-1 font-mono text-[11px]" type="password" autoComplete="off" placeholder="token" value={tok} onChange={e => setTok(e.target.value)} /><Btn onClick={() => { app.setToken(tok); setTok(""); setPedirToken(false); }}>salvar token</Btn></form> : <Btn onClick={() => setPedirToken(true)}>token</Btn>}
        {msg && <span className="font-mono text-[11px] text-accent">{msg}</span>}
      </div>
      {app.legacy && <p className="mt-4 border-l-2 border-warn bg-warn/10 px-4 py-2 text-[14px] text-muted">O progresso do cronograma anterior está preservado no exportável como histórico ({app.legacy.done.length} marcações). Ele não conta como avanço novo, para não inventar histórico.</p>}
    </header>
    <main className="mt-10">
      <Semana onSelect={setSel} />
      <Trilha onSelect={setSel} />
      <section className="mt-12 border-t border-line pt-10"><h2 className="text-2xl font-bold">Mercado, futuro e destino</h2>
        <div className="mt-5 grid gap-8 md:grid-cols-2"><div className="min-w-0"><p className="label mb-3">O que o mercado pede em 2026</p><ul className="list-disc space-y-2 pl-5 text-[15.5px] leading-relaxed">{MERCADO_DADOS.map(x => <li key={x}>{x}</li>)}</ul></div><div className="min-w-0"><p className="label mb-3">Leitura do futuro (2027–2029)</p><ul className="list-disc space-y-2 pl-5 text-[15.5px] leading-relaxed">{MERCADO_LEITURA.map(x => <li key={x}>{x}</li>)}</ul></div></div>
        <p className="label mb-3 mt-8">Destinos e régua de salário para visto</p><p className="mb-3 max-w-[70ch] text-[14.5px] text-muted">{DESTINOS_NOTA}</p>
        <div className="overflow-x-auto border border-line bg-surface"><table className="doc-table min-w-[640px] text-[14.5px]"><thead><tr><th>Destino</th><th>Via</th><th>Mínimo 2026</th><th>Prós</th><th>Contras</th></tr></thead><tbody>{DESTINOS.map(d => <tr key={d.pais}><td className="font-semibold">{d.pais}</td><td>{d.via}</td><td className="whitespace-nowrap font-mono text-[13px]">{d.minimo}</td><td className="text-muted">{d.pros}</td><td className="text-muted">{d.contras}</td></tr>)}</tbody></table></div>
        <p className="mt-4 font-mono text-[11px] text-muted">fontes: {MERCADO_FONTES.map(([t, u], i) => <span key={u}>{i > 0 && " · "}<a className="text-accent hover:underline" href={u} target="_blank" rel="noreferrer">{t}</a></span>)}</p>
      </section>
      <section className="mt-12 border-t border-line pt-10"><h2 className="text-2xl font-bold">Materiais e hábitos</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{materiais.map(m => <label key={m.id} className="block cursor-pointer border border-line bg-surface p-5"><div className="flex gap-3"><input className="mt-1 size-4" type="checkbox" checked={done.has(m.id)} onChange={() => app.toggle(m.id)} /><div><p className="label mb-1">{m.tipo}</p><p className={done.has(m.id) ? "font-semibold text-muted line-through" : "font-semibold"}>{m.titulo}</p><p className="mt-2 text-[14.5px] leading-relaxed text-muted">{m.descricao}</p>{m.url && <a className="mt-2 inline-block font-mono text-[11px] text-accent hover:underline" href={m.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>fonte pública ↗</a>}</div></div></label>)}</div></section>
    </main>
    <Drawer sel={sel} onClose={() => setSel(null)} onSelect={setSel} />
  </div>;
}

/* ───────── Semana (grade fixa, checkbox por dia e ofensiva) ───────── */
const horasSemana = (seg: Date, done: Set<string>) => SEMANA.reduce((t, d) => t + (done.has(diaId(seg, d.dow)) ? d.horas : 0), 0);
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
  for (let d = new Date(ano, mes, 1); d.getMonth() === mes; d = addDias(d, 1)) { const x = SEMANA.find(s => s.dow === d.getDay()); if (!x) continue; planejadas += x.horas; if (done.has(diaId(segunda(d), x.dow))) feitas += x.horas; }
  return { feitas, planejadas };
}

function Plano({ data, pilares, onSelect }: { data: Date; pilares: Pilar[]; onSelect: (s: Sel) => void }) {
  const a = useApp(); const m = mesDoPlano(data);
  if (!m) return <span className="mt-1 block font-mono text-[11px] text-muted">{data < inicioPlano() ? `o plano começa em 01/${String(INICIO_PLANO.mes + 1).padStart(2, "0")}/${INICIO_PLANO.ano}` : "fora do plano"}</span>;
  const xs = assuntosDoMes(m).filter(x => pilares.includes(x.pilar)), prox = xs.find(x => assuntoDone(x, a.done) < assuntoIds(x).length);
  return <span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[11px]">
    <span className="text-muted">M{String(m).padStart(2, "0")} · {fase(data)}:</span>
    {xs.length ? xs.map(x => { const ok = assuntoDone(x, a.done) === assuntoIds(x).length; return <button key={x.id} type="button" onClick={e => { e.preventDefault(); onSelect({ kind: "assunto", id: x.id }); }} className={`hover:underline ${ok ? "text-muted line-through" : x === prox ? "font-bold text-accent" : "text-text"}`}>{x.titulo}</button>; })
      : <span className="text-muted">sem assunto deste pilar no mês; revisar ou adiantar o</span>}
    {(pilares.includes("arquitetura") || !xs.length) && <button type="button" onClick={e => { e.preventDefault(); onSelect({ kind: "mes", mes: m }); }} className="text-measure hover:underline">laboratório M{String(m).padStart(2, "0")}</button>}
  </span>;
}

function Semana({ onSelect }: { onSelect: (s: Sel) => void }) {
  const a = useApp(); const [hoje, setHoje] = useState<Date | null>(null); const [desloc, setDesloc] = useState(0);
  useEffect(() => setHoje(new Date()), []);
  const total = SEMANA.reduce((t, d) => t + d.horas, 0);
  if (!hoje) return <section className="mb-14"><p className="label">Semana · {fmtH(total)} (qua a dom)</p></section>;
  const seg = addDias(segunda(hoje), desloc * 7), ref = dataDoDia(seg, 4), mes = horasMes(ref.getFullYear(), ref.getMonth(), a.done);
  const feitas = horasSemana(seg, a.done), atual = desloc === 0, n = ofensiva(hoje, a.done), rec = Math.max(recorde(a.done), n);
  return <section aria-labelledby="semana-h" className="mb-14">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="label">Semana · {fmtH(total)} (qua a dom)</p><h2 id="semana-h" className="mt-1 text-2xl font-bold">Ofensiva: {n} {n === 1 ? "semana" : "semanas"} <span className="font-mono text-[13px] font-normal text-muted">· recorde {rec}</span></h2></div>
      <div className="flex items-center gap-2"><Btn onClick={() => setDesloc(x => x - 1)}>← semana</Btn>{!atual && <Btn onClick={() => setDesloc(0)}>hoje</Btn>}<Btn onClick={() => setDesloc(x => x + 1)}>semana →</Btn></div>
    </div>
    <RevisaoHoje hoje={hoje} onSelect={onSelect} />
    <AtrasosHoje hoje={hoje} onSelect={onSelect} />
    <div className="mt-4 border border-line bg-surface">
      <p className="flex justify-between gap-3 border-b border-line px-4 py-2 font-mono text-[11px] text-muted"><span>{ddmm(dataDoDia(seg, 3))} → {ddmm(dataDoDia(seg, 0))}{atual && " · esta semana"}</span><span className={feitas >= META_SEMANA ? "text-ok" : ""}>{fmtH(feitas)}/{fmtH(total)} · meta {fmtH(META_SEMANA)}</span></p>
      {SEMANA.map(d => { const id = diaId(seg, d.dow), c = a.done.has(id); return <label key={d.dow} className="flex cursor-pointer items-start gap-3 border-b border-line-soft px-4 py-3 last:border-0">
        <input className="mt-1 size-4 shrink-0" type="checkbox" checked={c} onChange={() => a.toggle(id)} />
        <span className="w-12 shrink-0 font-mono text-[12px]"><span className="block font-bold">{d.dia}</span><span className="text-muted">{ddmm(dataDoDia(seg, d.dow))}</span></span>
        <span className="min-w-0 flex-1"><span className={`flex flex-wrap items-center gap-x-3 font-semibold ${c ? "text-muted line-through" : ""}`}>{d.pilares.map(p => <span key={p} className="flex items-center gap-1.5"><span className={`inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</span>)}</span><span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{d.foco}</span><Plano data={dataDoDia(seg, d.dow)} pilares={d.pilares} onSelect={onSelect} /></span>
        <span className="shrink-0 font-mono font-bold text-accent">{fmtH(d.horas)}</span>
      </label>; })}
    </div>
    <div className="mt-4 max-w-[36rem]"><p className="font-mono text-[12px]">Horas em {MESES[ref.getMonth()]}: <strong>{fmtH(mes.feitas)}</strong> de {fmtH(mes.planejadas)}</p><Bar n={mes.feitas} total={mes.planejadas} /></div>
    <p className="mt-4 max-w-[70ch] text-[14.5px] leading-relaxed text-muted">{RITMO_NOTA}</p>
  </section>;
}

/* ───────── Revisão espaçada (fora das horas da semana) ───────── */
function RevisaoHoje({ hoje, onSelect }: { hoje: Date; onSelect: (s: Sel) => void }) {
  const a = useApp(); const dia = isoDia(hoje), n = pendentes(a.cards, dia).length, total = Object.keys(a.cards).length, seq = sequencia(dia, a.done);
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
    <p className="text-[14.5px]"><strong>Revisão de hoje:</strong> {total === 0 ? <span className="text-muted">nenhum card ainda; crie perguntas no painel de um assunto</span> : n ? `${n} ${n === 1 ? "card" : "cards"}` : <span className="text-ok">em dia</span>} <span className="font-mono text-[12px] text-muted">· sequência {seq} {seq === 1 ? "dia" : "dias"} · {total} no total</span></p>
    {n > 0 && <Btn onClick={() => onSelect({ kind: "revisao" })}>revisar</Btn>}
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
  return <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
    <p className="text-[14.5px]"><strong>Ficou pra trás:</strong> {partes.length ? <span className="text-warn">{partes.join(" · ")}</span> : <span className="text-ok">em dia</span>}</p>
    {partes.length > 0 && <Btn onClick={() => onSelect({ kind: "atrasos" })}>resgatar</Btn>}
  </div>;
}

function AtrasosPanel({ onSelect }: { onSelect: (s: Sel) => void }) {
  const a = useApp(); const [hoje] = useState(() => new Date()); const x = atrasados(hoje, a.done, a.valores);
  const texto = (s: Assunto, id: string) => s.subtopicos.find(t => t.id === id)?.texto ?? s.leituras.find(l => l.id === id)?.titulo ?? (s.pratica.id === id ? `Prática: ${s.pratica.texto}` : id);
  const vazio = !x.dias.length && !x.assuntos.length && !x.labs.length;
  return <article>
    <p className="label">Resgate</p>
    <h2 className="mt-2 text-2xl font-bold">{vazio ? "Nada ficou pra trás" : "O que ficou pra trás"}</h2>
    {!vazio && <p className="mt-2 text-[14.5px] text-muted">Tudo o que não foi marcado até ontem. Marcar aqui conta no dia ou item original; a lista encolhe conforme você avança.</p>}
    {x.dias.length > 0 && <><h3 className="label mt-7 mb-1">Dias não marcados · {x.dias.length}</h3>
      {x.dias.map(({ id, data, dia }) => <label key={id} className="flex cursor-pointer items-start gap-3 border-t border-line-soft py-3 first:border-t-0">
        <input className="mt-1 size-4 shrink-0" type="checkbox" checked={a.done.has(id)} onChange={() => a.toggle(id)} />
        <span className="w-12 shrink-0 font-mono text-[12px]"><span className="block font-bold">{dia.dia}</span><span className="text-muted">{ddmm(data)}</span></span>
        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-x-3 font-semibold">{dia.pilares.map(p => <span key={p} className="flex items-center gap-1.5"><span className={`inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</span>)}</span><span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{dia.foco}</span><Plano data={data} pilares={dia.pilares} onSelect={onSelect} /></span>
        <span className="shrink-0 font-mono font-bold text-accent">{fmtH(dia.horas)}</span>
      </label>)}</>}
    {x.assuntos.length > 0 && <><h3 className="label mt-7 mb-1">Itens de assunto vencidos · {totalItens(x)}</h3>
      {x.assuntos.map(({ x: s, ids }) => { const travada = !a.temValor(`nota-${s.id}`); return <div key={s.id} className="mt-3 border border-line bg-surface px-4 py-2">
        <button type="button" onClick={() => onSelect({ kind: "assunto", id: s.id })} className="flex items-center gap-2 py-1 text-left font-semibold hover:text-accent hover:underline"><span className={`inline-block size-2 rounded-full ${DOT[s.pilar]}`} />M{String(s.mes).padStart(2, "0")} · {s.titulo}</button>
        {ids.map(id => <Check key={id} id={id} text={texto(s, id)} disabled={id === s.pratica.id && travada} />)}
        {ids.includes(s.pratica.id) && travada && <p className="mt-1 text-[13px] text-muted">Escreva o resumo no painel do assunto para liberar a prática.</p>}
      </div>; })}</>}
    {x.labs.length > 0 && <><h3 className="label mt-7 mb-1">Laboratórios incompletos · {x.labs.length}</h3>
      {x.labs.map(({ lab, atividades, evidencias }) => <div key={lab.id} className="mt-3 border border-line bg-surface px-4 py-2">
        <button type="button" onClick={() => onSelect({ kind: "mes", mes: lab.mes })} className="py-1 text-left font-semibold hover:text-accent hover:underline">M{String(lab.mes).padStart(2, "0")} · {lab.titulo}</button>
        {atividades.map(id => <Check key={id} id={id} text={lab.atividades.find(t => t.id === id)?.texto ?? id} />)}
        {evidencias.length > 0 && <p className="mt-1 font-mono text-[11px] text-muted">{plural(evidencias.length, "evidência sem registro", "evidências sem registro")}; registre no painel do laboratório.</p>}
      </div>)}</>}
  </article>;
}

/* ───────── Trilha (mapa de nós) ───────── */
function Trilha({ onSelect }: { onSelect: (s: Sel) => void }) {
  return <section aria-labelledby="trilha-h">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="trilha-h" className="text-2xl font-bold">Trilha</h2><p className="mt-2 max-w-[70ch] text-muted">Cada mês é um nó central; os assuntos saem dele. Clique num assunto: primeiro a teoria (o que estudar e leituras, com tempo estimado), depois a prática. Clique no mês para ver o laboratório.</p></div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted"><li className="flex items-center gap-1.5"><span className="inline-block size-3 border border-line bg-surface" />não iniciado</li><li className="flex items-center gap-1.5"><span className="inline-block size-3 border-2 border-accent bg-surface" />em andamento</li><li className="flex items-center gap-1.5"><span className="inline-block size-3 border border-ok bg-ok/20" />concluído</li></ul></div>
    {ANOS.map(ano => <div key={ano.n} className="mt-10">
      <div className="sticky top-0 z-20 -mx-6 border-b border-line bg-bg/95 px-6 py-3 backdrop-blur"><p className="label">Ano {ano.n} · {ano.meses}</p><h3 className="text-xl font-bold">{ano.nome}</h3></div>
      <div className="relative mt-6">
        <span aria-hidden className="absolute bottom-0 left-1/2 top-0 hidden w-0.5 -translate-x-1/2 bg-line md:block" />
        {trimestres.filter(t => Math.ceil(t.meses[0] / 12) === ano.n).map(t => <div key={t.id} className="relative">
          <QuarterPill t={t} onClick={() => onSelect({ kind: "tri", id: t.id })} />
          {t.meses.map(m => <MonthRow key={m} mes={m} onSelect={onSelect} />)}
        </div>)}
      </div>
    </div>)}
  </section>;
}

function QuarterPill({ t, onClick }: { t: Trimestre; onClick: () => void }) {
  const a = useApp(); const n = countDone(t.marcos.map(m => m.id), a.done);
  return <div className="relative z-10 my-6 flex justify-start md:justify-center"><button type="button" onClick={onClick} className="rounded-full border border-text bg-bg px-4 py-1.5 font-mono text-[12px] hover:bg-surface2">
    <span className="font-bold">{t.rotulo}</span> · {t.tema}{t.marco && <span className="text-measure"> · {t.marco}</span>} <span className="text-muted">· marcos {n}/{t.marcos.length}</span>
  </button></div>;
}

function MonthRow({ mes, onSelect }: { mes: number; onSelect: (s: Sel) => void }) {
  const lab = laboratorios[mes - 1]; const topics = assuntosDoMes(mes);
  const left = topics.filter((_, i) => i % 2 === 0), right = topics.filter((_, i) => i % 2 === 1);
  return <div className="relative grid grid-cols-1 gap-y-2 py-3 md:grid-cols-[1fr_16rem_1fr] md:items-center">
    <div className="order-2 flex flex-col gap-2 border-l border-dashed border-line pl-5 md:order-none md:items-end md:border-0 md:pl-0">{left.map(x => <TopicNode key={x.id} x={x} side="left" onClick={() => onSelect({ kind: "assunto", id: x.id })} />)}</div>
    <MonthNode lab={lab} onClick={() => onSelect({ kind: "mes", mes })} />
    <div className="order-3 flex flex-col gap-2 border-l border-dashed border-line pl-5 md:order-none md:items-start md:border-0 md:pl-0">{right.map(x => <TopicNode key={x.id} x={x} side="right" onClick={() => onSelect({ kind: "assunto", id: x.id })} />)}</div>
  </div>;
}

function MonthNode({ lab, onClick }: { lab: Laboratorio; onClick: () => void }) {
  const a = useApp(); const complete = labComplete(lab, a.done, a.valores);
  const dim = (a.filters.pillars.length > 0 && !lab.pilares.some(p => a.filters.pillars.includes(p))) || (a.filters.onlyPending && complete);
  return <button type="button" onClick={onClick} className={`order-1 relative z-10 w-full border-2 px-4 py-3 text-left transition md:order-none ${complete ? "border-ok bg-ok/15" : "border-text bg-surface2 hover:bg-surface"} ${dim ? "opacity-35" : ""}`}>
    <span className="flex items-baseline justify-between gap-2 font-mono text-[11px] text-muted"><span>M{String(lab.mes).padStart(2, "0")} · {lab.tipo === "projeto-integrador" ? "integrador" : "laboratório"}</span>{complete && <span className="text-ok">✓</span>}</span>
    <span className="mt-1 block font-display text-[15.5px] font-bold leading-snug">{lab.titulo}</span>
  </button>;
}

function TopicNode({ x, side, onClick }: { x: Assunto; side: "left" | "right"; onClick: () => void }) {
  const a = useApp(); const ids = assuntoIds(x); const n = assuntoDone(x, a.done); const complete = n === ids.length;
  const dim = (a.filters.pillars.length > 0 && !a.filters.pillars.includes(x.pilar)) || (a.filters.onlyPending && complete);
  const state = complete ? "border-ok bg-ok/15" : n > 0 ? "border-accent border-2 bg-surface" : "border-line bg-surface";
  return <div className={`flex w-full items-center md:justify-end ${side === "left" ? "md:flex-row" : "md:flex-row-reverse"} ${dim ? "opacity-35" : ""}`}>
    <button type="button" onClick={onClick} className={`w-full border px-3 md:w-[17rem] py-2 text-left transition hover:-translate-y-px hover:shadow-sm ${state}`}>
      <span className="flex items-center gap-2"><span className={`inline-block size-2 shrink-0 rounded-full ${DOT[x.pilar]}`} /><span className="font-display text-[14px] font-semibold leading-snug">{x.titulo}</span></span>
      <span className="mt-1 flex justify-between font-mono text-[10.5px] text-muted"><span>teoria {horasTeoria(x)}h · prática {horasPratica(x)}h</span><span>{complete ? "✓ feito" : `${n}/${ids.length}`}</span></span>
    </button>
    <span aria-hidden className="hidden h-0 w-8 shrink-0 border-t border-dashed border-muted md:block" />
  </div>;
}

/* ───────── Painel lateral ───────── */
function Drawer({ sel, onClose, onSelect }: { sel: Sel; onClose: () => void; onSelect: (s: Sel) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!sel) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); panel.current?.focus(); panel.current?.scrollTo(0, 0); return () => window.removeEventListener("keydown", k); }, [sel, onClose]);
  if (!sel) return null;
  return <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
    <button type="button" aria-label="Fechar" className="flex-1 bg-black/40" onClick={onClose} />
    <div ref={panel} tabIndex={-1} className="h-full w-full max-w-[36rem] overflow-y-auto border-l border-line bg-bg px-6 pb-16 pt-5 outline-none">
      <div className="mb-4 flex justify-end"><button type="button" onClick={onClose} className="border border-line px-2.5 py-1 font-mono text-[11px] text-muted hover:border-accent hover:text-accent">fechar · esc</button></div>
      {sel.kind === "assunto" && <AssuntoPanel id={sel.id} onSelect={onSelect} />}
      {sel.kind === "mes" && <MesPanel mes={sel.mes} onSelect={onSelect} />}
      {sel.kind === "tri" && <TriPanel id={sel.id} />}
      {sel.kind === "revisao" && <RevisaoPanel />}
      {sel.kind === "atrasos" && <AtrasosPanel onSelect={onSelect} />}
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
    <div className="mt-6 border border-line bg-surface px-4 py-3 text-[14.5px]"><p><strong>Ordem:</strong> primeiro a teoria (~{horasTeoria(x)}h), depois a prática (~{horasPratica(x)}h). Comece a prática quando conseguir explicar cada subtópico em voz alta sem consultar.</p></div><h3 className="mt-7 text-lg font-bold">Passo 1 · Teoria <span className="font-mono text-[12px] font-normal text-muted">~{horasTeoria(x)}h</span></h3><h3 className="label mt-3 mb-1">O que estudar</h3>{x.subtopicos.map(s => <Check key={s.id} id={s.id} text={s.texto} />)}
    <h3 className="label mt-7 mb-1">Leituras</h3>
    <ul>{x.leituras.map(l => <li key={l.id} className="flex items-start gap-3 border-t border-line-soft py-3 first:border-t-0">
      <input aria-label={`Marcar como lida: ${l.titulo}`} className="mt-1.5 size-4 shrink-0" type="checkbox" checked={a.done.has(l.id)} onChange={() => a.toggle(l.id)} />
      <div className="min-w-0"><a href={l.url} target="_blank" rel="noreferrer" className={`font-medium hover:text-accent hover:underline ${a.done.has(l.id) ? "text-muted line-through" : ""}`}>{l.titulo} ↗</a><p className="font-mono text-[11px] text-muted">{l.fonte} · {l.tipo} · ~{MIN_LEITURA[l.tipo]} min</p></div>
    </li>)}</ul>
    <h3 className="label mt-7 mb-1">Explique com suas palavras</h3>
    <p className="mb-2 text-[13.5px] text-muted">Sem consultar: o que é, por que importa e como se liga ao que você já sabe. Onde travar é o que precisa estudar de novo.</p>
    <textarea className="nota w-full" rows={5} value={a.valorDe(nota)} placeholder="resumo de 3 a 5 linhas" onChange={e => a.setValor(nota, e.target.value)} />
    <h3 className="label mt-7 mb-1">Perguntas de revisão</h3><CardsAssunto assunto={x.id} />
    <h3 className="mt-8 text-lg font-bold">Passo 2 · Prática <span className="font-mono text-[12px] font-normal text-muted">~{horasPratica(x)}h</span></h3><Check id={x.pratica.id} text={x.pratica.texto} disabled={!a.temValor(nota) && !a.isDone(x.pratica.id)} />
    {!a.temValor(nota) && !a.isDone(x.pratica.id) && <p className="mt-1 text-[13px] text-muted">Escreva o resumo acima para liberar a prática.</p>}
    <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
      {prev ? <Btn onClick={() => onSelect({ kind: "assunto", id: prev.id })}>← {prev.titulo}</Btn> : <span />}
      <Btn onClick={() => onSelect({ kind: "mes", mes: x.mes })}>laboratório do mês</Btn>
      {next ? <Btn onClick={() => onSelect({ kind: "assunto", id: next.id })}>{next.titulo} →</Btn> : <span />}
    </div>
  </article>;
}

function MesPanel({ mes, onSelect }: { mes: number; onSelect: (s: Sel) => void }) {
  const a = useApp(); const l = laboratorios[mes - 1]; if (!l) return null;
  const ids = l.atividades.map(x => x.id);
  return <article>
    <p className="label">M{String(l.mes).padStart(2, "0")} · {l.fase} · {l.tipo === "projeto-integrador" ? "projeto integrador" : "laboratório"}</p>
    <h2 className="mt-2 text-2xl font-bold">{l.titulo}</h2>
    <div className="mt-3 flex flex-wrap gap-2">{l.pilares.map(p => <span key={p} className={`border border-line px-2 py-0.5 font-mono text-[10px] ${PILARES[p].cor}`}>{title(p)}</span>)}</div>
    <p className="mt-4"><strong>Problema real: </strong>{l.problema}</p>
    <p className="mt-2 text-muted"><strong className="text-text">Objetivo: </strong>{l.objetivo}</p>
    <div className="mt-6 border border-line bg-surface px-4 py-3 text-[14.5px]"><p><strong>Semanas 1–2 · teoria:</strong> o que estudar e as leituras dos assuntos abaixo (~{assuntosDoMes(mes).reduce((t, x) => t + horasTeoria(x), 0)}h).</p><p className="mt-1"><strong>Semanas 3–4 · prática:</strong> a prática de cada assunto e as atividades do laboratório (~{assuntosDoMes(mes).reduce((t, x) => t + horasPratica(x), 0)}h).</p></div><h3 className="label mt-7 mb-2">Assuntos deste mês</h3>
    <div className="flex flex-col gap-2">{assuntosDoMes(mes).map(x => <button key={x.id} type="button" onClick={() => onSelect({ kind: "assunto", id: x.id })} className="flex items-center justify-between gap-3 border border-line bg-surface px-3 py-2 text-left hover:border-accent"><span className="flex items-center gap-2"><span className={`inline-block size-2 rounded-full ${DOT[x.pilar]}`} />{x.titulo}</span><span className="font-mono text-[11px] text-muted">{assuntoDone(x, a.done)}/{assuntoIds(x).length}</span></button>)}</div>
    <div className="mt-7 flex items-center gap-3"><h3 className="label">Atividades do laboratório</h3><button type="button" className="ml-auto border border-line px-2 py-1 font-mono text-[10px] text-muted" onClick={() => a.setMany(ids, countDone(ids, a.done) !== ids.length)}>{countDone(ids, a.done) === ids.length ? "desmarcar" : "marcar todas"}</button></div>
    {l.atividades.map(x => <Check key={x.id} id={x.id} text={x.texto} />)}
    <h3 className="label mt-7 mb-2">Evidências</h3>
    {l.evidencias.map(x => <label key={x.id} className="grid gap-2 border-t border-line-soft py-3 first:border-t-0"><span><span className="block font-medium">{x.label}</span><span className="text-[13px] text-muted">{x.prova}</span></span><input className="medicao w-full" value={a.valorDe(x.id)} placeholder="registrar evidência real" onChange={e => a.setValor(x.id, e.target.value)} /></label>)}
    <details className="mt-7 border border-line bg-surface"><summary className="px-4 py-3 font-medium">Plano completo e critérios</summary><div className="grid gap-5 border-t border-line p-4"><Info h="Contexto" x={[l.contexto]} /><Info h="Pré-requisitos" x={l.preRequisitos} /><Info h="Requisitos funcionais" x={l.requisitosFuncionais} /><Info h="Requisitos não funcionais" x={l.requisitosNaoFuncionais} /><Info h="Tecnologias sugeridas" x={l.tecnologias} /><Info h="Alternativas" x={l.alternativas} /><Info h="Como usar IA" x={[l.usoIa]} /><Info h="Como validar a IA" x={[l.validacaoIa]} /><Info h="Critérios de conclusão" x={l.criterios} /><Info h="Entregáveis" x={l.entregaveis} /></div></details>
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
function Check({ id, text, disabled }: { id: string; text: string; disabled?: boolean }) { const a = useApp(); const c = a.isDone(id); return <label className={`flex items-start gap-2 border-t border-line-soft py-2 first:border-t-0 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><input className="mt-1 size-4 shrink-0" type="checkbox" checked={c} disabled={disabled} onChange={() => a.toggle(id)} /><span className={c ? "text-[15px] text-muted line-through" : "text-[15px]"}>{text}</span></label>; }
function Bar({ n, total }: { n: number; total: number }) { return <div className="mt-4 h-1 bg-line"><div className="h-full bg-accent" style={{ width: `${pct(n, total)}%` }} /></div>; }
function Stat({ l, v }: { l: string; v: string }) { return <div className="flex gap-1.5"><dt className="uppercase tracking-wider">{l}</dt><dd className="font-semibold text-text">{v}</dd></div>; }
function Btn({ children, onClick, active, danger }: { children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`inline-flex items-center border px-2.5 py-1 font-mono text-[11px] ${danger ? "border-warn text-warn" : active ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:border-accent hover:text-accent"}`}>{children}</button>; }
