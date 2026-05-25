"use client";

import { useEffect, useState } from "react";

interface Stats {
  alunos:      number;
  professores: number;
  planos:      number;
  usuarios:    number;
}

export default function DashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Alunos",      value: stats?.alunos      },
    { title: "Professores", value: stats?.professores },
    { title: "Planos",      value: stats?.planos      },
    { title: "Usuários",    value: stats?.usuarios    },
  ];

  return (
    <div>
      <h1 className="text-3xl text-white font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl"
          >
            <h2 className="text-zinc-400">
              {card.title}
            </h2>

            <p className="text-4xl font-bold text-white mt-2">
              {loading ? (
                <span className="text-zinc-600 text-2xl">...</span>
              ) : (
                card.value ?? 0
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}