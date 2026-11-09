const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);

const { TAREFAS, tarefaById, pilarDe, feita, idsParaMarcar, montarDia, proximaTarefa, proximoDiaDeEstudo, diaDaSemana, pendentes, previsaoMes, metaMes } = require("../lib/data/agenda.ts");
const { INICIO, SESSAO_MIN, SEMANA, inicioMes } = require("../lib/data/cronograma.ts");
const { assuntos, horasPratica } = require("../lib/data/trilha.ts");
const { laboratorios } = require("../lib/data/blocos.ts");
const { addDias, fmtDiaSemana } = require("../lib/datas.ts");

const T = id => tarefaById.get(id);
const marcar = (done, ids) => ids.forEach(id => idsParaMarcar(T(id), true).forEach(x => done.add(x)));

// Datas
assert.equal(inicioMes(1), "2026-11-09");
assert.equal(metaMes(1), "2026-12-08");
assert.equal(metaMes(36), "2029-11-08");
assert.equal(fmtDiaSemana(INICIO), "seg 09/11");

// Fila
assert.equal(new Set(TAREFAS.map(t => t.id)).size, TAREFAS.length);
assert.equal(new Set(TAREFAS.map(t => t.mes)).size, 36);
assert.ok(TAREFAS.every(t => t.minutos > 0 && t.minutos <= 60));
assert.ok(TAREFAS.filter(t => t.sessao).every(t => t.minutos <= SESSAO_MIN));
for (const a of assuntos) assert.equal(TAREFAS.filter(t => t.baseId === a.pratica.id).reduce((s, t) => s + t.minutos, 0), horasPratica(a) * 60);

// Grade: 09/11 e 10/11 são dias extras; nas outras semanas segunda e terça são livres
assert.equal(diaDaSemana("2026-11-09").horas, 2);
assert.equal(diaDaSemana("2026-11-10").horas, 2);
assert.equal(proximoDiaDeEstudo("2026-11-08"), "2026-11-09");
assert.equal(diaDaSemana("2026-11-17"), undefined);
assert.equal(montarDia("2026-11-17", new Set(), {}), null);
assert.equal(proximoDiaDeEstudo("2026-11-16"), "2026-11-18");

const semana = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"]; // seg..dom
for (const d of semana) {
  const dia = diaDaSemana(d), partes = montarDia(d, new Set(), {});
  assert.equal(partes.length, dia.partes.length);
  const ids = partes.flat(); assert.equal(new Set(ids).size, ids.length, `${d}: tarefa repetida entre partes`);
  dia.partes.forEach((p, i) => {
    const xs = partes[i].map(T), min = xs.reduce((s, t) => s + t.minutos, 0);
    if (p.fonte === "fixo") return assert.equal(xs.length, 0);
    if (xs.length > 1) assert.ok(min <= p.horas * 60 + 10, `${d} parte ${i}: ${min} min`);
    if (p.fonte === "teoria") assert.ok(xs.every(t => pilarDe(t) === p.pilar && (t.tipo === "leitura" || t.tipo === "estudo")), `${d}: teoria fora do pilar`);
    if (p.fonte === "tudo") assert.ok(xs.every(t => pilarDe(t) === p.pilar));
    assert.ok(xs.every(t => t.tipo !== "pratica"), `${d}: prática antes da teoria`);
  });
}
assert.ok(montarDia("2026-11-11", new Set(), {})[0].length > 0, "quarta tem tarefa de IA");

// Dia perdido: a quarta seguinte começa do mesmo lugar
assert.deepEqual(montarDia("2026-11-18", new Set(), {}), montarDia("2026-11-11", new Set(), {}));
const done = new Set(); marcar(done, montarDia("2026-11-11", new Set(), {})[0]);
const depois = montarDia("2026-11-18", done, {})[0];
assert.ok(depois.length > 0 && depois.every(id => !done.has(id)), "dia feito avança a fila");

// Prática liberada quando a teoria do assunto acaba
const ia = assuntos.find(a => a.mes === 1 && a.pilar === "ia");
const teoriaIa = TAREFAS.filter(t => t.assuntoId === ia.id && t.tipo !== "pratica").map(t => t.id);
const comTeoria = new Set(); marcar(comTeoria, teoriaIa);
const domingo = montarDia("2026-11-15", comTeoria, {}), pIa = SEMANA.find(d => d.dow === 0).partes.findIndex(p => p.fonte === "pratica");
assert.ok(domingo[pIa].map(T).some(t => t.tipo === "pratica" && t.assuntoId === ia.id), "prática de IA aparece no domingo");

// Sessões: a última marca a prática original; desmarcar desfaz
const sessoes = TAREFAS.filter(t => t.baseId === assuntos[0].pratica.id);
assert.ok(sessoes.length > 1);
const s = new Set(); sessoes.slice(0, -1).forEach(t => idsParaMarcar(t, true).forEach(x => s.add(x)));
assert.ok(!s.has(sessoes[0].baseId));
idsParaMarcar(sessoes.at(-1), true).forEach(x => s.add(x));
assert.ok(s.has(sessoes[0].baseId), "última sessão conclui a prática");
idsParaMarcar(sessoes.at(-1), false).forEach(x => s.delete(x));
assert.ok(!s.has(sessoes[0].baseId) && !feita(sessoes.at(-1), s, {}));
assert.ok(sessoes.every(t => feita(t, new Set([t.baseId]), {})), "progresso antigo conclui as sessões");

// Evidência conta pelos valores preenchidos
const evidencia = TAREFAS.find(t => t.tipo === "evidencia");
assert.ok(feita(evidencia, new Set(), Object.fromEntries(laboratorios[0].evidencias.map(e => [e.id, "ok"]))));

// Adiantar não repete o que já está no dia
const hoje = montarDia("2026-11-11", new Set(), {}).flat();
const prox = proximaTarefa(new Set(), {}, new Set(hoje)); assert.ok(prox && !hoje.includes(prox.id));

// Previsão: antes do início conta a partir do início; um dia depois não adianta; tudo feito = null
const p1 = previsaoMes(1, new Set(), {}, INICIO);
assert.equal(previsaoMes(1, new Set(), {}, "2026-11-08"), p1);
assert.ok(previsaoMes(1, new Set(), {}, addDias(INICIO, 7)) >= p1);
const completo = new Set(TAREFAS.map(t => t.baseId));
assert.equal(previsaoMes(1, completo, {}, INICIO), null);
assert.equal(pendentes(completo, {}).length, 0);
assert.deepEqual(montarDia("2026-11-11", completo, {}), [[]]);

console.log(`Agenda OK. Mês 1 previsto para ${p1} (meta ${metaMes(1)}).`);
for (const d of semana) console.log(fmtDiaSemana(d), JSON.stringify(montarDia(d, new Set(), {}).map(ids => ids.map(id => `${T(id).texto.slice(0, 60)}${T(id).sessao ? ` s${T(id).sessao.join("/")}` : ""} (${T(id).minutos})`))));

// Projeção: cada tarefa aparece em um único dia, sem repetir, e o primeiro dia bate com o montarDia
const { projetarDias } = require("../lib/data/agenda.ts");
const proj = projetarDias("2026-11-09", "2026-12-31", new Set(), {});
const todas = [...proj.values()].flat(2);
assert.equal(new Set(todas).size, todas.length, "projeção repete tarefa");
assert.deepEqual(proj.get("2026-11-09"), montarDia("2026-11-09", new Set(), {}));
assert.ok(proj.has("2026-11-09") && proj.has("2026-11-10"), "dias extras entram na projeção");
assert.ok(!proj.has("2026-11-16") && !proj.has("2026-11-17"), "segunda e terça seguintes livres");
console.log("Projeção OK:", proj.size, "dias de estudo até 31/12.");
for (const d of ["2026-11-18", "2026-11-19", "2026-11-20"]) console.log(fmtDiaSemana(d), JSON.stringify(proj.get(d).map(ids => ids.map(id => T(id).texto.slice(0, 50)))));
