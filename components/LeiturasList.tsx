import type { Leitura } from "@/lib/types";

const FONTE_LABEL: Record<Leitura["fonte"], string> = {
  fidelis: "Fidelis",
  mukesh: "Mukesh",
  outro: "Leitura",
};

export function LeiturasList({ leituras }: { leituras: Leitura[] }) {
  if (leituras.length === 0) return null;

  return (
    <ul>
      {leituras.map((l, i) => (
        <li
          key={i}
          className="list-none border-t border-line-soft py-2.5 first:border-t-0 first:pt-0"
        >
          <span className="mb-0.5 block font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
            {FONTE_LABEL[l.fonte]}
          </span>
          <span className="text-[15.5px] leading-snug">
            {l.url ? (
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                {l.titulo} ↗
              </a>
            ) : (
              <span className="font-medium">{l.titulo}</span>
            )}
            {!l.confirmado && (
              <span className="ml-1.5 whitespace-nowrap border border-warn px-1.5 py-px font-mono text-[10.5px] uppercase tracking-wider text-warn">
                procurar no blog
              </span>
            )}
          </span>
          {l.nota && (
            <span className="mt-0.5 block max-w-[52ch] text-[14.5px] leading-relaxed text-muted">
              {l.nota}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
