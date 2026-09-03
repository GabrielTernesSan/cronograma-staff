export type Medicao = {
  id: string;
  label: string;
  unidade?: string;
};

export type Etapa = {
  id: string;
  texto: string;
  detalhe?: string;
};

export type Leitura = {
  fonte: "fidelis" | "mukesh" | "outro";
  titulo: string;
  url?: string;
  // false = endereço não verificado. A UI mostra badge em vez de link morto.
  confirmado: boolean;
};

// O exercício isolado do assunto. Cada bloco tem o seu, montado do zero — o
// resumo aqui é a versão curta do que `roteiro/NN-*.md` descreve por inteiro.
export type Projeto = {
  nome: string;
  resumo: string;
  criterio: string;
};

export type Bloco = {
  id: string;
  numero: number;
  titulo: string;
  duracaoSemanas: [number, number];
  conceitos: string[];
  leituras: Leitura[];
  projeto: Projeto;
  // caminho do roteiro completo, ex. "roteiro/01-cache.md"
  roteiro: string;
  etapas: Etapa[];
  medicoes: Medicao[];
  // o que ele deve escrever com as próprias palavras ao fechar o bloco
  notaObsidian?: string;
  // recado de contexto do bloco (critério de aceite, entregável, insumo de outro)
  observacao?: string;
  pontesTrabalho?: string;
};

export type TaskKind = "arq" | "trabalho" | "ingles" | "cert" | "check" | "ia";

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
  year: 1 | 2 | 3;
  highlight?: "marco" | "decisao";
  highlightLabel?: string;
  // blocos que o trimestre carrega e conta na barra
  blocoIds: string[];
  // blocos do trimestre anterior que transbordam para cá — aparecem como
  // referência, sem recontar etapas que já são contadas no trimestre de origem
  transbordoIds?: string[];
  tasks: Task[];
  note?: string;
};

export type Trilha = {
  id: string;
  titulo: string;
  icon: string;
  regra: string;
  aviso?: string;
  // deriva o progresso dos marcos da grade com esse kind
  kind?: TaskKind;
  // itens próprios, para a trilha que não tem lugar nos trimestres
  itens?: Task[];
};
