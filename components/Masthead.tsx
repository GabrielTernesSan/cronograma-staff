"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { blocos } from "@/lib/data/blocos";
import {
  ALL_ETAPA_IDS,
  ALL_MEDICAO_IDS,
  ALL_TASK_IDS,
  blocosConcluidos,
  countDone,
  countPreenchidas,
  pct,
} from "@/lib/stats";

export function Masthead() {
  const {
    done,
    valores,
    loaded,
    exportJson,
    importJson,
    reset,
    filters,
    setFilters,
  } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const etapasDone = countDone(ALL_ETAPA_IDS, done);
  const medicoesDone = countPreenchidas(ALL_MEDICAO_IDS, valores);
  const tasksDone = countDone(ALL_TASK_IDS, done);
  const nBlocos = blocosConcluidos(done, valores);

  // A porcentagem mede o estudo: etapas + medições. As trilhas paralelas não
  // competem com os assuntos nesse número.
  const percent = pct(
    etapasDone + medicoesDone,
    ALL_ETAPA_IDS.length + ALL_MEDICAO_IDS.length,
  );

  return (
    <header className="mb-10 border-b-2 border-text pb-5 pt-12">
      <p className="label mb-4">
        set/2026 — fev/2029 · .NET · arquitetura · staff
      </p>

      <h1 className="max-w-[16ch] text-[clamp(2.1rem,6vw,3.6rem)] font-bold leading-[1.08] tracking-tight">
        Sete assuntos e um sistema
      </h1>

      <p className="mt-4 max-w-[62ch] text-[19px]">
        Para cada assunto: <strong className="font-semibold">o que ler</strong>,{" "}
        <strong className="font-semibold">
          os conceitos que a leitura tem que deixar claros
        </strong>
        , e{" "}
        <strong className="font-semibold">um projetinho isolado</strong> para
        revisar aquele conceito na prática. No fim,{" "}
        <strong className="font-semibold">um oitavo projeto</strong> onde os
        sete se encontram — e se contradizem.
      </p>

      <dl className="mt-6 flex flex-wrap gap-x-7 gap-y-2 font-mono text-xs tabular-nums text-muted">
        <Stat label="assuntos" value={`${nBlocos}/${blocos.length}`} />
        <Stat label="etapas" value={`${etapasDone}/${ALL_ETAPA_IDS.length}`} />
        <Stat
          label="medições"
          value={`${medicoesDone}/${ALL_MEDICAO_IDS.length}`}
          destaque
        />
        <Stat label="marcos" value={`${tasksDone}/${ALL_TASK_IDS.length}`} />
        <Stat label="do estudo" value={`${loaded ? percent : 0}%`} />
      </dl>

      <div className="no-print mt-5 flex flex-wrap items-center gap-2">
        <Btn
          active={filters.onlyPending}
          onClick={() =>
            setFilters((f) => ({ ...f, onlyPending: !f.onlyPending }))
          }
        >
          só pendentes
        </Btn>

        <span className="mx-1 h-4 w-px bg-line" />

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
            <Btn
              danger
              onClick={() => {
                reset();
                setConfirmReset(false);
              }}
            >
              confirmar zerar
            </Btn>
            <Btn onClick={() => setConfirmReset(false)}>cancelar</Btn>
          </>
        ) : (
          <Btn onClick={() => setConfirmReset(true)}>zerar</Btn>
        )}

        {msg && <span className="font-mono text-[11px] text-accent">{msg}</span>}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  destaque,
}: {
  label: string;
  value: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="uppercase tracking-wider">{label}</dt>
      <dd
        className={`font-semibold ${destaque ? "text-measure" : "text-text"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Btn({
  children,
  onClick,
  danger,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-2.5 py-1 font-mono text-[11px] transition-colors ${
        danger
          ? "border-warn text-warn hover:bg-warn/10"
          : active
            ? "border-accent bg-accent/10 text-accent"
            : "border-line text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}
