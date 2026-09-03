// Um conceito com corpo. Tag solta ("stampede") não ensina nada — o que serve é
// o termo mais uma ou duas frases dizendo o que é e por que importa.
export type Conceito = {
  termo: string;
  definicao: string;
};

export type Medicao = {
  id: string;
  label: string;
  unidade?: string;
  // o que o número prova. Sem isso a medição vira burocracia.
  prova?: string;
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
  nota?: string;
};

// O exercício isolado do assunto, montado do zero.
export type Projeto = {
  nome: string;
  resumo: string;
  // qual pergunta o projeto responde sobre o conceito
  porque: string;
  entra: string;
  foraDe: string;
  criterio: string;
};

// Onde dois padrões certos não cabem juntos. Só o assunto de integração tem.
export type Conflito = {
  par: string;
  efeito: string;
};

export type Bloco = {
  id: string;
  numero: number;
  titulo: string;
  duracaoSemanas: [number, number];
  // parágrafos de abertura do assunto
  intro: string[];
  conceitos: Conceito[];
  conceitosTitulo?: string;
  leituras: Leitura[];
  // texto no lugar da lista, para o assunto que não tem leitura
  leiturasNota?: string;
  projeto: Projeto;
  // caminho do roteiro completo, ex. "roteiro/01-cache.md"
  roteiro: string;
  conflitos?: Conflito[];
  conflitosFecho?: string;
  etapas: Etapa[];
  medicoes: Medicao[];
  medicoesNota?: string;
  // o que ele deve escrever com as próprias palavras ao fechar o assunto
  notaObsidian?: string;
  // recado de contexto do assunto (critério de aceite, entregável, insumo de outro)
  observacao?: string;
  pontesTrabalho?: string;
  pontesTitulo?: string;
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
