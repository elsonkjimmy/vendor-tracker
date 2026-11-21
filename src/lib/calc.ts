import type { CalculatedProductRow, DailySheet, DayTotals, Product } from '../types'

export function calculateDailySheetTotals(sheet: DailySheet, productsCatalog: Product[]): DayTotals {
  const productMap = new Map<string, Product>()
  for (const p of productsCatalog) {
    if (!p.deleted) productMap.set(p.id, p)
  }

  // Aggregate deliveries per product
  const deliveredMap = new Map<string, { qty: number; itemProduct: Partial<Product> }>()
  for (const batch of sheet.deliveries) {
    for (const item of batch.items) {
      const prev = deliveredMap.get(item.product_id) || {
        qty: 0,
        itemProduct: {
          id: item.product_id,
          name: item.product_name,
          selling_price: item.selling_price,
          cost_price: item.cost_price,
          returnable: item.returnable,
          margin_type: item.margin_type,
          rebate_type: item.rebate_type,
          rebate_value: item.rebate_value,
        },
      }
      prev.qty += item.quantity
      deliveredMap.set(item.product_id, prev)
    }
  }

  // Ensure all products in catalog or delivered are evaluated
  const allProductIds = new Set<string>([...productMap.keys(), ...deliveredMap.keys()])
  const rows: CalculatedProductRow[] = []

  let totalDelivered = 0
  let totalSold = 0
  let totalUnsold = 0
  let totalEmployeeRevenue = 0
  let totalSupplierDue = 0
  let totalNetProfit = 0
  let totalRebateProfit = 0

  for (const pId of allProductIds) {
    const catalogProduct = productMap.get(pId)
    const deliveryData = deliveredMap.get(pId)

    const name = catalogProduct?.name || deliveryData?.itemProduct.name || 'Produit inconnu'
    const sellingPrice = deliveryData?.itemProduct.selling_price ?? catalogProduct?.selling_price ?? 0
    const costPrice = deliveryData?.itemProduct.cost_price ?? catalogProduct?.cost_price ?? 0
    const returnable = deliveryData?.itemProduct.returnable ?? catalogProduct?.returnable ?? true
    const supplierName = catalogProduct?.supplier_name
    const marginType = deliveryData?.itemProduct.margin_type ?? catalogProduct?.margin_type ?? 'direct'
    const rebateType = deliveryData?.itemProduct.rebate_type ?? catalogProduct?.rebate_type
    const rebateValue = deliveryData?.itemProduct.rebate_value ?? catalogProduct?.rebate_value

    const delivered = deliveryData?.qty ?? 0
    const unsold = sheet.unsold[pId] ?? 0
    const sold = sheet.closing_done ? Math.max(0, delivered - unsold) : 0

    const employeeRevenue = sold * sellingPrice
    const supplierDue = returnable ? sold * costPrice : delivered * costPrice

    let rebateAmount = 0
    if (marginType === 'rebate' && rebateValue) {
      if (rebateType === 'percent') {
        rebateAmount = Math.round(employeeRevenue * (rebateValue / 100))
      } else {
        rebateAmount = Math.round(sold * rebateValue)
      }
    }

    const directProfit = Math.max(0, employeeRevenue - supplierDue)
    const netProfit = marginType === 'rebate' ? rebateAmount : directProfit

    if (delivered > 0 || unsold > 0 || catalogProduct?.is_active) {
      rows.push({
        product_id: pId,
        product_name: name,
        supplier_name: supplierName,
        initial_stock: 0,
        delivered,
        available_stock: delivered,
        unsold: sheet.closing_done ? unsold : 0,
        sold,
        selling_price: sellingPrice,
        cost_price: costPrice,
        returnable,
        margin_type: marginType,
        rebate_type: rebateType,
        rebate_value: rebateValue,
        rebate_amount: rebateAmount,
        direct_profit: directProfit,
        employee_revenue: employeeRevenue,
        supplier_due: supplierDue,
        net_profit: netProfit,
      })
    }

    totalDelivered += delivered
    if (sheet.closing_done) {
      totalSold += sold
      totalUnsold += unsold
      totalEmployeeRevenue += employeeRevenue
      totalSupplierDue += supplierDue
      totalNetProfit += netProfit
      if (marginType === 'rebate') totalRebateProfit += rebateAmount
    }
  }

  // Override employee revenue with cash_collected if explicitly provided by manager
  const finalEmployeeRevenue =
    typeof sheet.cash_collected === 'number' && sheet.cash_collected > 0
      ? sheet.cash_collected
      : totalEmployeeRevenue

  return {
    date: sheet.date,
    closing_done: sheet.closing_done,
    closed_at: sheet.closed_at,
    total_delivered: totalDelivered,
    total_sold: totalSold,
    total_unsold: totalUnsold,
    total_employee_revenue: finalEmployeeRevenue,
    total_supplier_due: totalSupplierDue,
    total_net_profit: totalNetProfit,
    total_rebate_profit: totalRebateProfit,
    products: rows,
  }
}
