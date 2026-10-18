import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Sempre buscar dados atualizados do banco
export const dynamic = "force-dynamic";

// ── GET /api/treinos ─────────────────────────────────────────────────────────
// Retorna as rotinas já com seus dias e exercícios:
// [{ id, slug, nome, descricao, dias: [{ ..., exercicios: [...] }] }]
export async function GET() {
  try {
    const [rotinas] = (await db.query(
      "SELECT id, slug, nome, descricao FROM rotinas ORDER BY ordem"
    )) as any;

    const [dias] = (await db.query(
      `SELECT id, rotina_id, dia_semana, nome, tipo
       FROM rotina_dias
       ORDER BY rotina_id, dia_semana`
    )) as any;

    const [exercicios] = (await db.query(
      `SELECT id, dia_id, ordem, nome, grupo_muscular, series, repeticoes
       FROM rotina_exercicios
       ORDER BY dia_id, ordem`
    )) as any;

    const resultado = rotinas.map((rotina: any) => ({
      ...rotina,
      dias: dias
        .filter((dia: any) => dia.rotina_id === rotina.id)
        .map((dia: any) => ({
          ...dia,
          exercicios: exercicios.filter((ex: any) => ex.dia_id === dia.id),
        })),
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);

    return NextResponse.json(
      { error: "Erro ao buscar treinos" },
      { status: 500 }
    );
  }
}