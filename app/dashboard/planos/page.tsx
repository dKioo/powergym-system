"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Check,
} from "lucide-react";

// ─── Tipo do plano ────────────────────────────────────────────────────────────
interface Plano {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  duracao: number;
  beneficios: string;
  status: boolean;
}

// ─── Tipos de planos disponíveis ─────────────────────────────────────────────
interface TipoPlano {
  nome: string;
  descricao: string;
  valor: number;
  duracao: number;
  beneficios: string;
}

// Estes são os planos que aparecerão para seleção.
const TIPOS_PLANOS: TipoPlano[] = [
  {
    nome: "Mensal",
    descricao: "Plano ideal para quem deseja flexibilidade.",
    valor: 89.90,
    duracao: 1,
    beneficios: "Musculação, acesso à academia e avaliação física",
  },
  {
    nome: "Trimestral",
    descricao: "Mais economia para quem deseja treinar por mais tempo.",
    valor: 249.90,
    duracao: 3,
    beneficios: "Musculação, acesso à academia, avaliação física e acompanhamento",
  },
  {
    nome: "Semestral",
    descricao: "Uma opção equilibrada entre economia e duração.",
    valor: 449.90,
    duracao: 6,
    beneficios: "Acesso completo, avaliação física e acompanhamento",
  },
  {
    nome: "Anual",
    descricao: "Nossa opção com maior economia.",
    valor: 799.90,
    duracao: 12,
    beneficios: "Acesso completo, avaliações, acompanhamento e benefícios exclusivos",
  },
];

// ─── Formulário ──────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  nome: "",
  descricao: "",
  valor: "",
  duracao: "",
  beneficios: "",
  status: true,
};

// ─── Componente principal ────────────────────────────────────────────────────
export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] =
    useState<Plano | null>(null);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // ── Buscar planos ─────────────────────────────────────────────────────────
  async function fetchPlanos() {
    setLoading(true);

    try {
      const res = await fetch("/api/planos");
      const data = await res.json();

      setPlanos(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao carregar planos.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlanos();
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(
    msg: string,
    type: "success" | "error"
  ) {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3200);
  }

  // ── Formatar moeda ────────────────────────────────────────────────────────
  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // ── Selecionar tipo de plano ──────────────────────────────────────────────
  function selectPlan(tipo: TipoPlano) {
    setSelectedPlan(tipo.nome);

    setForm({
      nome: tipo.nome,
      descricao: tipo.descricao,
      valor: String(tipo.valor),
      duracao: String(tipo.duracao),
      beneficios: tipo.beneficios,
      status: true,
    });
  }

  // ── Abrir cadastro ────────────────────────────────────────────────────────
  function openCreate() {
    setForm(EMPTY_FORM);
    setSelectedPlan(null);
    setEditingId(null);
    setModalOpen(true);
  }

  // ── Abrir edição ──────────────────────────────────────────────────────────
  function openEdit(plano: Plano) {
    setForm({
      nome: plano.nome || "",
      descricao: plano.descricao || "",
      valor: String(plano.valor || ""),
      duracao: String(plano.duracao || ""),
      beneficios: plano.beneficios || "",
      status: Boolean(plano.status),
    });

    setSelectedPlan(plano.nome);
    setEditingId(plano.id);
    setModalOpen(true);
  }

  // ── Salvar plano ──────────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.nome || !form.valor || !form.duracao) {
      showToast(
        "Selecione um plano antes de salvar.",
        "error"
      );

      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/planos/${editingId}`
        : "/api/planos";

      const method = editingId
        ? "PUT"
        : "POST";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...form,
          valor: Number(form.valor),
          duracao: Number(form.duracao),
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      showToast(
        editingId
          ? "Plano atualizado com sucesso!"
          : "Plano cadastrado com sucesso!",
        "success"
      );

      setModalOpen(false);

      fetchPlanos();
    } catch {
      showToast(
        "Erro ao salvar plano.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  // ── Excluir plano ─────────────────────────────────────────────────────────
  async function handleDelete(plano: Plano) {
    try {
      const res = await fetch(
        `/api/planos/${plano.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      showToast(
        "Plano removido com sucesso.",
        "success"
      );

      fetchPlanos();
    } catch {
      showToast(
        "Erro ao remover plano.",
        "error"
      );
    } finally {
      setConfirmDelete(null);
    }
  }

  // ── Busca ─────────────────────────────────────────────────────────────────
  const filtered = planos.filter((plano) =>
    plano.nome
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="text-white">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Planos
          </h1>

          <p className="text-zinc-400 text-sm mt-1">
            Gerencie os planos e mensalidades da academia
          </p>
        </div>

        <button
          onClick={openCreate}
          className="
            flex
            items-center
            gap-2
            bg-indigo-600
            hover:bg-indigo-500
            transition
            px-4
            py-2
            rounded-lg
            text-sm
            font-medium
          "
        >
          <Plus size={16} />
          Novo Plano
        </button>

      </div>

      {/* ── Barra de busca ────────────────────────────────────────────────── */}
      <div className="relative mb-6">

        <Search
          size={16}
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-zinc-500
          "
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Buscar plano..."
          className="
            w-full
            bg-zinc-900
            border
            border-zinc-800
            rounded-lg
            pl-9
            pr-4
            py-2.5
            text-sm
            text-white
            placeholder:text-zinc-600
            focus:outline-none
            focus:border-indigo-500
            transition
          "
        />

      </div>

      {/* ── Tabela de planos ──────────────────────────────────────────────── */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-xl
          overflow-hidden
        "
      >

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-800">

              {[
                "Plano",
                "Valor",
                "Duração",
                "Benefícios",
                "Status",
                "Ações",
              ].map((header) => (

                <th
                  key={header}
                  className="
                    text-left
                    px-5
                    py-3
                    text-xs
                    font-semibold
                    text-zinc-500
                    uppercase
                    tracking-wider
                  "
                >
                  {header}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={6}
                  className="
                    text-center
                    py-12
                    text-zinc-600
                    text-sm
                  "
                >
                  Carregando planos...
                </td>

              </tr>

            ) : filtered.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="
                    text-center
                    py-12
                    text-zinc-600
                    text-sm
                  "
                >
                  Nenhum plano encontrado.
                </td>

              </tr>

            ) : (

              filtered.map((plano) => (

                <tr
                  key={plano.id}
                  className="
                    border-b
                    border-zinc-800
                    last:border-0
                    hover:bg-zinc-800/50
                    transition
                  "
                >

                  {/* Plano */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          w-9
                          h-9
                          rounded-lg
                          bg-indigo-500/10
                          border
                          border-indigo-500/20
                          flex
                          items-center
                          justify-center
                          text-indigo-400
                        "
                      >
                        <CreditCard size={17} />
                      </div>

                      <div>

                        <p className="text-sm font-medium">
                          {plano.nome}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {plano.descricao || "Sem descrição"}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* Valor */}
                  <td className="
                    px-5
                    py-4
                    text-sm
                    font-medium
                  ">
                    {formatCurrency(
                      Number(plano.valor)
                    )}
                  </td>

                  {/* Duração */}
                  <td className="
                    px-5
                    py-4
                    text-sm
                    text-zinc-400
                  ">

                    {plano.duracao}{" "}
                    {plano.duracao === 1
                      ? "mês"
                      : "meses"}

                  </td>

                  {/* Benefícios */}
                  <td className="
                    px-5
                    py-4
                    text-sm
                    text-zinc-400
                    max-w-xs
                  ">

                    <p className="truncate">
                      {plano.beneficios || "—"}
                    </p>

                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">

                    {plano.status ? (

                      <span className="
                        bg-emerald-500/10
                        text-emerald-400
                        border
                        border-emerald-500/20
                        text-xs
                        font-semibold
                        px-2.5
                        py-1
                        rounded-full
                        uppercase
                        tracking-wide
                      ">
                        Ativo
                      </span>

                    ) : (

                      <span className="
                        bg-red-500/10
                        text-red-400
                        border
                        border-red-500/20
                        text-xs
                        font-semibold
                        px-2.5
                        py-1
                        rounded-full
                        uppercase
                        tracking-wide
                      ">
                        Inativo
                      </span>

                    )}

                  </td>

                  {/* Ações */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          openEdit(plano)
                        }
                        className="
                          p-1.5
                          rounded-md
                          hover:bg-zinc-700
                          text-zinc-400
                          hover:text-white
                          transition
                        "
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() =>
                          setConfirmDelete(plano)
                        }
                        className="
                          p-1.5
                          rounded-md
                          hover:bg-red-500/20
                          text-zinc-400
                          hover:text-red-400
                          transition
                        "
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

      {/* ── Modal de cadastro/edição ──────────────────────────────────────── */}
      {modalOpen && (

        <div
          className="
            fixed
            inset-0
            bg-black/70
            backdrop-blur-sm
            z-50
            flex
            items-center
            justify-center
            p-4
          "
          onClick={(e) =>
            e.target === e.currentTarget &&
            setModalOpen(false)
          }
        >

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-7
              w-full
              max-w-4xl
              max-h-[90vh]
              overflow-y-auto
            "
          >

            {/* Cabeçalho */}
            <div className="
              flex
              items-center
              justify-between
              mb-6
            ">

              <div>

                <h2 className="text-lg font-bold">
                  {editingId
                    ? "Editar Plano"
                    : "Novo Plano"}
                </h2>

                <p className="
                  text-xs
                  text-zinc-500
                  mt-1
                ">
                  Selecione o plano desejado abaixo.
                </p>

              </div>

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                className="
                  text-zinc-500
                  hover:text-white
                  transition
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* ── CARDS DOS PLANOS ───────────────────────────────────────── */}
            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
            ">

              {TIPOS_PLANOS.map((tipo) => {

                const selected =
                  selectedPlan === tipo.nome;

                return (

                  <button
                    key={tipo.nome}
                    type="button"
                    onClick={() =>
                      selectPlan(tipo)
                    }
                    className={`
                      relative
                      text-left
                      rounded-xl
                      border
                      p-5
                      transition-all
                      duration-200
                      ${
                        selected
                          ? `
                            border-indigo-500
                            bg-indigo-500/10
                            shadow-lg
                            shadow-indigo-500/10
                          `
                          : `
                            border-zinc-800
                            bg-zinc-950
                            hover:border-zinc-700
                            hover:bg-zinc-800/60
                          `
                      }
                    `}
                  >

                    {/* Check */}
                    {selected && (

                      <div className="
                        absolute
                        top-3
                        right-3
                        w-6
                        h-6
                        rounded-full
                        bg-indigo-600
                        flex
                        items-center
                        justify-center
                      ">
                        <Check
                          size={14}
                          strokeWidth={3}
                        />
                      </div>

                    )}

                    {/* Ícone */}
                    <div
                      className={`
                        w-10
                        h-10
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        mb-4
                        ${
                          selected
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "bg-zinc-800 text-zinc-400"
                        }
                      `}
                    >
                      <CreditCard size={19} />
                    </div>

                    {/* Nome */}
                    <h3 className="
                      text-base
                      font-bold
                    ">
                      {tipo.nome}
                    </h3>

                    {/* Descrição */}
                    <p className="
                      text-xs
                      text-zinc-500
                      mt-1
                      min-h-[36px]
                    ">
                      {tipo.descricao}
                    </p>

                    {/* Preço */}
                    <div className="mt-5">

                      <span className="
                        text-2xl
                        font-bold
                      ">
                        {formatCurrency(
                          tipo.valor
                        )}
                      </span>

                      <span className="
                        text-xs
                        text-zinc-500
                        ml-1
                      ">
                        / mês
                      </span>

                    </div>

                    {/* Duração */}
                    <div className="
                      mt-3
                      text-xs
                      text-zinc-400
                    ">
                      Duração:{" "}
                      <span className="text-white font-medium">
                        {tipo.duracao}{" "}
                        {tipo.duracao === 1
                          ? "mês"
                          : "meses"}
                      </span>
                    </div>

                    {/* Benefícios */}
                    <div className="
                      mt-4
                      pt-4
                      border-t
                      border-zinc-800
                    ">

                      <p className="
                        text-[11px]
                        text-zinc-500
                        uppercase
                        tracking-wider
                        mb-2
                      ">
                        Benefícios
                      </p>

                      <p className="
                        text-xs
                        text-zinc-400
                        leading-relaxed
                      ">
                        {tipo.beneficios}
                      </p>

                    </div>

                  </button>

                );
              })}

            </div>

            {/* ── Resumo da seleção ──────────────────────────────────────── */}
            {selectedPlan && (

              <div className="
                mt-5
                bg-indigo-500/5
                border
                border-indigo-500/20
                rounded-xl
                p-4
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-4
                ">

                  <div>

                    <p className="
                      text-xs
                      text-indigo-400
                      uppercase
                      tracking-wider
                      font-semibold
                    ">
                      Plano selecionado
                    </p>

                    <p className="
                      text-sm
                      font-semibold
                      mt-1
                    ">
                      {form.nome}
                    </p>

                  </div>

                  <div className="
                    text-right
                  ">

                    <p className="
                      text-lg
                      font-bold
                    ">
                      {formatCurrency(
                        Number(form.valor)
                      )}
                    </p>

                    <p className="
                      text-xs
                      text-zinc-500
                    ">
                      {form.duracao}{" "}
                      {Number(form.duracao) === 1
                        ? "mês"
                        : "meses"}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* ── Status na edição ───────────────────────────────────────── */}
            {editingId && (

              <div className="mt-5">

                <label className="
                  block
                  text-xs
                  font-medium
                  text-zinc-500
                  uppercase
                  tracking-wider
                  mb-1.5
                ">
                  Status
                </label>

                <select
                  value={
                    form.status
                      ? "true"
                      : "false"
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status:
                        e.target.value ===
                        "true",
                    }))
                  }
                  className="
                    w-full
                    bg-zinc-950
                    border
                    border-zinc-800
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-white
                    focus:outline-none
                    focus:border-indigo-500
                    transition
                  "
                >

                  <option value="true">
                    Ativo
                  </option>

                  <option value="false">
                    Inativo
                  </option>

                </select>

              </div>

            )}

            {/* ── Botões ──────────────────────────────────────────────────── */}
            <div className="
              flex
              justify-end
              gap-3
              mt-6
              pt-5
              border-t
              border-zinc-800
            ">

              <button
                onClick={() =>
                  setModalOpen(false)
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  text-zinc-400
                  border
                  border-zinc-800
                  hover:bg-zinc-800
                  transition
                "
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !selectedPlan
                }
                className="
                  px-5
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  bg-indigo-600
                  hover:bg-indigo-500
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  transition
                "
              >

                {saving
                  ? "Salvando..."
                  : editingId
                    ? "Salvar alterações"
                    : "Cadastrar plano"}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* ── Modal de exclusão ─────────────────────────────────────────────── */}
      {confirmDelete && (

        <div className="
          fixed
          inset-0
          bg-black/70
          backdrop-blur-sm
          z-50
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-7
            w-full
            max-w-sm
          ">

            <h2 className="
              text-base
              font-bold
              mb-2
            ">
              Confirmar exclusão
            </h2>

            <p className="
              text-sm
              text-zinc-400
              mb-6
            ">

              Deseja excluir o plano{" "}

              <span className="
                text-white
                font-medium
              ">
                {confirmDelete.nome}
              </span>

              ?

              <br />

              Esta ação não pode ser desfeita.

            </p>

            <div className="
              flex
              justify-end
              gap-3
            ">

              <button
                onClick={() =>
                  setConfirmDelete(null)
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  text-zinc-400
                  border
                  border-zinc-800
                  hover:bg-zinc-800
                  transition
                "
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  handleDelete(confirmDelete)
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  bg-red-600/80
                  hover:bg-red-600
                  transition
                "
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
          className={`
            fixed
            bottom-6
            right-6
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            border
            text-sm
            shadow-xl
            z-[999]
            transition

            ${
              toast.type === "success"
                ? "bg-zinc-900 border-emerald-500/40 text-white"
                : "bg-zinc-900 border-red-500/40 text-white"
            }
          `}
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