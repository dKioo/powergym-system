import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM alunos ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar alunos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, cpf, data_nascimento, objetivo } = await request.json();

    await db.query(
      `INSERT INTO alunos (nome, email, telefone, cpf, data_nascimento, objetivo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, email, telefone, cpf, data_nascimento || null, objetivo || null]
    );

    return NextResponse.json({ message: "Aluno cadastrado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar aluno" }, { status: 500 });
  }
}