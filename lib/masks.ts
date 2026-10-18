// ─── Máscaras e validações de formulário ─────────────────────────────────────
// Usado nas páginas de Alunos e Professores.

/** Remove tudo que não for dígito. Aceita null/undefined (dados antigos do banco). */
export function onlyDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/** CPF → 000.000.000-00 (máximo de 11 dígitos) */
export function maskCPF(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 11);

  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;

  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Telefone → (00)00000-0000 (celular, 11 dígitos)
 *          ou (00)0000-0000  (fixo, 10 dígitos)
 */
export function maskTelefone(value: string | null | undefined): string {
  const d = onlyDigits(value).slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)})${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)})${d.slice(2, 6)}-${d.slice(6)}`;

  return `(${d.slice(0, 2)})${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CPF com os 11 dígitos preenchidos */
export function cpfCompleto(value: string | null | undefined): boolean {
  return onlyDigits(value).length === 11;
}

/** Telefone com DDD + 8 dígitos (fixo) ou DDD + 9 dígitos (celular) */
export function telefoneCompleto(value: string | null | undefined): boolean {
  const total = onlyDigits(value).length;
  return total === 10 || total === 11;
}