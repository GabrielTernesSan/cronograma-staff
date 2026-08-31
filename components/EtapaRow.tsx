"use client";

import { useApp } from "@/lib/app-context";
import type { Etapa } from "@/lib/types";

export function EtapaRow({ etapa, num }: { etapa: Etapa; num: number }) {
  const { isDone, toggle } = useApp();
  const checked = isDone(etapa.id);

  return (
    <label className="group flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface2">
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0"
        checked={checked}
        onChange={() => toggle(etapa.id)}
      />
      <span className="mt-px shrink-0 text-xs font-semibold tabular-nums text-muted">
        {num}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm leading-snug ${
            checked ? "text-muted line-through" : "text-text"
          }`}
        >
          {etapa.texto}
        </span>
        {etapa.detalhe && (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted">
            {etapa.detalhe}
          </span>
        )}
      </span>
    </label>
  );
}
