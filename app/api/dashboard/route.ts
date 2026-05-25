import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function count(tabela: string): Promise<number> {
  try {
    const [[row]] = await db.query(`SELECT COUNT(*) as total FROM ${tabela}`) as any;
    return row.total ?? 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const [alunos, professores, planos, usuarios] = await Promise.all([
    count("alunos"),
    count("professores"),
    count("planos"),
    count("usuarios"),
  ]);

  return NextResponse.json({ alunos, professores, planos, usuarios });
}