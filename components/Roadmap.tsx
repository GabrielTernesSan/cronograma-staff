"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { laboratorios } from "@/lib/data/blocos";
import { DESTINOS, DESTINOS_NOTA, DURACAO_MESES, INICIO_PLANO, materiais, MERCADO_DADOS, MERCADO_FONTES, MERCADO_LEITURA, META_SEMANA, PILARES, RITMO_NOTA, ROTA, SEMANA, trimestres } from "@/lib/data/cronograma";
import { assuntos, assuntosDoMes, horasPratica, horasTeoria, MIN_LEITURA } from "@/lib/data/trilha";
import { ALL_ACTIVITY_IDS, ALL_ASSUNTO_IDS, ALL_EVIDENCE_IDS, ALL_LEITURA_IDS, ALL_MARCO_IDS, assuntoDone, assuntoIds, countDone, countValues, labComplete, labsComplete, pct } from "@/lib/stats";
import type { Assunto, Laboratorio, Pilar, Trimestre } from "@/lib/types";

const title = (p: Pilar) => PILARES[p].titulo;
const DOT: Record<Pilar, string> = { arquitetura: "bg-accent", ia: "bg-measure", cloud: "bg-ok", ingles: "bg-decisao", carreira: "bg-warn" };
const ANOS = [
  { n: 1, nome: "Base sênior com IA", meses: "nov/2026 – out/2027" },
  { n: 2, nome: "Contrato remoto internacional", meses: "nov/2027 – out/2028" },
  { n: 3, nome: "Mudança com visto", meses: "nov/2028 – out/2029" },
];
type Sel = { kind: "assunto"; id: string } | { kind: "mes"; mes: number } | { kind: "tri"; id: string } | null;

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
const DIA = 86400000;
const addDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const segunda = (d: Date) => addDias(d, -((d.getDay() + 6) % 7));
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const diaId = (seg: Date, dow: number) => `sem-${iso(seg)}-d${dow}`;
const parteId = (seg: Date, dow: number, i: number) => `${diaId(seg, dow)}-p${i}`;
const dataDoDia = (seg: Date, dow: number) => addDias(seg, (dow + 6) % 7);
type Dia = (typeof SEMANA)[number];
// O id do dia inteiro vem de antes das partes e continua valendo como todas marcadas.
const parteFeita = (seg: Date, d: Dia, i: number, done: Set<string>) => done.has(diaId(seg, d.dow)) || done.has(parteId(seg, d.dow, i));
const horasDia = (seg: Date, d: Dia, done: Set<string>) => d.partes.reduce((t, p, i) => t + (parteFeita(seg, d, i, done) ? p.horas : 0), 0);
const horasSemana = (seg: Date, done: Set<string>) => SEMANA.reduce((t, d) => t + horasDia(seg, d, done), 0);
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
  for (let d = new Date(ano, mes, 1); d.getMonth() === mes; d = addDias(d, 1)) { const x = SEMANA.find(s => s.dow === d.getDay()); if (!x) continue; planejadas += x.horas; feitas += horasDia(segunda(d), x, done); }
  return { feitas, planejadas };
}
// Mês do plano pela data do dia (M01 = INICIO_PLANO); fora do plano devolve null. Dias 1–14 são teoria, 15 em diante prática.
const mesDoPlano = (d: Date) => { const m = (d.getFullYear() - INICIO_PLANO.ano) * 12 + d.getMonth() - INICIO_PLANO.mes + 1; return m >= 1 && m <= DURACAO_MESES ? m : null; };
const fase = (d: Date) => d.getDate() <= 14 ? "teoria" : "prática";

function Plano({ data, pilares, onSelect }: { data: Date; pilares: Pilar[]; onSelect: (s: Sel) => void }) {
  const a = useApp(); const m = mesDoPlano(data);
  if (!m) return <span className="mt-1 block font-mono text-[11px] text-muted">{data < new Date(INICIO_PLANO.ano, INICIO_PLANO.mes, 1) ? `o plano começa em 01/${String(INICIO_PLANO.mes + 1).padStart(2, "0")}/${INICIO_PLANO.ano}` : "fora do plano"}</span>;
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
    <div className="mt-4 border border-line bg-surface">
      <p className="flex justify-between gap-3 border-b border-line px-4 py-2 font-mono text-[11px] text-muted"><span>{ddmm(dataDoDia(seg, 3))} → {ddmm(dataDoDia(seg, 0))}{atual && " · esta semana"}</span><span className={feitas >= META_SEMANA ? "text-ok" : ""}>{fmtH(feitas)}/{fmtH(total)} · meta {fmtH(META_SEMANA)}</span></p>
      {SEMANA.map(d => {
        const id = diaId(seg, d.dow), partes = d.partes.map((_, i) => parteId(seg, d.dow, i)), h = horasDia(seg, d, a.done), c = h === d.horas, parcial = h > 0 && !c;
        const marcarDia = () => c ? a.setMany([id, ...partes], false) : a.setMany(partes, true);
        const marcarParte = (i: number) => { if (!a.done.has(id)) return a.toggle(partes[i]); a.setMany([id, partes[i]], false); a.setMany(partes.filter((_, j) => j !== i), true); };
        return <div key={d.dow} className="flex items-start gap-3 border-b border-line-soft px-4 py-3 last:border-0">
          <input aria-label={`Marcar ${d.dia} inteiro`} className="mt-1 size-4 shrink-0 cursor-pointer" type="checkbox" checked={c} ref={el => { if (el) el.indeterminate = parcial; }} onChange={marcarDia} />
          <span className="w-12 shrink-0 font-mono text-[12px]"><span className="block font-bold">{d.dia}</span><span className="text-muted">{ddmm(dataDoDia(seg, d.dow))}</span></span>
          <span className="min-w-0 flex-1"><span className={`flex flex-wrap items-center gap-x-3 font-semibold ${c ? "text-muted line-through" : ""}`}>{d.pilares.map(p => <span key={p} className="flex items-center gap-1.5"><span className={`inline-block size-2 rounded-full ${DOT[p]}`} />{title(p)}</span>)}</span>
            {d.partes.map((p, i) => { const f = parteFeita(seg, d, i, a.done); return <label key={i} className="mt-1 flex cursor-pointer items-start gap-2 text-[13.5px] leading-snug">
              <input className="mt-0.5 size-3.5 shrink-0" type="checkbox" checked={f} onChange={() => marcarParte(i)} />
              <span className={`flex-1 ${f ? "text-muted line-through" : "text-muted"}`}>{p.texto}</span><span className="shrink-0 font-mono text-[11px] text-muted">{fmtH(p.horas)}</span>
            </label>; })}
            <Plano data={dataDoDia(seg, d.dow)} pilares={d.pilares} onSelect={onSelect} /></span>
          <span className="shrink-0 font-mono font-bold text-accent">{parcial ? `${fmtH(h)}/` : ""}{fmtH(d.horas)}</span>
        </div>; })}
    </div>
    <div className="mt-4 max-w-[36rem]"><p className="font-mono text-[12px]">Horas em {MESES[ref.getMonth()]}: <strong>{fmtH(mes.feitas)}</strong> de {fmtH(mes.planejadas)}</p><Bar n={mes.feitas} total={mes.planejadas} /></div>
    <p className="mt-4 max-w-[70ch] text-[14.5px] leading-relaxed text-muted">{RITMO_NOTA}</p>
  </section>;
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
    </div>
  </div>;
}

function AssuntoPanel({ id, onSelect }: { id: string; onSelect: (s: Sel) => void }) {
  const a = useApp(); const i = assuntos.findIndex(x => x.id === id); const x = assuntos[i]; if (!x) return null;
  const ids = assuntoIds(x); const n = assuntoDone(x, a.done); const prev = assuntos[i - 1], next = assuntos[i + 1];
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
    <h3 className="mt-8 text-lg font-bold">Passo 2 · Prática <span className="font-mono text-[12px] font-normal text-muted">~{horasPratica(x)}h</span></h3><Check id={x.pratica.id} text={x.pratica.texto} />
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
function Check({ id, text }: { id: string; text: string }) { const a = useApp(); const c = a.isDone(id); return <label className="flex cursor-pointer items-start gap-2 border-t border-line-soft py-2 first:border-t-0"><input className="mt-1 size-4 shrink-0" type="checkbox" checked={c} onChange={() => a.toggle(id)} /><span className={c ? "text-[15px] text-muted line-through" : "text-[15px]"}>{text}</span></label>; }
function Bar({ n, total }: { n: number; total: number }) { return <div className="mt-4 h-1 bg-line"><div className="h-full bg-accent" style={{ width: `${pct(n, total)}%` }} /></div>; }
function Stat({ l, v }: { l: string; v: string }) { return <div className="flex gap-1.5"><dt className="uppercase tracking-wider">{l}</dt><dd className="font-semibold text-text">{v}</dd></div>; }
function Btn({ children, onClick, active, danger }: { children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean }) { return <button type="button" onClick={onClick} aria-pressed={active} className={`inline-flex items-center border px-2.5 py-1 font-mono text-[11px] ${danger ? "border-warn text-warn" : active ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:border-accent hover:text-accent"}`}>{children}</button>; }
