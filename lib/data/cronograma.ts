import { addDias, addMeses, fmtMesAno, paraData } from "../datas";
import type { Destino, Marco, Material, Pilar, Trimestre } from "../types";

// Início adiado de 01/11 (viagem a trabalho); começa em 09/11 com dois dias extras (seg e ter). Mudar aqui recalcula todas as datas.
export const INICIO = "2026-11-09";
// Tarefa maior que isso vira sessões; casa com as partes de 30 min da grade semanal.
export const SESSAO_MIN = 30;
// Quantos meses de calendário dura cada mês do plano. Nos meses 1–6 os cursos (Branas e Alura) ocupam 4h da semana
// até ~ago/2027 e a prática anda devagar; esses meses foram esticados até onde a projeção da fila (feita em nov/2026) os fecha.
// Do mês 7 em diante é 1 mês de calendário cada e a projeção fica à frente da meta: adiantar é lucro.
// O mês 36 passou de nov/2029 para mai/2030. Os ids não dependem disso: mudar aqui só mexe nas datas.
const DURACAO_CALENDARIO = [4, 2, 3, 1, 1, 1];
const mesesAte = (n: number) => Array.from({ length: n }, (_, i) => DURACAO_CALENDARIO[i] ?? 1).reduce((s, x) => s + x, 0);
/** Primeiro e último dia do mês n do plano (mês 1 = 09/11/2026 a 08/03/2027). */
export const inicioMes = (n: number) => addMeses(INICIO, mesesAte(n - 1));
export const fimMes = (n: number) => addDias(addMeses(INICIO, mesesAte(n)), -1);
export const periodo = (deMes: number, ateMes: number) => `${fmtMesAno(inicioMes(deMes))} – ${fmtMesAno(fimMes(ateMes))}`;

export const PILARES: Record<Pilar, { titulo: string; cor: string }> = {
  arquitetura: { titulo: "Arquitetura", cor: "text-accent" },
  ia: { titulo: "IA Engineering", cor: "text-measure" },
  cloud: { titulo: "Cloud", cor: "text-ok" },
  ingles: { titulo: "Inglês", cor: "text-decisao" },
  carreira: { titulo: "Carreira & mudança", cor: "text-warn" },
};

export const ROTA = [
  { codigo: "GRU", quando: "hoje", texto: "trabalhando no Brasil" },
  { codigo: "REMOTO", quando: "mês 24", texto: "contrato em USD/EUR" },
  { codigo: "EU", quando: "mês 36", texto: "Blue Card ou Tech Visa" },
] as const;

// dow: dia da semana do JS (0 = domingo). A semana começa na quarta e fecha no domingo.
// Cada dia é dividido em partes com horas próprias, para marcar o dia pela metade.
// fonte diz de onde o painel Hoje puxa as tarefas da trilha para a parte:
// curso = próximo módulo da fila de cursos (Branas/Alura), de qualquer pilar; sem curso pendente, volta ao pilar da parte.
// teoria/pratica = do pilar; tudo = qualquer tarefa do pilar; lab = laboratório; fixo = só o texto.
export type Fonte = "curso" | "teoria" | "pratica" | "tudo" | "lab" | "fixo";
// tambem: outro pilar aceito na parte (a carreira usa o domingo enquanto a hora da quinta vai para os cursos).
export type Parte = { horas: number; texto: string; pilar?: Pilar; tambem?: Pilar; fonte: Fonte };
const dia = (dia: string, dow: number, pilares: Pilar[], partes: Parte[]) => ({ dia, dow, pilares, partes, horas: partes.reduce((t, p) => t + p.horas, 0) });
export const SEMANA = [
  dia("qua", 3, ["ia"], [{ horas: 1, texto: "Curso: próximo módulo da fila (Branas/Alura); sem curso, teoria de IA", pilar: "ia", fonte: "curso" }]),
  dia("qui", 4, ["ingles", "carreira"], [{ horas: 0.5, texto: "Listening: podcast ou palestra técnica em inglês", pilar: "ingles", fonte: "fixo" }, { horas: 1, texto: "Curso: próximo módulo da fila (Branas/Alura); quando os cursos acabarem, carreira: portfólio, LinkedIn, entrevistas e documentos", pilar: "carreira", fonte: "curso" }]),
  dia("sex", 5, ["cloud"], [{ horas: 1, texto: "Curso: próximo módulo da fila (Branas/Alura); sem curso, teoria de cloud", pilar: "cloud", fonte: "curso" }, { horas: 0.5, texto: "Prática do assunto de cloud do mês", pilar: "cloud", fonte: "pratica" }]),
  dia("sáb", 6, ["arquitetura"], [{ horas: 1, texto: "Curso: próximo módulo da fila (Branas/Alura); sem curso, teoria de arquitetura", pilar: "arquitetura", fonte: "curso" }, { horas: 1, texto: "Laboratório do mês e prática de arquitetura", pilar: "arquitetura", fonte: "lab" }]),
  dia("dom", 0, ["ingles", "ia"], [{ horas: 1, texto: "Inglês e carreira: leitura e escrita técnica em inglês (ler um artigo da trilha e resumir em inglês), portfólio, LinkedIn e documentos", pilar: "ingles", tambem: "carreira", fonte: "tudo" }, { horas: 0.5, texto: "Laboratório: prática do assunto de IA do mês", pilar: "ia", fonte: "pratica" }, { horas: 0.5, texto: "Fechar a semana e planejar a próxima", fonte: "fixo" }]),
];
export type DiaSemana = (typeof SEMANA)[number];

// Dias de estudo fora da grade, por data (exceções pontuais). Contam na fila, na grade da semana e na ofensiva.
export const DIAS_EXTRAS: Record<string, DiaSemana> = {
  "2026-11-09": dia("seg", 1, ["arquitetura", "ia"], [{ horas: 1, texto: "Extra · Curso: próximo módulo da fila (Branas/Alura)", pilar: "arquitetura", fonte: "curso" }, { horas: 1, texto: "Extra · Curso: próximo módulo da fila (Branas/Alura)", pilar: "ia", fonte: "curso" }]),
  "2026-11-10": dia("ter", 2, ["cloud", "arquitetura"], [{ horas: 1, texto: "Extra · Curso: próximo módulo da fila (Branas/Alura)", pilar: "cloud", fonte: "curso" }, { horas: 1, texto: "Extra · Curso: próximo módulo da fila (Branas/Alura)", pilar: "arquitetura", fonte: "curso" }]),
};
/** Dia de estudo de uma data: exceção do dia, senão a grade semanal; undefined em dia livre. */
export const diaDeEstudo = (iso: string): DiaSemana | undefined => DIAS_EXTRAS[iso] ?? SEMANA.find(d => d.dow === paraData(iso).getDay());
/** Dias de estudo da semana que começa na segunda segIso, em ordem (seg → dom). */
export const diasDaSemana = (segIso: string) => Array.from({ length: 7 }, (_, i) => diaDeEstudo(addDias(segIso, i))).filter((d): d is DiaSemana => !!d);
export const META_SEMANA = 6; // horas marcadas para a semana contar na ofensiva
export const DURACAO_MESES = 36;
export const RITMO_NOTA = "8h por semana, de quarta a domingo: 1h na quarta (dia de academia), 1h30 na quinta e na sexta e 2h no sábado e no domingo; segunda e terça ficam livres. Os cursos (Branas e Alura) têm fila própria: a primeira hora de quarta, quinta, sexta e sábado vai para o próximo módulo, sem esperar o mês do assunto; a carreira divide com o inglês a hora de leitura do domingo e volta para a quinta quando os cursos acabarem. Os artigos dos assuntos técnicos são aprofundamento opcional. O inglês começa sem conversação (listening, leitura e escrita, que dá para fazer sozinho); quando houver aula ou parceiro, os 30 min de listening da quinta viram conversação. Dia perdido não é reposto: a próxima sessão começa da tarefa pendente seguinte, e o cronograma inteiro anda junto; o que ficou sem marcar aparece em “ficou pra trás”, onde dá para marcar o dia original quando repor. A semana conta na ofensiva com 6h ou mais marcadas. No ano 2, durante a busca de vaga (meses 19–24), a sexta de cloud pode virar treino de entrevista.";

export const MERCADO_DADOS = [
  "IA virou requisito básico: aparece em 42% das descrições de vaga de software em 2026, contra 8% em 2022.",
  "O mercado sênior se dividiu. Generalista full-stack sênior enfrenta buscas longas; especialista em infraestrutura e plataforma de IA continua escasso.",
  "Fora dos laboratórios de fronteira, quase ninguém treina modelo base. O trabalho está em avaliações, recuperação (RAG), agentes, observabilidade e custo.",
  "Quem contrata quer ver um produto pequeno entregue de ponta a ponta, medido contra uma baseline, com escolhas de modelo, custo e arquitetura defendidas. Evals são tratados como os testes unitários da IA.",
  "Plataforma, DevOps e segurança ganharam demanda com a IA; contratação de júnior encolheu.",
];
export const MERCADO_LEITURA = [
  "O trabalho do sênior sai de escrever código para especificar, delegar a agentes, verificar e assinar embaixo. Quem define critério de aceite e eval vale mais do que quem digita rápido.",
  "Com menos júniores sendo formados, sêniores de verdade ficam mais raros em 2028–2029. Isso favorece quem chegar lá com evidência pública.",
  "Empresas europeias tradicionais (banco, seguro, indústria, governo) rodam muito .NET e Azure e precisam pôr IA em produção com auditoria e AI Act. É um nicho bom para esse perfil e menos disputado que AI engineer de startup americana.",
  "Título-alvo: Senior Software Engineer (AI Platform) ou Senior Backend Engineer (.NET, Azure, LLM). Arquiteto vem depois, já lá fora.",
];
export const MERCADO_FONTES = [
  ["CoderCops — Software engineer job market 2026", "https://blog.codercops.com/blog/software-engineer-job-market-2026-data"],
  ["KORE1 — Senior SWE glut and AI infra drought", "https://kore1.com/senior-swe-glut-ai-infra-drought-2026/"],
  ["Hiring AI engineers in 2026", "https://www.callmissed.com/blog/hiring-ai-engineers-2026"],
  ["How to get an AI engineer job in 2026", "https://www.louisbouchard.ai/what-i-look-for-when-hiring-ai-engineers/"],
  ["Embaixada da Alemanha — EU Blue Card 2026", "https://www.germany.info/resource/blob/2435484/ffe411670fb3aa496edfb1a77e7136f2/eu-blue-card-data.pdf"],
  ["Kroes Advocaten — Highly skilled migrant 2026", "https://www.kroesadvocaten.nl/en/highly-skilled-migrant-salary-threshold-2026/"],
] as const;

export const DESTINOS: Destino[] = [
  { pais: "Alemanha", via: "EU Blue Card (TI)", minimo: "€45.934/ano", pros: "Aceita 3+ anos de experiência em TI nos últimos 7 sem diploma; Berlim funciona em inglês", contras: "Alemão pesa fora de Berlim; burocracia" },
  { pais: "Holanda", via: "Highly Skilled Migrant", minimo: "€5.942/mês (30+)", pros: "Processo rápido via empresa patrocinadora; muito inglês", contras: "Moradia cara e difícil" },
  { pais: "Portugal", via: "Tech Visa / procura de trabalho", minimo: "—", pros: "Idioma, comunidade brasileira grande, porta para a UE", contras: "Salários baixos; regras para CPLP apertaram em 2026" },
  { pais: "Plano B", via: "Remoto do Brasil", minimo: "—", pros: "Moeda forte sem mudar; vira reserva", contras: "Não resolve a saída; atenção a impostos PJ" },
];
export const DESTINOS_NOTA = "Mínimos brutos de 2026 exigidos para o visto. Sobem todo janeiro; o laboratório M25 manda conferir de novo nas fontes oficiais.";

export const materiais: Material[] = [
  { id: "material-arq", tipo: "curso", titulo: "Formação em Arquitetura de Software — Rodrigo Branas", descricao: "Os 12 módulos entram como vídeo dentro dos assuntos da trilha, com a duração das aulas (lib/data/cursos.ts). Testes e CI vêm antes, nos meses 2 e 4, porque o harness precisa deles; SOLID entra no mês 7, hexagonal e Clean no 8, microservices nos meses 11 e 13, DDD no 23, design patterns nos meses 24–25, frontend no 26 e refactoring no 28.", url: "https://www.branas.io/formacoes/arquitetura-de-software" },
  { id: "material-ia", tipo: "curso", titulo: "Formação em Inteligência Artificial — Rodrigo Branas", descricao: "Os 12 módulos entram como vídeo dentro dos assuntos da trilha (lib/data/cursos.ts). Spec-driven, context engineering e rules no mês 1, harness e skills no 2, agentes e MCP no 3, LLMs no 6 e RAG no 10; Second Brain, OpenClaw e Hermes ficam para a folga do ano 3. A página pública não dá a duração dos módulos: cada um conta 3h até ser conferido.", url: "https://www.branas.io/formacoes/inteligencia-artificial" },
  { id: "material-fidelis", tipo: "livro", titulo: "System Design — Matheus Fidelis", descricao: "Leitura contínua a partir do mês 7 e base para as entrevistas de system design do ano 2. Cobre rede, storage, CAP/PACELC, dados, cache, mensageria, escala, resiliência, observabilidade e capacidade.", url: "https://fidelissauro.dev/system-design-sumario/" },
  { id: "material-richards-ford", tipo: "livro", titulo: "Fundamentals of Software Architecture — Mark Richards e Neal Ford", descricao: "Leitura contínua a partir do mês 1, junto com o assunto Fundamentos de arquitetura. Base de características arquiteturais, estilos, modularidade e trade-offs; volte aos capítulos de cada estilo quando ele aparecer na trilha.", url: "https://fundamentalsofsoftwarearchitecture.com/" },
  { id: "material-akita", tipo: "livro", titulo: "Competente o Suficiente — Fabio Akita", descricao: "Livro gratuito (EPUB e PDF, em português e inglês) de 2026 sobre IA na prática, montado a partir dos posts do blog: o que é, se funciona, como ler benchmarks, riscos de dar acesso a agentes e o impacto no emprego. Ler em paralelo nos meses 1–6; a Parte V entra no M12. Os posts do blog aparecem como leituras nos assuntos de agentes, benchmarks e segurança.", url: "https://ailair.akitaonrails.com/book/" },
  { id: "material-ingles", tipo: "hábito", titulo: "Inglês falado e escrito", descricao: "1h30 por semana com horário próprio: 30 min de listening na quinta e 1h de leitura e escrita no domingo, mais READMEs, ADRs e posts em inglês. Conversação entra quando houver professor ou parceiro (o listening da quinta vira conversa). Meta B2+ no mês 10, C1 em entrevista no ano 3." },
  { id: "material-nivel", tipo: "teste", titulo: "Teste de nível de inglês", descricao: "EF SET ou equivalente no mês 1, no mês 11 e no ano 3. A nota entra como evidência; não depende de impressão." },
  { id: "material-az", tipo: "opcional", titulo: "Certificações Azure", descricao: "AZ-104 ou AZ-305 são opcionais após prática suficiente; ajudam a passar filtro de RH na Europa, mas não substituem projeto, decisão, operação ou evidência." },
  { id: "material-revenue", tipo: "opcional", titulo: "Revenue Architecture — Jacco van der Kooij", descricao: "Saiu do caminho principal: é material de receita e go-to-market e não pesa em entrevista sênior de engenharia. Fica como leitura livre." },
];

const base = (n: number): Marco[] => [
  { id: `t${n}-decisao`, texto: "Registrar decisões, trade-offs e evidências do trimestre.", pilar: "geral" },
  { id: `t${n}-ingles`, texto: "Publicar em inglês o resumo do trimestre (README, post ou vídeo).", pilar: "ingles" },
];
const trimestre = (n: number, tema: string, dependencias: string, marco?: string, extra: string[] = []): Trimestre => ({
  id: `t${n}`, rotulo: `T${n}`, periodo: `meses ${(n - 1) * 3 + 1}–${n * 3}`, tema, meses: [(n - 1) * 3 + 1, (n - 1) * 3 + 2, n * 3], marco, dependencias,
  marcos: [...base(n), ...extra.map((texto, i) => ({ id: `t${n}-x${i + 1}`, texto, pilar: "carreira" as const }))],
});
export const trimestres = [
  trimestre(1, "Harness: instruções, skills e ferramentas", "Nenhuma: começa em um repositório real do time.", undefined, ["Teste de nível de inglês feito e nota registrada.", "Repositório público criado com README em inglês."]),
  trimestre(2, "Harness: evals, segurança e custo", "Usa instruções, skills e conectores do T1.", undefined, ["LinkedIn e GitHub em inglês com título-alvo definido."]),
  trimestre(3, "PoC: especificação, Clean Architecture e cloud", "Aplica o harness do primeiro semestre.", undefined, ["6 histórias STAR em inglês com números reais."]),
  trimestre(4, "RAG, escala e Integrador I", "Consolida o ano.", "Marco ano 1", ["Inglês B2+ comprovado em teste.", "5 candidaturas remotas de calibragem com perguntas anotadas."]),
  trimestre(5, "Sistemas distribuídos e plataforma", "Parte do Integrador I."),
  trimestre(6, "Plataforma de IA e Integrador II", "Requer evals, observabilidade e segurança.", undefined, ["Um PR aceito em projeto open source de IA ou .NET."]),
  trimestre(7, "Entrevistas e busca ativa", "Usa portfólio e integradores.", undefined, ["Pipeline com 3 a 5 candidaturas qualificadas por semana."]),
  trimestre(8, "Contrato remoto e preparação da saída", "Depende de processo seletivo em andamento.", "Marco ano 2 · contrato remoto", ["Contrato remoto internacional assinado.", "Reserva para 12 meses do destino em andamento."]),
  trimestre(9, "Visto, governança e idioma", "Usa documentos e destino do T8."),
  trimestre(10, "Legado, comunicação e oferta", "Processos com relocation em andamento.", undefined, ["Oferta com visto assinada."]),
  trimestre(11, "Modelos abertos, visto e saída fiscal", "Depende da oferta do T10.", undefined, ["Visto aprovado."]),
  trimestre(12, "Chegada e próximo nível", "Mudança concluída.", "Marco ano 3 · mudança", ["Morando fora com visto de trabalho."]),
];
