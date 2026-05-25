import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── PUT /api/alunos/[id] ──────────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nome, email, telefone, cpf, data_nascimento, objetivo } = await request.json();

    await db.query(
      `UPDATE alunos
       SET nome = ?, email = ?, telefone = ?, cpf = ?, data_nascimento = ?, objetivo = ?, updated_at = NOW()
       WHERE id = ?`,
      [nome, email, telefone, cpf, data_nascimento || null, objetivo || null, id]
    );

    return NextResponse.json({ message: "Aluno atualizado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar aluno" }, { status: 500 });
  }
}

// ── DELETE /api/alunos/[id] ───────────────────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.query("DELETE FROM alunos WHERE id = ?", [id]);
    return NextResponse.json({ message: "Aluno removido com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover aluno" }, { status: 500 });
  }
}