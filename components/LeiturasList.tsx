import type { Leitura } from "@/lib/types";

const FONTE_LABEL: Record<Leitura["fonte"], string> = {
  fidelis: "Fidelis",
  mukesh: "Mukesh",
  outro: "Leitura",
};

export function LeiturasList({ leituras }: { leituras: Leitura[] }) {
  if (leituras.length === 0) return null;

  return (
    <ul className="space-y-1">
      {leituras.map((l, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
            {FONTE_LABEL[l.fonte]}
          </span>
          {l.url ? (
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 text-accent hover:underline"
            >
              {l.titulo} ↗
            </a>
          ) : (
            <span className="min-w-0">{l.titulo}</span>
          )}
          {!l.confirmado && (
            <span className="whitespace-nowrap rounded border border-warn/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warn">
              link não confirmado
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
