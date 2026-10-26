export type Pilar = "arquitetura" | "ia" | "cloud" | "ingles" | "carreira";

export type Activity = { id: string; texto: string };
export type Evidence = { id: string; label: string; prova: string };

export type Laboratorio = {
  id: string;
  mes: number;
  titulo: string;
  fase: string;
  tipo: "laboratorio" | "projeto-integrador";
  pilares: Pilar[];
  problema: string;
  contexto: string;
  objetivo: string;
  preRequisitos: string[];
  requisitosFuncionais: string[];
  requisitosNaoFuncionais: string[];
  tecnologias: string[];
  alternativas: string[];
  atividades: Activity[];
  usoIa: string;
  validacaoIa: string;
  criterios: string[];
  evidencias: Evidence[];
  entregaveis: string[];
};

export type Material = { id: string; tipo: "curso" | "livro" | "hábito" | "teste" | "opcional"; titulo: string; descricao: string; url?: string };
export type Marco = { id: string; texto: string; pilar: Pilar | "geral" };
export type Trimestre = { id: string; rotulo: string; periodo: string; tema: string; meses: number[]; marco?: string; dependencias: string; marcos: Marco[] };
export type Destino = { pais: string; via: string; minimo: string; pros: string; contras: string };
