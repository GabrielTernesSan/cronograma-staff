"use client";

import { useApp } from "@/lib/app-context";
import { REPO_BLOB_URL } from "@/lib/data/blocos";
import {
  blocoCompleto,
  countDone,
  countPreenchidas,
  etapaIds,
  medicaoIds,
  semanasLabel,
  trimestreDeBloco,
} from "@/lib/stats";
import type { Bloco } from "@/lib/types";
import { EtapaRow } from "./EtapaRow";
import { LeiturasList } from "./LeiturasList";
import { MedicaoRow } from "./MedicaoRow";

export function AssuntoSection({ bloco }: { bloco: Bloco }) {
  const { done, valores, setMany, filters } = useApp();

  const etapas = etapaIds(bloco);
  const medicoes = medicaoIds(bloco);
  const nEtapas = countDone(etapas, done);
  const nMedicoes = countPreenchidas(medicoes, valores);
  const total = etapas.length + medicoes.length;
  const feito = nEtapas + nMedicoes;
  const completo = blocoCompleto(bloco, done, valores);
  const etapasCompletas = nEtapas === etapas.length;

  const etapasVisiveis = bloco.etapas.filter(
    (e) => !(filters.onlyPending && done.has(e.id)),
  );
  const medicoesVisiveis = bloco.medicoes.filter(
    (m) => !(filters.onlyPending && m.id in valores),
  );

  if (
    filters.onlyPending &&
    etapasVisiveis.length + medicoesVisiveis.length === 0
  ) {
    return null;
  }

  return (
    <section
      id={bloco.id}
      className="scroll-mt-6 border-t border-line pt-11 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span className="pt-1.5 font-mono text-[13px] font-bold text-accent tabular-nums">
          {String(bloco.numero).padStart(2, "0")}
        </span>
        <h2 className="text-[clamp(1.6rem,3.6vw,2.25rem)] font-bold tracking-tight">
          {bloco.titulo}
        </h2>
        <span
          className={`ml-auto shrink-0 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
            completo
              ? "bg-ok/15 text-ok"
              : "border border-line text-muted"
          }`}
        >
          {feito}/{total}
        </span>
      </div>

      <p className="mb-5 mt-1 font-mono text-xs text-muted tabular-nums lg:ml-[33px]">
        {semanasLabel(bloco)} · {trimestreDeBloco(bloco.id)} ·{" "}
        {bloco.etapas.length} etapas · {bloco.medicoes.length} medições
      </p>

      <div className="lg:ml-[33px]">
        {bloco.intro.map((p, i) => (
          <p key={i} className="mb-3.5 max-w-[66ch] last:mb-0">
            {p}
          </p>
        ))}
      </div>

      {bloco.conflitos && (
        <div className="mt-7 border border-text bg-surface lg:ml-[33px]">
          <p className="label px-5 pb-2.5 pt-4">
            Por que este assunto existe — os padrões se contradizem
          </p>
          <div className="overflow-x-auto">
            <table className="doc-table min-w-[34rem]">
              <thead>
                <tr>
                  <th className="w-[32%] !pl-5">Onde conflita</th>
                  <th className="!pr-5">O que acontece</th>
                </tr>
              </thead>
              <tbody>
                {bloco.conflitos.map((c) => (
                  <tr key={c.par}>
                    <td className="!pl-5 font-mono text-[12.5px] font-medium leading-snug">
                      {c.par}
                    </td>
                    <td className="!pr-5 text-[15px] text-muted">{c.efeito}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bloco.conflitosFecho && (
            <p className="max-w-[66ch] px-5 pb-4 pt-3.5 text-[15.5px] font-semibold">
              {bloco.conflitosFecho}
            </p>
          )}
        </div>
      )}

      <div className="mt-7 grid gap-7 md:grid-cols-[1.05fr_1fr] md:gap-9 lg:ml-[33px]">
        <div>
          <p className="label mb-3">
            {bloco.conceitosTitulo ?? "Os conceitos"}
          </p>
          <dl>
            {bloco.conceitos.map((c) => (
              <div
                key={c.termo}
                className="border-t border-line-soft py-2.5 first:border-t-0 first:pt-0"
              >
                <dt className="mb-0.5 font-mono text-[13px] font-medium">
                  {c.termo}
                </dt>
                <dd className="m-0 max-w-[54ch] text-[15.5px] leading-relaxed text-muted">
                  {c.definicao}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="label mb-3">O que ler</p>
          {bloco.leituras.length > 0 && (
            <LeiturasList leituras={bloco.leituras} />
          )}
          {bloco.leiturasNota && (
            <p
              className={`m-0 max-w-[54ch] text-[15.5px] leading-relaxed text-muted ${
                bloco.leituras.length > 0 ? "mt-3" : ""
              }`}
            >
              {bloco.leiturasNota}
            </p>
          )}
        </div>
      </div>

      {/* O projetinho: o painel que concentra escopo, passos e medições — é
          aqui que se marca progresso, então ele é o objeto mais pesado da
          seção, com a régua âmbar da medição na borda. */}
      <div className="mt-8 border border-l-[3px] border-line border-l-measure bg-surface lg:ml-[33px]">
        <div className="px-6 pb-4 pt-5">
          <p className="label">
            {bloco.conflitos ? "O projetinho grande" : "O projetinho"}
          </p>
          <p className="mb-2.5 mt-1 font-mono text-xl font-bold tracking-tight text-measure">
            {bloco.projeto.nome}
          </p>
          <p className="mb-3 max-w-[66ch]">{bloco.projeto.resumo}</p>
          <p className="m-0 max-w-[66ch] text-[15.5px] leading-relaxed text-muted">
            {bloco.projeto.porque}
          </p>
        </div>

        <div className="grid border-t border-line sm:grid-cols-2">
          <div className="px-6 py-4">
            <p className="m-0 text-[15.5px] leading-relaxed">
              <strong className="font-semibold">Entra: </strong>
              {bloco.projeto.entra}
            </p>
          </div>
          <div className="border-t border-line-soft px-6 py-4 sm:border-l sm:border-t-0 sm:border-line">
            <p className="m-0 text-[15.5px] leading-relaxed text-muted">
              <strong className="font-semibold text-text">
                Fica de fora:{" "}
              </strong>
              {bloco.projeto.foraDe}
            </p>
          </div>
        </div>

        {etapasVisiveis.length > 0 && (
          <div className="border-t border-line px-6 pb-5 pt-4">
            <div className="mb-1 flex items-center gap-3">
              <p className="label">
                Passo a passo — {nEtapas}/{etapas.length}
              </p>
              <button
                type="button"
                onClick={() => setMany(etapas, !etapasCompletas)}
                className="no-print ml-auto shrink-0 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {etapasCompletas ? "desmarcar" : "marcar todas"}
              </button>
            </div>
            <ol>
              {etapasVisiveis.map((e) => (
                <EtapaRow
                  key={e.id}
                  etapa={e}
                  num={bloco.etapas.indexOf(e) + 1}
                />
              ))}
            </ol>
          </div>
        )}

        {medicoesVisiveis.length > 0 && (
          <div className="border-t border-line">
            <p className="label px-6 pb-2 pt-4">
              O que medir — {nMedicoes}/{medicoes.length} registradas
            </p>
            <div className="overflow-x-auto">
              <table className="doc-table min-w-[36rem]">
                <thead>
                  <tr>
                    <th className="!pl-6">Medição</th>
                    <th>O que o número prova</th>
                    <th className="!pr-6">O que você mediu</th>
                  </tr>
                </thead>
                <tbody>
                  {medicoesVisiveis.map((m) => (
                    <MedicaoRow key={m.id} medicao={m} />
                  ))}
                </tbody>
              </table>
            </div>
            {bloco.medicoesNota && (
              <p className="m-0 max-w-[64ch] px-6 pb-1 pt-3 text-[14.5px] text-muted">
                {bloco.medicoesNota}
              </p>
            )}
          </div>
        )}

        <div className="bg-surface2 px-6 pb-5 pt-4">
          <p className="m-0 max-w-[68ch] text-[15.5px]">
            <span className="label mb-1.5 block !text-accent">
              Terminei quando
            </span>
            {bloco.projeto.criterio}
          </p>
        </div>
      </div>

      {bloco.notaObsidian && (
        <div className="mt-6 border-l-[3px] border-accent py-1 pl-5 lg:ml-[33px]">
          <span className="label mb-1 block">A nota que fica</span>
          <p className="m-0 max-w-[66ch]">{bloco.notaObsidian}</p>
        </div>
      )}

      {bloco.observacao && (
        <p className="mt-4 max-w-[66ch] text-[14.5px] leading-relaxed text-muted lg:ml-[33px]">
          {bloco.observacao}
        </p>
      )}

      {bloco.pontesTrabalho && (
        <div className="mt-6 border border-accent bg-accent/[0.07] px-6 py-4 lg:ml-[33px]">
          <h4 className="mb-2 text-[15px] font-bold">
            {bloco.pontesTitulo ?? "A ponte com o trabalho"}
          </h4>
          <p className="m-0 max-w-[66ch] text-[15.5px] leading-relaxed">
            {bloco.pontesTrabalho}
          </p>
        </div>
      )}

      <p className="no-print mt-5 font-mono text-[11px] text-muted lg:ml-[33px]">
        roteiro completo:{" "}
        {REPO_BLOB_URL ? (
          <a
            href={`${REPO_BLOB_URL}${bloco.roteiro}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {bloco.roteiro} ↗
          </a>
        ) : (
          <span>{bloco.roteiro}</span>
        )}
      </p>
    </section>
  );
}
