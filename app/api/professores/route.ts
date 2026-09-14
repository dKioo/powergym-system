import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── GET /api/professores ──────────────────────────────────────────────────────
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM professores ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar professores" }, { status: 500 });
  }
}

// ── POST /api/professores ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { nome, telefone, email, especialidade } = await request.json();

    await db.query(
      `INSERT INTO professores (nome, telefone, email, especialidade)
       VALUES (?, ?, ?, ?)`,
      [nome, telefone || null, email || null, especialidade || null]
    );

    return NextResponse.json({ message: "Professor cadastrado com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao cadastrar professor" }, { status: 500 });
  }
}