"use client";

import { useApp } from "@/lib/app-context";
import { moduleById } from "@/lib/data/curso";
import { KIND_META, KIND_ORDER } from "@/lib/data/cronograma";
import { countDone, formatHours, quarterItemIds, quarterLessons } from "@/lib/stats";
import type { Quarter, TaskKind } from "@/lib/types";
import { Bar } from "./Bar";
import { ModuleAccordion } from "./ModuleAccordion";
import { TaskRow } from "./TaskRow";

const HIGHLIGHT: Record<string, string> = {
  marco: "border-ok/50",
  decisao: "border-decisao/50",
};

const HIGHLIGHT_LABEL: Record<string, string> = {
  marco: "MARCO DE 12 MESES",
  decisao: "PONTO DE DECISÃO",
};

export function QuarterCard({ quarter }: { quarter: Quarter }) {
  const { done, filters } = useApp();

  const ids = quarterItemIds(quarter);
  const nDone = countDone(ids, done);
  const complete = nDone === ids.length && ids.length > 0;

  const lessons = quarterLessons(quarter);
  const minutes = lessons.reduce((s, l) => s + l.min, 0);
  const mods = quarter.moduleIds
    .map((id) => moduleById.get(id))
    .filter((m) => m !== undefined);

  const tasksByKind = KIND_ORDER.map((kind) => ({
    kind,
    tasks: quarter.tasks.filter((t) => {
      if (t.kind !== kind) return false;
      if (filters.onlyPending && done.has(t.id)) return false;
      return true;
    }),
  })).filter((g) => g.tasks.length > 0);

  const border = quarter.highlight ? HIGHLIGHT[quarter.highlight] : "border-line";

  return (
    <section
      id={quarter.id}
      className={`scroll-mt-24 rounded-2xl border ${border} bg-surface p-4 sm:p-5`}
    >
      <header className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-lg font-bold">
            <span className="text-accent">{quarter.label}</span>{" "}
            <span className="text-muted">·</span> {quarter.theme}
          </h3>
          {complete && (
            <span className="rounded-md bg-ok/15 px-2 py-0.5 text-xs font-semibold text-ok">
              ✓ concluído
            </span>
          )}
          {quarter.highlight && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                quarter.highlight === "marco"
                  ? "bg-ok/15 text-ok"
                  : "bg-decisao/15 text-decisao"
              }`}
            >
              {HIGHLIGHT_LABEL[quarter.highlight]}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {quarter.period}
          {lessons.length > 0 && (
            <>
              {" · "}
              {lessons.length} lições · {formatHours(minutes)} de vídeo
            </>
          )}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Bar value={nDone} total={ids.length} className="flex-1" height={8} />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
            {nDone}/{ids.length}
          </span>
        </div>
      </header>

      {mods.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            🎓 Curso — .NET Web API Zero to Hero
          </h4>
          <div className="space-y-2">
            {mods.map((m) => (
              <ModuleAccordion key={m.id} module={m} />
            ))}
          </div>
        </div>
      )}

      {tasksByKind.map(({ kind, tasks }) => (
        <TaskGroup key={kind} kind={kind} tasks={tasks} />
      ))}

      {quarter.note && (
        <p className="mt-4 rounded-lg border-l-2 border-accent/60 bg-surface2 px-3 py-2 text-sm leading-relaxed text-muted">
          {quarter.note}
        </p>
      )}
    </section>
  );
}

function TaskGroup({
  kind,
  tasks,
}: {
  kind: TaskKind;
  tasks: Quarter["tasks"];
}) {
  const meta = KIND_META[kind];
  return (
    <div className="mb-3">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {meta.icon} {meta.label}
      </h4>
      <div>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}
