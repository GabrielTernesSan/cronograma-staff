"use client";

import { useApp } from "@/lib/app-context";
import type { Task } from "@/lib/types";

export function TaskRow({ task }: { task: Task }) {
  const { isDone, toggle } = useApp();
  const checked = isDone(task.id);

  return (
    <div className="flex items-start gap-2.5 border-t border-line-soft py-2 first:border-t-0">
      <input
        type="checkbox"
        id={task.id}
        className="mt-[5px] size-4 shrink-0"
        checked={checked}
        onChange={() => toggle(task.id)}
      />
      <label
        htmlFor={task.id}
        className={`min-w-0 flex-1 cursor-pointer text-[15px] leading-snug ${
          checked ? "text-muted line-through" : "text-text"
        }`}
      >
        {task.text}
      </label>
      {task.url && (
        <a
          href={task.url}
          target="_blank"
          rel="noopener noreferrer"
          className="no-print mt-0.5 shrink-0 font-mono text-[11px] text-accent hover:underline"
        >
          abrir ↗
        </a>
      )}
    </div>
  );
}
