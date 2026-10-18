"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  LogOut,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard",   href: "/dashboard",             icon: LayoutDashboard },
  { title: "Alunos",      href: "/dashboard/alunos",      icon: Users           },
  { title: "Professores", href: "/dashboard/professores", icon: Dumbbell        },
  { title: "Treinos",     href: "/dashboard/treinos",     icon: ClipboardList   },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Quem está logado (nome e perfil)
  const [user, setUser] = useState<{ nome: string; perfil: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const iniciais = user
    ? user.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <aside className="w-64 h-screen sticky top-0 bg-zinc-950 border-r border-zinc-800 text-white p-5 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-base">
          ⚡
        </div>
        <div>
          <p className="font-bold text-base leading-none">PowerGym</p>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mt-0.5">System</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1">
        <p className="text-zinc-700 text-xs uppercase tracking-widest px-3 mb-3">Menu</p>
        {menuItems.map((item) => {
          // Ativo exato para /dashboard, prefixo para os demais
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                ${isActive
                  ? "bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white border-l-2 border-transparent"
                }`}
            >
              <item.icon size={18} />
              <span className={isActive ? "font-semibold" : ""}>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Usuário logado + sair */}
      <div className="border-t border-zinc-800 pt-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
            {iniciais}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-none truncate">
              {user?.nome ?? "..."}
            </p>
            <p className="text-zinc-600 text-xs mt-0.5">
              {user ? (user.perfil === "ADMIN" ? "Administrador" : "Aluno") : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
