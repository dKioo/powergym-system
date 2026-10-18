// ─── Sessão (JWT) ────────────────────────────────────────────────────────────
// Cria e valida o token de login. O token é assinado com AUTH_SECRET (HS256)
// e guardado em um cookie httpOnly — o JavaScript do navegador não consegue ler.

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "powergym_session";
export const SESSION_HORAS = 8;
export const SESSION_MAX_AGE = SESSION_HORAS * 60 * 60; // em segundos

export type Perfil = "ADMIN" | "ALUNO";

export interface Sessao {
  id: number;
  nome: string;
  perfil: Perfil;
}

function getKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET não configurado. Adicione no .env.local uma chave com pelo menos 32 caracteres e reinicie o servidor."
    );
  }

  return new TextEncoder().encode(secret);
}

/** Gera o token assinado que vai para o cookie. */
export async function criarToken(sessao: Sessao): Promise<string> {
  return new SignJWT({ nome: sessao.nome, perfil: sessao.perfil })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(sessao.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HORAS}h`)
    .sign(getKey());
}

/** Valida assinatura e validade. Retorna a sessão, ou null se for inválido/expirado. */
export async function verificarToken(
  token: string | undefined
): Promise<Sessao | null> {
  if (!token) return null;

  const key = getKey(); // erro de configuração deve aparecer, não ser engolido

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });

    const id = Number(payload.sub);
    const perfil = payload.perfil;
    const nome = payload.nome;

    if (!Number.isInteger(id) || id <= 0) return null;
    if (perfil !== "ADMIN" && perfil !== "ALUNO") return null;
    if (typeof nome !== "string") return null;

    return { id, nome, perfil };
  } catch {
    return null; // assinatura inválida, token adulterado ou expirado
  }
}