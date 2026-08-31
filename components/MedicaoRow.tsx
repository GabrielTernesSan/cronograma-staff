"use client";

import { useApp } from "@/lib/app-context";
import type { Medicao } from "@/lib/types";

export function MedicaoRow({ medicao }: { medicao: Medicao }) {
  const { valorDe, temValor, setValor } = useApp();
  const preenchida = temValor(medicao.id);

  return (
    <div className="flex flex-col gap-1.5 px-2 py-2 sm:flex-row sm:items-center sm:gap-3">
      <label
        htmlFor={medicao.id}
        className="min-w-0 flex-1 text-sm leading-snug"
      >
        <span className={preenchida ? "text-muted" : "text-text"}>
          {medicao.label}
        </span>
        {preenchida && <span className="ml-2 text-xs text-ok">✓</span>}
      </label>
      <div className="flex shrink-0 items-center gap-2">
        <input
          id={medicao.id}
          type="text"
          // texto livre de propósito: "p50 120 / p99 480" vale tanto quanto um
          // número seco, e o ponto é registrar o que foi medido
          inputMode="text"
          autoComplete="off"
          value={valorDe(medicao.id)}
          onChange={(e) => setValor(medicao.id, e.target.value)}
          placeholder="—"
          data-preenchida={preenchida}
          className="medicao w-full sm:w-44"
          aria-label={medicao.label}
        />
        {medicao.unidade && (
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {medicao.unidade}
          </span>
        )}
      </div>
    </div>
  );
}
