"use client";

import { useEffect, useState } from "react";
import { blocos } from "@/lib/data/blocos";

const EXTRAS = [
  { id: "grade", label: "A grade", n: "T1–T10" },
  { id: "trilhas", label: "Trilhas", n: "//" },
];

/** Índice fixo da coluna esquerda. Marca a seção visível mais acima — o
 *  documento é longo e sem isso você perde o lugar. */
export function Rail() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const ids = [...blocos.map((b) => b.id), ...EXTRAS.map((e) => e.id)];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0 || !("IntersectionObserver" in window)) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        setCurrent(targets.find((t) => visible.has(t.id))?.id ?? null);
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const items = [
    ...blocos.map((b) => ({
      id: b.id,
      label: b.titulo,
      n: String(b.numero).padStart(2, "0"),
    })),
    ...EXTRAS,
  ];

  return (
    <nav className="no-print hidden lg:sticky lg:top-6 lg:block" aria-label="Seções">
      <p className="label mb-3.5">Índice</p>
      <ol>
        {items.map((it) => {
          const active = current === it.id;
          return (
            <li key={it.id} className="list-none">
              <a
                href={`#${it.id}`}
                aria-current={active ? "true" : undefined}
                className={`grid grid-cols-[2.6rem_1fr] gap-2 border-t border-line-soft py-1.5 font-display text-[13.5px] leading-tight transition-colors last:border-b ${
                  active
                    ? "font-semibold text-accent"
                    : "text-muted hover:text-text"
                }`}
              >
                <span className="pt-px font-mono text-[10.5px] tabular-nums">
                  {it.n}
                </span>
                <span>{it.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
