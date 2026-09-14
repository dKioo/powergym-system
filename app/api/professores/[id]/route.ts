import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── PUT /api/professores/[id] ─────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nome, telefone, email, especialidade } = await request.json();

    await db.query(
      `UPDATE professores
       SET nome = ?, telefone = ?, email = ?, especialidade = ?, updated_at = NOW()
       WHERE id = ?`,
      [nome, telefone || null, email || null, especialidade || null, id]
    );

    return NextResponse.json({ message: "Professor atualizado com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar professor" }, { status: 500 });
  }
}

// ── DELETE /api/professores/[id] ──────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM professores WHERE id = ?", [id]);
    return NextResponse.json({ message: "Professor removido com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover professor" }, { status: 500 });
  }
}