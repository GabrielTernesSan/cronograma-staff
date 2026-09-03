"use client";

import { useApp } from "@/lib/app-context";
import type { Medicao } from "@/lib/types";

/** Uma linha da tabela de medições: o que medir, o que o número prova, e o
 *  campo onde o número entra. As três colunas juntas são o argumento de que
 *  medição não é burocracia. */
export function MedicaoRow({ medicao }: { medicao: Medicao }) {
  const { valorDe, temValor, setValor } = useApp();
  const preenchida = temValor(medicao.id);

  return (
    <tr>
      <td className="!pl-6">
        <label
          htmlFor={medicao.id}
          className={`block max-w-[30ch] cursor-pointer text-[15px] leading-snug ${
            preenchida ? "text-muted" : "text-text"
          }`}
        >
          {medicao.label}
        </label>
        {medicao.unidade && (
          <span className="mt-1 inline-block bg-measure/10 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-measure">
            {medicao.unidade}
          </span>
        )}
      </td>
      <td className="max-w-[34ch] text-[14.5px] leading-snug text-muted">
        {medicao.prova}
      </td>
      <td className="!pr-6">
        <input
          id={medicao.id}
          type="text"
          // texto livre de propósito: "p50 120 / p99 480" vale tanto quanto um
          // número seco, e o ponto é registrar o que foi medido
          inputMode="text"
          autoComplete="off"
          value={valorDe(medicao.id)}
          onChange={(e) => setValor(medicao.id, e.target.value)}
          placeholder="anotar"
          data-preenchida={preenchida}
          className="medicao w-full min-w-[8rem]"
          aria-label={medicao.label}
        />
      </td>
    </tr>
  );
}
