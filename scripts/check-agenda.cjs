const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);

const { TAREFAS, feita, idsParaMarcar, montarDia, pendentes, previsaoMes, metaMes } = require("../lib/data/agenda.ts");
const { INICIO, MIN_POR_DIA, inicioMes } = require("../lib/data/cronograma.ts");
const { assuntos, horasPratica } = require("../lib/data/trilha.ts");
const { laboratorios } = require("../lib/data/blocos.ts");
const { addDias, fmtDiaSemana } = require("../lib/datas.ts");

assert.equal(inicioMes(1), "2026-11-10");
assert.equal(metaMes(1), "2026-12-09");
assert.equal(metaMes(36), "2029-11-09");
assert.equal(fmtDiaSemana(INICIO), "ter 10/11");
assert.equal(new Set(TAREFAS.map(t => t.id)).size, TAREFAS.length);
assert.equal(new Set(TAREFAS.map(t => t.mes)).size, 36);
assert.ok(TAREFAS.every(t => t.minutos > 0 && t.minutos <= MIN_POR_DIA));
for (const assunto of assuntos) {
  assert.equal(TAREFAS.filter(t => t.baseId === assunto.pratica.id).reduce((s, t) => s + t.minutos, 0), horasPratica(assunto) * 60);
}

const done = new Set();
const dia = montarDia(done, {});
assert.ok(dia.length > 0);
assert.equal(dia[0], TAREFAS[0]);
assert.deepEqual(montarDia(done, {}), dia, "Dia perdido mantém a próxima pendente");
dia.forEach(t => idsParaMarcar(t, true).forEach(id => done.add(id)));
assert.ok(dia.every(t => feita(t, done, {})));
assert.equal(montarDia(done, {})[0], TAREFAS[dia.length]);
assert.equal(montarDia(done, {}, new Set(dia.map(t => t.id)), 1).length, 1);

const sessoes = TAREFAS.filter(t => t.baseId === assuntos[0].pratica.id);
assert.ok(sessoes.length > 1);
idsParaMarcar(sessoes[0], true).forEach(id => done.add(id));
assert.ok(!done.has(sessoes[0].baseId));
sessoes.slice(1).forEach(t => idsParaMarcar(t, true).forEach(id => done.add(id)));
assert.ok(done.has(sessoes[0].baseId), "Última sessão conclui a prática existente");
idsParaMarcar(sessoes.at(-1), false).forEach(id => done.delete(id));
assert.ok(!done.has(sessoes[0].baseId));
assert.ok(!feita(sessoes.at(-1), done, {}));
assert.ok(sessoes.every(t => feita(t, new Set([t.baseId]), {})), "Progresso antigo conclui as sessões");

const evidencia = TAREFAS.find(t => t.tipo === "evidencia");
const valores = Object.fromEntries(laboratorios[0].evidencias.map(e => [e.id, "prova registrada"]));
assert.ok(feita(evidencia, new Set(), valores));
const previsao = previsaoMes(1, new Set(), {}, INICIO);
assert.equal(previsaoMes(1, new Set(), {}, "2026-11-09"), previsao);
assert.equal(previsaoMes(1, new Set(), {}, addDias(INICIO, 1)), addDias(previsao, 1));
const completo = new Set(TAREFAS.map(t => t.baseId));
assert.equal(previsaoMes(1, completo, {}, INICIO), null);
assert.equal(pendentes(completo, {}).length, 0);
assert.deepEqual(montarDia(completo, {}), []);
console.log("Agenda: datas, sessões, progresso, dia perdido, evidências e previsão OK.");
