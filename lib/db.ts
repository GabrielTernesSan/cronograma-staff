// só servidor: usa DATABASE_URL, nunca importar de componente client
import { neon } from "@neondatabase/serverless";
export const sql = neon(process.env.DATABASE_URL!);
let pronto: Promise<unknown> | null = null;
export const garantirTabela = () => pronto ??= sql`CREATE TABLE IF NOT EXISTS progresso (id text primary key, dados jsonb not null, atualizado_em timestamptz not null default now())`.catch(e => { pronto = null; throw e; });
