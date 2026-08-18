"use client";

import { useApp } from "@/lib/app-context";
import type { Lesson } from "@/lib/types";

export function LessonRow({ lesson }: { lesson: Lesson }) {
  const { isDone, toggle } = useApp();
  const checked = isDone(lesson.id);
  const planned = lesson.status === "planned";

  return (
    <label
      className={`group flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface2 ${
        planned ? "opacity-65" : ""
      }`}
    >
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0"
        checked={checked}
        onChange={() => toggle(lesson.id)}
      />
      <span className="min-w-0 flex-1">
        <span
          className={`text-sm leading-snug ${
            checked ? "text-muted line-through" : "text-text"
          }`}
        >
          {lesson.title}
        </span>
        {planned && (
          <span className="ml-2 whitespace-nowrap rounded border border-warn/40 px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-warn">
            planejada
          </span>
        )}
      </span>
      <span className="mt-0.5 shrink-0 text-xs tabular-nums text-muted">
        {lesson.min}min
      </span>
    </label>
  );
}
