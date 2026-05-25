"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  data_nascimento: string;
  objetivo: string;
  status: boolean;
}

const OBJETIVOS = [
  "Hipertrofia",
  "Emagrecimento",
  "Condicionamento",
  "Saúde",
  "Outro",
];

const EMPTY_FORM = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  data_nascimento: "",
  objetivo: "",
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Aluno | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Buscar alunos da API ───────────────────────────────────────────────────
  async function fetchAlunos() {
    setLoading(true);
    try {
      const res = await fetch("/api/alunos");
      const data = await res.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao carregar alunos.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAlunos(); }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }

  // ── Abrir modal ────────────────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(aluno: Aluno) {
    setForm({
      nome: aluno.nome,
      cpf: aluno.cpf,
      telefone: aluno.telefone,
      email: aluno.email,
      data_nascimento: aluno.data_nascimento?.slice(0, 10) ?? "",
      objetivo: aluno.objetivo,
    });
    setEditingId(aluno.id);
    setModalOpen(true);
  }

  // ── Salvar (POST / PUT) ────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.nome || !form.cpf || !form.telefone) {
      showToast("Preencha nome, CPF e telefone.", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/alunos/${editingId}` : "/api/alunos";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast(editingId ? "Aluno atualizado!" : "Aluno cadastrado!", "success");
      setModalOpen(false);
      fetchAlunos();
    } catch {
      showToast("Erro ao salvar aluno.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Excluir ────────────────────────────────────────────────────────────────
  async function handleDelete(aluno: Aluno) {
    try {
      const res = await fetch(`/api/alunos/${aluno.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Aluno removido.", "success");
      fetchAlunos();
    } catch {
      showToast("Erro ao remover aluno.", "error");
    } finally {
      setConfirmDelete(null);
    }
  }

  // ── Filtro de busca ────────────────────────────────────────────────────────
  const filtered = alunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.cpf.includes(search) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Iniciais do avatar ─────────────────────────────────────────────────────
  function initials(nome: string) {
    return nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="text-white">

      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Cadastro e gerenciamento dos alunos da academia
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          Novo Aluno
        </button>
      </div>

      {/* Barra de busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Tabela */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Aluno", "Telefone", "Objetivo", "Status", "Ações"].map((h) => (
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
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-zinc-600 text-sm">
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-zinc-600 text-sm">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((aluno) => (
                <tr
                  key={aluno.id}
                  className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition"
                >
                  {/* Nome + CPF */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {initials(aluno.nome)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{aluno.nome}</p>
                        <p className="text-xs text-zinc-500">{aluno.cpf}</p>
                      </div>
                    </div>
                  </td>

                  {/* Telefone */}
                  <td className="px-5 py-4 text-sm text-zinc-400">
                    {aluno.telefone}
                  </td>

                  {/* Objetivo */}
                  <td className="px-5 py-4">
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {aluno.objetivo}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {aluno.status ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        Ativo
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                        Inativo
                      </span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(aluno)}
                        className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(aluno)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal cadastro/edição ──────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {editingId ? "Editar Aluno" : "Novo Aluno"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Campos */}
            <div className="grid grid-cols-2 gap-4">
              {/* Nome — ocupa linha inteira */}
              <div className="col-span-2">
                <Label>Nome completo *</Label>
                <Input
                  value={form.nome}
                  onChange={(v) => setForm((f) => ({ ...f, nome: v }))}
                  placeholder="Nome do aluno"
                />
              </div>

              <div>
                <Label>CPF *</Label>
                <Input
                  value={form.cpf}
                  onChange={(v) => setForm((f) => ({ ...f, cpf: v }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label>Telefone *</Label>
                <Input
                  value={form.telefone}
                  onChange={(v) => setForm((f) => ({ ...f, telefone: v }))}
                  placeholder="(44) 99999-9999"
                />
              </div>

              <div className="col-span-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  placeholder="aluno@email.com"
                />
              </div>

              <div>
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(v) => setForm((f) => ({ ...f, data_nascimento: v }))}
                />
              </div>

              <div>
                <Label>Objetivo</Label>
                <select
                  value={form.objetivo}
                  onChange={(e) => setForm((f) => ({ ...f, objetivo: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Selecionar...</option>
                  {OBJETIVOS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-zinc-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-zinc-800 hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de confirmação de exclusão ──────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 w-full max-w-sm">
            <h2 className="text-base font-bold mb-2">Confirmar exclusão</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Deseja excluir o aluno <span className="text-white font-medium">{confirmDelete.nome}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-zinc-800 hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/80 hover:bg-red-600 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm shadow-xl z-[999] transition
            ${toast.type === "success"
              ? "bg-zinc-900 border-emerald-500/40 text-white"
              : "bg-zinc-900 border-red-500/40 text-white"
            }`}
        >
          {toast.type === "success"
            ? <CheckCircle size={16} className="text-emerald-400" />
            : <AlertCircle size={16} className="text-red-400" />
          }
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Componentes auxiliares pequenos ─────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
    />
  );
}
