"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  ArrowLeftRight,
  CalendarDays,
  CalendarCheck,
  Dumbbell,
  HeartPulse,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Exercicio {
  id: number;
  ordem: number;
  nome: string;
  grupo_muscular: string;
  series: number | null;
  repeticoes: string;
}

interface Dia {
  id: number;
  dia_semana: number; // 1 = Segunda ... 5 = Sexta
  nome: string;
  tipo: "forca" | "condicionamento";
  exercicios: Exercicio[];
}

interface Rotina {
  id: number;
  slug: string;
  nome: string;
  descricao: string;
  dias: Dia[];
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// Ícone de cada card (pelo slug cadastrado no banco)
const ICONES: Record<string, LucideIcon> = {
  "full-body": Layers,
  "upper-lower": ArrowLeftRight,
  abc: CalendarDays,
  abcde: CalendarCheck,
};

// "A: Peitoral, ombros e tríceps" -> "A"  |  "Full Body A" -> "Full Body A"
function nomeCurto(nome: string) {
  return nome.includes(":") ? nome.split(":")[0] : nome;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TreinosPage() {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const [rotinaSlug, setRotinaSlug] = useState<string | null>(null);
  const [diaIdx, setDiaIdx] = useState(0);

  // ── Buscar rotinas ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/treinos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRotinas(data);
        else setErro(true);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  function selecionarRotina(slug: string) {
    // Clicar no card já aberto fecha a rotina
    setRotinaSlug((atual) => (atual === slug ? null : slug));
    setDiaIdx(0);
  }

  const rotina = rotinas.find((r) => r.slug === rotinaSlug) ?? null;
  const dia = rotina?.dias[diaIdx] ?? null;
  const isCondicionamento = dia?.tipo === "condicionamento";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="text-white">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Treinos</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Escolha uma rotina para ver o plano de segunda a sexta
        </p>
      </div>

      {/* Erro */}
      {erro && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 mb-6 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>
            Não foi possível carregar as rotinas. Confira se o script{" "}
            <span className="font-mono text-red-200">treinos_rotinas.sql</span>{" "}
            foi executado no banco <span className="font-mono text-red-200">powergym</span>.
          </p>
        </div>
      )}

      {/* ── Cards das rotinas ───────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-zinc-600 text-sm">Carregando rotinas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rotinas.map((r) => {
            const Icon = ICONES[r.slug] ?? Dumbbell;
            const selected = r.slug === rotinaSlug;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => selecionarRotina(r.slug)}
                className={`text-left rounded-xl border p-5 transition-all duration-200 ${
                  selected
                    ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/60"
                }`}
              >
                <Icon
                  size={22}
                  className={selected ? "text-indigo-400" : "text-zinc-300"}
                />
                <h3 className="text-base font-bold mt-4">{r.nome}</h3>
                <p className="text-sm text-zinc-400 mt-1">{r.descricao}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Rotina selecionada ─────────────────────────────────────────────── */}
      {rotina && dia && (
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">
                Rotina {rotina.nome}
              </p>
              <h2 className="text-xl font-bold mt-1">Segunda a Sexta</h2>
            </div>
          </div>

          {/* Abas dos dias */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {rotina.dias.map((d, i) => {
              const active = i === diaIdx;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiaIdx(i)}
                  title={d.nome}
                  className={`rounded-lg border px-2 py-3 text-center transition ${
                    active
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span className="block text-sm font-semibold">
                    {DIAS_SEMANA[d.dia_semana - 1]}
                  </span>
                  <span
                    className={`block text-[11px] mt-0.5 truncate ${
                      active ? "text-indigo-300" : "text-zinc-600"
                    }`}
                  >
                    {nomeCurto(d.nome)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Título do dia */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                isCondicionamento
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              }`}
            >
              {isCondicionamento ? <HeartPulse size={17} /> : <Dumbbell size={17} />}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {DIAS_SEMANA[dia.dia_semana - 1]} — {dia.nome}
              </h3>
              <p className="text-xs text-zinc-500">
                {isCondicionamento ? "Condicionamento e mobilidade" : "Treino de força"}
                {" · "}
                {dia.exercicios.length}{" "}
                {dia.exercicios.length === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>

          {/* Tabela do dia */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-zinc-800">
                  {(isCondicionamento
                    ? ["#", "Atividade", "Objetivo", "Séries / duração"]
                    : ["#", "Exercício", "Grupo muscular", "Séries", "Repetições"]
                  ).map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dia.exercicios.map((ex) => (
                  <tr
                    key={ex.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition"
                  >
                    <td className="px-5 py-3.5 text-xs text-zinc-600 w-10">
                      {ex.ordem}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium">{ex.nome}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400">
                      {ex.grupo_muscular}
                    </td>

                    {isCondicionamento ? (
                      <td className="px-5 py-3.5">
                        <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {ex.repeticoes}
                        </span>
                      </td>
                    ) : (
                      <>
                        <td className="px-5 py-3.5 text-sm text-zinc-300">
                          {ex.series}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                            {ex.repeticoes}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
