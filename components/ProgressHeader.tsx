"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { quarters } from "@/lib/data/cronograma";
import {
  ALL_ITEM_IDS,
  ALL_LESSON_IDS,
  ALL_TASK_IDS,
  TOTAL_LESSON_MINUTES,
  countDone,
  formatHours,
  minutesDone,
  pct,
} from "@/lib/stats";

export function ProgressHeader() {
  const { done, loaded, exportJson, importJson, reset, filters, setFilters } =
    useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const lessonsDone = countDone(ALL_LESSON_IDS, done);
  const tasksDone = countDone(ALL_TASK_IDS, done);
  const totalDone = countDone(ALL_ITEM_IDS, done);
  const percent = pct(totalDone, ALL_ITEM_IDS.length);
  const minutes = minutesDone(done);

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Ring percent={loaded ? percent : 0} />

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">
              Cronograma 24 meses
            </h1>
            <p className="text-sm text-muted">
              .NET · Arquitetura · Staff — set/2026 a ago/2028
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
              <Stat
                label="Lições"
                value={`${lessonsDone}/${ALL_LESSON_IDS.length}`}
              />
              <Stat
                label="Marcos"
                value={`${tasksDone}/${ALL_TASK_IDS.length}`}
              />
              <Stat
                label="Vídeo assistido"
                value={`${formatHours(minutes)} / ${formatHours(TOTAL_LESSON_MINUTES)}`}
              />
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
          <Toggle
            active={filters.hidePlanned}
            onClick={() =>
              setFilters((f) => ({ ...f, hidePlanned: !f.hidePlanned }))
            }
          >
            ocultar planejadas
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
          concluído
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
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
