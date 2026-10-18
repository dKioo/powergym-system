"use client";

import { useEffect, useState } from "react";
import {
  maskCPF,
  maskTelefone,
  cpfCompleto,
  telefoneCompleto,
} from "@/lib/masks";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Check,
  CreditCard,
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

  // Dados do plano
  plano_id: number | null;
  plano_nome: string | null;
  plano_valor: number | null;
  plano_duracao: number | null;
}

interface Plano {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  duracao: number;
  beneficios: string;
}

// ─── Objetivos ────────────────────────────────────────────────────────────────

const OBJETIVOS = [
  "Hipertrofia",
  "Emagrecimento",
  "Condicionamento",
  "Saúde",
  "Outro",
];

// ─── Formulário vazio ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  data_nascimento: "",
  objetivo: "",
  plano_id: "",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingPlanos, setLoadingPlanos] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Aluno | null>(null);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // ── Buscar alunos da API ───────────────────────────────────────────────────

  async function fetchAlunos() {
    setLoading(true);

    try {
      const res = await fetch("/api/alunos");

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setAlunos(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao carregar alunos.", "error");
    } finally {
      setLoading(false);
    }
  }

  // ── Buscar planos da API ───────────────────────────────────────────────────

  async function fetchPlanos() {
    setLoadingPlanos(true);

    try {
      const res = await fetch("/api/planos");

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setPlanos(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao carregar planos.", "error");
      setPlanos([]);
    } finally {
      setLoadingPlanos(false);
    }
  }

  // ── Carregar dados ao abrir a página ───────────────────────────────────────

  useEffect(() => {
    fetchAlunos();
    fetchPlanos();
  }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────

  function showToast(
    msg: string,
    type: "success" | "error"
  ) {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  // ── Abrir modal para cadastrar ─────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  // ── Abrir modal para editar ────────────────────────────────────────────────

  function openEdit(aluno: Aluno) {
    setForm({
      nome: aluno.nome ?? "",
      cpf: maskCPF(aluno.cpf),
      telefone: maskTelefone(aluno.telefone),
      email: aluno.email ?? "",
      data_nascimento: aluno.data_nascimento?.slice(0, 10) ?? "",
      objetivo: aluno.objetivo ?? "",
      plano_id: aluno.plano_id ? String(aluno.plano_id) : "",
    });

    setEditingId(aluno.id);
    setModalOpen(true);
  }

  // ── Selecionar plano ───────────────────────────────────────────────────────

  function selectPlan(planoId: number) {
    setForm((f) => ({
      ...f,
      plano_id: String(planoId),
    }));
  }

  // ── Salvar aluno ───────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.nome || !form.cpf || !form.telefone) {
      showToast(
        "Preencha nome, CPF e telefone.",
        "error"
      );
      return;
    }
    if (!cpfCompleto(form.cpf)) {
      showToast("CPF incompleto. Use o formato 000.000.000-00.", "error");
      return;
    }

    if (!telefoneCompleto(form.telefone)) {
      showToast("Telefone incompleto. Use o formato (00)00000-0000.", "error");
      return;
    }
    if (!form.plano_id) {
      showToast(
        "Selecione um plano para o aluno.",
        "error"
      );
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/alunos/${editingId}`
        : "/api/alunos";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          plano_id: Number(form.plano_id),
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      showToast(
        editingId
          ? "Aluno atualizado!"
          : "Aluno cadastrado!",
        "success"
      );

      setModalOpen(false);

      await fetchAlunos();
    } catch {
      showToast(
        "Erro ao salvar aluno.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Excluir aluno ──────────────────────────────────────────────────────────

  async function handleDelete(aluno: Aluno) {
    try {
      const res = await fetch(
        `/api/alunos/${aluno.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      showToast(
        "Aluno removido.",
        "success"
      );

      await fetchAlunos();
    } catch {
      showToast(
        "Erro ao remover aluno.",
        "error"
      );
    } finally {
      setConfirmDelete(null);
    }
  }

  // ── Filtro de busca ────────────────────────────────────────────────────────

  const filtered = alunos.filter((aluno) =>
    aluno.nome
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    aluno.cpf
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||

    aluno.email
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ── Plano atualmente selecionado ──────────────────────────────────────────

  const selectedPlan = planos.find(
    (plano) =>
      String(plano.id) === form.plano_id
  );

  // ── Formatação de preço ────────────────────────────────────────────────────

  function formatCurrency(valor: number) {
    return new Intl.NumberFormat(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    ).format(Number(valor));
  }

  // ── Iniciais do avatar ─────────────────────────────────────────────────────

  function initials(nome: string) {
    return nome
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Renderização
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="text-white">

      {/* ── Cabeçalho da página ───────────────────────────────────────────── */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Alunos
          </h1>

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

      {/* ── Barra de busca ────────────────────────────────────────────────── */}

      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Buscar por nome, CPF ou e-mail..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────────────── */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr className="border-b border-zinc-800">

                {[
                  "Aluno",
                  "Telefone",
                  "Objetivo",
                  "Plano",
                  "Status",
                  "Ações",
                ].map((h) => (
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

              {/* Loading */}

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-zinc-600 text-sm"
                  >
                    Carregando...
                  </td>
                </tr>

              ) : filtered.length === 0 ? (

                /* Nenhum resultado */

                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-zinc-600 text-sm"
                  >
                    Nenhum aluno encontrado.
                  </td>
                </tr>

              ) : (

                /* Lista de alunos */

                filtered.map((aluno) => (
                  <tr
                    key={aluno.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition"
                  >

                    {/* Aluno */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {initials(aluno.nome)}
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {aluno.nome}
                          </p>

                          <p className="text-xs text-zinc-500">
                            {maskCPF(aluno.cpf)}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Telefone */}

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {maskTelefone(aluno.telefone)}
                    </td>

                    {/* Objetivo */}

                    <td className="px-5 py-4">

                      {aluno.objetivo ? (
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {aluno.objetivo}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs">
                          Não informado
                        </span>
                      )}

                    </td>

                    {/* Plano */}

                    <td className="px-5 py-4">

                      {aluno.plano_nome ? (
                        <div>
                          <p className="text-sm font-medium text-white">
                            {aluno.plano_nome}
                          </p>

                          {aluno.plano_valor !== null && (
                            <p className="text-xs text-zinc-500">
                              {formatCurrency(
                                Number(aluno.plano_valor)
                              )}
                              {aluno.plano_duracao
                                ? ` / ${aluno.plano_duracao} dias`
                                : ""}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs">
                          Sem plano
                        </span>
                      )}

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
                          onClick={() =>
                            openEdit(aluno)
                          }
                          className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() =>
                            setConfirmDelete(aluno)
                          }
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
      </div>

      {/* ── Modal cadastro/edição ─────────────────────────────────────────── */}

      {modalOpen && (

        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget &&
            setModalOpen(false)
          }
        >

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 w-full max-w-4xl max-h-[92vh] overflow-y-auto">

            {/* Cabeçalho */}

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-lg font-bold">
                  {editingId
                    ? "Editar Aluno"
                    : "Novo Aluno"}
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Preencha os dados do aluno e selecione o plano.
                </p>
              </div>

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                className="text-zinc-500 hover:text-white transition"
              >
                <X size={20} />
              </button>

            </div>

            {/* ── Dados pessoais ─────────────────────────────────────────── */}

            <div className="grid grid-cols-2 gap-4">

              {/* Nome */}

              <div className="col-span-2">

                <Label>
                  Nome completo *
                </Label>

                <Input
                  value={form.nome}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      nome: v,
                    }))
                  }
                  placeholder="Nome do aluno"
                />

              </div>

              {/* CPF */}

              <div>

                <Label>
                  CPF *
                </Label>

                <Input
                  value={form.cpf}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      cpf: maskCPF(v),
                    }))
                  }
                  placeholder="000.000.000-00"
                />

              </div>

              {/* Telefone */}

              <div>

                <Label>
                  Telefone *
                </Label>

                <Input
                  value={form.telefone}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      telefone: maskTelefone(v),
                    }))
                  }
                  placeholder="(44)99999-9999"
                />

              </div>

              {/* E-mail */}

              <div className="col-span-2">

                <Label>
                  E-mail
                </Label>

                <Input
                  type="email"
                  value={form.email}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      email: v,
                    }))
                  }
                  placeholder="aluno@email.com"
                />

              </div>

              {/* Data de nascimento */}

              <div>

                <Label>
                  Data de nascimento
                </Label>

                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      data_nascimento: v,
                    }))
                  }
                />

              </div>

              {/* Objetivo */}

              <div>

                <Label>
                  Objetivo
                </Label>

                <select
                  value={form.objetivo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      objetivo: e.target.value,
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >

                  <option value="">
                    Selecionar...
                  </option>

                  {OBJETIVOS.map((objetivo) => (
                    <option
                      key={objetivo}
                      value={objetivo}
                    >
                      {objetivo}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* ── Seleção de plano ───────────────────────────────────────── */}

            <div className="mt-7 pt-6 border-t border-zinc-800">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <div className="flex items-center gap-2">

                    <CreditCard
                      size={17}
                      className="text-indigo-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Plano do aluno *
                    </h3>

                  </div>

                  <p className="text-xs text-zinc-500 mt-1">
                    Selecione um dos planos disponíveis.
                  </p>

                </div>

                {selectedPlan && (
                  <span className="text-xs text-indigo-400">
                    Plano selecionado:{" "}
                    <strong>
                      {selectedPlan.nome}
                    </strong>
                  </span>
                )}

              </div>

              {/* Carregando planos */}

              {loadingPlanos ? (

                <div className="border border-zinc-800 bg-zinc-950 rounded-xl py-10 text-center">

                  <p className="text-sm text-zinc-500">
                    Carregando planos...
                  </p>

                </div>

              ) : planos.length === 0 ? (

                /* Nenhum plano */

                <div className="border border-dashed border-zinc-700 bg-zinc-950 rounded-xl py-10 px-6 text-center">

                  <CreditCard
                    size={28}
                    className="mx-auto text-zinc-600 mb-3"
                  />

                  <p className="text-sm text-zinc-400">
                    Nenhum plano ativo cadastrado.
                  </p>

                  <p className="text-xs text-zinc-600 mt-1">
                    Cadastre um plano ativo no banco de dados para poder
                    vinculá-lo ao aluno.
                  </p>

                </div>

              ) : (

                /* Cards dos planos */

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {planos.map((plano) => {

                    const isSelected =
                      String(plano.id) ===
                      form.plano_id;

                    return (

                      <button
                        key={plano.id}
                        type="button"
                        onClick={() =>
                          selectPlan(plano.id)
                        }
                        className={`relative text-left rounded-xl border p-5 transition-all duration-200
                          ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                              : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
                          }
                        `}
                      >

                        {/* Check do plano selecionado */}

                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Check
                              size={14}
                              className="text-white"
                            />
                          </div>
                        )}

                        {/* Nome */}

                        <h4
                          className={`text-base font-bold pr-8 ${
                            isSelected
                              ? "text-indigo-400"
                              : "text-white"
                          }`}
                        >
                          {plano.nome}
                        </h4>

                        {/* Descrição */}

                        {plano.descricao && (
                          <p className="text-xs text-zinc-500 mt-2 min-h-[32px]">
                            {plano.descricao}
                          </p>
                        )}

                        {/* Preço */}

                        <div className="mt-4">

                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(
                              Number(plano.valor)
                            )}
                          </span>

                          <span className="text-xs text-zinc-500 ml-1">
                            / {plano.duracao} dias
                          </span>

                        </div>

                        {/* Benefícios */}

                        {plano.beneficios && (
                          <div className="mt-4 pt-4 border-t border-zinc-800">

                            <p className="text-xs font-semibold text-zinc-400 mb-2">
                              Benefícios
                            </p>

                            <p className="text-xs text-zinc-500 leading-relaxed">
                              {plano.beneficios}
                            </p>

                          </div>
                        )}

                      </button>

                    );
                  })}

                </div>

              )}

            </div>

            {/* ── Botões ─────────────────────────────────────────────────── */}

            <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-zinc-800">

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-zinc-800 hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  loadingPlanos ||
                  planos.length === 0
                }
                className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving
                  ? "Salvando..."
                  : editingId
                  ? "Salvar alterações"
                  : "Cadastrar aluno"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ── Modal de confirmação de exclusão ──────────────────────────────── */}

      {confirmDelete && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 w-full max-w-sm">

            <h2 className="text-base font-bold mb-2">
              Confirmar exclusão
            </h2>

            <p className="text-sm text-zinc-400 mb-6">
              Deseja excluir o aluno{" "}
              <span className="text-white font-medium">
                {confirmDelete.nome}
              </span>
              ? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setConfirmDelete(null)
                }
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 border border-zinc-800 hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  handleDelete(confirmDelete)
                }
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
            ${
              toast.type === "success"
                ? "bg-zinc-900 border-emerald-500/40 text-white"
                : "bg-zinc-900 border-red-500/40 text-white"
            }`}
        >

          {toast.type === "success" ? (
            <CheckCircle
              size={16}
              className="text-emerald-400"
            />
          ) : (
            <AlertCircle
              size={16}
              className="text-red-400"
            />
          )}

          {toast.msg}

        </div>

      )}

    </div>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function Label({
  children,
}: {
  children: React.ReactNode;
}) {
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
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder={placeholder}
      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
    />
  );
}