"use client";

import { useEffect, useRef, useState } from "react";
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
import { Bar } from "./Bar";
import { EtapaRow } from "./EtapaRow";
import { LeiturasList } from "./LeiturasList";
import { MedicaoRow } from "./MedicaoRow";

export function BlocoCard({ bloco }: { bloco: Bloco }) {
  const { done, valores, loaded, setMany, filters } = useApp();

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

  // `open` é estado do usuário, não derivado de `completo`. Se ele fosse
  // derivado, digitar o primeiro caractere da última medição fecharia o
  // <details> embaixo do cursor e engoliria o resto do que está sendo digitado.
  // O bloco só se fecha sozinho uma vez, quando o localStorage chega e ele já
  // vem completo — depois disso quem abre e fecha é quem está usando.
  const [aberto, setAberto] = useState(true);
  const semeado = useRef(false);

  useEffect(() => {
    if (!loaded || semeado.current) return;
    semeado.current = true;
    if (completo) setAberto(false);
  }, [loaded, completo]);

  if (filters.onlyPending && etapasVisiveis.length + medicoesVisiveis.length === 0) {
    return null;
  }

  return (
    <details
      id={bloco.id}
      className="scroll-mt-24 rounded-xl border border-line bg-surface"
      open={aberto}
      onToggle={(e) => setAberto(e.currentTarget.open)}
    >
      <summary className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-xs font-semibold tabular-nums text-muted">
          {String(bloco.numero).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {bloco.titulo}
          </span>
          <span className="block truncate text-xs text-muted">
            {semanasLabel(bloco)} · {trimestreDeBloco(bloco.id)}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
            completo ? "bg-ok/15 text-ok" : "bg-surface2 text-muted"
          }`}
        >
          {feito}/{total}
        </span>
        <span className="shrink-0 text-muted transition-transform" aria-hidden>
          ▾
        </span>
      </summary>

      <div className="border-t border-line px-2 pb-3 pt-1">
        <div className="flex items-center gap-2 px-2 py-2">
          <Bar value={feito} total={total} className="flex-1" />
          {etapas.length > 0 && (
            <button
              type="button"
              onClick={() => setMany(etapas, !etapasCompletas)}
              className="no-print shrink-0 rounded-md border border-line px-2 py-1 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {etapasCompletas ? "desmarcar etapas" : "marcar etapas"}
            </button>
          )}
        </div>

        {bloco.conceitos.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5 px-2">
            {bloco.conceitos.map((c) => (
              <span
                key={c}
                className="rounded-md bg-surface2 px-2 py-0.5 text-[11px] text-muted"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <Secao titulo="🎯 O projetinho">
          <div className="rounded-lg border border-accent/30 bg-surface2 px-3 py-2.5">
            <p className="font-mono text-sm font-semibold text-accent">
              {bloco.projeto.nome}
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {bloco.projeto.resumo}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <strong className="font-semibold text-text">
                Terminei quando:{" "}
              </strong>
              {bloco.projeto.criterio}
            </p>
            <p className="mt-2 text-xs text-muted">
              Roteiro completo:{" "}
              {REPO_BLOB_URL ? (
                <a
                  href={`${REPO_BLOB_URL}${bloco.roteiro}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-accent hover:underline"
                >
                  {bloco.roteiro}
                </a>
              ) : (
                <span className="font-mono">{bloco.roteiro}</span>
              )}
            </p>
          </div>
        </Secao>

        {bloco.leituras.length > 0 && (
          <Secao titulo="📖 Leituras">
            <LeiturasList leituras={bloco.leituras} />
          </Secao>
        )}

        {etapasVisiveis.length > 0 && (
          <Secao titulo="🔧 Etapas">
            {etapasVisiveis.map((e) => (
              <EtapaRow
                key={e.id}
                etapa={e}
                num={bloco.etapas.indexOf(e) + 1}
              />
            ))}
          </Secao>
        )}

        {medicoesVisiveis.length > 0 && (
          <Secao
            titulo={`📊 Medições — ${nMedicoes}/${medicoes.length} registradas`}
          >
            <div className="divide-y divide-line/60">
              {medicoesVisiveis.map((m) => (
                <MedicaoRow key={m.id} medicao={m} />
              ))}
            </div>
          </Secao>
        )}

        {bloco.notaObsidian && (
          <p className="mx-2 mt-3 rounded-lg border-l-2 border-accent/60 bg-surface2 px-3 py-2 text-sm leading-relaxed">
            <strong className="font-semibold">Nota no Obsidian: </strong>
            <span className="text-muted">{bloco.notaObsidian}</span>
          </p>
        )}

        {bloco.observacao && (
          <p className="mx-2 mt-2 px-1 text-xs leading-relaxed text-muted">
            {bloco.observacao}
          </p>
        )}

        {bloco.pontesTrabalho && (
          <p className="mx-2 mt-2 rounded-lg border-l-2 border-ok/60 bg-surface2 px-3 py-2 text-sm leading-relaxed">
            <strong className="font-semibold">💼 Ponte com o trabalho: </strong>
            <span className="text-muted">{bloco.pontesTrabalho}</span>
          </p>
        )}
      </div>
    </details>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <h5 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {titulo}
      </h5>
      <div className="px-1">{children}</div>
    </div>
  );
}
