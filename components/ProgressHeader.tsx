"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { blocos } from "@/lib/data/blocos";
import { quarters } from "@/lib/data/cronograma";
import {
  ALL_ETAPA_IDS,
  ALL_MEDICAO_IDS,
  ALL_TASK_IDS,
  blocosConcluidos,
  countDone,
  countPreenchidas,
  pct,
} from "@/lib/stats";

export function ProgressHeader() {
  const {
    done,
    valores,
    loaded,
    exportJson,
    importJson,
    reset,
    filters,
    setFilters,
  } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const etapasDone = countDone(ALL_ETAPA_IDS, done);
  const medicoesDone = countPreenchidas(ALL_MEDICAO_IDS, valores);
  const tasksDone = countDone(ALL_TASK_IDS, done);
  const nBlocos = blocosConcluidos(done, valores);

  // O anel mede o projeto: etapas + medições. As trilhas paralelas não
  // competem com os blocos na barra principal.
  const percent = pct(
    etapasDone + medicoesDone,
    ALL_ETAPA_IDS.length + ALL_MEDICAO_IDS.length,
  );

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Ring percent={loaded ? percent : 0} />

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">
              Cronograma 30 meses
            </h1>
            <p className="text-sm text-muted">
              .NET · Arquitetura · Staff — set/2026 a fev/2029
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <Stat
                label="Assuntos"
                value={`${nBlocos}/${blocos.length}`}
              />
              <Stat
                label="Etapas"
                value={`${etapasDone}/${ALL_ETAPA_IDS.length}`}
              />
              <Stat
                label="Medições"
                value={`${medicoesDone}/${ALL_MEDICAO_IDS.length}`}
                destaque
              />
              <Stat label="Marcos" value={`${tasksDone}/${ALL_TASK_IDS.length}`} />
            </dl>
          </div>
        </div>

        <div className="no-print mt-5 flex flex-wrap items-center gap-2">
          <Toggle
            active={filters.onlyPending}
            onClick={() =>
              setFilters((f) => ({ ...f, onlyPending: !f.onlyPending }))
            }
          >
            só pendentes
          </Toggle>

          <span className="mx-1 h-5 w-px bg-line" />

          <Btn onClick={exportJson}>exportar</Btn>
          <Btn onClick={() => fileRef.current?.click()}>importar</Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const res = await importJson(file);
              setMsg(res.message);
              setTimeout(() => setMsg(null), 4000);
            }}
          />
          {confirmReset ? (
            <>
              <Btn danger onClick={() => { reset(); setConfirmReset(false); }}>
                confirmar zerar
              </Btn>
              <Btn onClick={() => setConfirmReset(false)}>cancelar</Btn>
            </>
          ) : (
            <Btn onClick={() => setConfirmReset(true)}>zerar</Btn>
          )}

          {msg && <span className="text-xs text-accent">{msg}</span>}
        </div>

        <nav className="no-print mt-4 flex flex-wrap gap-1.5">
          {quarters.map((q) => (
            <a
              key={q.id}
              href={`#${q.id}`}
              className="rounded-md border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {q.label} <span className="opacity-60">{q.period}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28 shrink-0 self-start sm:self-auto">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          className="stroke-surface2"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={percent === 100 ? "stroke-ok" : "stroke-accent"}
          strokeDasharray={c}
          strokeDashoffset={c - (c * percent) / 100}
          style={{ transition: "stroke-dashoffset 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{percent}%</span>
        <span className="text-[10px] uppercase tracking-wide text-muted">
          do projeto
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  destaque,
}: {
  label: string;
  value: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <dt className={`text-xs ${destaque ? "text-accent" : "text-muted"}`}>
        {label}
      </dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Btn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
        danger
          ? "border-warn/50 text-warn hover:bg-warn/10"
          : "border-line text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
