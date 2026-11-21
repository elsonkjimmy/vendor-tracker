export type MarginType = 'direct' | 'rebate'
export type RebateType = 'fixed' | 'percent'

export interface Product {
  id: string
  name: string
  category?: string
  selling_price: number
  cost_price: number
  returnable: boolean
  supplier_name?: string
  margin_type?: MarginType
  rebate_type?: RebateType
  rebate_value?: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface DeliveryItem {
  product_id: string
  product_name: string
  quantity: number
  selling_price: number
  cost_price: number
  returnable: boolean
  margin_type?: MarginType
  rebate_type?: RebateType
  rebate_value?: number
}

export interface DeliveryBatch {
  id: string
  at: string
  supplier_name?: string
  items: DeliveryItem[]
}

export interface DailySheet {
  id: string
  date: string
  deliveries: DeliveryBatch[]
  unsold: Record<string, number>
  closing_done: boolean
  closed_at?: string
  cash_collected?: number
  notes?: string
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface ClientBoutique {
  id: string
  name: string
  phone: string
  location: string
  balance: number
  created_at: string
}

export type AccountType = 'vendor' | 'driver'

export interface VendorUser {
  id: string
  name: string
  phone: string
  email?: string
  account_type?: AccountType
  is_admin: boolean
  created_at: string
}

export interface CalculatedProductRow {
  product_id: string
  product_name: string
  supplier_name?: string
  initial_stock: number
  delivered: number
  available_stock: number
  unsold: number
  sold: number
  selling_price: number
  cost_price: number
  returnable: boolean
  margin_type: MarginType
  rebate_type?: RebateType
  rebate_value?: number
  rebate_amount: number
  direct_profit: number
  employee_revenue: number
  supplier_due: number
  net_profit: number
}

export interface DayTotals {
  date: string
  closing_done: boolean
  closed_at?: string
  total_delivered: number
  total_sold: number
  total_unsold: number
  total_employee_revenue: number
  total_supplier_due: number
  total_net_profit: number
  total_rebate_profit: number
  products: CalculatedProductRow[]
}

export interface AdminOverviewStats {
  total_vendors: number
  active_vendors_7d: number
  total_sheets_count: number
  closed_sheets_count: number
  closing_rate_percent: number
  total_revenue_recorded: number
  total_items_sold: number
  total_products_count: number
  records_breakdown: Array<{ kind: string; count: number }>
}

export interface AdminVendorEnriched {
  id: string
  name: string
  phone: string
  email?: string
  is_admin: boolean
  created_at: string
  products_count: number
  sheets_count: number
  closed_sheets_count: number
  total_revenue: number
  total_sold_units: number
  last_active_at: string | null
  status: 'active' | 'dormant' | 'new'
  recent_sheets: Array<{ date: string; closing_done: boolean; revenue: number; items_sold: number }>
}

export interface AdminRecentActivity {
  vendor_id: string
  vendor_name: string
  date: string
  closing_done: boolean
  closed_at?: string
  revenue: number
  items_sold: number
  updated_at: string
}

export interface AdminDailyTrend {
  date: string
  revenue: number
  items_sold: number
  sheets_count: number
}

export interface AdminOverviewResponse {
  ok: boolean
  stats: AdminOverviewStats
  vendors: AdminVendorEnriched[]
  recent_activity: AdminRecentActivity[]
  daily_trends: AdminDailyTrend[]
}
