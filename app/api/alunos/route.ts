import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/alunos
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        alunos.*,
        planos.nome AS plano_nome,
        planos.valor AS plano_valor,
        planos.duracao AS plano_duracao
      FROM alunos
      LEFT JOIN planos
        ON alunos.plano_id = planos.id
      ORDER BY alunos.created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);

    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 }
    );
  }
}

// POST /api/alunos
export async function POST(request: Request) {
  try {
    const {
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      objetivo,
      plano_id,
    } = await request.json();

    // Validação dos campos obrigatórios
    if (!nome || !cpf || !telefone || !plano_id) {
      return NextResponse.json(
        {
          error:
            "Nome, CPF, telefone e plano são obrigatórios.",
        },
        { status: 400 }
      );
    }

    await db.query(
      `
        INSERT INTO alunos
        (
          nome,
          email,
          telefone,
          cpf,
          data_nascimento,
          objetivo,
          plano_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nome,
        email || null,
        telefone,
        cpf,
        data_nascimento || null,
        objetivo || null,
        Number(plano_id),
      ]
    );

    return NextResponse.json(
      {
        message: "Aluno cadastrado com sucesso",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);

    return NextResponse.json(
      {
        error: "Erro ao cadastrar aluno",
      },
      { status: 500 }
    );
  }
}