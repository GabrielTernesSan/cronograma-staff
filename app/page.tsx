"use client";

import { ProgressHeader } from "@/components/ProgressHeader";
import { QuarterCard } from "@/components/QuarterCard";
import { TrilhasSection } from "@/components/TrilhasSection";
import { AppProvider } from "@/lib/app-context";
import type { Quarter } from "@/lib/types";
import { FIDELIS_URL, MUKESH_BLOG_URL } from "@/lib/data/blocos";
import {
  FORA_DE_PROPOSITO,
  PRIORIDADE,
  REGRA_UNICA,
  RITMO_NOTA,
  RITMO_SEMANAL,
  quarters,
} from "@/lib/data/cronograma";

const ANOS: { title: string; year: Quarter["year"] }[] = [
  { title: "Ano 1 — fundação, cache, resiliência e persistência", year: 1 },
  { title: "Ano 2 — mensageria, observabilidade, escala e fechamento", year: 2 },
  { title: "Ano 3 — mercado e decisão", year: 3 },
];

export default function Page() {
  return (
    <AppProvider>
      <ProgressHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="mb-6 text-sm text-muted">{PRIORIDADE}</p>

        <section className="mb-10 rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Ritmo semanal — vale para os 30 meses
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

        {ANOS.map(({ title, year }) => (
          <YearSection
            key={year}
            title={title}
            quarters={quarters.filter((q) => q.year === year)}
          />
        ))}

        <TrilhasSection />

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
            Material de apoio:{" "}
            <a
              href={FIDELIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              fidelissauro.dev
            </a>{" "}
            ·{" "}
            <a
              href={MUKESH_BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              codewithmukesh.com
            </a>
          </p>
          <p className="mt-1">
            Progresso e medições salvos neste navegador. Use{" "}
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
