export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount)
  return `${new Intl.NumberFormat('fr-FR').format(rounded)} F`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

export function formatWeekday(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long' })
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  return `le ${new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
}
