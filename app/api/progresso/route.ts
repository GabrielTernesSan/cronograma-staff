import { timingSafeEqual } from "node:crypto";
import { garantirTabela, sql } from "@/lib/db";
import { parse, quando, saved } from "@/lib/progresso";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const autorizado = (req: Request) => { const t = process.env.PROGRESSO_TOKEN, h = req.headers.get("authorization") ?? ""; if (!t || !h.startsWith("Bearer ")) return false; const a = Buffer.from(h.slice(7)), b = Buffer.from(t); return a.length === b.length && timingSafeEqual(a, b); };
export async function GET() { try { await garantirTabela(); const r = await sql`SELECT dados, atualizado_em FROM progresso WHERE id = 'default'`; return Response.json(r[0] ? { dados: r[0].dados, atualizadoEm: r[0].atualizado_em } : { dados: null }, { headers: { "cache-control": "no-store" } }); } catch { return Response.json({ erro: "falha ao ler" }, { status: 500 }); } }
export async function PUT(req: Request) {
  if (!autorizado(req)) return Response.json({ erro: "não autorizado" }, { status: 401 });
  let body: unknown; try { body = await req.json(); } catch { return Response.json({ erro: "JSON inválido" }, { status: 400 }); }
  const s = parse(body); if (!s) return Response.json({ erro: "falta a lista done" }, { status: 400 });
  try { await garantirTabela(); const dados = JSON.stringify(saved(s, quando(body) || undefined)); await sql`INSERT INTO progresso (id, dados) VALUES ('default', ${dados}::jsonb) ON CONFLICT (id) DO UPDATE SET dados = EXCLUDED.dados, atualizado_em = now()`; return Response.json({ ok: true }); } catch { return Response.json({ erro: "falha ao gravar" }, { status: 500 }); }
}
