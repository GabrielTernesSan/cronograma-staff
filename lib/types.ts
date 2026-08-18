export type LessonStatus = "ready" | "planned";

export type Lesson = {
  id: string;
  title: string;
  min: number;
  status: LessonStatus;
};

export type Module = {
  id: string;
  num: number;
  title: string;
  short: string;
  lessons: Lesson[];
};

export type TaskKind = "arq" | "estudo" | "trabalho" | "ingles" | "cert" | "check";

export type Task = {
  id: string;
  text: string;
  url?: string;
  kind: TaskKind;
};

export type Quarter = {
  id: string;
  label: string;
  period: string;
  theme: string;
  year: 1 | 2;
  highlight?: "marco" | "decisao";
  moduleIds: string[];
  tasks: Task[];
  note?: string;
};
