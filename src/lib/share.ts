import type { DayTotals } from '../types'
import { formatDate, formatFCFA, formatNumber } from './format'

export function generateWhatsAppMessage(totals: DayTotals, businessName = 'Mon Point de Vente'): string {
  const lines: string[] = []
  lines.push(`📊 *BILAN DU ${totals.date} - ${businessName.toUpperCase()}*`)
  lines.push(`----------------------------------------`)
  lines.push(`💰 *RECETTE CAISSE À VERSER : ${formatFCFA(totals.total_employee_revenue)}*`)
  lines.push(`📦 Marchandises livrées : ${formatNumber(totals.total_delivered)} pcs`)
  lines.push(`✅ Produits vendus : ${formatNumber(totals.total_sold)} pcs`)
  lines.push(`⚠️ Total Invendus : ${formatNumber(totals.total_unsold)} pcs`)
  lines.push(`🏢 Dû Fournisseur : ${formatFCFA(totals.total_supplier_due)}`)
  lines.push(`📈 Bénéfice Net : +${formatFCFA(totals.total_net_profit)}`)
  lines.push(`----------------------------------------`)
  lines.push(`*DÉTAIL PAR PRODUIT :*`)

  for (const p of totals.products) {
    if (p.delivered > 0 || p.unsold > 0) {
      lines.push(
        `• *${p.product_name}* : ${p.sold}/${p.delivered} vendus (${formatFCFA(p.selling_price)}/u) | Invendus: ${p.unsold} | Recette: ${formatFCFA(p.employee_revenue)}`
      )
    }
  }

  lines.push(`----------------------------------------`)
  lines.push(`_Bilan certifié et clôturé sur VendorTracker_`)
  return lines.join('\n')
}

export function openWhatsApp(message: string, phone?: string) {
  const encoded = encodeURIComponent(message)
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
  window.open(url, '_blank')
}

export interface SummaryCanvasInput {
  periodTitle: string
  periodLabel: string
  businessName: string
  totalRevenue: number
  totalProfit: number
  marginRate: number
  totalSupplierDue: number
  totalDelivered: number
  totalSold: number
  totalUnsold: number
  unsoldRate: number
  closedDays: number
  avgPerDay: number
  productBreakdown: Array<{
    name: string
    delivered: number
    sold: number
    unsold: number
    revenue: number
    profit: number
  }>
}

export async function shareImageBlob(params: {
  blob: Blob
  filename: string
  title: string
  text: string
  fallbackMessage?: string
  onDownloaded?: () => void
}): Promise<void> {
  const { blob, filename, title, text, fallbackMessage, onDownloaded } = params
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (fallbackMessage) {
        openWhatsApp(fallbackMessage)
        return
      }
      throw err
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  onDownloaded?.()
}

export async function generateSummaryCanvasBlob(input: SummaryCanvasInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non supporté')

  const rows = input.productBreakdown.slice(0, 12)
  const height = 520 + Math.max(1, rows.length) * 44
  canvas.width = 800
  canvas.height = height

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, 800, height)

  const gradient = ctx.createLinearGradient(0, 0, 800, 160)
  gradient.addColorStop(0, '#020617')
  gradient.addColorStop(0.55, '#064e3b')
  gradient.addColorStop(1, '#047857')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 160)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px Inter, sans-serif'
  ctx.fillText('VendorTracker', 40, 55)

  ctx.font = '500 16px Inter, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillText(`Bilan ${input.periodTitle} • ${input.periodLabel}`, 40, 86)

  ctx.font = 'bold 20px Inter, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  ctx.fillText(input.businessName, 760, 65)
  ctx.font = '500 14px Inter, sans-serif'
  ctx.fillStyle = '#a7f3d0'
  ctx.fillText(`${input.closedDays} jour(s) clôturé(s) • Moy. ${formatFCFA(input.avgPerDay)}/j`, 760, 90)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.roundRect(40, 180, 720, 110, 16)
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.fillStyle = '#64748b'
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.fillText('RECETTE TOTALE', 64, 212)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 36px Inter, sans-serif'
  ctx.fillText(formatFCFA(input.totalRevenue), 64, 258)

  ctx.fillStyle = '#059669'
  ctx.font = 'bold 16px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`+${formatFCFA(input.totalProfit)} bénéfice (${input.marginRate}%)`, 736, 235)
  ctx.fillStyle = '#64748b'
  ctx.font = '500 13px Inter, sans-serif'
  ctx.fillText(`Dû fournisseur: ${formatFCFA(input.totalSupplierDue)}`, 736, 260)
  ctx.textAlign = 'left'

  const cards = [
    { label: 'Livrés', val: `${formatNumber(input.totalDelivered)} pcs`, color: '#0284c7' },
    { label: 'Vendus', val: `${formatNumber(input.totalSold)} pcs`, color: '#059669' },
    { label: 'Invendus', val: `${formatNumber(input.totalUnsold)} (${input.unsoldRate}%)`, color: '#d97706' },
  ]
  const cardW = 224
  cards.forEach((c, idx) => {
    const x = 40 + idx * (cardW + 24)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, 305, cardW, 70, 12)
    ctx.fill()

    ctx.fillStyle = '#64748b'
    ctx.font = '600 11px Inter, sans-serif'
    ctx.fillText(c.label.toUpperCase(), x + 16, 330)

    ctx.fillStyle = c.color
    ctx.font = 'bold 19px Inter, sans-serif'
    ctx.fillText(c.val, x + 16, 358)
  })

  const tableY = 410
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.roundRect(40, tableY, 720, 36, 8)
  ctx.fill()

  ctx.fillStyle = '#334155'
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.fillText('PRODUIT', 56, tableY + 23)
  ctx.fillText('VENDU / LIVRÉ', 340, tableY + 23)
  ctx.fillText('BÉNÉFICE', 520, tableY + 23)
  ctx.textAlign = 'right'
  ctx.fillText('RECETTE', 744, tableY + 23)
  ctx.textAlign = 'left'

  let rowY = tableY + 44
  rows.forEach((p, idx) => {
    if (idx % 2 === 1) {
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(40, rowY - 6, 720, 40)
    }
    ctx.fillStyle = '#0f172a'
    ctx.font = '600 14px Inter, sans-serif'
    ctx.fillText(p.name.slice(0, 26), 56, rowY + 18)

    ctx.fillStyle = '#475569'
    ctx.font = '500 14px Inter, sans-serif'
    ctx.fillText(`${formatNumber(p.sold)} / ${formatNumber(p.delivered)}`, 340, rowY + 18)

    ctx.fillStyle = '#059669'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.fillText(`+${formatFCFA(p.profit)}`, 520, rowY + 18)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#0f172a'
    ctx.fillText(formatFCFA(p.revenue), 744, rowY + 18)
    ctx.textAlign = 'left'
    rowY += 40
  })

  ctx.fillStyle = '#94a3b8'
  ctx.font = 'italic 12px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Généré automatiquement par VendorTracker • Suivi Vendeurs & Invendus', 400, height - 20)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Erreur création Blob Canvas'))
    }, 'image/png')
  })
}

export async function generateReceiptCanvasBlob(
  totals: DayTotals,
  businessName = 'Mon Point de Vente'
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non supporté')

  const activeProducts = totals.products.filter((p) => p.delivered > 0 || p.unsold > 0)
  const height = 520 + Math.max(1, activeProducts.length) * 44
  canvas.width = 800
  canvas.height = height

  // Background
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, 800, height)

  // Header Banner Gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 160)
  gradient.addColorStop(0, '#047857')
  gradient.addColorStop(0.5, '#0f766e')
  gradient.addColorStop(1, '#0369a1')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 160)

  // Header Text
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px Inter, sans-serif'
  ctx.fillText('VendorTracker', 40, 55)

  ctx.font = '500 16px Inter, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.fillText(`Point du jour • ${formatDate(totals.date)}`, 40, 85)

  ctx.font = 'bold 20px Inter, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  ctx.fillText(businessName, 760, 65)
  ctx.font = '500 14px Inter, sans-serif'
  ctx.fillStyle = '#a7f3d0'
  ctx.fillText('Clôture Journalière Certifiée', 760, 90)
  ctx.textAlign = 'left'

  // Big Metric Card (Recette Caisse)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  ctx.beginPath()
  ctx.roundRect(40, 180, 720, 110, 16)
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.fillStyle = '#64748b'
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.fillText('RECETTE CAISSE À VERSER', 64, 212)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 36px Inter, sans-serif'
  ctx.fillText(formatFCFA(totals.total_employee_revenue), 64, 258)

  ctx.fillStyle = '#059669'
  ctx.font = 'bold 16px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`+${formatFCFA(totals.total_net_profit)} bénéfice net`, 736, 235)
  ctx.fillStyle = '#64748b'
  ctx.font = '500 13px Inter, sans-serif'
  ctx.fillText(`Dû fournisseur: ${formatFCFA(totals.total_supplier_due)}`, 736, 260)
  ctx.textAlign = 'left'

  // Summary Row Cards
  const cards = [
    { label: 'Reçus', val: `${totals.total_delivered} pcs`, color: '#0284c7' },
    { label: 'Vendus', val: `${totals.total_sold} pcs`, color: '#059669' },
    { label: 'Invendus', val: `${totals.total_unsold} pcs`, color: '#d97706' },
  ]
  const cardW = 224
  cards.forEach((c, idx) => {
    const x = 40 + idx * (cardW + 24)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, 305, cardW, 70, 12)
    ctx.fill()

    ctx.fillStyle = '#64748b'
    ctx.font = '600 11px Inter, sans-serif'
    ctx.fillText(c.label.toUpperCase(), x + 16, 330)

    ctx.fillStyle = c.color
    ctx.font = 'bold 20px Inter, sans-serif'
    ctx.fillText(c.val, x + 16, 358)
  })

  // Table Header
  const tableY = 410
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.roundRect(40, tableY, 720, 36, 8)
  ctx.fill()

  ctx.fillStyle = '#334155'
  ctx.font = 'bold 12px Inter, sans-serif'
  ctx.fillText('PRODUIT', 56, tableY + 23)
  ctx.fillText('LIVRÉ', 330, tableY + 23)
  ctx.fillText('INVENDUS', 420, tableY + 23)
  ctx.fillText('VENDUS', 530, tableY + 23)
  ctx.textAlign = 'right'
  ctx.fillText('RECETTE', 744, tableY + 23)
  ctx.textAlign = 'left'

  // Table Rows
  let rowY = tableY + 44
  activeProducts.forEach((p, idx) => {
    if (idx % 2 === 1) {
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(40, rowY - 6, 720, 40)
    }

    ctx.fillStyle = '#0f172a'
    ctx.font = '600 14px Inter, sans-serif'
    ctx.fillText(p.product_name, 56, rowY + 18)

    ctx.fillStyle = '#475569'
    ctx.font = '500 14px Inter, sans-serif'
    ctx.fillText(String(p.delivered), 330, rowY + 18)

    ctx.fillStyle = p.unsold > 0 ? '#b45309' : '#64748b'
    ctx.fillText(String(p.unsold), 420, rowY + 18)

    ctx.fillStyle = '#059669'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.fillText(String(p.sold), 530, rowY + 18)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#0f172a'
    ctx.fillText(formatFCFA(p.employee_revenue), 744, rowY + 18)
    ctx.textAlign = 'left'

    rowY += 40
  })

  // Footer note
  ctx.fillStyle = '#94a3b8'
  ctx.font = 'italic 12px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Généré automatiquement par VendorTracker • Suivi Vendeurs & Invendus', 400, height - 20)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Erreur création Blob Canvas'))
    }, 'image/png')
  })
}
