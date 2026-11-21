import type { AdminVendorEnriched, DayTotals } from '../types'

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(';') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(';'), ...rows.map((r) => r.map(escape).join(';'))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportDayTotalsCsv(totals: DayTotals) {
  const headers = [
    'Date',
    'Produit',
    'Fournisseur',
    'Prix Vente (FCFA)',
    'Prix Achat (FCFA)',
    'Livré',
    'Invendu',
    'Vendu',
    'Recette Caisse (FCFA)',
    'Dû Fournisseur (FCFA)',
    'Bénéfice Net (FCFA)',
  ]
  const rows = totals.products.map((p) => [
    totals.date,
    p.product_name,
    p.supplier_name || '',
    p.selling_price,
    p.cost_price,
    p.delivered,
    p.unsold,
    p.sold,
    p.employee_revenue,
    p.supplier_due,
    p.net_profit,
  ])
  downloadCsv(`vendortracker-bilan-${totals.date}.csv`, headers, rows)
}

export function exportAdminVendorsCsv(vendors: AdminVendorEnriched[]) {
  const headers = [
    'Vendeur / Dépôt',
    'Téléphone',
    'Email',
    'Statut',
    'Produits',
    'Fiches',
    'Clôtures',
    'CA Total (FCFA)',
    'Articles Vendus',
    'Dernière Activité',
  ]
  const rows = vendors.map((v) => [
    v.name,
    v.phone,
    v.email || '',
    v.status,
    v.products_count,
    v.sheets_count,
    v.closed_sheets_count,
    v.total_revenue,
    v.total_sold_units,
    v.last_active_at || '',
  ])
  downloadCsv(`vendortracker-admin-vendeurs-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}
