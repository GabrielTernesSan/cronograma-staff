import { allLessons, moduleById } from "./data/curso";
import { quarters } from "./data/cronograma";
import type { Quarter } from "./types";

export const lessonById = new Map(allLessons.map((l) => [l.id, l]));

export function quarterLessons(q: Quarter) {
  return q.moduleIds.flatMap((id) => moduleById.get(id)?.lessons ?? []);
}

export function quarterItemIds(q: Quarter): string[] {
  return [...quarterLessons(q).map((l) => l.id), ...q.tasks.map((t) => t.id)];
}

export const ALL_LESSON_IDS = allLessons.map((l) => l.id);
export const ALL_TASK_IDS = quarters.flatMap((q) => q.tasks.map((t) => t.id));
export const ALL_ITEM_IDS = [...ALL_LESSON_IDS, ...ALL_TASK_IDS];

export const TOTAL_LESSON_MINUTES = allLessons.reduce((s, l) => s + l.min, 0);
export const TOTAL_PLANNED = allLessons.filter(
  (l) => l.status === "planned",
).length;
export const TOTAL_READY = allLessons.length - TOTAL_PLANNED;

export function countDone(ids: string[], done: Set<string>) {
  let n = 0;
  for (const id of ids) if (done.has(id)) n++;
  return n;
}

export function minutesDone(done: Set<string>) {
  let m = 0;
  for (const id of done) {
    const l = lessonById.get(id);
    if (l) m += l.min;
  }
  return m;
}

export function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}
