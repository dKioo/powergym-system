import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verificarToken } from "@/lib/auth";
import { decidirAcesso } from "@/lib/access";

// Roda antes de cada requisição (no Next 16, o antigo "middleware" se chama "proxy").
// - Páginas: quem não está logado é enviado para /login.
// - Rotas /api: quem não está logado recebe 401.
export async function proxy(request: NextRequest) {
  const sessao = await verificarToken(
    request.cookies.get(SESSION_COOKIE)?.value
  );

  const decisao = decidirAcesso(
    request.nextUrl.pathname,
    sessao?.perfil ?? null
  );

  if (decisao.tipo === "redirect") {
    return NextResponse.redirect(new URL(decisao.para, request.url));
  }

  if (decisao.tipo === "nao-autenticado") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  return NextResponse.next();
}

// Não roda em arquivos estáticos (_next, favicon, imagens da pasta public...)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};