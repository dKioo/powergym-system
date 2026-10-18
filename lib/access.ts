// ─── Regras de acesso ────────────────────────────────────────────────────────
// Decide o que fazer com cada requisição, com base na rota e no perfil logado.
// É usado pelo proxy.ts. Fica separado para ser simples de entender e de
// ampliar (na próxima etapa, é aqui que o perfil ALUNO ganhará suas regras).

export type Decisao =
  | { tipo: "next" }                       // deixa a requisição seguir
  | { tipo: "redirect"; para: string }     // redireciona (páginas)
  | { tipo: "nao-autenticado" };           // responde 401 (rotas /api)

// Rotas que qualquer pessoa pode acessar, mesmo sem login
const ROTAS_PUBLICAS = ["/login", "/api/auth/login", "/api/auth/logout"];

/**
 * @param pathname  caminho da requisição (ex.: "/dashboard/alunos")
 * @param perfil    perfil da sessão válida, ou null se não houver sessão
 */
export function decidirAcesso(pathname: string, perfil: string | null): Decisao {
  // Por enquanto, só o ADMIN entra no sistema.
  // Qualquer outro perfil (ou ausência de sessão) é tratado como "não logado".
  const logado = perfil === "ADMIN";
  const isApi = pathname.startsWith("/api/");

  // Raiz do site: manda para o lugar certo
  if (pathname === "/") {
    return { tipo: "redirect", para: logado ? "/dashboard" : "/login" };
  }

  // Rotas públicas (login e logout)
  if (ROTAS_PUBLICAS.includes(pathname)) {
    // Quem já está logado não precisa ver a tela de login de novo
    if (logado && pathname === "/login") {
      return { tipo: "redirect", para: "/dashboard" };
    }
    return { tipo: "next" };
  }

  // Todo o resto exige login
  if (logado) return { tipo: "next" };

  return isApi
    ? { tipo: "nao-autenticado" }
    : { tipo: "redirect", para: "/login" };
}