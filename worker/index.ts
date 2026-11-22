export interface Env {
  DB: D1Database
  ASSETS?: Fetcher
}

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  account_type: 'vendor' | 'driver'
  is_admin: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  category?: string
  selling_price: number
  cost_price: number
  returnable: boolean
  supplier_name?: string
  margin_type?: 'direct' | 'rebate'
  rebate_type?: 'fixed' | 'percent'
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
  margin_type?: 'direct' | 'rebate'
  rebate_type?: 'fixed' | 'percent'
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

export type SyncRecord =
  | { kind: 'product'; value: Product }
  | { kind: 'daily_sheet'; value: DailySheet }

export interface SyncRequest {
  since: number
  records: SyncRecord[]
}

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

function isId(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= 64
}

function isAmount(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e8
}

function isQuantity(v: unknown): v is number {
  return Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 999999
}

function hasTimestamps(r: { created_at?: unknown; updated_at?: unknown }): boolean {
  return (
    typeof r.created_at === 'string' &&
    ISO_RE.test(r.created_at) &&
    typeof r.updated_at === 'string' &&
    ISO_RE.test(r.updated_at)
  )
}

function parseProduct(raw: unknown): Product | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!isId(r.id) || typeof r.name !== 'string' || r.name.trim().length === 0) return null
  if (!isAmount(r.selling_price) || !isAmount(r.cost_price)) return null
  if (typeof r.returnable !== 'boolean' || typeof r.is_active !== 'boolean' || typeof r.deleted !== 'boolean') return null
  if (!hasTimestamps(r)) return null
  return {
    id: r.id,
    name: (r.name as string).trim(),
    category: typeof r.category === 'string' ? r.category : undefined,
    selling_price: r.selling_price,
    cost_price: r.cost_price,
    returnable: r.returnable,
    supplier_name: typeof r.supplier_name === 'string' ? r.supplier_name : undefined,
    margin_type: r.margin_type === 'rebate' ? 'rebate' : 'direct',
    rebate_type: r.rebate_type === 'percent' ? 'percent' : r.rebate_type === 'fixed' ? 'fixed' : undefined,
    rebate_value: isAmount(r.rebate_value) ? r.rebate_value : undefined,
    is_active: r.is_active,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted: r.deleted,
  }
}

function parseDeliveryItem(raw: unknown): DeliveryItem | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!isId(r.product_id) || typeof r.product_name !== 'string') return null
  if (!isQuantity(r.quantity) || (r.quantity as number) <= 0) return null
  if (!isAmount(r.selling_price) || !isAmount(r.cost_price)) return null
  if (typeof r.returnable !== 'boolean') return null
  return {
    product_id: r.product_id,
    product_name: r.product_name,
    quantity: r.quantity,
    selling_price: r.selling_price,
    cost_price: r.cost_price,
    returnable: r.returnable,
    margin_type: r.margin_type === 'rebate' ? 'rebate' : 'direct',
    rebate_type: r.rebate_type === 'percent' ? 'percent' : r.rebate_type === 'fixed' ? 'fixed' : undefined,
    rebate_value: isAmount(r.rebate_value) ? r.rebate_value : undefined,
  }
}

function parseDeliveryBatch(raw: unknown): DeliveryBatch | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!isId(r.id) || typeof r.at !== 'string' || !ISO_RE.test(r.at)) return null
  if (!Array.isArray(r.items)) return null
  const items: DeliveryItem[] = []
  for (const itemRaw of r.items) {
    const item = parseDeliveryItem(itemRaw)
    if (!item) return null
    items.push(item)
  }
  return {
    id: r.id,
    at: r.at,
    supplier_name: typeof r.supplier_name === 'string' ? r.supplier_name : undefined,
    items,
  }
}

function parseDailySheet(raw: unknown): DailySheet | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (!isId(r.id) || typeof r.date !== 'string' || !DATE_RE.test(r.date)) return null
  if (typeof r.closing_done !== 'boolean' || typeof r.deleted !== 'boolean') return null
  if (!hasTimestamps(r)) return null
  if (!Array.isArray(r.deliveries)) return null
  const deliveries: DeliveryBatch[] = []
  for (const d of r.deliveries) {
    const batch = parseDeliveryBatch(d)
    if (!batch) return null
    deliveries.push(batch)
  }
  if (typeof r.unsold !== 'object' || r.unsold === null) return null
  const unsoldMap: Record<string, number> = {}
  for (const [prodId, qty] of Object.entries(r.unsold as Record<string, unknown>)) {
    if (typeof qty === 'number' && Number.isInteger(qty) && qty >= 0) unsoldMap[prodId] = qty
  }
  return {
    id: r.id,
    date: r.date,
    deliveries,
    unsold: unsoldMap,
    closing_done: r.closing_done,
    closed_at: typeof r.closed_at === 'string' ? r.closed_at : undefined,
    cash_collected: typeof r.cash_collected === 'number' ? r.cash_collected : undefined,
    notes: typeof r.notes === 'string' ? r.notes : undefined,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted: r.deleted,
  }
}

function parseSyncRecord(raw: unknown): SyncRecord | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as { kind?: unknown; value?: unknown }
  if (r.kind === 'product') {
    const value = parseProduct(r.value)
    return value ? { kind: 'product', value } : null
  }
  if (r.kind === 'daily_sheet') {
    const value = parseDailySheet(r.value)
    return value ? { kind: 'daily_sheet', value } : null
  }
  return null
}

function parseSyncRequest(raw: unknown): SyncRequest | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as { since?: unknown; records?: unknown }
  if (!Number.isInteger(r.since) || (r.since as number) < 0) return null
  if (!Array.isArray(r.records)) return null
  const records: SyncRecord[] = []
  for (const item of r.records) {
    const rec = parseSyncRecord(item)
    if (!rec) return null
    records.push(rec)
  }
  return { since: r.since as number, records }
}

const ADMIN_EMAILS = new Set(['elsonkjimmy@gmail.com'])
const ADMIN_PHONES = new Set(['621614204'])

function isSuperAdmin(email?: string | null, phone?: string | null): boolean {
  if (email && ADMIN_EMAILS.has(email.trim().toLowerCase())) return true
  if (phone && ADMIN_PHONES.has(normalizePhone(phone))) return true
  return false
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    },
  })
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').trim()
}

async function accountIdFrom(request: Request, db: D1Database): Promise<string | null> {
  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const user = await db.prepare('SELECT id FROM users WHERE id = ?').bind(token).first<{ id: string }>()
  return user ? user.id : null
}

const UPSERT_RECORD = `
  INSERT INTO records (account_id, kind, id, data, updated_at, deleted, rev)
  VALUES (?1, ?2, ?3, ?4, ?5, ?6, (SELECT COALESCE(MAX(rev), 0) + 1 FROM records WHERE account_id = ?1))
  ON CONFLICT (account_id, kind, id) DO UPDATE SET
    data = excluded.data,
    updated_at = excluded.updated_at,
    deleted = excluded.deleted,
    rev = excluded.rev
  WHERE excluded.updated_at > records.updated_at`

async function handleSync(request: Request, db: D1Database, accountId: string): Promise<Response> {
  const body = parseSyncRequest(await request.json().catch(() => null))
  if (!body) return json({ error: 'invalid_request' }, 400)

  const recordStmt = db.prepare(UPSERT_RECORD)
  const writes = body.records.map((r) =>
    recordStmt.bind(
      accountId,
      r.kind,
      r.value.id,
      JSON.stringify(r.value),
      r.value.updated_at,
      r.value.deleted ? 1 : 0
    )
  )
  if (writes.length > 0) await db.batch(writes)

  const rows =
    (
      await db
        .prepare('SELECT kind, data, rev FROM records WHERE account_id = ? AND rev > ? ORDER BY rev LIMIT ?')
        .bind(accountId, body.since, 501)
        .all<{ kind: string; data: string; rev: number }>()
    ).results ?? []

  const hasMore = rows.length > 500
  const page = rows.slice(0, 500)
  const records: SyncRecord[] = []

  for (const item of page) {
    try {
      const parsedValue = JSON.parse(item.data)
      records.push({ kind: item.kind as SyncRecord['kind'], value: parsedValue })
    } catch (e) {
      console.error('Failed to parse record data:', e)
    }
  }

  return json({
    records,
    cursor: page.length > 0 ? page[page.length - 1].rev : body.since,
    hasMore,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        },
      })
    }

    const { pathname } = new URL(request.url)

    if (!pathname.startsWith('/api/')) {
      const assets = env.ASSETS
      if (assets) return await assets.fetch(request)
      return new Response(null, { status: 404 })
    }

    try {
      if (pathname === '/api/auth/register' && request.method === 'POST') {
        const body = (await request.json().catch(() => null)) as {
          name?: string
          phone?: string
          password?: string
          email?: string
          account_type?: string
        } | null
        if (!body || !body.name?.trim() || !body.phone?.trim() || !body.password || body.password.length < 4) {
          return json({ error: 'invalid_data', message: 'Nom, téléphone et mot de passe (4 car. min) requis.' }, 400)
        }
        const cleanPhone = normalizePhone(body.phone)
        const cleanEmail = body.email?.trim().toLowerCase() || null
        const accountType: 'vendor' | 'driver' = body.account_type === 'driver' ? 'driver' : 'vendor'
        const passwordHash = await sha256Hex(body.password)
        const userId = await sha256Hex(`usr_${cleanPhone}`)
        const now = new Date().toISOString()
        const isAdmin = isSuperAdmin(cleanEmail, cleanPhone) ? 1 : 0

        if (await env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(cleanPhone).first()) {
          return json({ error: 'phone_taken', message: 'Un compte existe déjà avec ce numéro de téléphone.' }, 409)
        }
        if (cleanEmail) {
          if (await env.DB.prepare('SELECT id FROM users WHERE LOWER(email) = ?').bind(cleanEmail).first()) {
            return json({ error: 'email_taken', message: 'Un compte existe déjà avec cette adresse email.' }, 409)
          }
        }

        await env.DB.prepare(
          'INSERT INTO users (id, name, phone, email, password_hash, account_type, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(userId, body.name.trim(), cleanPhone, cleanEmail, passwordHash, accountType, isAdmin, now)
          .run()

        return json({
          ok: true,
          token: userId,
          user: {
            id: userId,
            name: body.name.trim(),
            phone: cleanPhone,
            email: cleanEmail,
            account_type: accountType,
            is_admin: Boolean(isAdmin),
            created_at: now,
          },
        })
      }

      if (pathname === '/api/auth/login' && request.method === 'POST') {
        const body = (await request.json().catch(() => null)) as {
          phone?: string
          email?: string
          password?: string
        } | null
        const rawIdentifier = (body?.phone || body?.email || '').trim()
        if (!body || !rawIdentifier || !body.password) {
          return json({ error: 'invalid_credentials', message: 'Identifiant (téléphone ou email) et mot de passe requis.' }, 400)
        }
        const cleanPhone = normalizePhone(rawIdentifier)
        const localPhone = cleanPhone.replace(/^\+?237/, '')
        const cleanEmail = rawIdentifier.toLowerCase()
        const passwordHash = await sha256Hex(body.password)

        const user = await env.DB.prepare(
          'SELECT id, name, phone, email, password_hash, account_type, is_admin, created_at FROM users WHERE phone IN (?, ?) OR LOWER(email) = ? LIMIT 1'
        )
          .bind(cleanPhone, localPhone, cleanEmail)
          .first<{
            id: string
            name: string
            phone: string
            email: string | null
            password_hash: string
            account_type?: string
            is_admin: number
            created_at: string
          }>()

        if (!user || user.password_hash !== passwordHash) {
          return json({ error: 'invalid_credentials', message: 'Identifiant ou mot de passe incorrect.' }, 401)
        }

        const isAdmin = user.is_admin === 1 || isSuperAdmin(user.email, user.phone)
        return json({
          ok: true,
          token: user.id,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email ?? undefined,
            account_type: user.account_type === 'driver' ? 'driver' : 'vendor',
            is_admin: isAdmin,
            created_at: user.created_at,
          },
        })
      }

      const accountId = await accountIdFrom(request, env.DB)
      if (!accountId) {
        return json({ error: 'unauthorized', message: 'Veuillez vous connecter.' }, 401)
      }

      if (pathname === '/api/auth/me' && request.method === 'GET') {
        const caller = await env.DB.prepare('SELECT id, name, phone, email, account_type, is_admin, created_at FROM users WHERE id = ?')
          .bind(accountId)
          .first<{
            id: string
            name: string
            phone: string
            email: string | null
            account_type?: string
            is_admin: number
            created_at: string
          }>()
        if (!caller) return json({ error: 'not_found', message: 'Utilisateur introuvable.' }, 404)
        const isAdmin = caller.is_admin === 1 || isSuperAdmin(caller.email, caller.phone)
        return json({
          ok: true,
          user: {
            id: caller.id,
            name: caller.name,
            phone: caller.phone,
            email: caller.email ?? undefined,
            account_type: caller.account_type === 'driver' ? 'driver' : 'vendor',
            is_admin: isAdmin,
            created_at: caller.created_at,
          },
        })
      }

      if (pathname === '/api/admin/overview' && request.method === 'GET') {
        const caller = await env.DB.prepare('SELECT id, phone, email, is_admin FROM users WHERE id = ?')
          .bind(accountId)
          .first<{ id: string; phone: string; email: string | null; is_admin: number }>()

        if (!(caller && (caller.is_admin === 1 || isSuperAdmin(caller.email, caller.phone)))) {
          return json({ error: 'forbidden', message: 'Accès réservé au Super Administrateur.' }, 403)
        }

        const vendors =
          (
            await env.DB.prepare(
              'SELECT id, name, phone, email, is_admin, created_at FROM users ORDER BY created_at DESC'
            ).all<{
              id: string
              name: string
              phone: string
              email: string | null
              is_admin: number
              created_at: string
            }>()
          ).results ?? []

        const recordsStats = await env.DB.prepare(
          'SELECT kind, COUNT(*) as count FROM records WHERE deleted = 0 GROUP BY kind'
        ).all<{ kind: string; count: number }>()

        const allRecords =
          (
            await env.DB.prepare(
              'SELECT account_id, kind, id, data, updated_at FROM records WHERE deleted = 0'
            ).all<{
              account_id: string
              kind: string
              id: string
              data: string
              updated_at: string
            }>()
          ).results ?? []

        const vendorProductsCount: Record<string, number> = {}
        const vendorSheetsCount: Record<string, number> = {}
        const vendorClosedSheetsCount: Record<string, number> = {}
        const vendorRevenue: Record<string, number> = {}
        const vendorSoldUnits: Record<string, number> = {}
        const vendorLastActive: Record<string, string> = {}
        const vendorRecentSheets: Record<string, Array<{ date: string; closing_done: boolean; revenue: number; items_sold: number }>> = {}

        let totalRevenue = 0
        let totalClosedSheets = 0
        let totalSheets = 0
        let totalItemsSold = 0
        let totalProducts = 0

        const recentActivityList: Array<{
          vendor_id: string
          vendor_name: string
          date: string
          closing_done: boolean
          closed_at?: string
          revenue: number
          items_sold: number
          updated_at: string
        }> = []

        const userNameMap = new Map<string, string>()
        for (const u of vendors) {
          userNameMap.set(u.id, u.name)
          vendorProductsCount[u.id] = 0
          vendorSheetsCount[u.id] = 0
          vendorClosedSheetsCount[u.id] = 0
          vendorRevenue[u.id] = 0
          vendorSoldUnits[u.id] = 0
          vendorRecentSheets[u.id] = []
        }

        const todayDate = new Date()
        const last7Dates: string[] = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date(todayDate)
          d.setDate(d.getDate() - i)
          last7Dates.push(d.toISOString().slice(0, 10))
        }

        const dailyTrendsMap = new Map<string, { date: string; revenue: number; items_sold: number; sheets_count: number }>()
        for (const d of last7Dates) {
          dailyTrendsMap.set(d, { date: d, revenue: 0, items_sold: 0, sheets_count: 0 })
        }

        for (const r of allRecords) {
          const accId = r.account_id
          if (!vendorLastActive[accId] || r.updated_at > vendorLastActive[accId]) {
            vendorLastActive[accId] = r.updated_at
          }
          if (r.kind === 'product') {
            totalProducts++
            vendorProductsCount[accId] = (vendorProductsCount[accId] || 0) + 1
          } else if (r.kind === 'daily_sheet' || r.kind === 'sheet') {
            totalSheets++
            vendorSheetsCount[accId] = (vendorSheetsCount[accId] || 0) + 1
            try {
              const sheet = JSON.parse(r.data) as Record<string, unknown>
              const dateStr = (sheet.date as string) || r.updated_at.slice(0, 10)
              const closingDone = Boolean(sheet.closing_done)
              let calculatedRevenue = 0
              const deliveredByProduct: Record<string, { qty: number; price: number }> = {}

              if (Array.isArray(sheet.deliveries)) {
                for (const b of sheet.deliveries as Array<{ items?: Array<{ product_id: string; quantity?: number; selling_price?: number }> }>) {
                  if (Array.isArray(b?.items)) {
                    for (const item of b.items) {
                      const q = Number(item.quantity) || 0
                      const prev = deliveredByProduct[item.product_id] || {
                        qty: 0,
                        price: Number(item.selling_price) || 0,
                      }
                      prev.qty += q
                      if (item.selling_price) prev.price = Number(item.selling_price)
                      deliveredByProduct[item.product_id] = prev
                    }
                  }
                }
              }

              let soldUnits = 0
              const unsoldMap = (sheet.unsold as Record<string, unknown>) || {}
              for (const [pId, entry] of Object.entries(deliveredByProduct)) {
                const unsold = Number(unsoldMap[pId]) || 0
                const sold = Math.max(0, entry.qty - unsold)
                soldUnits += sold
                calculatedRevenue += sold * entry.price
              }

              const revenue =
                typeof sheet.cash_collected === 'number' && sheet.cash_collected > 0
                  ? sheet.cash_collected
                  : calculatedRevenue

              if (closingDone) {
                totalClosedSheets++
                vendorClosedSheetsCount[accId] = (vendorClosedSheetsCount[accId] || 0) + 1
                totalRevenue += revenue
                totalItemsSold += soldUnits
                vendorRevenue[accId] = (vendorRevenue[accId] || 0) + revenue
                vendorSoldUnits[accId] = (vendorSoldUnits[accId] || 0) + soldUnits
              }

              if (dailyTrendsMap.has(dateStr)) {
                const trend = dailyTrendsMap.get(dateStr)!
                trend.sheets_count++
                if (closingDone) {
                  trend.revenue += revenue
                  trend.items_sold += soldUnits
                }
              }

              const vName = userNameMap.get(accId) || 'Boutique'
              recentActivityList.push({
                vendor_id: accId,
                vendor_name: vName,
                date: dateStr,
                closing_done: closingDone,
                closed_at: typeof sheet.closed_at === 'string' ? sheet.closed_at : undefined,
                revenue,
                items_sold: soldUnits,
                updated_at: r.updated_at,
              })

              if (!vendorRecentSheets[accId]) vendorRecentSheets[accId] = []
              vendorRecentSheets[accId].push({
                date: dateStr,
                closing_done: closingDone,
                revenue,
                items_sold: soldUnits,
              })
            } catch {}
          }
        }

        recentActivityList.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        const topRecentActivity = recentActivityList.slice(0, 10)
        const sevenDaysAgo = new Date(Date.now() - 6048e5).toISOString()

        let activeVendors7d = 0
        const enrichedVendors = vendors.map((v) => {
          const lastActive = vendorLastActive[v.id] || null
          const sheetsCount = vendorSheetsCount[v.id] || 0
          const isActiveRecently = lastActive ? lastActive >= sevenDaysAgo : false
          if (isActiveRecently) activeVendors7d++

          let status = 'new'
          if (sheetsCount > 0) status = isActiveRecently ? 'active' : 'dormant'

          const vSheets = vendorRecentSheets[v.id] || []
          vSheets.sort((a, b) => b.date.localeCompare(a.date))

          return {
            id: v.id,
            name: v.name,
            phone: v.phone,
            email: v.email,
            is_admin: Boolean(v.is_admin),
            created_at: v.created_at,
            products_count: vendorProductsCount[v.id] || 0,
            sheets_count: sheetsCount,
            closed_sheets_count: vendorClosedSheetsCount[v.id] || 0,
            total_revenue: vendorRevenue[v.id] || 0,
            total_sold_units: vendorSoldUnits[v.id] || 0,
            last_active_at: lastActive,
            status,
            recent_sheets: vSheets.slice(0, 3),
          }
        })

        const closingRate = totalSheets > 0 ? Math.round((totalClosedSheets / totalSheets) * 100) : 0

        return json({
          ok: true,
          stats: {
            total_vendors: vendors.length,
            active_vendors_7d: activeVendors7d,
            total_sheets_count: totalSheets,
            closed_sheets_count: totalClosedSheets,
            closing_rate_percent: closingRate,
            total_revenue_recorded: totalRevenue,
            total_items_sold: totalItemsSold,
            total_products_count: totalProducts,
            records_breakdown: recordsStats.results ?? [],
          },
          vendors: enrichedVendors,
          recent_activity: topRecentActivity,
          daily_trends: Array.from(dailyTrendsMap.values()),
        })
      }

      if (pathname === '/api/admin/reset-password' && request.method === 'POST') {
        const caller = await env.DB.prepare('SELECT id, phone, email, is_admin FROM users WHERE id = ?')
          .bind(accountId)
          .first<{ id: string; phone: string; email: string | null; is_admin: number }>()

        if (!(caller && (caller.is_admin === 1 || isSuperAdmin(caller.email, caller.phone)))) {
          return json({ error: 'forbidden', message: 'Accès réservé au Super Administrateur.' }, 403)
        }

        const body = (await request.json().catch(() => null)) as { user_id?: string; new_password?: string } | null
        if (!body || !isId(body.user_id) || !body.new_password || body.new_password.length < 4) {
          return json({ error: 'invalid_data', message: 'ID utilisateur et nouveau mot de passe (4 car. min) requis.' }, 400)
        }

        const newHash = await sha256Hex(body.new_password)
        const res = await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newHash, body.user_id).run()
        if (!res.meta.changes) {
          return json({ error: 'not_found', message: 'Compte introuvable.' }, 404)
        }
        return json({ ok: true })
      }

      if (pathname === '/api/sync' && request.method === 'POST') {
        return await handleSync(request, env.DB, accountId)
      }

      return json({ error: 'not_found' }, 404)
    } catch (err) {
      console.error(JSON.stringify({ message: 'api_error', path: pathname, error: String(err) }))
      return json({ error: 'server_error' }, 500)
    }
  },
}
