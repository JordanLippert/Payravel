export function formatEur(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(value)
}
