import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, nome, descricao, valor, duracao, beneficios
       FROM planos
       WHERE status = 1
       ORDER BY valor ASC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao buscar planos:", error);

    return NextResponse.json(
      { error: "Erro ao buscar planos" },
      { status: 500 }
    );
  }
}