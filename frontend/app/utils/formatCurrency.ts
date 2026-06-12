export function formatEur(value: number | string | null | undefined): string {
  const n = Number(value)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(isFinite(n) ? n : 0)
}
