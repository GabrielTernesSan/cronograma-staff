"use client";

import { ProgressHeader } from "@/components/ProgressHeader";
import { QuarterCard } from "@/components/QuarterCard";
import { AppProvider } from "@/lib/app-context";
import type { Quarter } from "@/lib/types";
import { CURSO_URL } from "@/lib/data/curso";
import {
  FORA_DE_PROPOSITO,
  PRIORIDADE,
  REGRA_UNICA,
  RITMO_NOTA,
  RITMO_SEMANAL,
  quarters,
} from "@/lib/data/cronograma";

export default function Page() {
  const ano1 = quarters.filter((q) => q.year === 1);
  const ano2 = quarters.filter((q) => q.year === 2);

  return (
    <AppProvider>
      <ProgressHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-6 text-sm text-muted">{PRIORIDADE}</p>

        <section className="mb-10 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Ritmo semanal — vale para os 24 meses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[24rem] text-sm">
              <tbody>
                {RITMO_SEMANAL.map((r) => (
                  <tr key={r.bloco} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4">{r.bloco}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {r.tempo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{RITMO_NOTA}</p>
        </section>

        <YearSection
          title="Ano 1 — ficar útil e virar sênior de fato"
          quarters={ano1}
        />
        <YearSection
          title="Ano 2 — virar candidato aos dois caminhos"
          quarters={ano2}
        />

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              O que fica de fora de propósito
            </h2>
            <p className="text-sm leading-relaxed">{FORA_DE_PROPOSITO}</p>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-surface p-4 sm:p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
              Regra única
            </h2>
            <p className="text-sm leading-relaxed">{REGRA_UNICA}</p>
          </div>
        </section>

        <footer className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            Curso:{" "}
            <a
              href={CURSO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              .NET Web API: Zero to Hero — codewithmukesh
            </a>{" "}
            · Arquitetura:{" "}
            <a
              href="https://fidelissauro.dev/system-design-sumario/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              fidelissauro.dev
            </a>
          </p>
          <p className="mt-1">
            Progresso salvo neste navegador. Use{" "}
            <strong className="font-semibold">exportar</strong> antes de trocar de
            máquina ou limpar o cache.
          </p>
        </footer>
      </main>
    </AppProvider>
  );
}

function YearSection({
  title,
  quarters,
}: {
  title: string;
  quarters: Quarter[];
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-base font-bold tracking-tight">
        {title}
      </h2>
      <div className="space-y-5">
        {quarters.map((q) => (
          <QuarterCard key={q.id} quarter={q} />
        ))}
      </div>
    </section>
  );
}
