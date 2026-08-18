"use client";

import { useApp } from "@/lib/app-context";
import { countDone, formatHours } from "@/lib/stats";
import type { Module } from "@/lib/types";
import { Bar } from "./Bar";
import { LessonRow } from "./LessonRow";

export function ModuleAccordion({ module }: { module: Module }) {
  const { done, setMany, filters } = useApp();

  const visible = module.lessons.filter((l) => {
    if (filters.hidePlanned && l.status === "planned") return false;
    if (filters.onlyPending && done.has(l.id)) return false;
    return true;
  });

  const ids = module.lessons.map((l) => l.id);
  const nDone = countDone(ids, done);
  const complete = nDone === ids.length;
  const minutes = module.lessons.reduce((s, l) => s + l.min, 0);

  if (visible.length === 0) return null;

  return (
    <details
      className="rounded-xl border border-line bg-surface"
      open={!complete}
    >
      <summary className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-xs font-semibold tabular-nums text-muted">
          {String(module.num).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {module.short}
          </span>
          <span className="block truncate text-xs text-muted">
            {module.title}
          </span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {formatHours(minutes)}
        </span>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
            complete ? "bg-ok/15 text-ok" : "bg-surface2 text-muted"
          }`}
        >
          {nDone}/{ids.length}
        </span>
        <span className="shrink-0 text-muted transition-transform" aria-hidden>
          ▾
        </span>
      </summary>

      <div className="border-t border-line px-2 pb-2 pt-1">
        <div className="flex items-center gap-2 px-2 py-2">
          <Bar value={nDone} total={ids.length} className="flex-1" />
          <button
            type="button"
            onClick={() => setMany(ids, !complete)}
            className="no-print shrink-0 rounded-md border border-line px-2 py-1 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {complete ? "desmarcar tudo" : "marcar tudo"}
          </button>
        </div>
        {visible.map((l) => (
          <LessonRow key={l.id} lesson={l} />
        ))}
      </div>
    </details>
  );
}
