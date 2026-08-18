"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cronograma-staff:v1";

type Payload = {
  version: number;
  savedAt: string;
  done: string[];
};

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray((parsed as Payload).done)
    ) {
      return (parsed as Payload).done.filter((x) => typeof x === "string");
    }
  } catch {
    // storage corrompido ou bloqueado — começa do zero em vez de quebrar a página
  }
  return [];
}

function write(ids: Set<string>) {
  const payload: Payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    done: [...ids].sort(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota cheia ou modo restrito — a marcação continua valendo na sessão
  }
  return payload;
}

export function useProgress() {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  // `loaded` evita hydration mismatch: no primeiro render o servidor e o cliente
  // desenham a mesma coisa (nada marcado) e só depois o localStorage entra.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDone(new Set(read()));
    setLoaded(true);
  }, []);

  const commit = useCallback((next: Set<string>) => {
    setDone(next);
    write(next);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        write(next);
        return next;
      });
    },
    [],
  );

  const setMany = useCallback((ids: string[], value: boolean) => {
    setDone((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
      }
      write(next);
      return next;
    });
  }, []);

  const exportJson = useCallback(() => {
    const payload: Payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      done: [...done].sort(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
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
  }, [done]);

  const importJson = useCallback(
    async (file: File): Promise<{ ok: boolean; message: string }> => {
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        const ids = (parsed as Payload)?.done;
        if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
          return { ok: false, message: "Arquivo inválido: falta a lista `done`." };
        }
        commit(new Set(ids));
        return { ok: true, message: `${ids.length} itens importados.` };
      } catch {
        return { ok: false, message: "Não consegui ler esse arquivo como JSON." };
      }
    },
    [commit],
  );

  const reset = useCallback(() => {
    commit(new Set());
  }, [commit]);

  const isDone = useCallback((id: string) => done.has(id), [done]);

  return useMemo(
    () => ({ done, loaded, toggle, setMany, exportJson, importJson, reset, isDone }),
    [done, loaded, toggle, setMany, exportJson, importJson, reset, isDone],
  );
}

export type ProgressApi = ReturnType<typeof useProgress>;
