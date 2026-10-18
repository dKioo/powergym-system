import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verificarToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Devolve quem está logado (usado pela Sidebar para mostrar nome e perfil).
export async function GET() {
  const cookieStore = await cookies();
  const sessao = await verificarToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!sessao) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  return NextResponse.json({
    nome: sessao.nome,
    perfil: sessao.perfil,
  });
}