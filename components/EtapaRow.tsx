"use client";

import { useApp } from "@/lib/app-context";
import type { Etapa } from "@/lib/types";

export function EtapaRow({ etapa, num }: { etapa: Etapa; num: number }) {
  const { isDone, toggle } = useApp();
  const checked = isDone(etapa.id);

  return (
    <li className="list-none border-t border-line-soft first:border-t-0">
      <label className="grid cursor-pointer grid-cols-[auto_1.4rem_1fr] items-start gap-x-2.5 py-2.5">
        <input
          type="checkbox"
          className="mt-[5px] size-4 shrink-0"
          checked={checked}
          onChange={() => toggle(etapa.id)}
        />
        <span
          className={`pt-[3px] font-mono text-[11px] font-bold tabular-nums ${
            checked ? "text-muted" : "text-measure"
          }`}
        >
          {num}
        </span>
        <span className="min-w-0">
          <span
            className={`block text-[15.5px] font-medium leading-relaxed ${
              checked ? "text-muted line-through" : "text-text"
            }`}
          >
            {etapa.texto}
          </span>
          {etapa.detalhe && (
            <span className="mt-1 block max-w-[62ch] text-[14.5px] leading-relaxed text-muted">
              {etapa.detalhe}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}
