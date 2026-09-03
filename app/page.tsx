"use client";

import { AssuntoSection } from "@/components/AssuntoSection";
import { Masthead } from "@/components/Masthead";
import { QuarterCard } from "@/components/QuarterCard";
import { Rail } from "@/components/Rail";
import { TrilhasSection } from "@/components/TrilhasSection";
import { AppProvider } from "@/lib/app-context";
import { FIDELIS_URL, MUKESH_BLOG_URL, blocos } from "@/lib/data/blocos";
import {
  FORA_DE_PROPOSITO,
  PRIORIDADE,
  REGRA_UNICA,
  RITMO_NOTA,
  RITMO_SEMANAL,
  quarters,
} from "@/lib/data/cronograma";
import { semanasLabel } from "@/lib/stats";
import type { Quarter } from "@/lib/types";

const ANOS: { title: string; year: Quarter["year"] }[] = [
  { title: "Ano 1 — fundação, cache, resiliência e persistência", year: 1 },
  {
    title: "Ano 2 — mensageria, observabilidade, escala e o sistema inteiro",
    year: 2,
  },
  { title: "Ano 3 — mercado e decisão", year: 3 },
];

export default function Page() {
  return (
    <AppProvider>
      <div className="mx-auto max-w-[1180px] px-6 pb-24">
        <Masthead />

        <div className="grid gap-0 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-14">
          <Rail />

          <main>
            <Overview />

            <div className="mt-14 flex flex-col gap-11">
              {blocos.map((b) => (
                <AssuntoSection key={b.id} bloco={b} />
              ))}
            </div>

            <Grade />

            <TrilhasSection />

            <Footer />
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

function Overview() {
  return (
    <section>
      <p className="label mb-3">Os assuntos</p>
      <div className="overflow-x-auto border border-line bg-surface">
        <table className="doc-table min-w-[38rem]">
          <thead>
            <tr>
              <th>#</th>
              <th>Assunto</th>
              <th>Semanas</th>
              <th>O projetinho</th>
              <th>Etapas</th>
              <th>Medições</th>
            </tr>
          </thead>
          <tbody>
            {blocos.map((b) => (
              <tr key={b.id}>
                <td className="font-mono text-[13px] tabular-nums text-muted">
                  {String(b.numero).padStart(2, "0")}
                </td>
                <td>
                  <a
                    href={`#${b.id}`}
                    className="font-medium text-text hover:text-accent hover:underline"
                  >
                    {b.titulo}
                  </a>
                </td>
                <td className="whitespace-nowrap font-mono text-[13px] tabular-nums text-muted">
                  {semanasLabel(b).replace(/ semanas?$/, "")}
                </td>
                <td className="font-mono text-[13px] font-medium text-measure">
                  {b.projeto.nome}
                </td>
                <td className="font-mono text-[13px] tabular-nums text-muted">
                  {b.etapas.length}
                </td>
                <td className="font-mono text-[13px] tabular-nums text-muted">
                  {b.medicoes.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout>
        <p>
          <strong className="font-semibold">
            Os sete primeiros projetinhos são independentes.
          </strong>{" "}
          Repositório novo, <Code>dotnet new</Code> novo,{" "}
          <Code>docker compose</Code> novo. Isso é de propósito: um projeto
          grande que atravessa 30 meses vira dívida — você passa a manter o que
          construiu em vez de estudar o assunto da vez, e cada conceito novo
          chega enterrado sob o acoplamento com os antigos. Repetir o
          boilerplate custa duas horas e compra foco total no conceito.
        </p>
        <p>
          <strong className="font-semibold">
            O assunto 7 é a exceção, e vem no fim de propósito.
          </strong>{" "}
          Ele não reaproveita o código dos sete — reaproveita as decisões. Só
          depois de entender cada conceito sozinho vale a pena descobrir que
          eles se contradizem.
        </p>
        <p>
          O que atravessa os 30 meses não é o código — é a pasta de notas e as
          medições.
        </p>
      </Callout>

      <Callout tom="measure">
        <p>
          <strong className="font-semibold">
            O contador que manda é medição registrada.
          </strong>{" "}
          Não hora assistida, não artigo lido. Cada projetinho termina com
          números anotados: latência antes e depois, número de queries, tamanho
          da fila, RPS até degradar. O número é a prova de que a etapa foi
          executada — e é ele que você vai lembrar daqui a dois anos, não o
          texto do artigo.
        </p>
        <p>
          Um assunto só fecha quando{" "}
          <strong className="font-semibold">
            todas as etapas estão feitas E todas as medições estão preenchidas
          </strong>
          .
        </p>
      </Callout>

      <p className="mt-6 max-w-[66ch] text-[15.5px] text-muted">{PRIORIDADE}</p>
    </section>
  );
}

function Grade() {
  return (
    <section id="grade" className="mt-14 scroll-mt-6 border-t border-line pt-11">
      <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">
        A grade
      </h2>
      <p className="mb-6 mt-1.5 max-w-[62ch] text-muted">
        Dez trimestres com os marcos de trabalho, certificação, inglês e
        checkpoint. Cada trimestre carrega um assunto; o resto corre em paralelo.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start">
        <div className="border border-line bg-surface px-5 py-4">
          <p className="label mb-2.5">Ritmo semanal — vale para os 30 meses</p>
          <table className="w-full">
            <tbody>
              {RITMO_SEMANAL.map((r) => (
                <tr
                  key={r.bloco}
                  className="border-b border-line-soft last:border-0"
                >
                  <td className="py-1.5 pr-3 text-[15px]">{r.bloco}</td>
                  <td className="py-1.5 text-right font-mono text-[15px] font-bold tabular-nums text-accent">
                    {r.tempo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-muted">
          {RITMO_NOTA}
        </p>
      </div>

      {ANOS.map(({ title, year }) => (
        <div key={year} className="mt-9">
          <h3 className="mb-4 text-[15px] font-bold uppercase tracking-wide text-muted">
            {title}
          </h3>
          <div className="flex flex-col gap-4">
            {quarters
              .filter((q) => q.year === year)
              .map((q) => (
                <QuarterCard key={q.id} quarter={q} />
              ))}
          </div>
        </div>
      ))}

      <Callout>
        <p>
          <strong className="font-semibold">
            T4 não tem assunto novo, de propósito.
          </strong>{" "}
          Ele absorve o transbordo: os assuntos 2, 3 e 4 custam ~60h contra 52h
          de capacidade por trimestre, então cada um escorrega ~2 semanas para o
          seguinte. Isso é previsto, não falha.
        </p>
        <p>
          <strong className="font-semibold">
            O T8 carrega o assunto 7 e sobra pouca folga:
          </strong>{" "}
          8–10 semanas de projeto contra ~13 de trimestre. Se o ano 2
          escorregou, o assunto 7 entra no T9 — e isso não atrapalha, porque as
          mock interviews do T9 são sobre ele.
        </p>
      </Callout>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-surface px-5 py-4">
          <p className="label mb-2">O que fica de fora de propósito</p>
          <p className="m-0 text-[15px] leading-relaxed text-muted">
            {FORA_DE_PROPOSITO}
          </p>
        </div>
        <div className="border border-accent bg-accent/[0.07] px-5 py-4">
          <p className="label mb-2 !text-accent">Regra única</p>
          <p className="m-0 text-[15px] leading-relaxed">{REGRA_UNICA}</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-14 border-t border-line pt-5 font-mono text-[11.5px] leading-relaxed text-muted">
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
        — a teoria, o porquê, o vocabulário ·{" "}
        <a
          href={MUKESH_BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          codewithmukesh.com
        </a>{" "}
        — o como fazer em .NET.
      </p>
      <p className="mt-1.5">
        Nenhum dos dois é a espinha. A espinha é o projetinho; eles são o que
        você lê para conseguir escrevê-lo.
      </p>
      <p className="mt-3">
        Progresso e medições ficam salvos neste navegador. Use{" "}
        <strong className="font-bold text-text">exportar</strong> antes de
        trocar de máquina ou limpar o cache.
      </p>
    </footer>
  );
}

function Callout({
  children,
  tom = "accent",
}: {
  children: React.ReactNode;
  tom?: "accent" | "measure";
}) {
  return (
    <div
      className={`mt-6 flex flex-col gap-2.5 border-l-[3px] px-5 py-3.5 [&_p]:m-0 [&_p]:max-w-[68ch] ${
        tom === "measure"
          ? "border-measure bg-measure/[0.07]"
          : "border-accent bg-accent/[0.07]"
      }`}
    >
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-surface2 px-1 py-px font-mono text-[0.88em]">
      {children}
    </code>
  );
}
