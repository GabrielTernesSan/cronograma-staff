# Assunto 0 — Fundação

**1 semana · T1 (set–nov/2026)**

Este é o único assunto sem conceito de arquitetura. Ele existe para tirar a ferrugem:
subir uma API .NET moderna do zero, com banco, sem copiar de projeto antigo.

Se você já faz isso de olhos fechados no trabalho, faça mesmo assim — mas em uma
semana, não mais. O ganho aqui é confirmar que o `dotnet new` até o `docker compose up`
é caminho conhecido, porque os seis assuntos seguintes começam todos por ele.

## Os conceitos

Nenhum novo. O que se pratica é o ferramental:

- **Minimal API vs Controllers** — qual você escolhe e por quê, não qual é melhor.
- **EF Core migrations** — o ciclo `Add-Migration` / `Update-Database` sem consultar.
- **Docker Compose** — subir aplicação e banco juntos com um comando.
- **Configuração e secrets** — connection string fora do código, desde o primeiro dia.

## O que ler

Nada. Este assunto é execução.

Se travar em alguma peça, procure no [blog do Mukesh](https://codewithmukesh.com/blog/)
o artigo específico daquela peça — mas procurar já é o custo, não estude por antecipação.

## O projetinho

### `precos-api`

Uma API que guarda cotações de commodity e as devolve por período.

### Por que este projeto

É o esqueleto mais barato que exercita as quatro peças que todos os outros projetinhos
vão precisar: HTTP, banco relacional, um job que roda sozinho, e tudo isso em containers.

O domínio (cotação de commodity) foi escolhido porque é próximo do seu trabalho e não
exige inventar regra de negócio. Se preferir outro domínio, troque — o domínio não
importa neste assunto.

### Escopo

**Entra:** um agregado (`Cotacao`: commodity, data, preço, fonte), um endpoint de
consulta, um job agendado que busca de uma API pública e grava, `docker compose` com
Postgres.

**Fica de fora:** autenticação, testes, validação elaborada, camadas, CQRS,
tratamento de erro sofisticado, front-end. **Feio é aceitável aqui.** Se você está
pensando em arquitetura limpa nesta semana, está no assunto errado — ela não é o
objeto de estudo de nenhum dos sete.

### Passo a passo

1. **API .NET 10 + PostgreSQL + EF Core rodando.** `docker compose up` sobe aplicação
   e banco; a migration cria a tabela sozinha na subida.
2. **Job agendado que busca cotação de commodity numa API pública e grava.** Um
   `BackgroundService` com `PeriodicTimer` basta. Se a API pública exigir chave, use
   uma fonte que não exija — não gaste a semana em cadastro.
3. **Endpoint de consulta por commodity e período.** `GET /cotacoes?commodity=soja&de=…&ate=…`.

### O que medir

Nada. Este é o único assunto sem medição — não há conceito para provar, só ferramenta
para destravar.

### Terminei quando

`docker compose up` numa máquina limpa sobe tudo, o job grava sozinho em alguns
minutos, e o endpoint devolve o que foi gravado. Sem passo manual entre um e outro.

## A nota que fica

Não escreva nota conceitual aqui. Escreva a **lista de coisas em que você travou** e
quanto tempo cada uma custou — o `docker compose`, a connection string, a migration.
Essa lista é a sua linha de base de ferramental e vale reler antes do assunto 1.
