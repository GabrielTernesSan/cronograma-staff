"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cronograma-staff:v2";

export type Valores = Record<string, string>;

type Payload = {
  version: number;
  savedAt: string;
  done: string[];
  valores: Valores;
};

// `done` e `valores` vivem no mesmo estado porque toda escrita persiste os dois
// juntos. Separá-los obrigaria a encadear setState dentro de setState.
type State = { done: Set<string>; valores: Valores };

const EMPTY: State = { done: new Set(), valores: {} };

function parseValores(raw: unknown): Valores {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};
  const out: Valores = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim() !== "") out[k] = v;
  }
  return out;
}

function parseState(parsed: unknown): State | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const p = parsed as Partial<Payload>;
  if (!Array.isArray(p.done)) return null;
  return {
    done: new Set(p.done.filter((x) => typeof x === "string")),
    // export v1 não tinha `valores` — aceitar sem quebrar
    valores: parseValores(p.valores),
  };
}

function payloadOf(s: State): Payload {
  return {
    version: 2,
    savedAt: new Date().toISOString(),
    done: [...s.done].sort(),
    valores: s.valores,
  };
}

function read(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = parseState(JSON.parse(raw));
      if (s) return s;
    }
  } catch {
    // storage corrompido ou bloqueado — começa do zero em vez de quebrar a página
  }
  return EMPTY;
}

function write(s: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payloadOf(s)));
  } catch {
    // quota cheia ou modo restrito — a marcação continua valendo na sessão
  }
  return s;
}

export function useProgress() {
  const [state, setState] = useState<State>(EMPTY);
  // `loaded` evita hydration mismatch: no primeiro render o servidor e o cliente
  // desenham a mesma coisa (nada marcado) e só depois o localStorage entra.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(read());
    setLoaded(true);
  }, []);

  const commit = useCallback((next: State) => {
    setState(write(next));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setState((prev) => {
        const done = new Set(prev.done);
        if (done.has(id)) done.delete(id);
        else done.add(id);
        return write({ ...prev, done });
      });
    },
    [],
  );

  const setMany = useCallback((ids: string[], value: boolean) => {
    setState((prev) => {
      const done = new Set(prev.done);
      for (const id of ids) {
        if (value) done.add(id);
        else done.delete(id);
      }
      return write({ ...prev, done });
    });
  }, []);

  // Valor vazio remove a chave: "medição preenchida" vira só `id in valores`,
  // sem precisar testar string vazia em cada contador.
  const setValor = useCallback((id: string, value: string) => {
    setState((prev) => {
      const valores = { ...prev.valores };
      if (value.trim() === "") delete valores[id];
      else valores[id] = value;
      return write({ ...prev, valores });
    });
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(payloadOf(state), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progresso-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJson = useCallback(
    async (file: File): Promise<{ ok: boolean; message: string }> => {
      try {
        const next = parseState(JSON.parse(await file.text()));
        if (!next) {
          return {
            ok: false,
            message: "Arquivo inválido: falta a lista `done`.",
          };
        }
        commit(next);
        const n = Object.keys(next.valores).length;
        return {
          ok: true,
          message: `${next.done.size} itens e ${n} medições importados.`,
        };
      } catch {
        return { ok: false, message: "Não consegui ler esse arquivo como JSON." };
      }
    },
    [commit],
  );

  const reset = useCallback(() => {
    commit({ done: new Set(), valores: {} });
  }, [commit]);

  const { done, valores } = state;

  const isDone = useCallback((id: string) => done.has(id), [done]);
  const valorDe = useCallback((id: string) => valores[id] ?? "", [valores]);
  const temValor = useCallback((id: string) => id in valores, [valores]);

  return useMemo(
    () => ({
      done,
      valores,
      loaded,
      toggle,
      setMany,
      setValor,
      exportJson,
      importJson,
      reset,
      isDone,
      valorDe,
      temValor,
    }),
    [
      done,
      valores,
      loaded,
      toggle,
      setMany,
      setValor,
      exportJson,
      importJson,
      reset,
      isDone,
      valorDe,
      temValor,
    ],
  );
}

export type ProgressApi = ReturnType<typeof useProgress>;
