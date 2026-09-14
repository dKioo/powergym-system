import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── PUT /api/planos/[id] ─────────────────────────────────────────────────────
// Atualiza um plano
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const {
      nome,
      descricao,
      valor,
      duracao,
      beneficios,
      status,
    } = await request.json();

    await db.query(
      `UPDATE planos
       SET
         nome = ?,
         descricao = ?,
         valor = ?,
         duracao = ?,
         beneficios = ?,
         status = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        nome,
        descricao || null,
        valor,
        duracao,
        beneficios || null,
        status,
        id,
      ]
    );

    return NextResponse.json({
      message: "Plano atualizado com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar plano" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/planos/[id] ──────────────────────────────────────────────────
// Remove um plano
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.query(
      "DELETE FROM planos WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      message: "Plano removido com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao remover plano" },
      { status: 500 }
    );
  }
}