import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import {
  criarToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type Perfil,
} from "@/lib/auth";

interface UsuarioRow extends RowDataPacket {
  id: number;
  nome: string;
  senha: string;
  perfil: Perfil;
  status: number;
}

// Hash "de mentira": quando o usuário não existe, comparamos a senha com ele
// para gastar o mesmo tempo e não revelar quais usuários existem.
const HASH_FALSO =
  "$2b$10$JRnz9uUPbpEDXlzgg/SE6unFQH0f0hF8hXEUO4X/iaQHq1oxvNp76";

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const dados = body as { usuario?: unknown; senha?: unknown };
  const usuario = typeof dados.usuario === "string" ? dados.usuario.trim() : "";
  const senha = typeof dados.senha === "string" ? dados.senha : "";

  if (!usuario || !senha) {
    return NextResponse.json(
      { error: "Informe usuário e senha." },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query<UsuarioRow[]>(
      "SELECT id, nome, senha, perfil, status FROM usuarios WHERE usuario = ? LIMIT 1",
      [usuario]
    );

    const user = rows[0];
    const senhaConfere = await bcrypt.compare(senha, user?.senha ?? HASH_FALSO);

    // Mesma mensagem para qualquer falha: não revela se o usuário existe
    if (!user || !senhaConfere || !user.status) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const token = await criarToken({
      id: user.id,
      nome: user.nome,
      perfil: user.perfil,
    });

    const response = NextResponse.json({ nome: user.nome, perfil: user.perfil });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: "Erro ao realizar login." }, { status: 500 });
  }
}