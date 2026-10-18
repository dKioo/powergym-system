"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.error ?? "Não foi possível entrar. Tente novamente.");
        setLoading(false);
        return;
      }

      // Login ok: o cookie já foi gravado pelo servidor
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErro("Erro de conexão com o servidor.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <p className="font-bold text-xl leading-none">PowerGym</p>
            <p className="text-zinc-600 text-xs tracking-widest uppercase mt-1">
              System
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold">Entrar</h1>
          <p className="text-zinc-400 text-sm mt-1 mb-6">
            Acesse o painel de gerenciamento da academia
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Usuário */}
            <div>
              <label
                htmlFor="usuario"
                className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5"
              >
                Usuário
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  autoFocus
                  maxLength={50}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  maxLength={72}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg px-3 py-2.5 text-sm"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !usuario || !senha}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed transition px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              {loading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          PowerGym System · Gerenciamento de Academias
        </p>
      </div>
    </main>
  );
}
