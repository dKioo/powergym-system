import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export async function POST() {
  const response = NextResponse.json({ message: "Sessão encerrada." });

  // Apaga o cookie de login
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}